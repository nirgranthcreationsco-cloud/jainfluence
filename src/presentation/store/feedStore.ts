import { create } from 'zustand';
import type { ActivityModel, ActivityType } from '../../data/types';
import { StorageService } from '../../data/services/storage';
import { uploadToCloudinary, type UploadStage } from '../../data/services/cloudinary';
import { supabase } from '../../data/services/supabaseClient';

const WALL_CAPACITY = 300;
const PAGE_SIZE = 10;
const CACHE_KEY = 'atlas_feed_cache';

const parseActivityType = (act: ActivityModel): ActivityType => {
  // Prefer DB value if present, fall back to postId parsing for legacy posts
  if (act.activityType && act.activityType !== 'photo') return act.activityType;
  const id = act.postId;
  if (id.includes('_opportunity_') || id.startsWith('opp_')) return 'opportunity';
  if (id.includes('_project_')) return 'project';
  if (id.includes('_event_')) return 'event';
  if (id.includes('_announcement_')) return 'announcement';
  if (id.includes('_article_')) return 'article';
  if (id.includes('_achievement_')) return 'achievement';
  if (id.includes('_video_')) return 'video';
  return act.activityType || 'photo';
};

const calculateEngagementScore = async (post: ActivityModel): Promise<number> => {
  const ageInMs = Date.now() - new Date(post.timestamp).getTime();
  const ageInHours = Math.max(0, ageInMs / (1000 * 60 * 60));
  const likes = post.likesCount || 0;
  const savesCount = await StorageService.getSavesCountForPost(post.postId);
  return (likes * 1 + savesCount * 3) / Math.pow(1 + ageInHours / 48, 1.2);
};

interface CommunityPulse {
  members: number;
  posts: number;
  gigs: number;
  appreciations: number;
}

interface FeedState {
  activities: ActivityModel[];
  userLikes: string[];
  userSaves: string[];
  isLoading: boolean;
  isFetchingMore: boolean;
  hasMore: boolean;
  error: string | null;
  uploadProgress: UploadStage | null;
  communityPulse: CommunityPulse | null;

  loadFeed: (userId?: string) => Promise<void>;
  loadMore: (userId?: string) => Promise<void>;
  likePost: (userId: string, postId: string) => Promise<void>;
  savePostToggle: (userId: string, postId: string) => Promise<void>;
  fetchCommunityPulse: () => Promise<void>;
  createActivity: (
    authorId: string,
    authorName: string,
    authorPhoto: string | undefined,
    file: File | null,
    caption: string,
    hashtags: string[],
    activityType: ActivityType,
  ) => Promise<void>;

  isLiked: (postId: string) => boolean;
  isSaved: (postId: string) => boolean;
  deletePost: (postId: string) => Promise<void>;
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
  communityPulse: null,

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

      const rawActivities = (data as ActivityModel[]);
      const activities = rawActivities.map(act => ({
        ...act,
        activityType: parseActivityType(act)
      }));

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

      // Preserve pending posts during reload
      const currentPending = get().activities.filter(a => a.status === 'pending');
      const mergedActivities = [...currentPending, ...activities];

      set({
        activities: mergedActivities,
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

      const rawNewActivities = data as ActivityModel[];
      const newActivities = rawNewActivities.map(act => ({
        ...act,
        activityType: parseActivityType(act)
      }));
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

  fetchCommunityPulse: async () => {
    try {
      const [members, posts, gigs, appreciations] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('posts').select('*', { count: 'exact', head: true }).eq('status', 'live'),
        supabase.from('posts').select('*', { count: 'exact', head: true })
          .eq('status', 'live')
          .ilike('postId', '%_opportunity_%'),
        supabase.from('likes').select('*', { count: 'exact', head: true }),
      ]);
      set({
        communityPulse: {
          members: members.count ?? 0,
          posts: posts.count ?? 0,
          gigs: gigs.count ?? 0,
          appreciations: appreciations.count ?? 0,
        }
      });
    } catch (e) {
      console.error('Failed to fetch community pulse:', e);
    }
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
    const localUrl = file ? URL.createObjectURL(file) : '';

    // ── 1. Optimistic insert ─────────────────────────────────────────
    const pending: ActivityModel = {
      postId: tempId,
      authorId,
      authorName,
      authorPhoto,
      mediaUrls: localUrl ? [localUrl] : [],
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
    if (file) {
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
      postId: `post_${activityType}_${Date.now()}`,
      mediaUrls: finalUrl ? [finalUrl] : [],
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

  deletePost: async (postId) => {
    set(state => ({
      activities: state.activities.filter(a => a.postId !== postId)
    }));
    await StorageService.deletePost(postId);
    // Update cache
    try {
      const live = get().activities.filter(a => a.status !== 'archived');
      sessionStorage.setItem(CACHE_KEY, JSON.stringify(live));
    } catch { /* ignore */ }
  },
}));
