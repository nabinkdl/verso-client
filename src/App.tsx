import { useState } from "react";
import { Screen, User, Post, Chat, NotificationItem, Page, AdminUser } from "./types";
import { PageProvider, usePages } from './contexts/PageContext';
import {
  CURRENT_USER_ID,
  initialUsers,
  initialPosts,
  initialChats,
  initialNotifications,
  initialPages,
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
import ForgetScreen from "./components/ForgetScreen";
import PageManagementScreen from './components/PageManagementScreen';
import PageViewScreen from './components/PageViewScreen';
import CreatePageScreen from './components/CreatePageScreen';

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
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeScreen, setActiveScreen] = useState<Screen>("login");
  const [users, setUsers] = useState<AdminUser[]>([
  {
    id: 'u1', name: 'Alex Morgan', username: 'alexm', email: 'alex@verso.app',
    role: 'admin', status: 'active', joinedAt: Date.now() - 86400000 * 180,
    followers: ['u2'], following: ['u3'],
    permissions: ['read','post','comment','like','edit_own','edit_any','delete_any','follow','dm','mention','suspend','ban','view_reports','pin_posts','manage_roles','manage_perms','analytics','settings','audit_log']
  },
  {
    id: 'u2', name: 'Jamie Lin', username: 'jamieL', email: 'jamie@verso.app',
    role: 'moderator', status: 'active', joinedAt: Date.now() - 86400000 * 140,
    followers: [], following: ['u1'],
    permissions: ['read','post','comment','like','edit_own','edit_any','delete_any','follow','dm','mention','suspend','ban','view_reports','pin_posts']
  },
  {
    id: 'u3', name: 'Taylor Ray', username: 'tray', email: 'taylor@verso.app',
    role: 'member', status: 'active', joinedAt: Date.now() - 86400000 * 120,
    followers: ['u1'], following: [],
    permissions: ['read','post','comment','like','edit_own','follow','dm','mention']
  },
  {
    id: 'u4', name: 'Casey Wong', username: 'caseyw', email: 'casey@verso.app',
    role: 'member', status: 'active', joinedAt: Date.now() - 86400000 * 95,
    followers: [], following: [],
    permissions: ['read','post','comment','like','edit_own','follow','dm','mention']
  },
  {
    id: 'u5', name: 'Jordan Smith', username: 'jsmith', email: 'jordan@verso.app',
    role: 'member', status: 'pending', joinedAt: Date.now() - 86400000 * 7,
    followers: [], following: [],
    permissions: ['read','post','comment','like','edit_own','follow','dm','mention']
  },
  {
    id: 'u6', name: 'Riley Park', username: 'rpark', email: 'riley@verso.app',
    role: 'guest', status: 'active', joinedAt: Date.now() - 86400000 * 3,
    followers: [], following: [],
    permissions: ['read']
  },
]);
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [chats, setChats] = useState<Chat[]>(initialChats);
  const [notifications, setNotifications] =
    useState<NotificationItem[]>(initialNotifications);
  const [profileUserId, setProfileUserId] = useState(CURRENT_USER_ID);
  const [targetChatId, setTargetChatId] = useState<string | null>(null);

  const { pages } = usePages();
  const [activePageId, setActivePageId] = useState<string | null>(null);
  const [newPostTargetPageId, setNewPostTargetPageId] = useState<string | null>(null);
  const [isCreatingPage, setIsCreatingPage] = useState(false);

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
    const newUser: AdminUser = {
      id: `u${Date.now()}`,
      name,
      username,
      email,
      role: 'member',
      status: 'active',
      joinedAt: Date.now(),
      followers: [],
      following: [],
      permissions: ['read','post','comment','like','edit_own','follow','dm','mention']
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
    pageId?: string
  ) => {
    const isVideo = media?.type === "video";
    const fallbackMedia = makePostImage(`NEW`);
    const newPost: Post = {
      id: `p${Date.now()}`,
      authorId: CURRENT_USER_ID,
      pageId,
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
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        background: "#0a0a0a",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 480,
          height: "100vh",
          background: "#000",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          borderLeft: "1px solid #222",
          borderRight: "1px solid #222",
          boxShadow: "0 0 50px rgba(0,0,0,0.8)",
          color: "#fff",
          position: "relative",
        }}
      >
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
            onLike={handleLike}
            onComment={handleComment}
            onEditPost={handleEditPost}
            onDeletePost={handleDeletePost}
            onEditComment={handleEditComment}
            onDeleteComment={handleDeleteComment}
            onCreatePost={() => setActiveScreen("newPost")}
            onOpenNotifications={() => setActiveScreen("notifications")}
            onSearch={() => setActiveScreen("search")}
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
          <NewPostScreen
            targetPageName={newPostTargetPageId ? pages.find(p => p.id === newPostTargetPageId)?.name : undefined}
            onClose={() => {
              setNewPostTargetPageId(null);
              setActiveScreen(newPostTargetPageId ? "pages" : "home");
            }}
            onPublish={(caption, media) => {
              handlePublish(caption, media, newPostTargetPageId || undefined);
              setNewPostTargetPageId(null);
              setActiveScreen(newPostTargetPageId ? "pages" : "home");
            }}
          />
        )}{activeScreen === "reels" && (
          <ReelScreen
            posts={posts}
            users={users}
            currentUserId={CURRENT_USER_ID}
            onLike={handleLike}
            onComment={handleComment}
            onEditComment={handleEditComment}
            onDeleteComment={handleDeleteComment}
          />
        )}
        {activeScreen === "notifications" && (
          <NotificationScreen notifications={notifications} />
        )}
        {activeScreen === "pages" && (
          <PageManagementScreen
            currentUserId={CURRENT_USER_ID}
            users={users}
            onCreatePage={() => setIsCreatingPage(true)}
            onViewPage={(id) => setActivePageId(id)}
          />
        )}
        {activePageId && (
          <PageViewScreen
            page={pages.find(p => p.id === activePageId)!}
            users={users}
            posts={posts}
            currentUserId={CURRENT_USER_ID}
            onClose={() => setActivePageId(null)}
            onNewPostClick={() => {
              setNewPostTargetPageId(activePageId);
              setActiveScreen("newPost");
            }}
          />
        )}
        {isCreatingPage && (
          <CreatePageScreen
            onClose={() => setIsCreatingPage(false)}
            currentUserId={CURRENT_USER_ID}
          />
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
            onEditPost={handleEditPost}
            onDeletePost={handleDeletePost}
            onMessage={() => handleMessageUser(profileUserId)}
          />
        )}
        {isLoggedIn && <BottomNav active={activeScreen} onChange={handleNav} />}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <PageProvider initialPages={initialPages}>
      <AppContent />
    </PageProvider>
  );
}
