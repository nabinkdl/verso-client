export interface User {
  id: string;
  name: string;
  username: string;
  avatarUrl?: string;
  followers: string[];
  following: string[];
  /** Server-side counts, when the user came from the API. */
  followerCount?: number;
  followingCount?: number;
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

export type Screen = 'login' | 'register' | 'forget' | 'reset-password' | 'home' | 'search' | 'newPost' | 'reels' | "notifications"
  | "chat"
  | "profile"
  | "pages"
  | "marketplace"
  | "admin";

// Admin / RBAC Types
export type AdminRole = 'admin' | 'editor' | 'moderator' | 'member' | 'custom';
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

// Marketplace Types
export type DeliveryMethod = 'local_meetup' | 'delivery';

export interface Product {
  id: string;
  title: string;
  price: number;
  description: string;
  category: string;
  condition: 'New' | 'Like New' | 'Good' | 'Fair';
  deliveryMethod: DeliveryMethod;
  image: string;
  images?: string[];
  location: string;
  sellerId: string;
  sellerName: string;
  createdAt: number;
}

export interface CartItem {
  productId: string;
  quantity: number;
}

export type OrderStatus =
  | 'Confirmed'
  | 'Shipped'
  | 'In Transit'
  | 'Delivered'
  | 'Seller Accepted'
  | 'Meetup Scheduled'
  | 'Completed'
  | 'Cancelled';

export interface OrderItem {
  productId: string;
  title: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Order {
  id: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  deliveryMethod: DeliveryMethod;
  deliveryAddress?: string;
  createdAt: number;
  estimatedDelivery: number;
  trackingNumber: string;
}
