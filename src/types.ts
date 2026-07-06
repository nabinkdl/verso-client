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

export type Screen = 'login' | 'register' | 'home' | 'search' | 'newPost' | 'reels' | 'notifications' | 'chat' | 'profile';
