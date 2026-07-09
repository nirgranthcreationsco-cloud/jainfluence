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

export interface PostModel {
  postId: string;
  authorId: string;
  authorName: string;
  authorPhoto?: string;
  mediaUrls: string[];
  caption?: string;
  hashtags: string[];
  likesCount: number;
  commentsCount: number;
  timestamp: string;
  status: 'live' | 'archived';
  engagementScore: number;
}
