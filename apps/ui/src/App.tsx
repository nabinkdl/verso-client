import { useCallback, useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Screen, Post, Conversation, NotificationItem, AdminUser, CartItem, User, ChatMessage } from "./types";
import { PageProvider, usePages } from './contexts/PageContext';
import {
  CURRENT_USER_ID,
  initialNotifications,
  initialPages,
  initialMarketplaceCart,
} from "./data";
import {
  DEMO_EMAIL,
  DEMO_PASSWORD,
  DEMO_USER,
  initialDemoConversations,
  initialDemoMessages,
  initialPosts as initialDemoPosts,
} from "./demoData";

const DEMO_SESSION_KEY = "verso-demo";
import { likePost, editPost, deletePost, addComment, editComment, deleteComment } from "./services/postService";
import { api, getToken, setToken, toUiComment, toUiPost, toUiUser } from "./services/api";
import { connectChatSocket, disconnectChatSocket } from "./services/chatSocket";
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
import ResetPasswordScreen from "./components/ResetPasswordScreen";
import PageManagementScreen from "./components/PageManagementScreen";
import PageViewScreen from "./components/PageViewScreen";
import CreatePageDialog from "./components/CreatePageDialog";
import MarketplaceScreen from "./components/MarketplaceScreen";
import { SpeedInsights } from "@vercel/speed-insights/react";

function AppContent() {
  const resetToken = new URLSearchParams(window.location.search).get("resetToken");
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [demoMode, setDemoMode] = useState(() => {
    try {
      return localStorage.getItem(DEMO_SESSION_KEY) === "1";
    } catch {
      return false;
    }
  });
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [activeScreen, setActiveScreen] = useState<Screen>(() =>
    resetToken ? "reset-password" : "login",
  );
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
  const [posts, setPosts] = useState<Post[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [demoMessages, setDemoMessages] =
    useState<Record<string, ChatMessage[]>>(initialDemoMessages);
  const [notifications, setNotifications] =
    useState<NotificationItem[]>(initialNotifications);
  const [profileUserId, setProfileUserId] = useState(CURRENT_USER_ID);
  const [targetConversationId, setTargetConversationId] = useState<string | null>(null);
  const [chatOrigin, setChatOrigin] = useState<"marketplace" | null>(null);
  const [marketplaceCart, setMarketplaceCart] =
    useState<CartItem[]>(initialMarketplaceCart);
  const [savedPosts, setSavedPosts] = useState<string[]>([]);

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

  const currentUserId = currentUser?.id ?? CURRENT_USER_ID;

  const refreshConversations = useCallback(async () => {
    if (demoMode || !getToken()) return;

    try {
      const page = await api.listConversations({ limit: 30 });
      setConversations(page.data);
    } catch {
      // Chat is optional; ignore transient failures and keep the last list.
    }
  }, [demoMode]);

  useEffect(() => {
    if (demoMode || !currentUser || !getToken()) return;

    const socket = connectChatSocket(getToken()!);
    const onConversationUpdated = () => {
      void refreshConversations();
    };

    socket.on("conversation:updated", onConversationUpdated);
    void refreshConversations();

    return () => {
      socket.off("conversation:updated", onConversationUpdated);
    };
  }, [currentUser, demoMode, refreshConversations]);

  const mergeUsers = useCallback((incoming: AdminUser[]) => {
    setUsers((prev) => {
      const map = new Map(prev.map((user) => [user.id, user]));
      for (const user of incoming) {
        const existing = map.get(user.id);
        map.set(user.id, {
          ...existing,
          ...user,
          followerCount: user.followerCount ?? existing?.followerCount,
          followingCount: user.followingCount ?? existing?.followingCount,
          followers: user.followers.length
            ? user.followers
            : (existing?.followers ?? []),
          following: user.following.length
            ? user.following
            : (existing?.following ?? []),
        });
      }
      return Array.from(map.values());
    });
  }, []);

  const loadFeed = useCallback(
    async (me: AdminUser) => {
      if (demoMode) return;
      const page = await api.listPosts({ limit: 20 });
      const commentLists = await Promise.all(
        page.data.map((post) => api.comments(post.id).catch(() => [])),
      );
      const nextPosts = page.data.map((post, index) => {
        const mapped = toUiPost(post, me.id);
        mapped.comments = commentLists[index].map(toUiComment);
        return mapped;
      });
      setPosts(nextPosts);
      mergeUsers([
        me,
        ...page.data.map((post) => toUiUser(post.author)),
        ...commentLists.flat().map((comment) => toUiUser(comment.author)),
      ]);
    },
    [demoMode, mergeUsers],
  );

  const enterDemoMode = useCallback(() => {
    setDemoMode(true);
    try {
      localStorage.setItem(DEMO_SESSION_KEY, "1");
    } catch {
      // Storage unavailable — keep the demo session in memory only.
    }
    setToken(null);
    setAuthLoading(false);
    setAuthError(null);
    setCurrentUser(DEMO_USER);
    mergeUsers([DEMO_USER]);
    setPosts(initialDemoPosts);
    setConversations(initialDemoConversations);
    setDemoMessages(initialDemoMessages);
    setActiveScreen("home");
  }, [mergeUsers]);

  useEffect(() => {
    if (demoMode) {
      setToken(null);
      setCurrentUser(DEMO_USER);
      mergeUsers([DEMO_USER]);
      setPosts(initialDemoPosts);
      setConversations(initialDemoConversations);
      setDemoMessages(initialDemoMessages);
      if (!resetToken) setActiveScreen("home");
      return;
    }

    if (!getToken()) return;
    let active = true;
    (async () => {
      try {
        const me = toUiUser(await api.me());
        if (!active) return;
        setCurrentUser(me);
        mergeUsers([me]);
        await loadFeed(me);
        if (active && !resetToken) setActiveScreen("home");
      } catch {
        setToken(null);
      }
    })();
    return () => {
      active = false;
    };
  }, [demoMode, loadFeed, mergeUsers, resetToken]);

  const handleLogin = async (identifier: string, password: string) => {
    const isDemoLogin =
      identifier.trim().toLowerCase() === DEMO_EMAIL.toLowerCase() &&
      password === DEMO_PASSWORD;

    if (isDemoLogin) {
      enterDemoMode();
      return;
    }

    setAuthLoading(true);
    setAuthError(null);
    try {
      const response = await api.login(identifier, password);
      setToken(response.accessToken);
      const me = toUiUser(response.user);
      setCurrentUser(me);
      mergeUsers([me]);
      await loadFeed(me);
      setActiveScreen("home");
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Sign in failed");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleForgotPassword = async (email: string) => {
    await api.forgotPassword(email);
  };

  const handleResetPassword = async (token: string, password: string) => {
    await api.resetPassword(token, password);
  };

  const handleRegister = async (
    name: string,
    username: string,
    email: string,
    password: string,
  ) => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const response = await api.register(name, username, email, password);
      setToken(response.accessToken);
      const me = toUiUser(response.user);
      setCurrentUser(me);
      mergeUsers([me]);
      await loadFeed(me);
      setActiveScreen("home");
    } catch (error) {
      setAuthError(
        error instanceof Error ? error.message : "Could not create account",
      );
    } finally {
      setAuthLoading(false);
    }
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
    setDemoMode(false);
    try {
      localStorage.removeItem(DEMO_SESSION_KEY);
    } catch {
      // Storage unavailable — nothing to clear.
    }
    setToken(null);
    disconnectChatSocket();
    setCurrentUser(null);
    setPosts([]);
    setConversations([]);
    setDemoMessages(initialDemoMessages);
    setTargetConversationId(null);
    setProfileUserId(CURRENT_USER_ID);
    setAuthError(null);
    setActiveScreen("login");
  };

  const handleLike = async (postId: string) => {
    const uid = currentUser?.id;
    if (!uid) return;

    const target = posts.find((post) => post.id === postId);
    if (!target) return;
    const wasLiked = target.likes.includes(uid);

    setPosts((prev) => likePost(prev, postId, uid));

    if (demoMode) {
      pushNotification({
        title: "Like updated",
        message: "You reacted to a post from the feed.",
        kind: "like",
      });
      return;
    }

    try {
      const result = wasLiked
        ? await api.unlikePost(postId)
        : await api.likePost(postId);
      setPosts((prev) =>
        prev.map((post) => {
          if (post.id !== postId) return post;
          const likes = Array.from(
            { length: result.likeCount },
            (_, index) => `like-${postId}-${index}`,
          );
          if (result.liked) likes[0] = uid;
          return { ...post, likes };
        }),
      );
      pushNotification({
        title: "Like updated",
        message: "You reacted to a post from the feed.",
        kind: "like",
      });
    } catch {
      setPosts((prev) => likePost(prev, postId, uid));
    }
  };

  const handleEditPost = async (postId: string, caption: string) => {
    const previous = posts;
    setPosts((prev) => editPost(prev, postId, caption));
    if (demoMode) return;
    try {
      await api.updatePost(postId, { caption });
    } catch (error) {
      setPosts(previous);
      window.alert(
        error instanceof Error ? error.message : "Could not update post",
      );
    }
  };

  const handleDeletePost = async (postId: string) => {
    const previous = posts;
    setPosts((prev) => deletePost(prev, postId));
    if (demoMode) return;
    try {
      await api.deletePost(postId);
    } catch (error) {
      setPosts(previous);
      window.alert(
        error instanceof Error ? error.message : "Could not delete post",
      );
    }
  };

  const handleComment = async (postId: string, text: string) => {
    if (demoMode) {
      const comment = {
        id: `demo-comment-${Date.now()}`,
        userId: currentUserId,
        text,
      };
      setPosts((prev) => addComment(prev, postId, comment));
      pushNotification({
        title: "Comment posted",
        message: text,
        kind: "comment",
      });
      return;
    }

    try {
      const comment = await api.addComment(postId, text);
      setPosts((prev) => addComment(prev, postId, toUiComment(comment)));
      mergeUsers([toUiUser(comment.author)]);
      pushNotification({
        title: "Comment posted",
        message: text,
        kind: "comment",
      });
    } catch (error) {
      window.alert(
        error instanceof Error ? error.message : "Could not post comment",
      );
    }
  };

  const handleEditComment = (
    postId: string,
    commentId: string,
    text: string,
  ) => {
    // The API does not expose comment editing; keep this change local.
    setPosts((prev) => editComment(prev, postId, commentId, text));
  };

  const handleDeleteComment = async (postId: string, commentId: string) => {
    const previous = posts;
    setPosts((prev) => deleteComment(prev, postId, commentId));
    if (demoMode) return;
    try {
      await api.deleteComment(postId, commentId);
    } catch (error) {
      setPosts(previous);
      window.alert(
        error instanceof Error ? error.message : "Could not delete comment",
      );
    }
  };

  const handleToggleSave = (postId: string) => {
    setSavedPosts((prev) =>
      prev.includes(postId)
        ? prev.filter((id) => id !== postId)
        : [...prev, postId],
    );
  };

  const handleToggleFollow = async (target: User) => {
    if (!currentUser || target.id === currentUser.id) return;
    const wasFollowing = currentUser.following.includes(target.id);

    if (demoMode) {
      const nextFollowing = wasFollowing
        ? currentUser.following.filter((id) => id !== target.id)
        : [...currentUser.following, target.id];

      setCurrentUser((prev) =>
        prev ? { ...prev, following: nextFollowing } : prev,
      );
      setUsers((prev) =>
        prev.map((user) => {
          if (user.id === currentUser.id) {
            return { ...user, following: nextFollowing };
          }
          if (
            user.id === target.id &&
            typeof user.followerCount === "number"
          ) {
            return {
              ...user,
              followerCount: Math.max(
                user.followerCount + (wasFollowing ? -1 : 1),
                0,
              ),
            };
          }
          return user;
        }),
      );
      pushNotification({
        title: "Following updated",
        message: "You changed who you follow.",
        kind: "follow",
      });
      return;
    }

    try {
      const result = wasFollowing
        ? await api.unfollow(target.username)
        : await api.follow(target.username);
      const nextFollowing = result.following
        ? Array.from(new Set([...currentUser.following, target.id]))
        : currentUser.following.filter((id) => id !== target.id);

      setCurrentUser((prev) =>
        prev ? { ...prev, following: nextFollowing } : prev,
      );
      setUsers((prev) =>
        prev.map((user) => {
          if (user.id === currentUser.id) {
            return { ...user, following: nextFollowing };
          }
          if (
            user.id === target.id &&
            typeof user.followerCount === "number"
          ) {
            return {
              ...user,
              followerCount: Math.max(
                user.followerCount + (result.following ? 1 : -1),
                0,
              ),
            };
          }
          return user;
        }),
      );
      pushNotification({
        title: "Following updated",
        message: "You changed who you follow.",
        kind: "follow",
      });
    } catch (error) {
      window.alert(
        error instanceof Error ? error.message : "Could not update follow",
      );
    }
  };

  const handlePublish = async (
    caption: string,
    media?: { url: string; type: "image" | "video"; name: string },
    pageId?: string
  ) => {
    const isVideo = media?.type === "video";
    const usableMediaUrl =
      media?.url &&
      /^https?:\/\//i.test(media.url) &&
      media.url.length <= 2048
        ? media.url
        : undefined;

    if (demoMode) {
      const newPost: Post = {
        id: `demo-post-${Date.now()}`,
        authorId: currentUserId,
        pageId,
        caption,
        imageUrl: usableMediaUrl && !isVideo ? usableMediaUrl : undefined,
        imageAlt: caption || "New post image",
        mediaUrl: usableMediaUrl,
        mediaType: usableMediaUrl ? (isVideo ? "video" : "image") : undefined,
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
      return;
    }

    try {
      const created = await api.createPost({
        caption,
        ...(usableMediaUrl
          ? {
              imageUrl: isVideo ? undefined : usableMediaUrl,
              mediaUrl: usableMediaUrl,
              mediaType: isVideo ? "VIDEO" : "IMAGE",
              imageAlt: caption || "New post image",
            }
          : {}),
      });
      const newPost = toUiPost(created, currentUserId);
      if (pageId) newPost.pageId = pageId;
      setPosts((prev) => [newPost, ...prev]);
      mergeUsers([toUiUser(created.author)]);
      pushNotification({
        title: isVideo ? "Reel uploaded" : "Post uploaded",
        message: media?.name ?? (caption || "New content is now live."),
        kind: isVideo ? "reel" : "post",
      });
      setActiveScreen("home");
    } catch (error) {
      window.alert(
        error instanceof Error ? error.message : "Could not publish post",
      );
    }
  };

  const handleEditProfile = async (
    newName: string,
    newUsername: string,
    avatarUrl?: string,
  ) => {
    if (!currentUser) return;

    const payload: { name: string; avatarUrl?: string } = { name: newName };
    if (
      avatarUrl &&
      /^https?:\/\//i.test(avatarUrl) &&
      avatarUrl.length <= 2048
    ) {
      payload.avatarUrl = avatarUrl;
    }

    if (demoMode) {
      const merged: AdminUser = {
        ...currentUser,
        name: newName,
        username: newUsername || currentUser.username,
        ...(payload.avatarUrl ? { avatarUrl: payload.avatarUrl } : {}),
      };
      setCurrentUser(merged);
      mergeUsers([merged]);
      return;
    }

    try {
      const updated = toUiUser(await api.updateProfile(payload));
      const merged: AdminUser = {
        ...currentUser,
        ...updated,
        username: newUsername || currentUser.username,
        followers: currentUser.followers,
        following: currentUser.following,
        followerCount: currentUser.followerCount,
        followingCount: currentUser.followingCount,
      };
      setCurrentUser(merged);
      mergeUsers([merged]);
    } catch (error) {
      window.alert(
        error instanceof Error ? error.message : "Could not update profile",
      );
    }
  };

  const resolveChatUsername = async (userId: string): Promise<string | null> => {
    const local = users.find((user) => user.id === userId);
    if (!local) return null;

    if (demoMode) return local.username;

    // Demo profiles use ids like "u2"; resolve them to a real account by name.
    if (!local.id.startsWith("u")) return local.username;

    try {
      const matches = await api.searchUsers(local.name);
      const match =
        matches.find((candidate) => candidate.name === local.name) ?? matches[0];
      return match?.username ?? null;
    } catch {
      return null;
    }
  };

  const handleDemoSend = useCallback(
    (conversationId: string, message: ChatMessage) => {
      setDemoMessages((prev) => ({
        ...prev,
        [conversationId]: [...(prev[conversationId] ?? []), message],
      }));
      setConversations((prev) =>
        prev.map((conversation) =>
          conversation.id === conversationId
            ? {
                ...conversation,
                lastMessage: message,
                lastMessageAt: message.createdAt,
              }
            : conversation,
        ),
      );
    },
    [],
  );

  const openConversationWith = async (
    username: string,
  ): Promise<Conversation | null> => {
    if (demoMode) {
      if (!currentUser) return null;
      const other = users.find((user) => user.username === username);
      if (!other) return null;

      const existing = conversations.find((conversation) =>
        conversation.participants.some(
          (participant) => participant.id === other.id,
        ),
      );
      if (existing) {
        setTargetConversationId(existing.id);
        setActiveScreen("chat");
        return existing;
      }

      const conversation: Conversation = {
        id: `demo-chat-${other.id}`,
        type: "DIRECT",
        participants: [
          {
            id: currentUser.id,
            username: currentUser.username,
            name: currentUser.name,
            avatarUrl: currentUser.avatarUrl ?? null,
          },
          {
            id: other.id,
            username: other.username,
            name: other.name,
            avatarUrl: other.avatarUrl ?? null,
          },
        ],
        lastMessage: null,
        lastMessageAt: new Date().toISOString(),
        unreadCount: 0,
        createdAt: new Date().toISOString(),
      };
      setConversations((prev) => [conversation, ...prev]);
      setDemoMessages((prev) => ({ ...prev, [conversation.id]: [] }));
      setTargetConversationId(conversation.id);
      setActiveScreen("chat");
      return conversation;
    }

    try {
      const conversation = await api.createConversation({ username });
      setConversations((prev) =>
        prev.some((item) => item.id === conversation.id)
          ? prev
          : [conversation, ...prev],
      );
      setTargetConversationId(conversation.id);
      setActiveScreen("chat");
      void refreshConversations();
      return conversation;
    } catch (error) {
      window.alert(
        error instanceof Error ? error.message : "Could not start conversation",
      );
      return null;
    }
  };

  const handleMessageUser = async (userId: string) => {
    const username = await resolveChatUsername(userId);
    if (!username) {
      window.alert("This account is not available for chat yet.");
      return;
    }

    await openConversationWith(username);
  };

  const handleMessageSeller = async (sellerId: string, productTitle: string) => {
    const username = await resolveChatUsername(sellerId);
    if (!username) {
      window.alert("This seller is not available for chat yet.");
      return;
    }

    setChatOrigin("marketplace");
    const conversation = await openConversationWith(username);
    if (!conversation) return;

    if (demoMode) {
      if (currentUser) {
        handleDemoSend(conversation.id, {
          id: `demo-msg-${Date.now()}`,
          conversationId: conversation.id,
          senderId: currentUser.id,
          text: `Hi, I'm interested in "${productTitle}"`,
          editedAt: null,
          deleted: false,
          createdAt: new Date().toISOString(),
          sender: {
            id: currentUser.id,
            username: currentUser.username,
            name: currentUser.name,
            avatarUrl: currentUser.avatarUrl ?? null,
          },
          replyTo: null,
        });
      }
      return;
    }

    try {
      await api.sendMessage(
        conversation.id,
        `Hi, I'm interested in "${productTitle}"`,
      );
      await refreshConversations();
    } catch {
      // Keep the conversation open even if the intro message fails.
    }
  };

  const handleNav = (screen: Screen) => {
    if (screen === "profile") setProfileUserId(currentUserId);
    if (screen !== "chat") {
      setTargetConversationId(null);
      setChatOrigin(null);
    }
    setActiveScreen(screen);
  };

  const handleViewProfile = (userId: string) => {
    setProfileUserId(userId);
    setActiveScreen("profile");

    const target = users.find((user) => user.id === userId);
    if (!target) return;
    if (demoMode) return;

    api
      .profile(target.username)
      .then((profile) => {
        const merged = toUiUser(profile);
        mergeUsers([merged]);
        if (profile.isFollowing) {
          setCurrentUser((prev) =>
            prev && !prev.following.includes(merged.id)
              ? { ...prev, following: [...prev.following, merged.id] }
              : prev,
          );
        }
      })
      .catch(() => {
        // Profile details are optional; keep the local copy.
      });
  };

  const handleSearchUsers = useCallback(
    async (query: string): Promise<User[]> => {
      if (demoMode) {
        const needle = query.trim().toLowerCase();
        if (!needle) return users;
        return users.filter(
          (user) =>
            user.name.toLowerCase().includes(needle) ||
            user.username.toLowerCase().includes(needle),
        );
      }

      const results = (await api.searchUsers(query)).map(toUiUser);
      mergeUsers(results);
      return results;
    },
    [demoMode, mergeUsers, users],
  );

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
            error={authError}
            submitting={authLoading}
          />
        )}
        {activeScreen === "register" && (
          <RegisterScreen
            onRegister={handleRegister}
            onNavigateToLogin={handleNavigateToLogin}
            error={authError}
            submitting={authLoading}
          />
        )}
        {activeScreen === "forget" && (
          <ForgetScreen
            onRequestReset={handleForgotPassword}
            onNavigateToLogin={handleNavigateToLogin}
          />
        )}
        {activeScreen === "reset-password" && resetToken && (
          <ResetPasswordScreen
            token={resetToken}
            onResetPassword={handleResetPassword}
            onNavigateToLogin={() => {
              window.history.replaceState({}, "", window.location.pathname);
              setActiveScreen("login");
            }}
          />
        )}
        {activeScreen === "home" && (
          <HomeScreen
            posts={posts}
            users={users}
            currentUserId={currentUserId}
            savedPosts={savedPosts}
            onToggleSave={handleToggleSave}
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
            currentUserId={currentUserId}
            onToggleFollow={handleToggleFollow}
            onViewProfile={handleViewProfile}
            onSearchUsers={handleSearchUsers}
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
              alignItems: "stretch",
              justifyContent: "stretch",
              padding: 0,
            }}
          >
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                borderRadius: 0,
                overflow: "hidden",
                border: "none",
                boxShadow: "none",
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
            currentUserId={currentUserId}
            savedPosts={savedPosts}
            onToggleSave={handleToggleSave}
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
            marketplaceCartCount={marketplaceCart.reduce(
              (sum, item) => sum + item.quantity,
              0,
            )}
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
            currentUserId={currentUserId}
            initialTab={activePageTab || "feed"}
            defaultMemberFilter={activePageMemberFilter}
            savedPosts={savedPosts}
            onToggleSave={handleToggleSave}
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
            cart={marketplaceCart}
            setCart={setMarketplaceCart}
            onMessageSeller={handleMessageSeller}
          />
        )}
        {activeScreen === "chat" && (
          <ChatScreen
            conversations={conversations}
            currentUserId={currentUserId}
            targetConversationId={targetConversationId}
            onRefresh={refreshConversations}
            demoMode={demoMode}
            demoMessages={demoMessages}
            onDemoSend={handleDemoSend}
            onClearTarget={() => {
              setTargetConversationId(null);
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
            currentUserId={currentUserId}
            users={users}
            posts={posts}
            savedPosts={savedPosts}
            onToggleSave={handleToggleSave}
            onNewPost={() => setActiveScreen("newPost")}
            onEditProfile={handleEditProfile}
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
        {currentUser !== null && (
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
