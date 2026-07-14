import type { UserModel, ActivityModel } from '../types';
import { supabase } from './supabaseClient';

export class StorageService {
  // Auth Session
  static getCurrentUserId(): string | null {
    return localStorage.getItem('currentUserId');
  }

  static setCurrentUserId(uid: string) {
    localStorage.setItem('currentUserId', uid);
  }

  static clearSession() {
    localStorage.removeItem('currentUserId');
  }

  // First-run Onboarding
  static hasCompletedOnboarding(): boolean {
    return localStorage.getItem('hasCompletedOnboarding') === 'true';
  }

  static setOnboardingComplete() {
    localStorage.setItem('hasCompletedOnboarding', 'true');
  }

  // Users Database
  static async getUsers(): Promise<UserModel[]> {
    const { data, error } = await supabase.from('users').select('*');
    if (error) {
      console.error('Error fetching users:', error);
      return [];
    }
    return data as UserModel[];
  }

  static async getUser(uid: string): Promise<UserModel | null> {
    const { data, error } = await supabase.from('users').select('*').eq('uid', uid).single();
    if (error) {
      console.error('Error fetching user:', error);
      return null;
    }
    return data as UserModel;
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

  // Posts Database
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
    const { activityType, ...dbPost } = post as any;
    const { error } = await supabase.from('posts').upsert(dbPost);
    if (error) console.error('Error saving post:', error);
  }

  static async deletePost(postId: string): Promise<void> {
    const { error } = await supabase.from('posts').delete().eq('postId', postId);
    if (error) console.error('Error deleting post:', error);
  }

  static async saveAllPosts(posts: ActivityModel[]): Promise<void> {
    const dbPosts = posts.map(({ activityType, ...dbPost }: any) => dbPost);
    const { error } = await supabase.from('posts').upsert(dbPosts);
    if (error) console.error('Error saving all posts:', error);
  }

  // Likes System
  static async getLikes(userId: string): Promise<string[]> {
    const { data, error } = await supabase.from('likes').select('postId').eq('userId', userId);
    if (error) return [];
    return data.map(d => d.postId);
  }

  static async toggleLike(userId: string, postId: string): Promise<boolean> {
    const { data } = await supabase.from('likes').select('id').eq('userId', userId).eq('postId', postId).maybeSingle();
    let isLiked = false;

    if (data) {
      // Unlike
      await supabase.from('likes').delete().eq('id', data.id);
      isLiked = false;
    } else {
      // Like
      await supabase.from('likes').insert({ userId, postId });
      isLiked = true;
    }

    // Update post count in Supabase
    const { data: postData } = await supabase.from('posts').select('likesCount').eq('postId', postId).single();
    if (postData) {
      const newCount = Math.max(0, postData.likesCount + (isLiked ? 1 : -1));
      await supabase.from('posts').update({ likesCount: newCount }).eq('postId', postId);
    }

    return isLiked;
  }

  // Saves System
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

  // Follow System
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

    // Update counts
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
}
