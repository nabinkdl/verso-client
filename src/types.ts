export interface User {
  id: string;
  name: string;
  username: string;
  followers: string[];
  following: string[];
}

export interface Comment {
  id: string;
  userId: string;
  text: string;
}

export interface Post {
  id: string;
  authorId: string;
  pageId?: string;
  caption: string;
  imageUrl?: string;
  imageAlt?: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  likes: string[];
  comments: Comment[];
  createdAt: number;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  kind: 'like' | 'comment' | 'follow' | 'post' | 'reel';
  createdAt: number;
}

export interface Message {
  from: string;
  text: string;
  timestamp: number;
}

export interface Chat {
  id: string;
  participants: string[];
  messages: Message[];
  lastUpdated: number;
}

export interface PageMember {
  userId: string;
  role: AdminRole;
  joinedAt: string;
  permissions?: string[];
}

export interface PageEvent {
  id: string;
  title: string;
  date: number;
  description: string;
}

export interface Page {
  id: string;
  name: string;
  category: string;
  description: string;
  visibility: string;
  avatar: string;
  members: PageMember[];
  joinRequests?: string[];
  invitedUsers?: string[];
  isVerified: boolean;
  coverUrl?: string;
  rules?: string[];
  events?: PageEvent[];
  analytics?: { views: number; membersTrend: number };
}

export type Screen = 'login' | 'register' | 'forget' | 'home' | 'search' | 'newPost' | 'reels' | "notifications"
  | "chat"
  | "profile"
  | "pages"
  | "admin";

// Admin / RBAC Types
export type AdminRole = 'admin' | 'editor' | 'moderator' | 'member' | 'guest' | 'custom';
export type UserStatus = 'active' | 'pending' | 'suspended';

export interface PermissionDef {
  id: string;
  label: string;
  description: string;
  category: 'content' | 'social' | 'moderation' | 'system';
}

export interface AdminUser extends User {
  email: string;
  role: AdminRole;
  status: UserStatus;
  joinedAt: number;
  invitedBy?: string;
  permissions: string[]; // manually selected permission IDs (for custom role)
}
