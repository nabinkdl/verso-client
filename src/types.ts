export interface User {
  id: string;
  name: string;
  username: string;
  followers: string[];
  following: string[];
}

export interface Comment {
  userId: string;
  text: string;
}

export interface Post {
  id: string;
  authorId: string;
  caption: string;
  imageUrl?: string;
  imageAlt?: string;
  likes: string[];
  comments: Comment[];
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

export type Screen = 'login' | 'register' | 'home' | 'search' | 'newPost' | 'chat' | 'profile';
