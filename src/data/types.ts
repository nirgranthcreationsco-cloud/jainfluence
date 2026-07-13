export interface UserModel {
  uid: string;
  name: string;
  username: string;
  phone: string;
  bio: string;
  profilePhoto?: string;
  coverPhoto?: string;
  location?: string;
  skills: string[];
  followersCount: number;
  followingCount: number;
  projectsCompleted: number;
  reviewCount: number;
  reviewRating: number;
  isVerified: boolean;
  hireCount: number;
}

export type ActivityType =
  | 'photo'
  | 'video'
  | 'event'
  | 'article'
  | 'opportunity'
  | 'project'
  | 'announcement'
  | 'achievement';

/** Represents a single community activity / contribution. */
export interface ActivityModel {
  postId: string;        // kept as-is so Supabase column name stays stable
  authorId: string;
  authorName: string;
  authorPhoto?: string;
  mediaUrls: string[];
  caption?: string;
  hashtags: string[];
  activityType: ActivityType;
  likesCount: number;
  commentsCount: number;
  timestamp: string;
  /** 'live' | 'archived' | 'pending' — pending = optimistic, not yet confirmed */
  status: 'live' | 'archived' | 'pending';
  engagementScore: number;
}

/** @deprecated Use ActivityModel */
export type PostModel = ActivityModel;
