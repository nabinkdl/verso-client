import { useState } from "react";
import { Screen, User, Post, Chat, NotificationItem } from "./types";
import {
  initialUsers,
  initialPosts,
  initialChats,
  initialNotifications,
} from "./data";
import BottomNav from "./components/BottomNav";
import HomeScreen from "./components/HomeScreen";
import SearchScreen from "./components/SearchScreen";
import NewPostScreen from "./components/NewPostScreen";
import ReelScreen from "./components/ReelScreen";
import NotificationScreen from "./components/NotificationScreen";
import ChatScreen from "./components/ChatScreen";
import ProfileScreen from "./components/ProfileScreen";
import LoginScreen from "./components/LoginScreen";
import RegisterScreen from "./components/RegisterScreen";

const CURRENT_USER_ID = "u1";

const makePostImage = (seed: string) => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="900" height="900" viewBox="0 0 900 900">
      <defs>
        <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#f2f2f2"/>
          <stop offset="45%" stop-color="#6a6a6a"/>
          <stop offset="100%" stop-color="#050505"/>
        </linearGradient>
      </defs>
      <rect width="900" height="900" fill="url(#g)"/>
      <circle cx="170" cy="180" r="92" fill="rgba(255,255,255,0.22)"/>
      <rect x="96" y="634" width="708" height="106" rx="53" fill="rgba(0,0,0,0.26)"/>
      <text x="96" y="592" fill="#ffffff" font-family="Arial, Helvetica, sans-serif" font-size="54" font-weight="700">${seed}</text>
    </svg>
  `
    .replace(/\s+/g, " ")
    .trim();

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeScreen, setActiveScreen] = useState<Screen>("login");
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [chats, setChats] = useState<Chat[]>(initialChats);
  const [notifications, setNotifications] =
    useState<NotificationItem[]>(initialNotifications);
  const [profileUserId, setProfileUserId] = useState(CURRENT_USER_ID);

  const pushNotification = (
    item: Omit<NotificationItem, "id" | "createdAt">,
  ) => {
    setNotifications((prev) => [
      {
        ...item,
        id: `n${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
        createdAt: Date.now(),
      },
      ...prev,
    ]);
  };

  const handleLogin = (email: string, password: string) => {
    setIsLoggedIn(true);
    setActiveScreen("home");
  };

  const handleRegister = (
    name: string,
    username: string,
    email: string,
    password: string,
  ) => {
    // Add the new user to the users list
    const newUser: User = {
      id: `u${Date.now()}`,
      name,
      username,
      followers: [],
      following: [],
    };
    setUsers((prev) => [...prev, newUser]);

    // Auto-login after registration
    setIsLoggedIn(true);
    setActiveScreen("home");
  };

  const handleNavigateToRegister = () => {
    setActiveScreen("register");
  };

  const handleNavigateToLogin = () => {
    setActiveScreen("login");
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setActiveScreen("login");
  };

  const handleLike = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        const liked = p.likes.includes(CURRENT_USER_ID);
        return {
          ...p,
          likes: liked
            ? p.likes.filter((id) => id !== CURRENT_USER_ID)
            : [...p.likes, CURRENT_USER_ID],
        };
      }),
    );
    pushNotification({
      title: "Like updated",
      message: "You reacted to a post from the feed.",
      kind: "like",
    });
  };

  const handleEditPost = (postId: string, caption: string) => {
    setPosts((prev) =>
      prev.map((post) => (post.id === postId ? { ...post, caption } : post)),
    );
  };

  const handleDeletePost = (postId: string) => {
    setPosts((prev) => prev.filter((post) => post.id !== postId));
  };

  const handleComment = (postId: string, text: string) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id !== postId
          ? p
          : {
              ...p,
              comments: [
                ...p.comments,
                {
                  id: `c${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
                  userId: CURRENT_USER_ID,
                  text,
                },
              ],
            },
      ),
    );
    pushNotification({
      title: "Comment posted",
      message: text,
      kind: "comment",
    });
  };

  const handleEditComment = (
    postId: string,
    commentId: string,
    text: string,
  ) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id !== postId
          ? post
          : {
              ...post,
              comments: post.comments.map((comment) =>
                comment.id === commentId ? { ...comment, text } : comment,
              ),
            },
      ),
    );
  };

  const handleDeleteComment = (postId: string, commentId: string) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id !== postId
          ? post
          : {
              ...post,
              comments: post.comments.filter(
                (comment) => comment.id !== commentId,
              ),
            },
      ),
    );
  };

  const handleToggleFollow = (targetId: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id !== CURRENT_USER_ID) return u;
        const isFollowing = u.following.includes(targetId);
        return {
          ...u,
          following: isFollowing
            ? u.following.filter((id) => id !== targetId)
            : [...u.following, targetId],
        };
      }),
    );
    pushNotification({
      title: "Following updated",
      message: "You changed who you follow.",
      kind: "follow",
    });
  };

  const handlePublish = (
    caption: string,
    media?: { url: string; type: "image" | "video"; name: string },
  ) => {
    const isVideo = media?.type === "video";
    const fallbackMedia = makePostImage(`NEW`);
    const newPost: Post = {
      id: `p${Date.now()}`,
      authorId: CURRENT_USER_ID,
      caption,
      imageUrl: isVideo ? undefined : (media?.url ?? fallbackMedia),
      imageAlt: caption || "New post image",
      mediaUrl: media?.url ?? fallbackMedia,
      mediaType: media?.type ?? "image",
      likes: [],
      comments: [],
      createdAt: Date.now(),
    };
    setPosts((prev) => [newPost, ...prev]);
    pushNotification({
      title: isVideo ? "Reel uploaded" : "Post uploaded",
      message: media?.name ?? (caption || "New content is now live."),
      kind: isVideo ? "reel" : "post",
    });
    setActiveScreen("home");
  };

  const handleSendMessage = (chatId: string, text: string) => {
    setChats((prev) =>
      prev.map((c) =>
        c.id !== chatId
          ? c
          : {
              ...c,
              messages: [
                ...c.messages,
                { from: CURRENT_USER_ID, text, timestamp: Date.now() },
              ],
              lastUpdated: Date.now(),
            },
      ),
    );
  };

  const handleEditName = (newName: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id !== CURRENT_USER_ID ? u : { ...u, name: newName })),
    );
  };

  const handleNav = (screen: Screen) => {
    if (screen === "profile") setProfileUserId(CURRENT_USER_ID);
    setActiveScreen(screen);
  };

  const handleViewProfile = (userId: string) => {
    setProfileUserId(userId);
    setActiveScreen("profile");
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        background: "#000",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 380,
          height: 700,
          background: "#000",
          borderRadius: 32,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 0 0 1px #2a2a2a, 0 20px 35px -12px rgba(0,0,0,0.8)",
          color: "#fff",
        }}
      >
        {activeScreen === "login" && (
          <LoginScreen
            onLogin={handleLogin}
            onNavigateToRegister={handleNavigateToRegister}
          />
        )}
        {activeScreen === "register" && (
          <RegisterScreen
            onRegister={handleRegister}
            onNavigateToLogin={handleNavigateToLogin}
          />
        )}
        {activeScreen === "home" && (
          <HomeScreen
            posts={posts}
            users={users}
            currentUserId={CURRENT_USER_ID}
            onLike={handleLike}
            onComment={handleComment}
            onEditPost={handleEditPost}
            onDeletePost={handleDeletePost}
            onEditComment={handleEditComment}
            onDeleteComment={handleDeleteComment}
            onCreatePost={() => setActiveScreen("newPost")}
            onOpenNotifications={() => setActiveScreen("notifications")}
          />
        )}
        {activeScreen === "search" && (
          <SearchScreen
            users={users}
            currentUserId={CURRENT_USER_ID}
            onToggleFollow={handleToggleFollow}
            onViewProfile={handleViewProfile}
          />
        )}
        {activeScreen === "newPost" && (
          <NewPostScreen onPublish={handlePublish} />
        )}
        {activeScreen === "reels" && (
          <ReelScreen
            posts={posts}
            users={users}
            currentUserId={CURRENT_USER_ID}
            onLike={handleLike}
          />
        )}
        {activeScreen === "notifications" && (
          <NotificationScreen notifications={notifications} />
        )}
        {activeScreen === "chat" && (
          <ChatScreen
            chats={chats}
            users={users}
            currentUserId={CURRENT_USER_ID}
            onSendMessage={handleSendMessage}
          />
        )}
        {activeScreen === "profile" && (
          <ProfileScreen
            profileUserId={profileUserId}
            currentUserId={CURRENT_USER_ID}
            users={users}
            posts={posts}
            onNewPost={() => setActiveScreen("newPost")}
            onEditName={handleEditName}
            onLogout={handleLogout}
          />
        )}
        {isLoggedIn && <BottomNav active={activeScreen} onChange={handleNav} />}
      </div>
    </div>
  );
}
