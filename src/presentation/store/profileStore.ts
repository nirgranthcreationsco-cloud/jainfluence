import { create } from 'zustand';
import type { UserModel, ActivityModel } from '../../data/types';
import { StorageService } from '../../data/services/storage';

interface ProfileState {
  profileUser: UserModel | null;
  posts: ActivityModel[];
  isLoading: boolean;
  isFollowing: boolean;
  loadProfile: (userId: string, currentUserId: string) => Promise<void>;
  toggleFollow: (currentUserId: string, targetUserId: string) => Promise<void>;
  incrementHireCount: (userId: string) => Promise<void>;
}

export const useProfileStore = create<ProfileState>((set) => ({
  profileUser: null,
  posts: [],
  isLoading: false,
  isFollowing: false,

  loadProfile: async (userId: string, currentUserId: string) => {
    set({ isLoading: true });
    try {
      const user = await StorageService.getUser(userId);
      const allPosts = await StorageService.getPosts();
      const posts = allPosts.filter(p => p.authorId === userId);
      
      let isFollowing = false;
      if (currentUserId && userId !== currentUserId) {
        const follows = await StorageService.getFollows(currentUserId);
        isFollowing = follows.includes(userId);
      }
      
      set({ profileUser: user, posts, isFollowing, isLoading: false });
    } catch (e) {
      console.error(e);
      set({ isLoading: false });
    }
  },

  toggleFollow: async (currentUserId: string, targetUserId: string) => {
    if (!currentUserId) return;
    const following = await StorageService.toggleFollow(currentUserId, targetUserId);
    
    // Reload profile state
    const user = await StorageService.getUser(targetUserId);
    set({ profileUser: user, isFollowing: following });
  },

  incrementHireCount: async (userId: string) => {
    await StorageService.incrementHireCount(userId);
    const user = await StorageService.getUser(userId);
    set({ profileUser: user });
  }
}));
