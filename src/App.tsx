import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Screen, Post, Chat, NotificationItem, AdminUser } from "./types";
import { PageProvider, usePages } from './contexts/PageContext';
import {
  CURRENT_USER_ID,
  initialPosts,
  initialChats,
  initialNotifications,
  initialPages,
} from "./data";
import { likePost, editPost, deletePost, addComment, editComment, deleteComment } from "./services/postService";
import { toggleFollow, editName, addUser } from "./services/userService";
import { sendMessage, findOrCreateChat } from "./services/chatService";
import { addNotification } from "./services/notificationService";
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
import PageManagementScreen from "./components/PageManagementScreen";
import PageViewScreen from "./components/PageViewScreen";
import CreatePageDialog from "./components/CreatePageDialog";
import MarketplaceScreen from "./components/MarketplaceScreen";
import { SpeedInsights } from "@vercel/speed-insights/react";

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
  const [darkMode, setDarkMode] = useState(() => {
    try {
      return localStorage.getItem("verso-theme") !== "light";
    } catch {
      return true;
    }
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    try {
      localStorage.setItem("verso-theme", darkMode ? "dark" : "light");
    } catch {
      // Storage unavailable — keep the theme in memory only.
    }
  }, [darkMode]);

  const memberPerms = ['read','post','comment','like','edit_own','follow','dm','mention'];
  const allPerms = ['read','post','comment','like','edit_own','edit_any','delete_any','follow','dm','mention','suspend','ban','view_reports','pin_posts','manage_roles','manage_perms','analytics','settings','audit_log'];
  const [users, setUsers] = useState<AdminUser[]>([
    { id: 'u1', name: 'Alex Morgan', username: 'alexm', email: 'alex@verso.app', role: 'admin', status: 'active', joinedAt: Date.now() - 86400000 * 180, followers: ['u2'], following: ['u3'], permissions: allPerms },
    { id: 'u2', name: 'Jamie Lin', username: 'jamieL', email: 'jamie@verso.app', role: 'moderator', status: 'active', joinedAt: Date.now() - 86400000 * 140, followers: [], following: ['u1'], permissions: ['read','post','comment','like','edit_own','edit_any','delete_any','follow','dm','mention','suspend','ban','view_reports','pin_posts'] },
    { id: 'u3', name: 'Taylor Ray', username: 'tray', email: 'taylor@verso.app', role: 'member', status: 'active', joinedAt: Date.now() - 86400000 * 120, followers: ['u1'], following: [], permissions: memberPerms },
    { id: 'u4', name: 'Casey Wong', username: 'caseyw', email: 'casey@verso.app', role: 'member', status: 'active', joinedAt: Date.now() - 86400000 * 95, followers: [], following: [], permissions: memberPerms },
    { id: 'u5', name: 'Jordan Smith', username: 'jsmith', email: 'jordan@verso.app', role: 'member', status: 'pending', joinedAt: Date.now() - 86400000 * 7, followers: [], following: [], permissions: memberPerms },
    { id: 'u6', name: 'Riley Park', username: 'rpark', email: 'riley@verso.app', role: 'member', status: 'active', joinedAt: Date.now() - 86400000 * 3, followers: [], following: [], permissions: ['read'] },
    { id: 'u7', name: 'Morgan Lee', username: 'morgs', email: 'morgan@verso.app', role: 'member', status: 'active', joinedAt: Date.now() - 86400000 * 90, followers: [], following: [], permissions: memberPerms },
    { id: 'u8', name: 'Drew Kim', username: 'dkim', email: 'drew@verso.app', role: 'member', status: 'active', joinedAt: Date.now() - 86400000 * 85, followers: [], following: [], permissions: memberPerms },
    { id: 'u9', name: 'Sam Rivera', username: 'srivera', email: 'sam@verso.app', role: 'member', status: 'active', joinedAt: Date.now() - 86400000 * 80, followers: [], following: [], permissions: memberPerms },
    { id: 'u10', name: 'Avery Chen', username: 'averyc', email: 'avery@verso.app', role: 'member', status: 'active', joinedAt: Date.now() - 86400000 * 75, followers: [], following: [], permissions: memberPerms },
    { id: 'u11', name: 'Quinn Davis', username: 'quinnD', email: 'quinn@verso.app', role: 'member', status: 'active', joinedAt: Date.now() - 86400000 * 70, followers: [], following: [], permissions: memberPerms },
    { id: 'u12', name: 'Blake Turner', username: 'blaket', email: 'blake@verso.app', role: 'member', status: 'active', joinedAt: Date.now() - 86400000 * 65, followers: [], following: [], permissions: memberPerms },
    { id: 'u13', name: 'Cameron Reed', username: 'creed', email: 'cameron@verso.app', role: 'member', status: 'active', joinedAt: Date.now() - 86400000 * 60, followers: [], following: [], permissions: memberPerms },
    { id: 'u14', name: 'Dakota Hayes', username: 'dhayes', email: 'dakota@verso.app', role: 'member', status: 'active', joinedAt: Date.now() - 86400000 * 55, followers: [], following: [], permissions: memberPerms },
    { id: 'u15', name: 'Emerson Blake', username: 'eblake', email: 'emerson@verso.app', role: 'member', status: 'active', joinedAt: Date.now() - 86400000 * 50, followers: [], following: [], permissions: memberPerms },
    { id: 'u16', name: 'Finley Gray', username: 'fgray', email: 'finley@verso.app', role: 'member', status: 'active', joinedAt: Date.now() - 86400000 * 48, followers: [], following: [], permissions: memberPerms },
    { id: 'u17', name: 'Grayson Cole', username: 'gcole', email: 'grayson@verso.app', role: 'member', status: 'active', joinedAt: Date.now() - 86400000 * 45, followers: [], following: [], permissions: memberPerms },
    { id: 'u18', name: 'Harper Wells', username: 'hwells', email: 'harper@verso.app', role: 'member', status: 'active', joinedAt: Date.now() - 86400000 * 42, followers: [], following: [], permissions: memberPerms },
    { id: 'u19', name: 'Indigo Nash', username: 'inash', email: 'indigo@verso.app', role: 'member', status: 'active', joinedAt: Date.now() - 86400000 * 40, followers: [], following: [], permissions: memberPerms },
    { id: 'u20', name: 'Jesse Fox', username: 'jfox', email: 'jesse@verso.app', role: 'member', status: 'active', joinedAt: Date.now() - 86400000 * 38, followers: [], following: [], permissions: memberPerms },
    { id: 'u21', name: 'Kai Morrow', username: 'kmorrow', email: 'kai@verso.app', role: 'member', status: 'active', joinedAt: Date.now() - 86400000 * 35, followers: [], following: [], permissions: memberPerms },
    { id: 'u22', name: 'Logan Pierce', username: 'lpierce', email: 'logan@verso.app', role: 'member', status: 'active', joinedAt: Date.now() - 86400000 * 32, followers: [], following: [], permissions: memberPerms },
    { id: 'u23', name: 'Morgan Sage', username: 'msage', email: 'morgan.s@verso.app', role: 'member', status: 'active', joinedAt: Date.now() - 86400000 * 30, followers: [], following: [], permissions: memberPerms },
    { id: 'u24', name: 'Nico Valentine', username: 'nval', email: 'nico@verso.app', role: 'member', status: 'active', joinedAt: Date.now() - 86400000 * 28, followers: [], following: [], permissions: memberPerms },
    { id: 'u25', name: 'Oakley Frost', username: 'ofrost', email: 'oakley@verso.app', role: 'member', status: 'active', joinedAt: Date.now() - 86400000 * 25, followers: [], following: [], permissions: memberPerms },
    { id: 'u26', name: 'Parker Snow', username: 'psnow', email: 'parker@verso.app', role: 'member', status: 'active', joinedAt: Date.now() - 86400000 * 22, followers: [], following: [], permissions: memberPerms },
    { id: 'u27', name: 'Reese Storm', username: 'rstorm', email: 'reese@verso.app', role: 'member', status: 'active', joinedAt: Date.now() - 86400000 * 20, followers: [], following: [], permissions: memberPerms },
    { id: 'u28', name: 'Skyler Wren', username: 'swren', email: 'skyler@verso.app', role: 'member', status: 'active', joinedAt: Date.now() - 86400000 * 18, followers: [], following: [], permissions: memberPerms },
    { id: 'u29', name: 'Tatum Birch', username: 'tbirch', email: 'tatum@verso.app', role: 'member', status: 'active', joinedAt: Date.now() - 86400000 * 15, followers: [], following: [], permissions: memberPerms },
    { id: 'u30', name: 'Ainsley Cruz', username: 'acruz', email: 'ainsley@verso.app', role: 'member', status: 'active', joinedAt: Date.now() - 86400000 * 14, followers: [], following: [], permissions: memberPerms },
    { id: 'u31', name: 'Briar Dean', username: 'bdean', email: 'briar@verso.app', role: 'member', status: 'active', joinedAt: Date.now() - 86400000 * 12, followers: [], following: [], permissions: memberPerms },
    { id: 'u32', name: 'Colby Hart', username: 'chart', email: 'colby@verso.app', role: 'member', status: 'active', joinedAt: Date.now() - 86400000 * 10, followers: [], following: [], permissions: memberPerms },
    { id: 'u33', name: 'Devon Ivey', username: 'divey', email: 'devon@verso.app', role: 'member', status: 'active', joinedAt: Date.now() - 86400000 * 9, followers: [], following: [], permissions: memberPerms },
    { id: 'u34', name: 'Ellis Johns', username: 'ejohns', email: 'ellis@verso.app', role: 'member', status: 'active', joinedAt: Date.now() - 86400000 * 8, followers: [], following: [], permissions: memberPerms },
    { id: 'u35', name: 'Frankie Knox', username: 'fknox', email: 'frankie@verso.app', role: 'member', status: 'active', joinedAt: Date.now() - 86400000 * 7, followers: [], following: [], permissions: memberPerms },
    { id: 'u36', name: 'Gray Luna', username: 'gluna', email: 'gray@verso.app', role: 'member', status: 'active', joinedAt: Date.now() - 86400000 * 6, followers: [], following: [], permissions: memberPerms },
    { id: 'u37', name: 'Hadley Moss', username: 'hmoss', email: 'hadley@verso.app', role: 'member', status: 'active', joinedAt: Date.now() - 86400000 * 5, followers: [], following: [], permissions: memberPerms },
    { id: 'u38', name: 'Jay North', username: 'jnorth', email: 'jay@verso.app', role: 'member', status: 'active', joinedAt: Date.now() - 86400000 * 4, followers: [], following: [], permissions: memberPerms },
    { id: 'u39', name: 'Kendall Ortiz', username: 'kortiz', email: 'kendall@verso.app', role: 'member', status: 'active', joinedAt: Date.now() - 86400000 * 3, followers: [], following: [], permissions: memberPerms },
    { id: 'u40', name: 'Leighton Pace', username: 'lpace', email: 'leighton@verso.app', role: 'member', status: 'active', joinedAt: Date.now() - 86400000 * 2, followers: [], following: [], permissions: memberPerms },
    { id: 'u41', name: 'Marley Quinn', username: 'mquinn', email: 'marley@verso.app', role: 'member', status: 'active', joinedAt: Date.now() - 86400000 * 1, followers: [], following: [], permissions: memberPerms },
    { id: 'u42', name: 'Nova Reyes', username: 'nreyes', email: 'nova@verso.app', role: 'member', status: 'active', joinedAt: Date.now(), followers: [], following: [], permissions: memberPerms },
  ]);
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [chats, setChats] = useState<Chat[]>(initialChats);
  const [notifications, setNotifications] =
    useState<NotificationItem[]>(initialNotifications);
  const [profileUserId, setProfileUserId] = useState(CURRENT_USER_ID);
  const [targetChatId, setTargetChatId] = useState<string | null>(null);
  const [chatOrigin, setChatOrigin] = useState<"marketplace" | null>(null);

  const { pages } = usePages();
  const [activePageId, setActivePageId] = useState<string | null>(null);
  const [activePageTab, setActivePageTab] = useState<"feed" | "members" | null>(null);
  const [activePageMemberFilter, setActivePageMemberFilter] = useState<'all' | 'invite'>('all');
  const [newPostTargetPageId, setNewPostTargetPageId] = useState<string | null>(null);
  const [isCreatingPage, setIsCreatingPage] = useState(false);

  const pushNotification = (
    item: Omit<NotificationItem, "id" | "createdAt">,
  ) => {
    setNotifications((prev) => addNotification(prev, item));
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
    setActiveScreen("home");
  };

  const handleRegister = (
    name: string,
    username: string,
    email: string,
  ) => {
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
    setUsers((prev) => addUser(prev, newUser));

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
    setPosts((prev) => likePost(prev, postId, CURRENT_USER_ID));
    pushNotification({
      title: "Like updated",
      message: "You reacted to a post from the feed.",
      kind: "like",
    });
  };

  const handleEditPost = (postId: string, caption: string) => {
    setPosts((prev) => editPost(prev, postId, caption));
  };

  const handleDeletePost = (postId: string) => {
    setPosts((prev) => deletePost(prev, postId));
  };

  const handleComment = (postId: string, text: string) => {
    const comment = {
      id: `c${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
      userId: CURRENT_USER_ID,
      text,
    };
    setPosts((prev) => addComment(prev, postId, comment));
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
    setPosts((prev) => editComment(prev, postId, commentId, text));
  };

  const handleDeleteComment = (postId: string, commentId: string) => {
    setPosts((prev) => deleteComment(prev, postId, commentId));
  };

  const handleToggleFollow = (targetId: string) => {
    setUsers((prev) => toggleFollow(prev, CURRENT_USER_ID, targetId));
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
      sendMessage(prev, chatId, { from: CURRENT_USER_ID, text, timestamp: Date.now() }),
    );
  };

  const handleEditName = (newName: string) => {
    setUsers((prev) => editName(prev, CURRENT_USER_ID, newName));
  };

  const handleMessageUser = (userId: string) => {
    const { chats: updatedChats, chatId } = findOrCreateChat(chats, CURRENT_USER_ID, userId);
    setChats(updatedChats);
    setTargetChatId(chatId);
    setActiveScreen("chat");
  };

  const handleMessageSeller = (sellerId: string, productTitle: string) => {
    const { chats: updatedChats, chatId } = findOrCreateChat(
      chats,
      CURRENT_USER_ID,
      sellerId,
    );
    setChats(
      sendMessage(updatedChats, chatId, {
        from: CURRENT_USER_ID,
        text: `Hi, I'm interested in "${productTitle}"`,
        timestamp: Date.now(),
      }),
    );
    setTargetChatId(chatId);
    setChatOrigin("marketplace");
    setActiveScreen("chat");
  };

  const handleNav = (screen: Screen) => {
    if (screen === "profile") setProfileUserId(CURRENT_USER_ID);
    if (screen !== "chat") {
      setTargetChatId(null);
      setChatOrigin(null);
    }
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
        background: "var(--bg-app)",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        padding: 20,
        boxSizing: "border-box",
      }}
    >
      {/* Theme toggle — outside the app window, top-right */}
      <button
        type="button"
        onClick={() => setDarkMode((prev) => !prev)}
        aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
        title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
        style={{
          position: "fixed",
          top: 20,
          right: 20,
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "8px 14px",
          borderRadius: 999,
          background: "var(--surface-subtle)",
          border: "0.5px solid var(--border-strong)",
          color: "var(--text-soft)",
          backdropFilter: "blur(10px)",
          cursor: "pointer",
          fontSize: 13,
          fontWeight: 600,
          boxShadow: "0 8px 24px var(--shadow-color)",
          transition: "transform 0.2s ease, background 0.2s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "scale(1.05)";
          e.currentTarget.style.background = "var(--surface-hover)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1)";
          e.currentTarget.style.background = "var(--surface-subtle)";
        }}
        onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.95)")}
        onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
      >
        {darkMode ? <Sun size={16} /> : <Moon size={16} />}
        {darkMode ? "Light" : "Dark"}
      </button>

      {/* Mobile Frame */}
      <div
        style={{
          width: 480,
          height: "calc(100vh - 40px)",
          maxHeight: 900,
          borderRadius: 44,
          background: "var(--bg-raised)",
          padding: 12,
          boxShadow: "0 0 0 1px var(--border), 0 20px 60px rgba(0,0,0,0.5)",
          boxSizing: "border-box",
          position: "relative",
          flexShrink: 0,
        }}
      >
        {/* Screen */}
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: 32,
            overflow: "hidden",
            background: "var(--bg)",
            display: "flex",
            flexDirection: "column",
            color: "var(--text)",
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
          <div
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 80,
              background: "rgba(0,0,0,0.72)",
              backdropFilter: "blur(14px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 16,
            }}
          >
            <div
              style={{
                width: "100%",
                maxWidth: 460,
                maxHeight: "92vh",
                borderRadius: 28,
                overflow: "hidden",
                boxShadow: "0 20px 60px rgba(0,0,0,0.45)",
                border: "1px solid var(--surface-hover)",
                background: "var(--bg)",
              }}
            >
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
            </div>
          </div>
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
            onOpenMarketplace={() => setActiveScreen("marketplace")}
            onViewPage={(id, initialTab, memberFilter) => {
              setActivePageId(id);
              setActivePageTab(initialTab || "feed");
              setActivePageMemberFilter(memberFilter || 'all');
            }}
          />
        )}
        {activePageId && (
          <PageViewScreen
            page={pages.find(p => p.id === activePageId)!}
            users={users}
            posts={posts}
            currentUserId={CURRENT_USER_ID}
            initialTab={activePageTab || "feed"}
            defaultMemberFilter={activePageMemberFilter}
            onClose={() => {
              setActivePageId(null);
              setActivePageTab(null);
              setActivePageMemberFilter('all');
            }}
            onNewPostClick={() => {
              setNewPostTargetPageId(activePageId);
              setActiveScreen("newPost");
            }}
            onLike={handleLike}
            onComment={handleComment}
            onEditComment={handleEditComment}
            onDeleteComment={handleDeleteComment}
          />
        )}
        {isCreatingPage && (
          <CreatePageDialog
            open={isCreatingPage}
            onClose={() => setIsCreatingPage(false)}
            currentUserId={CURRENT_USER_ID}
            onCreated={(id) => {
              pushNotification({
                title: 'New page created',
                message: 'Your new community is ready to grow.',
                kind: 'post',
              });
              // Auto-navigate into the freshly-created page
              setActivePageId(id);
            }}
          />
        )}
        {activeScreen === "marketplace" && (
          <MarketplaceScreen
            onMessageSeller={handleMessageSeller}
          />
        )}
        {activeScreen === "chat" && (
          <ChatScreen
            chats={chats}
            users={users}
            currentUserId={CURRENT_USER_ID}
            onSendMessage={handleSendMessage}
            targetChatId={targetChatId}
            onClearTargetChat={() => {
              setTargetChatId(null);
              if (chatOrigin === "marketplace") {
                setChatOrigin(null);
                setActiveScreen("marketplace");
              }
            }}
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
            onLike={handleLike}
            onComment={handleComment}
            onEditComment={handleEditComment}
            onDeleteComment={handleDeleteComment}
          />
        )}
        {isLoggedIn && (
          <BottomNav
            active={activeScreen === "marketplace" ? "pages" : activeScreen}
            onChange={handleNav}
          />
        )}
        </div>
        <SpeedInsights />
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
