import type { AdminUser, ChatMessage, Comment, Conversation, Post } from "../types";

export const API_URL =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") ??
  "http://localhost:3000/api";

const TOKEN_KEY = "verso-token";
const DEFAULT_PERMISSIONS = [
  "read",
  "post",
  "comment",
  "like",
  "edit_own",
  "follow",
  "dm",
  "mention",
];

export interface ApiUser {
  id: string;
  email?: string;
  username: string;
  name: string;
  bio?: string | null;
  avatarUrl?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiProfile extends ApiUser {
  followerCount: number;
  followingCount: number;
  postCount: number;
  isFollowing?: boolean;
  isMe?: boolean;
}

export interface ApiPost {
  id: string;
  authorId: string;
  caption: string;
  imageUrl?: string | null;
  imageAlt?: string | null;
  mediaUrl?: string | null;
  mediaType?: "IMAGE" | "VIDEO" | null;
  createdAt: string;
  updatedAt?: string;
  author: ApiUser;
  likeCount: number;
  commentCount: number;
  likedByMe: boolean;
  isMine: boolean;
}

export interface ApiComment {
  id: string;
  postId: string;
  authorId: string;
  text: string;
  createdAt: string;
  author: ApiUser;
}

export interface AuthResponse {
  accessToken: string;
  user: ApiUser;
}

export interface Paginated<T> {
  data: T[];
  meta: {
    nextCursor: string | null;
    hasMore: boolean;
    limit: number;
  };
}

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string | null): void {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    // Storage unavailable — keep the token in memory only for this session.
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    ...(init.body ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...((init.headers as Record<string, string> | undefined) ?? {}),
  };

  const response = await fetch(`${API_URL}${path}`, { ...init, headers });

  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const body = (await response.json()) as { message?: string | string[] };
      if (Array.isArray(body.message)) message = body.message.join(", ");
      else if (body.message) message = body.message;
    } catch {
      // Non-JSON error body — keep the status message.
    }
    throw new Error(message);
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export const api = {
  login: (identifier: string, password: string) =>
    request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ identifier, password }),
    }),

  register: (name: string, username: string, email: string, password: string) =>
    request<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, username, email, password }),
    }),

  me: () => request<ApiUser>("/auth/me"),

  forgotPassword: (email: string) =>
    request<{ message: string }>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  resetPassword: (token: string, password: string) =>
    request<{ message: string }>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, password }),
    }),

  listPosts: (params: { cursor?: string; limit?: number } = {}) => {
    const search = new URLSearchParams();
    if (params.cursor) search.set("cursor", params.cursor);
    if (params.limit) search.set("limit", String(params.limit));
    const query = search.toString();
    return request<Paginated<ApiPost>>(`/posts${query ? `?${query}` : ""}`);
  },

  createPost: (input: {
    caption?: string;
    imageUrl?: string;
    imageAlt?: string;
    mediaUrl?: string;
    mediaType?: "IMAGE" | "VIDEO";
  }) =>
    request<ApiPost>("/posts", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  updatePost: (postId: string, input: { caption?: string }) =>
    request<ApiPost>(`/posts/${postId}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    }),

  deletePost: (postId: string) =>
    request<{ deleted: boolean }>(`/posts/${postId}`, { method: "DELETE" }),

  likePost: (postId: string) =>
    request<{ liked: boolean; likeCount: number }>(`/posts/${postId}/like`, {
      method: "POST",
    }),

  unlikePost: (postId: string) =>
    request<{ liked: boolean; likeCount: number }>(`/posts/${postId}/like`, {
      method: "DELETE",
    }),

  comments: (postId: string) =>
    request<ApiComment[]>(`/posts/${postId}/comments`),

  addComment: (postId: string, text: string) =>
    request<ApiComment>(`/posts/${postId}/comments`, {
      method: "POST",
      body: JSON.stringify({ text }),
    }),

  deleteComment: (postId: string, commentId: string) =>
    request<{ deleted: boolean }>(`/posts/${postId}/comments/${commentId}`, {
      method: "DELETE",
    }),

  profile: (username: string) =>
    request<ApiProfile>(`/users/${encodeURIComponent(username)}`),

  searchUsers: (query: string) =>
    request<ApiUser[]>(
      `/users/search?q=${encodeURIComponent(query)}&limit=50`,
    ),

  updateProfile: (input: {
    name?: string;
    bio?: string | null;
    avatarUrl?: string | null;
  }) =>
    request<ApiUser>("/users/me", {
      method: "PATCH",
      body: JSON.stringify(input),
    }),

  follow: (username: string) =>
    request<{ following: boolean }>(
      `/users/${encodeURIComponent(username)}/follow`,
      { method: "POST" },
    ),

  unfollow: (username: string) =>
    request<{ following: boolean }>(
      `/users/${encodeURIComponent(username)}/follow`,
      { method: "DELETE" },
    ),

  listConversations: (params: { cursor?: string; limit?: number } = {}) => {
    const search = new URLSearchParams();
    if (params.cursor) search.set("cursor", params.cursor);
    if (params.limit) search.set("limit", String(params.limit));
    const query = search.toString();
    return request<Paginated<Conversation>>(
      `/conversations${query ? `?${query}` : ""}`,
    );
  },

  conversation: (conversationId: string) =>
    request<Conversation>(`/conversations/${conversationId}`),

  createConversation: (input: { username?: string; userId?: string }) =>
    request<Conversation>("/conversations", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  messages: (
    conversationId: string,
    params: { cursor?: string; limit?: number } = {},
  ) => {
    const search = new URLSearchParams();
    if (params.cursor) search.set("cursor", params.cursor);
    if (params.limit) search.set("limit", String(params.limit));
    const query = search.toString();
    return request<Paginated<ChatMessage>>(
      `/conversations/${conversationId}/messages${query ? `?${query}` : ""}`,
    );
  },

  sendMessage: (conversationId: string, text: string) =>
    request<ChatMessage>(`/conversations/${conversationId}/messages`, {
      method: "POST",
      body: JSON.stringify({ text }),
    }),

  markConversationRead: (conversationId: string, messageId?: string) =>
    request<{
      conversationId: string;
      userId: string;
      lastReadAt: string;
      unreadCount: number;
    }>(`/conversations/${conversationId}/read`, {
      method: "POST",
      body: JSON.stringify(messageId ? { messageId } : {}),
    }),

  unreadMessages: () =>
    request<{ count: number; conversations: number }>(
      "/conversations/unread-count",
    ),
};

export function toUiUser(input: ApiUser | ApiProfile): AdminUser {
  const profile = input as ApiProfile;

  return {
    id: input.id,
    name: input.name,
    username: input.username,
    email: input.email ?? "",
    avatarUrl: input.avatarUrl ?? undefined,
    followers: [],
    following: [],
    followerCount:
      typeof profile.followerCount === "number"
        ? profile.followerCount
        : undefined,
    followingCount:
      typeof profile.followingCount === "number"
        ? profile.followingCount
        : undefined,
    role: "member",
    status: "active",
    joinedAt: input.createdAt ? Date.parse(input.createdAt) : Date.now(),
    permissions: DEFAULT_PERMISSIONS,
  };
}

export function toUiPost(post: ApiPost, currentUserId: string): Post {
  const placeholderCount = Math.max(
    post.likeCount - (post.likedByMe ? 1 : 0),
    0,
  );
  const likes = Array.from(
    { length: placeholderCount },
    (_, index) => `like-${post.id}-${index}`,
  );
  if (post.likedByMe) likes.unshift(currentUserId);

  return {
    id: post.id,
    authorId: post.authorId,
    caption: post.caption,
    imageUrl: post.imageUrl ?? undefined,
    imageAlt: post.imageAlt ?? undefined,
    mediaUrl: post.mediaUrl ?? undefined,
    mediaType:
      post.mediaType === "IMAGE"
        ? "image"
        : post.mediaType === "VIDEO"
          ? "video"
          : undefined,
    likes,
    comments: [],
    createdAt: Date.parse(post.createdAt),
  };
}

export function toUiComment(comment: ApiComment): Comment {
  return {
    id: comment.id,
    userId: comment.authorId,
    text: comment.text,
  };
}
