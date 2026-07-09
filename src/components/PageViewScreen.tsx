import { useState, useMemo, useEffect } from "react";
import {
  ArrowLeft,
  Bell,
  Heart,
  MessageCircle,
  MoreVertical,
  Calendar,
  TrendingUp,
  Settings as SettingsIcon,
} from "lucide-react";
import Avatar from "./Avatar";

import { usePages } from "../contexts/PageContext";
import { Page, User, Post } from "../types";
import PageTeamManager from "./PageTeamManager";

type Tab = "feed" | "events" | "members" | "about" | "insights" | "settings";

interface PageViewScreenProps {
  page: Page;
  users: User[];
  posts: Post[];
  currentUserId: string;
  onClose: () => void;
  onNewPostClick?: () => void;
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

export default function PageViewScreen({
  page,
  users,
  posts,
  currentUserId,
  onClose,
  onNewPostClick,
}: PageViewScreenProps) {
  const { joinPage, updatePageSettings } = usePages();
  const [activeTab, setActiveTab] = useState<Tab>("feed");

  const [settingsName, setSettingsName] = useState(page.name);
  const [settingsCategory, setSettingsCategory] = useState(page.category);
  const [settingsDesc, setSettingsDesc] = useState(page.description);
  const [settingsVisibility, setSettingsVisibility] = useState(page.visibility);
  const [settingsRulesText, setSettingsRulesText] = useState(
    (page.rules || []).join("\n"),
  );

  // Reset settings when page changes
  useEffect(() => {
    setSettingsName(page.name);
    setSettingsCategory(page.category);
    setSettingsDesc(page.description);
    setSettingsVisibility(page.visibility);
    setSettingsRulesText((page.rules || []).join("\n"));
    setActiveTab("feed");
  }, [page.id]);

  const myRole = page.members.find((m) => m.userId === currentUserId)?.role;
  const isMember = !!myRole;
  const isAdminOrEditor = myRole === "admin" || myRole === "editor";

  const tabs = useMemo(() => {
    return isAdminOrEditor ? ALL_TABS : MEMBER_TABS;
  }, [isAdminOrEditor]);

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
      {/* Header with Cover */}
      <div
        style={{ position: "relative", borderBottom: "0.5px solid #2a2a2a" }}
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
              : "linear-gradient(135deg, #1e3a8a, #4c1d95, #9d174d)",
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
            background: "linear-gradient(to bottom, transparent, #000)",
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
            <button
              aria-label="More options"
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
            <button
              aria-label="Notifications"
              style={{
                width: 36,
                height: 36,
                background: "rgba(255,255,255,0.05)",
                color: "#bfbfbf",
                border: "none",
                borderRadius: 12,
                cursor: "pointer",
                display: "grid",
                placeItems: "center",
                flexShrink: 0,
              }}
            >
              <Bell size={18} />
            </button>
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

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: 4,
          padding: "8px 16px",
          borderBottom: "0.5px solid #2a2a2a",
          overflowX: "auto",
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
            }}
          >
            {tab === "members"
              ? "Manage Team"
              : tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Content */}
      <div
        style={{
          flex: 1,
          overflowY: activeTab === "members" ? "hidden" : "auto",
          padding: 16,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {activeTab === "feed" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {isMember && onNewPostClick && (
              <div
                onClick={onNewPostClick}
                style={{
                  background: "#1a1a1a",
                  border: "0.5px solid #333",
                  padding: "14px 16px",
                  borderRadius: 16,
                  color: "#8a8a8a",
                  fontSize: 14,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    background: "#333",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                  }}
                >
                  +
                </div>
                <span>Share something with the community...</span>
              </div>
            )}

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
                      <h4 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>
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
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        color: "#8a8a8a",
                        fontSize: 13,
                      }}
                    >
                      <Heart size={16} /> {post.likes.length}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        color: "#8a8a8a",
                        fontSize: 13,
                      }}
                    >
                      <MessageCircle size={16} /> {post.comments.length}
                    </div>
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
        )}

        {activeTab === "members" && (
          <PageTeamManager
            page={page}
            users={users}
            currentUserId={currentUserId}
          />
        )}

        {activeTab === "about" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
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
                <span style={{ color: "#8a8a8a", fontSize: 14 }}>Category</span>
                <span style={{ color: "#fff", fontSize: 14, fontWeight: 500 }}>
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
                <span style={{ color: "#8a8a8a", fontSize: 14 }}>Members</span>
                <span style={{ color: "#fff", fontSize: 14, fontWeight: 500 }}>
                  {page.members.length.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}

        {activeTab === "insights" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
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
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
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
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
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
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
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
    </div>
  );
}
