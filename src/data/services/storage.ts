import type { UserModel, ActivityModel, ProposalModel, HiringSelectionModel, NotificationModel, ProposalStatus } from '../types';
import { supabase } from './supabaseClient';

export class StorageService {
  // ── Auth Session ──────────────────────────────────────────────────────────
  static getCurrentUserId(): string | null {
    return localStorage.getItem('currentUserId');
  }

  static setCurrentUserId(uid: string) {
    localStorage.setItem('currentUserId', uid);
  }

  static clearSession() {
    localStorage.removeItem('currentUserId');
  }

  // ── Onboarding ────────────────────────────────────────────────────────────
  static hasCompletedOnboarding(): boolean {
    return localStorage.getItem('hasCompletedOnboarding') === 'true';
  }

  static setOnboardingComplete() {
    localStorage.setItem('hasCompletedOnboarding', 'true');
  }

  // ── Users ─────────────────────────────────────────────────────────────────
  static async getUsers(): Promise<UserModel[]> {
    const { data, error } = await supabase.from('users').select('*');
    if (error) {
      console.error('Error fetching users:', error);
      return [];
    }
    return (data as UserModel[]).map(u => normalizeUser(u));
  }

  static async getUser(uid: string): Promise<UserModel | null> {
    const { data, error } = await supabase.from('users').select('*').eq('uid', uid).single();
    if (error) {
      console.error('Error fetching user:', error);
      return null;
    }
    return normalizeUser(data as UserModel);
  }

  static async getUserByEmail(email: string): Promise<UserModel | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .maybeSingle();
    if (error) {
      console.error('Error fetching user by email:', error);
      return null;
    }
    return data ? normalizeUser(data as UserModel) : null;
  }

  static async saveUser(user: UserModel): Promise<void> {
    const { error } = await supabase.from('users').upsert(user);
    if (error) console.error('Error saving user:', error);
  }

  static async incrementHireCount(uid: string): Promise<void> {
    const user = await this.getUser(uid);
    if (user) {
      user.hireCount = (user.hireCount || 0) + 1;
      await this.saveUser(user);
    }
  }

  // ── Posts ─────────────────────────────────────────────────────────────────
  static async getPosts(): Promise<ActivityModel[]> {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('timestamp', { ascending: false });
    if (error) {
      console.error('Error fetching posts:', error);
      return [];
    }
    return data as ActivityModel[];
  }

  static async savePost(post: ActivityModel): Promise<void> {
    const { error } = await supabase.from('posts').upsert(post);
    if (error) console.error('Error saving post:', error);
  }

  static async deletePost(postId: string): Promise<void> {
    const { error } = await supabase.from('posts').delete().eq('postId', postId);
    if (error) console.error('Error deleting post:', error);
  }

  static async saveAllPosts(posts: ActivityModel[]): Promise<void> {
    const { error } = await supabase.from('posts').upsert(posts);
    if (error) console.error('Error saving all posts:', error);
  }

  // ── Likes ─────────────────────────────────────────────────────────────────
  static async getLikes(userId: string): Promise<string[]> {
    const { data, error } = await supabase.from('likes').select('postId').eq('userId', userId);
    if (error) return [];
    return data.map(d => d.postId);
  }

  static async toggleLike(userId: string, postId: string): Promise<boolean> {
    const { data } = await supabase.from('likes').select('id').eq('userId', userId).eq('postId', postId).maybeSingle();
    let isLiked = false;

    if (data) {
      await supabase.from('likes').delete().eq('id', data.id);
      isLiked = false;
    } else {
      await supabase.from('likes').insert({ userId, postId });
      isLiked = true;
    }

    const { data: postData } = await supabase.from('posts').select('likesCount').eq('postId', postId).single();
    if (postData) {
      const newCount = Math.max(0, postData.likesCount + (isLiked ? 1 : -1));
      await supabase.from('posts').update({ likesCount: newCount }).eq('postId', postId);
    }

    return isLiked;
  }

  // ── Saves ─────────────────────────────────────────────────────────────────
  static async getSaved(userId: string): Promise<string[]> {
    const { data, error } = await supabase.from('saves').select('postId').eq('userId', userId);
    if (error) return [];
    return data.map(d => d.postId);
  }

  static async toggleSave(userId: string, postId: string): Promise<boolean> {
    const { data } = await supabase.from('saves').select('id').eq('userId', userId).eq('postId', postId).maybeSingle();
    let isSaved = false;

    if (data) {
      await supabase.from('saves').delete().eq('id', data.id);
      isSaved = false;
    } else {
      await supabase.from('saves').insert({ userId, postId });
      isSaved = true;
    }

    return isSaved;
  }

  static async getSavesCountForPost(postId: string): Promise<number> {
    const { count } = await supabase.from('saves').select('*', { count: 'exact', head: true }).eq('postId', postId);
    return count || 0;
  }

  // ── Follows ───────────────────────────────────────────────────────────────
  static async getFollows(userId: string): Promise<string[]> {
    const { data, error } = await supabase.from('follows').select('followingId').eq('followerId', userId);
    if (error) return [];
    return data.map(d => d.followingId);
  }

  static async toggleFollow(currentUserId: string, targetUserId: string): Promise<boolean> {
    const { data } = await supabase.from('follows').select('id').eq('followerId', currentUserId).eq('followingId', targetUserId).maybeSingle();
    let following = false;

    if (data) {
      await supabase.from('follows').delete().eq('id', data.id);
      following = false;
    } else {
      await supabase.from('follows').insert({ followerId: currentUserId, followingId: targetUserId });
      following = true;
    }

    const target = await this.getUser(targetUserId);
    const current = await this.getUser(currentUserId);

    if (target) {
      target.followersCount = Math.max(0, target.followersCount + (following ? 1 : -1));
      await this.saveUser(target);
    }
    if (current) {
      current.followingCount = Math.max(0, current.followingCount + (following ? 1 : -1));
      await this.saveUser(current);
    }

    return following;
  }

  // ── Proposals ─────────────────────────────────────────────────────────────
  static async submitProposal(proposal: Omit<ProposalModel, 'id' | 'createdAt' | 'status'>): Promise<ProposalModel | null> {
    const { data, error } = await supabase
      .from('proposals')
      .insert({
        ...proposal,
        status: 'pending',
        createdAt: new Date().toISOString(),
      })
      .select()
      .single();
    if (error) {
      console.error('Error submitting proposal:', error);
      return null;
    }
    return data as ProposalModel;
  }

  static async getProposalsForOpportunity(opportunityId: string): Promise<ProposalModel[]> {
    const { data, error } = await supabase
      .from('proposals')
      .select('*')
      .eq('opportunityId', opportunityId)
      .order('createdAt', { ascending: false });
    if (error) return [];
    return data as ProposalModel[];
  }

  static async getProposalsByApplicant(applicantId: string): Promise<ProposalModel[]> {
    const { data, error } = await supabase
      .from('proposals')
      .select('*')
      .eq('applicantId', applicantId)
      .order('createdAt', { ascending: false });
    if (error) return [];
    return data as ProposalModel[];
  }

  static async updateProposalStatus(proposalId: string, status: ProposalStatus): Promise<void> {
    const { error } = await supabase
      .from('proposals')
      .update({ status })
      .eq('id', proposalId);
    if (error) console.error('Error updating proposal status:', error);
  }

  static async getProposalCountForOpportunity(opportunityId: string): Promise<number> {
    const { count } = await supabase
      .from('proposals')
      .select('*', { count: 'exact', head: true })
      .eq('opportunityId', opportunityId);
    return count || 0;
  }

  // ── Hiring Selections ─────────────────────────────────────────────────────
  static async saveHiringSelection(selection: Omit<HiringSelectionModel, 'id' | 'createdAt'>): Promise<HiringSelectionModel | null> {
    const { data, error } = await supabase
      .from('hiring_selections')
      .insert({ ...selection, createdAt: new Date().toISOString() })
      .select()
      .single();
    if (error) {
      console.error('Error saving hiring selection:', error);
      return null;
    }
    return data as HiringSelectionModel;
  }

  static async getHiringSelections(opportunityId: string): Promise<HiringSelectionModel[]> {
    const { data, error } = await supabase
      .from('hiring_selections')
      .select('*')
      .eq('opportunityId', opportunityId);
    if (error) return [];
    return data as HiringSelectionModel[];
  }

  static async removeHiringSelection(selectionId: string): Promise<void> {
    await supabase.from('hiring_selections').delete().eq('id', selectionId);
  }

  static async confirmHiring(opportunityId: string): Promise<void> {
    await supabase
      .from('hiring_selections')
      .update({ status: 'confirmed' })
      .eq('opportunityId', opportunityId);
  }

  // ── Notifications ─────────────────────────────────────────────────────────
  static async createNotification(notif: Omit<NotificationModel, 'id' | 'createdAt' | 'read'>): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .insert({ ...notif, read: false, createdAt: new Date().toISOString() });
    if (error) console.error('Error creating notification:', error);
  }

  static async getNotifications(recipientId: string): Promise<NotificationModel[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('recipientId', recipientId)
      .order('createdAt', { ascending: false })
      .limit(50);
    if (error) return [];
    return data as NotificationModel[];
  }

  static async markNotificationsRead(recipientId: string): Promise<void> {
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('recipientId', recipientId)
      .eq('read', false);
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function normalizeUser(u: UserModel): UserModel {
  return {
    ...u,
    roles: u.roles ?? [],
    creatorCategories: u.creatorCategories ?? [],
    skills: u.skills ?? [],
    followersCount: u.followersCount ?? 0,
    followingCount: u.followingCount ?? 0,
    projectsCompleted: u.projectsCompleted ?? 0,
    reviewCount: u.reviewCount ?? 0,
    reviewRating: u.reviewRating ?? 0,
    isVerified: u.isVerified ?? false,
    hireCount: u.hireCount ?? 0,
  };
}
