import { useState, useMemo, useEffect, useRef } from "react";
import {
  ArrowLeft,
  Heart,
  MessageCircle,
  MoreVertical,
  Calendar,
  TrendingUp,
  Settings as SettingsIcon,
  LogOut,
  Flag,
  ChevronUp,
  Image as ImageIcon,
  Send,
  X,
  Plus,
  BadgeCheck,
} from "lucide-react";
import Avatar from "./Avatar";
import CommentDialog from "./CommentDialog";

import { usePages } from "../contexts/PageContext";
import { Page, Post, User } from "../types";
import PageTeamManager from "./PageTeamManager";

type Tab = "feed" | "events" | "members" | "about" | "insights" | "settings";

interface PageViewScreenProps {
  page: Page;
  users: User[];
  posts: Post[];
  currentUserId: string;
  onClose: () => void;
  onNewPostClick?: () => void;
  initialTab?: Tab;
  defaultMemberFilter?: 'all' | 'invite';
  onLike: (postId: string) => void;
  onComment: (postId: string, text: string) => void;
  onEditComment: (postId: string, commentId: string, text: string) => void;
  onDeleteComment: (postId: string, commentId: string) => void;
}

const ALL_TABS: Tab[] = [
  "feed",
  "events",
  "members",
  "about",
  "insights",
  "settings",
];
const MEMBER_TABS: Tab[] = ["feed", "events", "members", "about"];
const VISITOR_TABS: Tab[] = ["feed", "events", "about"];

export default function PageViewScreen({
  page,
  users,
  posts,
  currentUserId,
  onClose,
  onNewPostClick,
  initialTab,
  defaultMemberFilter,
  onLike,
  onComment,
  onEditComment,
  onDeleteComment,
}: PageViewScreenProps) {
  const { joinPage, updatePageSettings, leavePage, addEvent, requestPageVerification } = usePages();
  const [activeTab, setActiveTab] = useState<Tab>(initialTab || "feed");
  const [showMenu, setShowMenu] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [isHeaderSticky, setIsHeaderSticky] = useState(false);
  const [postText, setPostText] = useState("");
  const [postImage, setPostImage] = useState<string | null>(null);
  const [isPosting, setIsPosting] = useState(false);
  const [commentDialogPostId, setCommentDialogPostId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);
  const postInputRef = useRef<HTMLDivElement>(null);

  const [settingsName, setSettingsName] = useState(page.name);
  const [settingsCategory, setSettingsCategory] = useState(page.category);
  const [settingsDesc, setSettingsDesc] = useState(page.description);
  const [settingsVisibility, setSettingsVisibility] = useState(page.visibility);
  const [settingsRulesText, setSettingsRulesText] = useState(
    (page.rules || []).join("\n"),
  );
  const [showEventForm, setShowEventForm] = useState(false);
  const [eventTitle, setEventTitle] = useState("");
  const [eventDesc, setEventDesc] = useState("");
  const [eventDate, setEventDate] = useState("");

  // Reset settings when page changes
  useEffect(() => {
    setSettingsName(page.name);
    setSettingsCategory(page.category);
    setSettingsDesc(page.description);
    setSettingsVisibility(page.visibility);
    setSettingsRulesText((page.rules || []).join("\n"));
    setActiveTab(initialTab || "feed");
    setShowMenu(false);
  }, [page.id, initialTab]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle scroll events for sticky header and back to top button
  useEffect(() => {
    const handleScroll = () => {
      if (contentRef.current) {
        const scrollY = contentRef.current.scrollTop;

        // Show/hide back to top button
        setShowBackToTop(scrollY > 300);

        // Check if header should be sticky
        if (headerRef.current) {
          const headerHeight = headerRef.current.offsetHeight;
          setIsHeaderSticky(scrollY > headerHeight - 60);
        }
      }
    };

    const contentElement = contentRef.current;
    if (contentElement) {
      contentElement.addEventListener("scroll", handleScroll);
      return () => contentElement.removeEventListener("scroll", handleScroll);
    }
  }, []);

  // Focus textarea when clicking on the post container
  const handlePostContainerClick = () => {
    if (textAreaRef.current) {
      textAreaRef.current.focus();
    }
  };

  const myRole = page.members.find((m) => m.userId === currentUserId)?.role;
  const isMember = !!myRole;
  const isAdminOrEditor = myRole === "admin" || myRole === "editor";
  const canManageTeam = myRole === "admin" || myRole === "moderator";

  const tabs = useMemo(() => {
    if (!isMember) return VISITOR_TABS;
    if (canManageTeam) return ALL_TABS;
    return MEMBER_TABS;
  }, [isMember, canManageTeam]);

  const pagePosts = useMemo(() => {
    return posts.filter((p) => p.pageId === page.id);
  }, [posts, page.id]);

  const settingsRules = settingsRulesText
    .split("\n")
    .map((rule) => rule.trim())
    .filter(Boolean);

  const handleSaveSettings = () => {
    updatePageSettings(
      page.id,
      settingsName,
      settingsDesc,
      settingsCategory,
      settingsVisibility,
      currentUserId,
      settingsRules,
    );
    alert("Settings saved!");
  };

  const handleJoin = () => {
    joinPage(page.id, currentUserId);
  };

  const hasRequestedJoin = page.joinRequests?.includes(currentUserId);

  const handleLeavePage = () => {
    if (!window.confirm(`Leave "${page.name}"?`)) return;
    leavePage(page.id, currentUserId);
    setShowMenu(false);
  };

  const handleReportPage = () => {
    window.alert("Thanks — your report has been submitted.");
    setShowMenu(false);
  };

  const scrollToTop = () => {
    if (contentRef.current) {
      contentRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPostImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitPost = () => {
    if (postText.trim() || postImage) {
      setIsPosting(true);
      // Here you would typically send the post data to your backend
      console.log("Post submitted:", { text: postText, image: postImage });

      // Simulate API call
      setTimeout(() => {
        // Add the new post to the list (in a real app, this would come from the backend)
        const newPost: Post = {
          id: Date.now().toString(),
          pageId: page.id,
          authorId: currentUserId,
          caption: postText,
          imageUrl: postImage || undefined,
          imageAlt: "Post Image",
          likes: [],
          comments: [],
          createdAt: new Date().toISOString(),
        };

        // In a real app, you would update the posts state through a context or prop
        // For now, we'll just show a success message
        alert("Post submitted successfully!");
        setPostText("");
        setPostImage(null);
        setIsPosting(false);
      }, 500);
    } else {
      alert("Please add some text or an image to your post.");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmitPost();
    }
  };

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 45,
        background: "#000",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Scrollable Content */}
      <div
        ref={contentRef}
        style={{
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",
          position: "relative",
        }}
      >
        {/* Header with Cover */}
        <div
          ref={headerRef}
          style={{
            position: "relative",
            borderBottom: isHeaderSticky ? "none" : "0.5px solid #2a2a2a",
            transition: "border-bottom 0.3s ease",
          }}
        >
          {/* Cover Background */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 120,
              background: page.coverUrl
                ? `url(${page.coverUrl}) center/cover`
                : "",
              opacity: 0.6,
              zIndex: 0,
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 120,
              background: "",
              zIndex: 1,
            }}
          />

          {/* Header Content */}
          <div
            style={{
              position: "relative",
              zIndex: 2,
              padding: "16px 16px 12px",
              paddingTop: 16,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <button
                onClick={onClose}
                aria-label="Go back"
                style={{
                  background: "rgba(0,0,0,0.5)",
                  backdropFilter: "blur(10px)",
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  border: "none",
                  color: "#fff",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ArrowLeft size={20} />
              </button>
            <div style={{ position: "relative" }} ref={menuRef}>
              <button
                aria-label="More options"
                onClick={() => setShowMenu((prev) => !prev)}
                style={{
                    background: "rgba(0,0,0,0.5)",
                    backdropFilter: "blur(10px)",
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    border: "none",
                    color: "#fff",
                    cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <MoreVertical size={20} />
              </button>
                {showMenu && (
                  <div
                    style={{
                      position: "absolute",
                      top: "calc(100% + 8px)",
                      right: 0,
                      width: 220,
                      background: "#141414",
                      border: "0.5px solid #2a2a2a",
                      borderRadius: 16,
                      padding: 8,
                      zIndex: 100,
                      boxShadow: "0 16px 32px rgba(0,0,0,0.45)",
                    }}
                  >
                    {isMember && (
                      <button
                        onClick={handleLeavePage}
                        style={{
                          width: "100%",
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          padding: "10px 12px",
                          background: "transparent",
                          border: "none",
                          color: "#fca5a5",
                          borderRadius: 12,
                          cursor: "pointer",
                          textAlign: "left",
                          fontSize: 14,
                        }}
                      >
                        <LogOut size={16} />
                        Leave Page
                      </button>
                    )}
                    <button
                      onClick={handleReportPage}
                      style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "10px 12px",
                        background: "transparent",
                        border: "none",
                        color: "#e5e5e5",
                        borderRadius: 12,
                        cursor: "pointer",
                        textAlign: "left",
                        fontSize: 14,
                      }}
                    >
                      <Flag size={16} />
                      Report Page
                    </button>
                    {!page.isVerified && myRole === "admin" && (
                      <button
                        onClick={() => {
                          requestPageVerification(page.id, currentUserId);
                          setShowMenu(false);
                        }}
                        style={{
                          width: "100%",
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          padding: "10px 12px",
                          background: "transparent",
                          border: "none",
                          color: "#60a5fa",
                          borderRadius: 12,
                          cursor: "pointer",
                          textAlign: "left",
                          fontSize: 14,
                        }}
                      >
                        <BadgeCheck size={16} />
                        Request Verification
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                gap: 12,
                marginTop: 16,
              }}
            >
              <div
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 36,
                  background: "#111",
                  display: "grid",
                  placeItems: "center",
                  fontSize: 28,
                  fontWeight: 700,
                  border: "3px solid #000",
                }}
              >
                {page.avatar}
              </div>
              <div style={{ flex: 1, paddingBottom: 4 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    flexWrap: "wrap",
                  }}
                >
                  <span
                    style={{
                      fontWeight: 800,
                      fontSize: 22,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      maxWidth: "100%",
                    }}
                  >
                    {page.name}
                  </span>
                  {page.isVerified && (
                    <span
                      style={{
                        background: "#3b82f6",
                        color: "#fff",
                        fontSize: 10,
                        padding: "2px 8px",
                        borderRadius: 12,
                      }}
                    >
                      ✓ Verified
                    </span>
                  )}
                </div>
                <p style={{ color: "#aaa", fontSize: 13, margin: "4px 0 0" }}>
                  {page.category}
                </p>
              </div>
            </div>
            {/* Action buttons */}
            <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
              {!isMember && (
                <button
                  onClick={handleJoin}
                  disabled={hasRequestedJoin}
                  style={{
                    flex: 1,
                    padding: "8px",
                    background: hasRequestedJoin ? "#333" : "#fff",
                    color: hasRequestedJoin ? "#888" : "#000",
                    border: "none",
                    borderRadius: 12,
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: hasRequestedJoin ? "not-allowed" : "pointer",
                    transform: "scale(1)",
                    transition: "all 0.2s ease",
                  }}
                  onMouseDown={(e) => {
                    if (!hasRequestedJoin)
                      e.currentTarget.style.transform = "scale(0.96)";
                  }}
                  onMouseUp={(e) =>
                    (e.currentTarget.style.transform = "scale(1)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.transform = "scale(1)")
                  }
                >
                  {hasRequestedJoin ? "Requested" : "Join Page"}
                </button>
              )}
            </div>

            {/* Stats */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "8px 24px",
                marginTop: 12,
                paddingTop: 12,
                borderTop: "0.5px solid #2a2a2a",
              }}
            >
              <span style={{ fontSize: 13, color: "#8a8a8a" }}>
                👥 {page.members.length.toLocaleString()} members
              </span>
              <span style={{ fontSize: 13, color: "#8a8a8a" }}>
                📝 {pagePosts.length} posts
              </span>
            </div>
          </div>
        </div>

        {/* Sticky Tabs */}
        <div
          ref={tabsRef}
          style={{
            position: isHeaderSticky ? "sticky" : "relative",
            top: isHeaderSticky ? 0 : "auto",
            zIndex: isHeaderSticky ? 40 : 1,
            background: "#000",
            display: "flex",
            gap: 4,
            padding: "8px 16px",
            borderBottom: "0.5px solid #2a2a2a",
            overflowX: "auto",
            transition: "box-shadow 0.3s ease",
            boxShadow: isHeaderSticky ? "0 4px 20px rgba(0,0,0,0.3)" : "none",
          }}
          className="hide-scrollbar"
        >
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: "6px 16px",
                background: activeTab === tab ? "#fff" : "transparent",
                color: activeTab === tab ? "#000" : "#8a8a8a",
                border: "none",
                borderRadius: 16,
                fontWeight: 600,
                fontSize: 13,
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "all 0.2s ease",
                flexShrink: 0,
              }}
            >
              {tab === "members"
                ? (canManageTeam ? "Manage Team" : "Members")
                : tab.charAt(0).toUpperCase() + tab.slice(1)}
              {tab === "members" && (page.joinRequests?.length || 0) > 0 && (
                <span style={{ marginLeft: 6, width: 8, height: 8, borderRadius: 4, background: "#ff4d6d", display: "inline-block", flexShrink: 0 }} />
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div
          style={{
            padding: 16,
            display: "flex",
            flexDirection: "column",
            minHeight: "calc(100vh - 200px)",
          }}
        >
          {activeTab === "feed" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {/* Inline Post Creator */}
              {/* Inline Post Creator - Single line input */}
              {isMember && (
                <div
                  ref={postInputRef}
                  onClick={handlePostContainerClick}
                  style={{
                    background: "#1a1a1a",
                    border:
                      postText || postImage
                        ? "1px solid #3b82f6"
                        : "0.5px solid #333",
                    borderRadius: 12,
                    padding: "10px 12px",
                    transition: "all 0.2s ease",
                    cursor: "text",
                  }}
                >
                  {/* User info */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: 8,
                    }}
                  >
                    <Avatar
                      name={
                        users.find((u) => u.id === currentUserId)?.name ||
                        "User"
                      }
                      size="small"
                    />
                    <div>
                      <h4
                        style={{
                          margin: 0,
                          fontSize: 13,
                          fontWeight: 600,
                          color: "#fff",
                        }}
                      >
                        {users.find((u) => u.id === currentUserId)?.name ||
                          "User"}
                      </h4>
                      <p style={{ margin: 0, fontSize: 10, color: "#666" }}>
                        Posting to {page.name}
                      </p>
                    </div>
                  </div>

                  {/* Single line input - grows on Enter */}
                  <input
                    ref={textAreaRef}
                    type="text"
                    value={postText}
                    onChange={(e) => setPostText(e.target.value)}
                    placeholder="Share something with the community..."
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        if (postText.trim() || postImage) {
                          handleSubmitPost();
                        }
                      }
                    }}
                    style={{
                      width: "100%",
                      height: 36,
                      background: "transparent",
                      border: "none",
                      color: "#fff",
                      fontSize: 13,
                      fontFamily: "inherit",
                      outline: "none",
                      padding: 0,
                      placeholder: "#666",
                    }}
                  />

                  {/* Image preview */}
                  {postImage && (
                    <div
                      style={{
                        position: "relative",
                        marginTop: 8,
                        borderRadius: 8,
                        overflow: "hidden",
                        background: "#0c0c0c",
                      }}
                    >
                      <img
                        src={postImage}
                        alt="Post preview"
                        style={{
                          width: "100%",
                          maxHeight: 200,
                          objectFit: "contain",
                        }}
                      />
                      <button
                        onClick={() => setPostImage(null)}
                        style={{
                          position: "absolute",
                          top: 6,
                          right: 6,
                          background: "rgba(0,0,0,0.7)",
                          border: "none",
                          color: "#fff",
                          width: 26,
                          height: 26,
                          borderRadius: 13,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}

                  {/* Action buttons - only show when there's content */}
                  {(postText.trim() || postImage) && (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginTop: 8,
                        paddingTop: 8,
                        borderTop: "0.5px solid #2a2a2a",
                      }}
                    >
                      <div style={{ display: "flex", gap: 6 }}>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          style={{ display: "none" }}
                        />
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            padding: "4px 12px",
                            background: "rgba(59, 130, 246, 0.1)",
                            color: "#3b82f6",
                            border: "0.5px solid rgba(59, 130, 246, 0.2)",
                            borderRadius: 8,
                            cursor: "pointer",
                            fontSize: 12,
                            fontWeight: 500,
                          }}
                        >
                          <ImageIcon size={14} />
                          Media
                        </button>
                      </div>

                      <button
                        onClick={handleSubmitPost}
                        disabled={isPosting}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          padding: "4px 16px",
                          background: isPosting ? "#2a2a2a" : "#3b82f6",
                          color: isPosting ? "#666" : "#fff",
                          border: "none",
                          borderRadius: 8,
                          cursor: isPosting ? "not-allowed" : "pointer",
                          fontSize: 12,
                          fontWeight: 600,
                          opacity: isPosting ? 0.6 : 1,
                        }}
                      >
                        <Send size={14} />
                        {isPosting ? "Posting..." : "Post"}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Posts List */}
              {pagePosts.map((post) => {
                const u = users.find((user) => user.id === post.authorId);
                return (
                  <div
                    key={post.id}
                    style={{
                      background: "#0c0c0c",
                      borderRadius: 16,
                      padding: 14,
                      border: "0.5px solid #2a2a2a",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        marginBottom: 12,
                      }}
                    >
                      <Avatar name={u?.name || "Unknown"} />
                      <div>
                        <h4
                          style={{ margin: 0, fontSize: 14, fontWeight: 600 }}
                        >
                          {u?.name || "Unknown User"}
                        </h4>
                        <p style={{ margin: 0, fontSize: 12, color: "#666" }}>
                          {new Date(post.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <p
                      style={{
                        margin: "0 0 12px 0",
                        fontSize: 14,
                        lineHeight: 1.5,
                        color: "#e5e5e5",
                      }}
                    >
                      {post.caption}
                    </p>
                    {post.imageUrl && (
                      <div
                        style={{
                          width: "100%",
                          borderRadius: 12,
                          overflow: "hidden",
                          marginBottom: 12,
                        }}
                      >
                        <img
                          src={post.imageUrl}
                          alt={post.imageAlt || "Post Image"}
                          style={{ width: "100%", display: "block" }}
                        />
                      </div>
                    )}
                    <div style={{ display: "flex", gap: 16 }}>
                      <button
                        onClick={() => onLike(post.id)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          color: "#8a8a8a",
                          fontSize: 13,
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          padding: 0,
                        }}
                      >
                        <Heart size={16} color={post.likes.includes(currentUserId) ? "#ff4d6d" : "#8a8a8a"} fill={post.likes.includes(currentUserId) ? "#ff4d6d" : "none"} /> {post.likes.length}
                      </button>
                      <button
                        onClick={() => setCommentDialogPostId(post.id)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          color: "#8a8a8a",
                          fontSize: 13,
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          padding: 0,
                        }}
                      >
                        <MessageCircle size={16} /> {post.comments.length}
                      </button>
                    </div>
                  </div>
                );
              })}
              {pagePosts.length === 0 && (
                <div
                  style={{
                    textAlign: "center",
                    padding: "40px 20px",
                    color: "#666",
                    fontSize: 14,
                  }}
                >
                  No posts yet. Be the first to post!
                </div>
              )}
            </div>
          )}

          {activeTab === "events" && (
            <div style={{ position: "relative", flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
              <div style={{ flex: 1, overflowY: "auto", minHeight: 0, paddingBottom: 0 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {!page.events || page.events.length === 0 ? (
                    <div
                      style={{
                        textAlign: "center",
                        padding: "40px 20px",
                        color: "#666",
                        fontSize: 14,
                      }}
                    >
                      No upcoming events for this page.
                    </div>
                  ) : (
                    page.events.map((event) => (
                      <div
                        key={event.id}
                        style={{
                          background: "#0c0c0c",
                          borderRadius: 16,
                          padding: 16,
                          border: "0.5px solid #2a2a2a",
                          display: "flex",
                          gap: 16,
                        }}
                      >
                        <div
                          style={{
                            width: 48,
                            height: 48,
                            borderRadius: 12,
                            background: "rgba(59, 130, 246, 0.1)",
                            color: "#3b82f6",
                            display: "grid",
                            placeItems: "center",
                            flexShrink: 0,
                          }}
                        >
                          <Calendar size={24} />
                        </div>
                        <div>
                          <h4
                            style={{
                              margin: 0,
                              fontSize: 16,
                              fontWeight: 600,
                              color: "#fff",
                            }}
                          >
                            {event.title}
                          </h4>
                          <p
                            style={{
                              margin: "4px 0",
                              fontSize: 13,
                              color: "#3b82f6",
                              fontWeight: 600,
                            }}
                          >
                            {new Date(event.date).toLocaleDateString()}
                          </p>
                          <p style={{ margin: 0, fontSize: 14, color: "#888" }}>
                            {event.description}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          )}

          <style>{`
            @keyframes eventSlideUp {
              from { transform: translateY(100%); }
              to { transform: translateY(0); }
            }
          `}</style>

          {activeTab === "members" && (
            <div style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
            <PageTeamManager
              page={page}
              users={users}
              currentUserId={currentUserId}
              defaultFilterRole={defaultMemberFilter}
            />
            </div>
          )}

          {activeTab === "about" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16, flex: 1, overflowY: "auto", minHeight: 0 }}>
              <div
                style={{
                  background: "#0c0c0c",
                  borderRadius: 16,
                  padding: 16,
                  border: "0.5px solid #2a2a2a",
                }}
              >
                <h4
                  style={{
                    margin: 0,
                    marginBottom: 8,
                    color: "#fff",
                    fontSize: 15,
                  }}
                >
                  About this page
                </h4>
                <p
                  style={{
                    lineHeight: 1.6,
                    color: "#8a8a8a",
                    fontSize: 14,
                    margin: 0,
                  }}
                >
                  {page.description}
                </p>
              </div>

              {page.rules && page.rules.length > 0 && (
                <div
                  style={{
                    background: "#0c0c0c",
                    borderRadius: 16,
                    padding: 16,
                    border: "0.5px solid #2a2a2a",
                  }}
                >
                  <h4
                    style={{
                      margin: 0,
                      marginBottom: 12,
                      color: "#fff",
                      fontSize: 15,
                    }}
                  >
                    Community Rules
                  </h4>
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 8 }}
                  >
                    {page.rules.map((rule, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: "flex",
                          gap: 12,
                          color: "#8a8a8a",
                          fontSize: 14,
                        }}
                      >
                        <span style={{ fontWeight: 600, color: "#555" }}>
                          {idx + 1}.
                        </span>
                        <span>{rule}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div
                style={{
                  background: "#0c0c0c",
                  borderRadius: 16,
                  padding: 16,
                  border: "0.5px solid #2a2a2a",
                }}
              >
                <h4
                  style={{
                    margin: 0,
                    marginBottom: 12,
                    color: "#fff",
                    fontSize: 15,
                  }}
                >
                  Details
                </h4>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "10px 0",
                    borderBottom: "0.5px solid #222",
                  }}
                >
                  <span style={{ color: "#8a8a8a", fontSize: 14 }}>
                    Category
                  </span>
                  <span
                    style={{ color: "#fff", fontSize: 14, fontWeight: 500 }}
                  >
                    {page.category}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "10px 0",
                    borderBottom: "0.5px solid #222",
                  }}
                >
                  <span style={{ color: "#8a8a8a", fontSize: 14 }}>
                    Visibility
                  </span>
                  <span
                    style={{
                      color: "#fff",
                      fontSize: 14,
                      fontWeight: 500,
                      textTransform: "capitalize",
                    }}
                  >
                    {page.visibility}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    paddingTop: 10,
                  }}
                >
                  <span style={{ color: "#8a8a8a", fontSize: 14 }}>
                    Members
                  </span>
                  <span
                    style={{ color: "#fff", fontSize: 14, fontWeight: 500 }}
                  >
                    {page.members.length.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeTab === "insights" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16, flex: 1, overflowY: "auto", minHeight: 0 }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>
                Page Insights
              </h3>

              <div style={{ display: "flex", gap: 12 }}>
                <div
                  style={{
                    flex: 1,
                    background: "#0c0c0c",
                    borderRadius: 16,
                    padding: 16,
                    border: "0.5px solid #2a2a2a",
                  }}
                >
                  <p
                    style={{
                      margin: 0,
                      fontSize: 13,
                      color: "#888",
                      marginBottom: 8,
                    }}
                  >
                    Total Views
                  </p>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <h4 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>
                      {page.analytics?.views.toLocaleString() || "0"}
                    </h4>
                    <span
                      style={{
                        color: "#10b981",
                        fontSize: 12,
                        fontWeight: 600,
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                      }}
                    >
                      <TrendingUp size={12} /> +12%
                    </span>
                  </div>
                </div>
                <div
                  style={{
                    flex: 1,
                    background: "#0c0c0c",
                    borderRadius: 16,
                    padding: 16,
                    border: "0.5px solid #2a2a2a",
                  }}
                >
                  <p
                    style={{
                      margin: 0,
                      fontSize: 13,
                      color: "#888",
                      marginBottom: 8,
                    }}
                  >
                    Member Trend
                  </p>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <h4 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>
                      {page.analytics?.membersTrend || "0"}
                    </h4>
                    <span
                      style={{
                        color:
                          (page.analytics?.membersTrend || 0) >= 0
                            ? "#10b981"
                            : "#ef4444",
                        fontSize: 12,
                        fontWeight: 600,
                      }}
                    >
                      {(page.analytics?.membersTrend || 0) >= 0
                        ? "Positive"
                        : "Negative"}
                    </span>
                  </div>
                </div>
              </div>

              <div
                style={{
                  background: "#0c0c0c",
                  borderRadius: 16,
                  padding: 16,
                  border: "0.5px solid #2a2a2a",
                  height: 200,
                  display: "flex",
                  alignItems: "flex-end",
                  gap: 8,
                  marginTop: 10,
                }}
              >
                {/* Dummy bar chart */}
                {[30, 45, 20, 60, 80, 50, 90].map((h, i) => (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      background: "rgba(59, 130, 246, 0.2)",
                      height: `${h}%`,
                      borderRadius: "4px 4px 0 0",
                      position: "relative",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: "40%",
                        background: "#3b82f6",
                        borderRadius: "4px 4px 0 0",
                      }}
                    />
                  </div>
                ))}
              </div>
              <p
                style={{
                  textAlign: "center",
                  color: "#666",
                  fontSize: 12,
                  margin: 0,
                }}
              >
                Activity over last 7 days
              </p>
            </div>
          )}

          {activeTab === "settings" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16, flex: 1, overflowY: "auto", minHeight: 0 }}>
              <h3
                style={{
                  margin: 0,
                  fontSize: 18,
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <SettingsIcon size={20} /> Page Settings
              </h3>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <label style={{ fontSize: 13, color: "#aaa", fontWeight: 600 }}>
                  Page Name
                </label>
                <input
                  type="text"
                  value={settingsName}
                  onChange={(e) => setSettingsName(e.target.value)}
                  style={{
                    background: "#0c0c0c",
                    border: "1px solid #333",
                    color: "#fff",
                    padding: "12px",
                    borderRadius: 12,
                    fontSize: 14,
                  }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <label style={{ fontSize: 13, color: "#aaa", fontWeight: 600 }}>
                  Category
                </label>
                <input
                  type="text"
                  value={settingsCategory}
                  onChange={(e) => setSettingsCategory(e.target.value)}
                  style={{
                    background: "#0c0c0c",
                    border: "1px solid #333",
                    color: "#fff",
                    padding: "12px",
                    borderRadius: 12,
                    fontSize: 14,
                  }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <label style={{ fontSize: 13, color: "#aaa", fontWeight: 600 }}>
                  Description
                </label>
                <textarea
                  value={settingsDesc}
                  onChange={(e) => setSettingsDesc(e.target.value)}
                  rows={3}
                  style={{
                    background: "#0c0c0c",
                    border: "1px solid #333",
                    color: "#fff",
                    padding: "12px",
                    borderRadius: 12,
                    fontSize: 14,
                    fontFamily: "inherit",
                    resize: "vertical",
                  }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <label style={{ fontSize: 13, color: "#aaa", fontWeight: 600 }}>
                  Visibility
                </label>
                <select
                  value={settingsVisibility}
                  onChange={(e) => setSettingsVisibility(e.target.value)}
                  style={{
                    background: "#0c0c0c",
                    border: "1px solid #333",
                    color: "#fff",
                    padding: "12px",
                    borderRadius: 12,
                    fontSize: 14,
                  }}
                >
                  <option value="public">Public - Anyone can join</option>
                  <option value="restricted">
                    Restricted - Join requires approval
                  </option>
                  <option value="private">Private - Invite only</option>
                </select>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <label style={{ fontSize: 13, color: "#aaa", fontWeight: 600 }}>
                  Community Rules
                </label>
                <textarea
                  value={settingsRulesText}
                  onChange={(e) => setSettingsRulesText(e.target.value)}
                  rows={5}
                  placeholder={
                    "Be respectful and constructive.\nNo spam or self-promotion.\nCredit sources and creators."
                  }
                  style={{
                    background: "#0c0c0c",
                    border: "1px solid #333",
                    color: "#fff",
                    padding: "12px",
                    borderRadius: 12,
                    fontSize: 14,
                    fontFamily: "inherit",
                    resize: "vertical",
                  }}
                />
                <div style={{ color: "#666", fontSize: 12 }}>
                  Add one rule per line.
                </div>
              </div>

              <button
                onClick={handleSaveSettings}
                style={{
                  background: "#fff",
                  color: "#000",
                  padding: "12px",
                  borderRadius: 12,
                  border: "none",
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: "pointer",
                  marginTop: 10,
                }}
              >
                Save Changes
              </button>
            </div>
          )}
        </div>

        {/* Back to Top Button - Bottom Right */}
        {showBackToTop && (
          <button
            onClick={scrollToTop}
            style={{
              position: "sticky",
              bottom: 24,
              marginLeft: "auto",
              marginRight: 24,
              marginTop: -60,
              width: 48,
              height: 48,
              borderRadius: 24,
              background: "#3b82f6",
              color: "#fff",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 20px rgba(59, 130, 246, 0.4)",
              transition: "all 0.3s ease",
              zIndex: 30,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.1)";
              e.currentTarget.style.boxShadow =
                "0 6px 28px rgba(59, 130, 246, 0.6)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow =
                "0 4px 20px rgba(59, 130, 246, 0.4)";
            }}
            aria-label="Back to top"
          >
            <ChevronUp size={24} />
          </button>
        )}
      </div>

      {/* Create Event FAB */}
      {isAdminOrEditor && !showEventForm && activeTab === "events" && (
        <button
          onClick={() => setShowEventForm(true)}
          style={{
            position: "absolute",
            bottom: 24,
            right: 24,
            width: 52,
            height: 52,
            borderRadius: 26,
            background: "#3b82f6",
            border: "none",
            color: "#fff",
            cursor: "pointer",
            display: "grid",
            placeItems: "center",
            boxShadow: "0 4px 20px rgba(59, 130, 246, 0.4)",
            transition: "all 0.2s",
            zIndex: 50,
          }}
          onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.92)")}
          onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          aria-label="Create event"
        >
          <Plus size={24} />
        </button>
      )}

      {/* Create Event Dialog */}
      {showEventForm && (
        <div
          onClick={() => { setShowEventForm(false); setEventTitle(""); setEventDesc(""); setEventDate(""); }}
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 100,
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#1a1a1a",
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              padding: 24,
              paddingBottom: 32,
              border: "1px solid #2a2a2a",
              borderBottom: "none",
              animation: "eventSlideUp 0.3s ease",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h4 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#fff" }}>New Event</h4>
              <button
                onClick={() => { setShowEventForm(false); setEventTitle(""); setEventDesc(""); setEventDate(""); }}
                style={{ background: "none", border: "none", color: "#888", cursor: "pointer", padding: 4 }}
              >
                <X size={22} />
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <input
                type="text"
                placeholder="Event title"
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                style={{ background: "#0c0c0c", border: "1px solid #333", color: "#fff", padding: "12px 14px", borderRadius: 12, fontSize: 14, outline: "none" }}
              />
              <input
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                style={{ background: "#0c0c0c", border: "1px solid #333", color: "#fff", padding: "12px 14px", borderRadius: 12, fontSize: 14, outline: "none", colorScheme: "dark" }}
              />
              <textarea
                placeholder="Description"
                value={eventDesc}
                onChange={(e) => setEventDesc(e.target.value)}
                rows={3}
                style={{ background: "#0c0c0c", border: "1px solid #333", color: "#fff", padding: "12px 14px", borderRadius: 12, fontSize: 14, fontFamily: "inherit", outline: "none", resize: "vertical" }}
              />
              <button
                onClick={() => {
                  if (!eventTitle.trim() || !eventDate) return;
                  addEvent(page.id, eventTitle.trim(), eventDesc.trim(), new Date(eventDate).getTime(), currentUserId);
                  setEventTitle("");
                  setEventDesc("");
                  setEventDate("");
                  setShowEventForm(false);
                }}
                style={{
                  width: "100%",
                  padding: "14px",
                  borderRadius: 14,
                  background: eventTitle.trim() && eventDate ? "#3b82f6" : "#333",
                  color: eventTitle.trim() && eventDate ? "#fff" : "#666",
                  border: "none",
                  cursor: eventTitle.trim() && eventDate ? "pointer" : "not-allowed",
                  fontSize: 15,
                  fontWeight: 700,
                  marginTop: 4,
                }}
              >
                Create Event
              </button>
            </div>
          </div>
        </div>
      )}

      {commentDialogPostId && (
        <CommentDialog
          post={posts.find(p => p.id === commentDialogPostId)!}
          users={users}
          currentUserId={currentUserId}
          onClose={() => setCommentDialogPostId(null)}
          onComment={onComment}
          onEditComment={onEditComment}
          onDeleteComment={onDeleteComment}
        />
      )}

      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
