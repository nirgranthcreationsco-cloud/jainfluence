// ─── Role & Category Types ────────────────────────────────────────────────────

export type UserRole = 'Creator' | 'Business' | 'Individual' | 'Organization';

export type CreatorCategory =
  | 'Photographer'
  | 'Videographer'
  | 'Graphic Designer'
  | 'Website Developer'
  | 'App Developer'
  | 'Artist';

export const ALL_CREATOR_CATEGORIES: CreatorCategory[] = [
  'Photographer',
  'Videographer',
  'Graphic Designer',
  'Website Developer',
  'App Developer',
  'Artist',
];

export const ALL_USER_ROLES: UserRole[] = [
  'Creator',
  'Business',
  'Individual',
  'Organization',
];

// ─── User Model ───────────────────────────────────────────────────────────────

export interface UserModel {
  uid: string;
  name: string;
  username: string;
  phone?: string;
  email?: string;
  passwordHash?: string;
  bio: string;
  city?: string;
  profilePhoto?: string;
  coverPhoto?: string;
  location?: string;
  skills: string[];

  // V2: Professional Identity
  roles: UserRole[];
  creatorCategories: CreatorCategory[];
  instagramUrl?: string;
  portfolioUrl?: string;
  professionalSummary?: string;

  // V2: Business Info
  businessName?: string;
  businessIndustry?: string;
  businessWebsite?: string;

  // Stats
  followersCount: number;
  followingCount: number;
  projectsCompleted: number;
  reviewCount: number;
  reviewRating: number;
  isVerified: boolean;
  hireCount: number;
}

// ─── Activity / Post Model ────────────────────────────────────────────────────

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
  authorRoles?: UserRole[];   // V2: for badge rendering on feed cards
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

// ─── Proposal Model ───────────────────────────────────────────────────────────

export type ProposalStatus = 'pending' | 'accepted' | 'rejected';

export interface ProposalModel {
  id: string;
  opportunityId: string;
  applicantId: string;
  applicantName: string;
  applicantPhoto?: string;
  creatorCategories: CreatorCategory[];
  offerPrice: string;
  message: string;
  estimatedDelivery: string;
  portfolioUrl?: string;
  instagramUrl?: string;
  status: ProposalStatus;
  createdAt: string;
}

// ─── Hiring Selection Model ───────────────────────────────────────────────────

export interface HiringSelectionModel {
  id: string;
  opportunityId: string;
  businessId: string;
  creatorId: string;
  creatorName: string;
  creatorPhoto?: string;
  agreedPrice: string;
  status: 'selected' | 'confirmed';
  createdAt: string;
}

// ─── Notification Model ───────────────────────────────────────────────────────

export type NotificationType =
  | 'like'
  | 'follow'
  | 'comment'
  | 'proposal_received'
  | 'proposal_accepted'
  | 'proposal_rejected'
  | 'hiring_confirmed';

export interface NotificationModel {
  id: string;
  recipientId: string;
  senderId?: string;
  senderName?: string;
  senderPhoto?: string;
  type: NotificationType;
  referenceId?: string;  // opportunityId or postId
  message: string;
  read: boolean;
  createdAt: string;
}
