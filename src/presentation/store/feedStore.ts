import { create } from 'zustand';
import type { PostModel } from '../../data/types';
import { StorageService } from '../../data/services/storage';

const WALL_CAPACITY = 300;

const calculateEngagementScore = async (post: PostModel): Promise<number> => {
  const ageInMs = Date.now() - new Date(post.timestamp).getTime();
  const ageInHours = Math.max(0, ageInMs / (1000 * 60 * 60));
  const likes = post.likesCount || 0;
  
  const savesCount = await StorageService.getSavesCountForPost(post.postId);
  return (likes * 1 + savesCount * 3) / Math.pow(1 + ageInHours / 48, 1.2);
};

interface FeedState {
  posts: PostModel[];
  userLikes: string[];
  userSaves: string[];
  isLoading: boolean;
  isFetchingMore: boolean;
  hasReachedMax: boolean;
  
  loadFeed: (userId?: string) => Promise<void>;
  likePost: (userId: string, postId: string) => Promise<void>;
  savePostToggle: (userId: string, postId: string) => Promise<void>;
  createPost: (authorId: string, authorName: string, authorPhoto: string | undefined, mediaUrl: string, caption: string, hashtags: string[]) => Promise<void>;
  
  isLiked: (postId: string) => boolean;
  isSaved: (postId: string) => boolean;
}

export const useFeedStore = create<FeedState>((set, get) => ({
  posts: [],
  userLikes: [],
  userSaves: [],
  isLoading: false,
  isFetchingMore: false,
  hasReachedMax: true,

  loadFeed: async (userId?: string) => {
    set({ isLoading: true });
    try {
      const posts = (await StorageService.getPosts()).filter(p => p.status === 'live');
      
      let userLikes: string[] = [];
      let userSaves: string[] = [];
      if (userId) {
        userLikes = await StorageService.getLikes(userId);
        userSaves = await StorageService.getSaved(userId);
      }
      
      set({ posts, userLikes, userSaves, isLoading: false });
    } catch (e) {
      console.error(e);
      set({ isLoading: false });
    }
  },

  likePost: async (userId: string, postId: string) => {
    // Optimistic UI Update
    const { userLikes, posts } = get();
    const isCurrentlyLiked = userLikes.includes(postId);
    
    let newLikes = [...userLikes];
    if (isCurrentlyLiked) {
      newLikes = newLikes.filter(id => id !== postId);
    } else {
      newLikes.push(postId);
    }
    
    const newPosts = posts.map(p => {
      if (p.postId === postId) {
        return { ...p, likesCount: Math.max(0, p.likesCount + (isCurrentlyLiked ? -1 : 1)) };
      }
      return p;
    });
    
    set({ userLikes: newLikes, posts: newPosts });

    // Server request
    await StorageService.toggleLike(userId, postId);
    
    const allPosts = await StorageService.getPosts();
    const postIdx = allPosts.findIndex(p => p.postId === postId);
    if (postIdx >= 0) {
       allPosts[postIdx].engagementScore = await calculateEngagementScore(allPosts[postIdx]);
       await StorageService.saveAllPosts([allPosts[postIdx]]);
    }

    const latestPosts = (await StorageService.getPosts()).filter(p => p.status === 'live');
    set({ posts: latestPosts });
  },

  savePostToggle: async (userId: string, postId: string) => {
    const { userSaves } = get();
    const isCurrentlySaved = userSaves.includes(postId);
    
    let newSaves = [...userSaves];
    if (isCurrentlySaved) {
      newSaves = newSaves.filter(id => id !== postId);
    } else {
      newSaves.push(postId);
    }
    set({ userSaves: newSaves });

    await StorageService.toggleSave(userId, postId);
    
    const allPosts = await StorageService.getPosts();
    const postIdx = allPosts.findIndex(p => p.postId === postId);
    if (postIdx >= 0) {
       allPosts[postIdx].engagementScore = await calculateEngagementScore(allPosts[postIdx]);
       await StorageService.saveAllPosts([allPosts[postIdx]]);
    }

    const latestPosts = (await StorageService.getPosts()).filter(p => p.status === 'live');
    set({ posts: latestPosts });
  },

  createPost: async (authorId: string, authorName: string, authorPhoto: string | undefined, mediaUrl: string, caption: string, hashtags: string[]) => {
    const post: PostModel = {
      postId: 'post_' + Date.now(),
      authorId,
      authorName,
      authorPhoto,
      mediaUrls: [mediaUrl],
      caption,
      hashtags,
      likesCount: 0,
      commentsCount: 0,
      timestamp: new Date().toISOString(),
      status: 'live',
      engagementScore: 0
    };
    
    let allPosts = await StorageService.getPosts();
    let livePosts = allPosts.filter(p => p.status === 'live');
    
    if (livePosts.length >= WALL_CAPACITY) {
      for (let p of livePosts) {
        p.engagementScore = await calculateEngagementScore(p);
      }
      livePosts.sort((a, b) => a.engagementScore - b.engagementScore);
      const weakestPostId = livePosts[0].postId;
      
      const weakestIdx = allPosts.findIndex(p => p.postId === weakestPostId);
      if (weakestIdx >= 0) {
        allPosts[weakestIdx].status = 'archived';
        await StorageService.savePost(allPosts[weakestIdx]);
      }
    }
    
    await StorageService.savePost(post);
    
    const posts = (await StorageService.getPosts()).filter(p => p.status === 'live');
    set({ posts });
  },

  isLiked: (postId: string) => {
    return get().userLikes.includes(postId);
  },

  isSaved: (postId: string) => {
    return get().userSaves.includes(postId);
  }
}));
