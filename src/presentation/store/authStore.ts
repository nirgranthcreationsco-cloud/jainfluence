import { create } from 'zustand';
import type { UserModel } from '../../data/types';
import { StorageService } from '../../data/services/storage';

interface AuthState {
  user: UserModel | null;
  isLoading: boolean;
  isInitializing: boolean;
  error: string;
  hasCompletedOnboarding: boolean;
  initSession: () => Promise<void>;
  setCompletedOnboarding: () => void;
  login: (phone: string, name: string) => Promise<boolean>;
  signup: (phone: string, name: string, username: string, profilePhoto?: string) => Promise<boolean>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  isInitializing: true,
  error: '',
  hasCompletedOnboarding: false,

  initSession: async () => {
    const uid = StorageService.getCurrentUserId();
    const completed = StorageService.hasCompletedOnboarding();
    let currentUser: UserModel | null = null;
    if (uid) {
      currentUser = await StorageService.getUser(uid);
    }
    set({ user: currentUser, hasCompletedOnboarding: completed, isInitializing: false });
  },

  setCompletedOnboarding: () => {
    StorageService.setOnboardingComplete();
    set({ hasCompletedOnboarding: true });
  },

  login: async (phone: string, name: string) => {
    set({ isLoading: true, error: '' });
    try {
      const users = await StorageService.getUsers();
      let user = users.find(u => u.phone === phone);
      if (!user) {
        user = {
          uid: 'user_' + Date.now(),
          name: name || 'Jain Member',
          username: phone,
          phone,
          bio: 'Proud member of the Jain community.',
          skills: [],
          followersCount: 0,
          followingCount: 0,
          projectsCompleted: 0,
          reviewCount: 0,
          reviewRating: 0.0,
          isVerified: false,
          hireCount: 0
        };
        await StorageService.saveUser(user);
      }
      StorageService.setCurrentUserId(user.uid);
      set({ user, isLoading: false });
      return true;
    } catch (e: any) {
      set({ error: e.message || 'Login failed', isLoading: false });
      return false;
    }
  },

  signup: async (phone: string, name: string, username: string, profilePhoto?: string) => {
    set({ isLoading: true, error: '' });
    try {
      const users = await StorageService.getUsers();
      const phoneExists = users.some(u => u.phone === phone);
      const usernameExists = users.some(u => u.username === username);
      
      if (phoneExists && usernameExists) {
        throw new Error('Both phone number and username are already taken.');
      } else if (phoneExists) {
        throw new Error('This phone number is already registered.');
      } else if (usernameExists) {
        throw new Error('This username is already taken.');
      }
      
      const user: UserModel = {
        uid: 'user_' + Date.now(),
        name,
        username,
        phone,
        bio: 'Proud member of the Jain community.',
        profilePhoto,
        skills: [],
        followersCount: 0,
        followingCount: 0,
        projectsCompleted: 0,
        reviewCount: 0,
        reviewRating: 0.0,
        isVerified: false,
        hireCount: 0
      };
      await StorageService.saveUser(user);
      StorageService.setCurrentUserId(user.uid);
      set({ user, isLoading: false });
      return true;
    } catch (e: any) {
      set({ error: e.message || 'Signup failed', isLoading: false });
      return false;
    }
  },

  logout: () => {
    StorageService.clearSession();
    set({ user: null });
  }
}));
