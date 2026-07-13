import { create } from 'zustand';
import type { ActivityModel, ActivityType } from '../../data/types';
import { StorageService } from '../../data/services/storage';
import { uploadToCloudinary, type UploadStage } from '../../data/services/cloudinary';
import { supabase } from '../../data/services/supabaseClient';

const WALL_CAPACITY = 300;
const PAGE_SIZE = 10;
const CACHE_KEY = 'atlas_feed_cache';

const calculateEngagementScore = async (post: ActivityModel): Promise<number> => {
  const ageInMs = Date.now() - new Date(post.timestamp).getTime();
  const ageInHours = Math.max(0, ageInMs / (1000 * 60 * 60));
  const likes = post.likesCount || 0;
  const savesCount = await StorageService.getSavesCountForPost(post.postId);
  return (likes * 1 + savesCount * 3) / Math.pow(1 + ageInHours / 48, 1.2);
};

interface FeedState {
  activities: ActivityModel[];
  userLikes: string[];
  userSaves: string[];
  isLoading: boolean;
  isFetchingMore: boolean;
  hasMore: boolean;
  error: string | null;
  uploadProgress: UploadStage | null;

  loadFeed: (userId?: string) => Promise<void>;
  loadMore: (userId?: string) => Promise<void>;
  likePost: (userId: string, postId: string) => Promise<void>;
  savePostToggle: (userId: string, postId: string) => Promise<void>;
  createActivity: (
    authorId: string,
    authorName: string,
    authorPhoto: string | undefined,
    file: File,
    caption: string,
    hashtags: string[],
    activityType: ActivityType,
  ) => Promise<void>;

  isLiked: (postId: string) => boolean;
  isSaved: (postId: string) => boolean;
}

export const useFeedStore = create<FeedState>((set, get) => ({
  activities: [],
  userLikes: [],
  userSaves: [],
  isLoading: false,
  isFetchingMore: false,
  hasMore: true,
  error: null,
  uploadProgress: null,

  loadFeed: async (userId?: string) => {
    // ── Show cached feed instantly ────────────────────────────────────
    try {
      const cached = sessionStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed: ActivityModel[] = JSON.parse(cached);
        if (parsed.length > 0) {
          set({ activities: parsed });
        }
      }
    } catch { /* ignore */ }

    set({ isLoading: true });

    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('status', 'live')
        .order('timestamp', { ascending: false })
        .range(0, PAGE_SIZE - 1);

      if (error) throw error;

      const activities = (data as ActivityModel[]);

      let userLikes: string[] = [];
      let userSaves: string[] = [];
      if (userId) {
        [userLikes, userSaves] = await Promise.all([
          StorageService.getLikes(userId),
          StorageService.getSaved(userId),
        ]);
      }

      // Cache the fresh feed
      try { sessionStorage.setItem(CACHE_KEY, JSON.stringify(activities)); } catch { /* ignore */ }

      set({
        activities,
        userLikes,
        userSaves,
        isLoading: false,
        hasMore: activities.length === PAGE_SIZE,
      });
    } catch (e) {
      console.error(e);
      set({ isLoading: false });
    }
  },

  loadMore: async (_userId?: string) => {
    const { activities, isFetchingMore, hasMore } = get();
    if (isFetchingMore || !hasMore) return;

    set({ isFetchingMore: true });
    try {
      const from = activities.filter(a => a.status === 'live').length;
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('status', 'live')
        .order('timestamp', { ascending: false })
        .range(from, from + PAGE_SIZE - 1);

      if (error) throw error;

      const newActivities = data as ActivityModel[];
      const combined = [...activities, ...newActivities];

      try { sessionStorage.setItem(CACHE_KEY, JSON.stringify(combined.filter(a => a.status === 'live'))); } catch { /* ignore */ }

      set({
        activities: combined,
        isFetchingMore: false,
        hasMore: newActivities.length === PAGE_SIZE,
      });
    } catch (e) {
      console.error(e);
      set({ isFetchingMore: false });
    }
  },

  likePost: async (userId: string, postId: string) => {
    const { userLikes, activities } = get();
    const isCurrentlyLiked = userLikes.includes(postId);

    // Optimistic update
    const newLikes = isCurrentlyLiked
      ? userLikes.filter(id => id !== postId)
      : [...userLikes, postId];

    const newActivities = activities.map(a =>
      a.postId === postId
        ? { ...a, likesCount: Math.max(0, a.likesCount + (isCurrentlyLiked ? -1 : 1)) }
        : a
    );
    set({ userLikes: newLikes, activities: newActivities });

    // Persist
    await StorageService.toggleLike(userId, postId);
    const allPosts = await StorageService.getPosts();
    const idx = allPosts.findIndex(p => p.postId === postId);
    if (idx >= 0) {
      allPosts[idx].engagementScore = await calculateEngagementScore(allPosts[idx]);
      await StorageService.saveAllPosts([allPosts[idx]]);
    }
  },

  savePostToggle: async (userId: string, postId: string) => {
    const { userSaves } = get();
    const isCurrentlySaved = userSaves.includes(postId);
    const newSaves = isCurrentlySaved
      ? userSaves.filter(id => id !== postId)
      : [...userSaves, postId];
    set({ userSaves: newSaves });

    await StorageService.toggleSave(userId, postId);
  },

  createActivity: async (
    authorId,
    authorName,
    authorPhoto,
    file,
    caption,
    hashtags,
    activityType,
  ) => {
    const tempId = 'pending_' + Date.now();
    const localUrl = URL.createObjectURL(file);

    // ── 1. Optimistic insert ─────────────────────────────────────────
    const pending: ActivityModel = {
      postId: tempId,
      authorId,
      authorName,
      authorPhoto,
      mediaUrls: [localUrl],
      caption,
      hashtags,
      activityType,
      likesCount: 0,
      commentsCount: 0,
      timestamp: new Date().toISOString(),
      status: 'pending',
      engagementScore: 0,
    };
    set(state => ({ activities: [pending, ...state.activities], error: null }));

    // ── 2. Compress + upload with progress ───────────────────────────
    let finalUrl = localUrl;
    try {
      finalUrl = await uploadToCloudinary(file, (progress) => {
        set({ uploadProgress: progress });
      });
    } catch (err) {
      console.error('Upload failed, rolling back optimistic post:', err);
      set(state => ({
        activities: state.activities.filter(a => a.postId !== tempId),
        error: 'Upload failed. Please try again.',
        uploadProgress: null,
      }));
      return;
    }

    set({ uploadProgress: null });

    // ── 3. Enforce wall capacity ─────────────────────────────────────
    const allPosts = await StorageService.getPosts();
    const livePosts = allPosts.filter(p => p.status === 'live');
    if (livePosts.length >= WALL_CAPACITY) {
      for (const p of livePosts) {
        p.engagementScore = await calculateEngagementScore(p);
      }
      livePosts.sort((a, b) => a.engagementScore - b.engagementScore);
      const weakest = livePosts[0];
      weakest.status = 'archived';
      await StorageService.savePost(weakest);
    }

    // ── 4. Persist confirmed activity ────────────────────────────────
    const confirmed: ActivityModel = {
      ...pending,
      postId: 'post_' + Date.now(),
      mediaUrls: [finalUrl],
      status: 'live',
    };
    await StorageService.savePost(confirmed);

    // ── 5. Replace optimistic entry with confirmed ───────────────────
    set(state => ({
      activities: state.activities.map(a => (a.postId === tempId ? confirmed : a)),
    }));

    // Update cache
    try {
      const live = get().activities.filter(a => a.status !== 'archived');
      sessionStorage.setItem(CACHE_KEY, JSON.stringify(live));
    } catch { /* ignore */ }
  },

  isLiked: (postId) => get().userLikes.includes(postId),
  isSaved: (postId) => get().userSaves.includes(postId),
}));
