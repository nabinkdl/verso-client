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
import SavedScreen from "./components/SavedScreen";
import LoginScreen from "./components/LoginScreen";
import RegisterScreen from "./components/RegisterScreen";
import ForgetScreen from "./components/ForgetScreen";
import { DarkModeProvider, useDarkMode } from "./context/DarkModeContext";
import { SpeedInsights } from "@vercel/speed-insights/react";

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

function AppContent() {
  const { darkMode, toggleDarkMode } = useDarkMode();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeScreen, setActiveScreen] = useState<Screen>("login");
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [chats, setChats] = useState<Chat[]>(initialChats);
  const [notifications, setNotifications] =
    useState<NotificationItem[]>(initialNotifications);
  const [profileUserId, setProfileUserId] = useState(CURRENT_USER_ID);
  const [targetChatId, setTargetChatId] = useState<string | null>(null);
  const [savedPosts, setSavedPosts] = useState<string[]>([]);

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

  const handleNavigateToForget = () => {
    setActiveScreen("forget");
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
                  createdAt: Date.now(),
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

  const handleToggleSave = (postId: string) => {
    setSavedPosts((prev) =>
      prev.includes(postId)
        ? prev.filter((id) => id !== postId)
        : [...prev, postId],
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

  const handleMessageUser = (userId: string) => {
    let existingChat = chats.find(c => c.participants.includes(CURRENT_USER_ID) && c.participants.includes(userId));
    if (!existingChat) {
       existingChat = {
         id: `c${Date.now()}`,
         participants: [CURRENT_USER_ID, userId],
         messages: [],
         lastUpdated: Date.now()
       };
       setChats(prev => [...prev, existingChat!]);
    }
    setTargetChatId(existingChat.id);
    setActiveScreen("chat");
  };

  const handleNav = (screen: Screen) => {
    if (screen === "profile") setProfileUserId(CURRENT_USER_ID);
    if (screen !== "chat") setTargetChatId(null);
    setActiveScreen(screen);
  };

  const handleViewProfile = (userId: string) => {
    setProfileUserId(userId);
    setActiveScreen("profile");
  };

  return (
      <div
      className={`relative flex items-center justify-center min-h-screen transition-colors duration-300 ${darkMode ? "dark" : ""}`}
      style={{
        background: darkMode ? "#121212" : "#f2f2f7",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      }}
    >
      <div
        className="w-full max-w-[390px] h-[780px] rounded-[28px] overflow-hidden flex flex-col transition-[background,color,box-shadow] duration-300"
        style={{ background: "var(--bg)", color: "var(--text)", boxShadow: "var(--shadow)" }}
      >
        <button
          onClick={toggleDarkMode}
          className="absolute top-4 right-4 bg-transparent rounded-full px-3 py-1.5 cursor-pointer text-xs z-10 backdrop-blur-sm transition-all duration-200 hover:scale-105 active:scale-95"
          style={{
            color: "var(--text)",
            border: "0.5px solid var(--separator)",
          }}
        >
          <span className="flex items-center gap-2">
            {darkMode ? (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
                Light
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
                Dark
              </>
            )}
          </span>
        </button>
        {activeScreen === "login" && (
          <LoginScreen
            onLogin={handleLogin}
            onNavigateToRegister={handleNavigateToRegister}
            onNavigateToForget={handleNavigateToForget}
          />
        )}
        {activeScreen === "register" && (
          <RegisterScreen
            onRegister={handleRegister}
            onNavigateToLogin={handleNavigateToLogin}
          />
        )}
        {activeScreen === "forget" && (
          <ForgetScreen
            onNavigateToLogin={handleNavigateToLogin}
          />
        )}
        {activeScreen === "home" && (
          <HomeScreen
            posts={posts}
            users={users}
            currentUserId={CURRENT_USER_ID}
            savedPosts={savedPosts}
            onToggleSave={handleToggleSave}
            onLike={handleLike}
            onComment={handleComment}
            onEditPost={handleEditPost}
            onDeletePost={handleDeletePost}
            onEditComment={handleEditComment}
            onDeleteComment={handleDeleteComment}
            onToggleFollow={handleToggleFollow}
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
          <NewPostScreen onPublish={handlePublish} onClose={() => setActiveScreen("home")} />
        )}
        {activeScreen === "reels" && (
          <ReelScreen
            posts={posts}
            users={users}
            currentUserId={CURRENT_USER_ID}
            savedPosts={savedPosts}
            onToggleSave={handleToggleSave}
            onLike={handleLike}
            onComment={handleComment}
          />
        )}
        {activeScreen === "notifications" && (
          <NotificationScreen notifications={notifications} onClose={() => setActiveScreen("home")} />
        )}
        {activeScreen === "chat" && (
          <ChatScreen
            chats={chats}
            users={users}
            currentUserId={CURRENT_USER_ID}
            onSendMessage={handleSendMessage}
            targetChatId={targetChatId}
            onClearTargetChat={() => setTargetChatId(null)}
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
            onLike={handleLike}
            onToggleSave={handleToggleSave}
            savedPosts={savedPosts}
            onEditPost={handleEditPost}
            onDeletePost={handleDeletePost}
            onComment={handleComment}
            onEditComment={handleEditComment}
            onDeleteComment={handleDeleteComment}
            onToggleFollow={handleToggleFollow}
            onMessage={() => handleMessageUser(profileUserId)}
          />
        )}
        {activeScreen === "saved" && (
          <SavedScreen
            posts={posts}
            users={users}
            currentUserId={CURRENT_USER_ID}
            savedPosts={savedPosts}
            onToggleSave={handleToggleSave}
            onLike={handleLike}
            onComment={handleComment}
            onEditComment={handleEditComment}
            onDeleteComment={handleDeleteComment}
            onClose={() => setActiveScreen("profile")}
          />
        )}
        {isLoggedIn && <BottomNav active={activeScreen} onChange={handleNav} />}
      </div>
      <SpeedInsights />
    </div>
  );
}

export default function App() {
  return (
    <DarkModeProvider>
      <AppContent />
    </DarkModeProvider>
  );
}
