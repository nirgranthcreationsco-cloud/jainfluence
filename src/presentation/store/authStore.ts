import { create } from 'zustand';
import type { UserModel, UserRole, CreatorCategory } from '../../data/types';
import { StorageService } from '../../data/services/storage';

// Minimal password hash using btoa (not for production security — use Supabase Auth for that)
const hashPassword = (pw: string): string => btoa(encodeURIComponent(pw));

interface SignupStep1Data {
  name: string;
  email: string;
  password: string;
}

interface SignupStep2Data {
  bio: string;
  city: string;
  profilePhoto?: string;
}

interface SignupStep3Data {
  roles: UserRole[];
  creatorCategories: CreatorCategory[];
  businessName?: string;
  businessIndustry?: string;
  businessWebsite?: string;
}

interface AuthState {
  user: UserModel | null;
  isLoading: boolean;
  isInitializing: boolean;
  error: string;
  hasCompletedOnboarding: boolean;

  // Persisted draft for multi-step signup
  signupDraft: Partial<SignupStep1Data & SignupStep2Data & SignupStep3Data>;

  initSession: () => Promise<void>;
  setCompletedOnboarding: () => void;

  // Email-based login (V2 primary)
  loginWithEmail: (email: string, password: string) => Promise<boolean>;
  // Phone-based login (legacy fallback)
  login: (phone: string, name: string) => Promise<boolean>;

  // Multi-step signup
  setSignupDraft: (data: Partial<SignupStep1Data & SignupStep2Data & SignupStep3Data>) => void;
  completeSignup: () => Promise<boolean>;

  // Legacy single-step signup (keep for compatibility)
  signup: (phone: string, name: string, username: string, profilePhoto?: string) => Promise<boolean>;

  updateProfile: (updates: Partial<UserModel>) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: false,
  isInitializing: true,
  error: '',
  hasCompletedOnboarding: false,
  signupDraft: {},

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

  setSignupDraft: (data) => {
    set(state => ({ signupDraft: { ...state.signupDraft, ...data } }));
  },

  completeSignup: async () => {
    const { signupDraft } = get();
    const { name, email, password, bio, city, profilePhoto, roles, creatorCategories,
      businessName, businessIndustry, businessWebsite } = signupDraft;

    if (!name || !email || !password) {
      set({ error: 'Name, email and password are required.' });
      return false;
    }

    set({ isLoading: true, error: '' });

    try {
      // Check email uniqueness
      const existing = await StorageService.getUserByEmail(email);
      if (existing) {
        set({ error: 'This email is already registered.', isLoading: false });
        return false;
      }

      const username = name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
      const user: UserModel = {
        uid: 'user_' + Date.now(),
        name,
        email: email.toLowerCase().trim(),
        passwordHash: hashPassword(password),
        username,
        bio: bio || 'Proud member of the Jain community.',
        city: city || '',
        profilePhoto,
        skills: [],
        roles: roles || [],
        creatorCategories: creatorCategories || [],
        businessName,
        businessIndustry,
        businessWebsite,
        followersCount: 0,
        followingCount: 0,
        projectsCompleted: 0,
        reviewCount: 0,
        reviewRating: 0.0,
        isVerified: false,
        hireCount: 0,
      };

      await StorageService.saveUser(user);
      StorageService.setCurrentUserId(user.uid);
      StorageService.setOnboardingComplete();
      set({ user, isLoading: false, hasCompletedOnboarding: true, signupDraft: {} });
      return true;
    } catch (e: any) {
      set({ error: e.message || 'Signup failed', isLoading: false });
      return false;
    }
  },

  loginWithEmail: async (email: string, password: string) => {
    set({ isLoading: true, error: '' });
    try {
      const user = await StorageService.getUserByEmail(email);
      if (!user) {
        set({ error: 'No account found with this email.', isLoading: false });
        return false;
      }
      if (user.passwordHash && user.passwordHash !== hashPassword(password)) {
        set({ error: 'Incorrect password.', isLoading: false });
        return false;
      }
      StorageService.setCurrentUserId(user.uid);
      StorageService.setOnboardingComplete();
      set({ user, isLoading: false, hasCompletedOnboarding: true });
      return true;
    } catch (e: any) {
      set({ error: e.message || 'Login failed', isLoading: false });
      return false;
    }
  },

  // Legacy phone-based login (kept for backward compatibility)
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
          roles: [],
          creatorCategories: [],
          followersCount: 0,
          followingCount: 0,
          projectsCompleted: 0,
          reviewCount: 0,
          reviewRating: 0.0,
          isVerified: false,
          hireCount: 0,
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

  // Legacy single-step signup (kept for compatibility)
  signup: async (phone: string, name: string, username: string, profilePhoto?: string) => {
    set({ isLoading: true, error: '' });
    try {
      const users = await StorageService.getUsers();
      const phoneExists = users.some(u => u.phone === phone);
      const usernameExists = users.some(u => u.username === username);

      if (phoneExists && usernameExists) throw new Error('Both phone number and username are already taken.');
      if (phoneExists) throw new Error('This phone number is already registered.');
      if (usernameExists) throw new Error('This username is already taken.');

      const user: UserModel = {
        uid: 'user_' + Date.now(),
        name,
        username,
        phone,
        bio: 'Proud member of the Jain community.',
        profilePhoto,
        skills: [],
        roles: [],
        creatorCategories: [],
        followersCount: 0,
        followingCount: 0,
        projectsCompleted: 0,
        reviewCount: 0,
        reviewRating: 0.0,
        isVerified: false,
        hireCount: 0,
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

  updateProfile: async (updates: Partial<UserModel>) => {
    const { user } = get();
    if (!user) return;
    const updated = { ...user, ...updates };
    await StorageService.saveUser(updated);
    set({ user: updated });
  },

  logout: () => {
    StorageService.clearSession();
    set({ user: null });
  },
}));
