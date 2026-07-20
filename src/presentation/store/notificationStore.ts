import { create } from 'zustand';
import type { NotificationModel, NotificationType } from '../../data/types';
import { StorageService } from '../../data/services/storage';

interface NotificationState {
  notifications: NotificationModel[];
  unreadCount: number;
  isLoading: boolean;

  fetchNotifications: (userId: string) => Promise<void>;
  markAllRead: (userId: string) => Promise<void>;

  // Computed
  activityNotifications: () => NotificationModel[];
  marketplaceNotifications: () => NotificationModel[];
}

const ACTIVITY_TYPES: NotificationType[] = ['like', 'follow', 'comment'];
const MARKETPLACE_TYPES: NotificationType[] = [
  'proposal_received', 'proposal_accepted', 'proposal_rejected', 'hiring_confirmed'
];

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  fetchNotifications: async (userId) => {
    set({ isLoading: true });
    try {
      const data = await StorageService.getNotifications(userId);
      const unread = data.filter(n => !n.read).length;
      set({ notifications: data, unreadCount: unread, isLoading: false });
    } catch (e) {
      console.error('fetchNotifications error:', e);
      set({ isLoading: false });
    }
  },

  markAllRead: async (userId) => {
    await StorageService.markNotificationsRead(userId);
    set(state => ({
      notifications: state.notifications.map(n => ({ ...n, read: true })),
      unreadCount: 0,
    }));
  },

  activityNotifications: () =>
    get().notifications.filter(n => (ACTIVITY_TYPES as string[]).includes(n.type)),

  marketplaceNotifications: () =>
    get().notifications.filter(n => (MARKETPLACE_TYPES as string[]).includes(n.type)),
}));
