import { useState } from "react";
import {
  Plus,
  Inbox,
  Check,
  X,
  Search,
  User,
  Store,
  ChevronRight,
} from "lucide-react";
import Avatar from "./Avatar";

import { usePages } from "../contexts/PageContext";

interface PageManagementScreenProps {
  currentUserId: string;
  users: { id: string; name: string; username: string; avatarUrl?: string }[];
  onCreatePage: () => void;
  onViewPage: (pageId: string, initialTab?: "feed" | "members", memberFilter?: 'all' | 'invite') => void;
  onOpenMarketplace: () => void;
  marketplaceCartCount?: number;
}

type Tab = "my_pages" | "discover" | "requests" | "invites";

export default function PageManagementScreen({
  currentUserId,
  users,
  onCreatePage,
  onViewPage,
  onOpenMarketplace,
  marketplaceCartCount = 0,
}: PageManagementScreenProps) {
  const { pages, acceptJoinRequest, rejectJoinRequest, joinPage } = usePages();

  const [activeTab, setActiveTab] = useState<Tab>("my_pages");
  const [discoverCategory, setDiscoverCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");

  const myPages = pages.filter((p) =>
    p.members.some((m) => m.userId === currentUserId),
  );
  const discoverPages = pages.filter(
    (p) => !p.members.some((m) => m.userId === currentUserId),
  );
  const categories = [
    "All",
    "Technology",
    "Art & Design",
    "Music",
    "Sports",
    "Food",
    "Travel",
    "Fashion",
    "Other",
  ];

  const filteredDiscoverPages = discoverPages
    .filter(
      (p) => discoverCategory === "All" || p.category === discoverCategory,
    )
    .filter(
      (p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.description &&
          p.description.toLowerCase().includes(searchQuery.toLowerCase())),
    );

  // Compute pending requests for pages where current user is admin/editor
  const managedPages = pages.filter((p) => {
    const role = p.members.find((m) => m.userId === currentUserId)?.role;
    return role === "admin" || role === "editor";
  });

  const allRequests = managedPages.flatMap((p) =>
    (p.joinRequests || []).map((reqUserId) => ({
      page: p,
      userId: reqUserId,
    })),
  );

  const tabs: Tab[] = ["my_pages", "discover", "requests"];

  const formatTabLabel = (tab: Tab) => {
    return tab
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  };

  const getRoleBadgeStyles = (role: string) => {
    const styles: Record<
      string,
      { bg: string; color: string; border: string }
    > = {
      admin: {
        bg: "rgba(59, 130, 246, 0.2)",
        color: "var(--accent-blue-soft)",
        border: "rgba(59, 130, 246, 0.3)",
      },
      editor: {
        bg: "rgba(139, 92, 246, 0.2)",
        color: "var(--accent-purple-soft)",
        border: "rgba(139, 92, 246, 0.3)",
      },
      moderator: {
        bg: "rgba(245, 158, 11, 0.2)",
        color: "var(--accent-amber-soft)",
        border: "rgba(245, 158, 11, 0.3)",
      },
      member: {
        bg: "rgba(107, 114, 128, 0.2)",
        color: "var(--text-secondary)",
        border: "rgba(107, 114, 128, 0.3)",
      },
    };
    return styles[role] || styles.member;
  };

  return (
    <div
      style={{
        flex: 1,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ padding: "12px 16px 0", flexShrink: 0 }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <div style={{ flex: 1, minWidth: 200 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>Pages</h2>
          <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 4 }}>
            Manage your communities and pages
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={onCreatePage}
            style={{
              width: 40,
              height: 40,
              borderRadius: 14,
              background: "var(--surface-subtle)",
              border: "none",
              color: "var(--text-secondary)",
              display: "grid",
              placeItems: "center",
              cursor: "pointer",
              boxShadow: "0 8px 20px var(--surface-hover)",
              flexShrink: 0,
              transition: "all 0.2s",
            }}
            onMouseDown={(e) =>
              (e.currentTarget.style.transform = "scale(0.92)")
            }
            onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            aria-label="Create Page"
          >
            <Plus size={18} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 20,
          borderBottom: "0.5px solid var(--border-2)",
          paddingBottom: 12,
          overflowX: "auto",
        }}
        className="hide-scrollbar"
      >
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              background: activeTab === tab ? "var(--text)" : "transparent",
              color: activeTab === tab ? "var(--bg)" : "var(--text-muted)",
              border: "none",
              padding: "8px 16px",
              borderRadius: 20,
              cursor: "pointer",
              fontWeight: 600,
              fontSize: 13,
              display: "flex",
              alignItems: "center",
              transition: "all 0.2s",
            }}
          >
            {formatTabLabel(tab)}
            {tab === "requests" && allRequests.length > 0 && (
              <span
                style={{
                  marginLeft: 8,
                  background: "#ff4d6d",
                  color: "var(--text)",
                  padding: "2px 8px",
                  borderRadius: 12,
                  fontSize: 11,
                  fontWeight: 700,
                }}
              >
                {allRequests.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Discover Categories & Search */}
      {activeTab === "discover" && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
            marginBottom: 16,
          }}
        >
          <div
            style={{ display: "flex", gap: 8, overflowX: "auto" }}
            className="hide-scrollbar"
          >
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setDiscoverCategory(cat)}
                style={{
                  padding: "6px 14px",
                  borderRadius: 20,
                  border: discoverCategory === cat ? "none" : "1px solid var(--border)",
                  background: discoverCategory === cat ? "var(--text)" : "transparent",
                  color: discoverCategory === cat ? "var(--bg)" : "var(--text-muted)",
                  fontWeight: 600,
                  fontSize: 12,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                {cat}
              </button>
            ))}
          </div>
          <div
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
            }}
          >
            <Search
              size={16}
              color="var(--text-tertiary)"
              style={{ position: "absolute", left: 12 }}
            />
            <input
              type="text"
              placeholder="Search communities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                background: "var(--bg-elevated-2)",
                border: "1px solid var(--border)",
                color: "var(--text)",
                padding: "10px 12px 10px 36px",
                borderRadius: 12,
                fontSize: 14,
                outline: "none",
              }}
            />
          </div>
        </div>
      )}
      </div>

      {/* Page Cards */}
      <div style={{ flex: 1, overflowY: "auto", padding: "4px 16px 16px" }}>
      {activeTab !== "requests" && (
        <button
          onClick={onOpenMarketplace}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: 14,
            background: "var(--bg-elevated)",
            border: "0.5px solid var(--border-subtle)",
            borderRadius: 20,
            padding: "14px 16px",
            marginBottom: 16,
            cursor: "pointer",
            textAlign: "left",
            color: "var(--text)",
            fontFamily: "inherit",
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              background: "var(--text)",
              color: "var(--bg)",
              display: "grid",
              placeItems: "center",
              flexShrink: 0,
              position: "relative",
            }}
          >
            <Store size={20} />
            {marketplaceCartCount > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: -6,
                  right: -6,
                  minWidth: 18,
                  height: 18,
                  padding: "0 5px",
                  borderRadius: 999,
                  background: "#ff4d6d",
                  color: "#fff",
                  fontSize: 10,
                  fontWeight: 700,
                  display: "grid",
                  placeItems: "center",
                  boxShadow: "0 0 0 2px var(--bg-elevated)",
                }}
              >
                {marketplaceCartCount > 9 ? "9+" : marketplaceCartCount}
              </span>
            )}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontWeight: 700, fontSize: 15 }}>Marketplace</span>
            </div>
            <p
              style={{
                margin: "4px 0 0",
                fontSize: 12,
                color: "var(--text-muted)",
              }}
            >
              Buy, sell, and connect with sellers
            </p>
          </div>
          <ChevronRight size={18} color="var(--text-tertiary)" />
        </button>
      )}
      {(activeTab === "my_pages"
        ? myPages
        : activeTab === "discover"
          ? filteredDiscoverPages
          : []
      ).map((page) => (
        <div
          key={page.id}
          style={{
            position: "relative",
            background: "var(--bg-elevated)",
            borderRadius: 20,
            padding: 16,
            border: "0.5px solid var(--border-subtle)",
            marginBottom: 16,
            overflow: "hidden",
          }}
        >
          {/* Rich Gradient Banner */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "40px",
              background: page.coverUrl
                ? `url(${page.coverUrl}) center/cover`
                : "",
              borderBottom: "0.5px solid var(--surface-subtle)",
              zIndex: 0,
            }}
          />

          <div
            style={{
              position: "relative",
              zIndex: 1,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: 12,
            }}
          >
            <div
              style={{
                display: "flex",
                gap: 12,
                cursor: "pointer",
                flex: 1,
                minWidth: 0,
                marginTop: 4,
              }}
              onClick={() => onViewPage(page.id)}
            >
              <Avatar name={page.avatar} size="lg" />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    flexWrap: "wrap",
                  }}
                >
                  <h3
                    style={{
                      fontWeight: 700,
                      fontSize: 16,
                      margin: 0,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {page.name}
                  </h3>
                  {page.isVerified && (
                    <span
                      style={{
                        background: "#3b82f6",
                        color: "var(--text)",
                        fontSize: 10,
                        padding: "2px 8px",
                        borderRadius: 12,
                      }}
                    >
                      ✓ Verified
                    </span>
                  )}
                </div>
                <p style={{ color: "var(--text-muted)", fontSize: 13, margin: "4px 0" }}>
                  {page.category}
                </p>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "8px 16px",
                    marginTop: 8,
                  }}
                >
                  <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                    👥 {page.members.length.toLocaleString()} members
                  </span>
                </div>
              </div>
            </div>
            {activeTab !== "discover" && (
            <button
              onClick={() => onViewPage(page.id, "members", "invite")}
              style={{
                position: "absolute",
                top: 14,
                right: 14,
                width: 36,
                height: 36,
                borderRadius: 18,
                background: "var(--overlay-surface)",
                border: "1px solid var(--surface-hover)",
                color: "var(--text)",
                display: "grid",
                placeItems: "center",
                cursor: "pointer",
                boxShadow: "0 8px 18px rgba(0,0,0,0.25)",
              }}
              aria-label="Member notifications"
              title={`Pending requests: ${page.joinRequests?.length || 0}`}
            >
              <div
                style={{
                  position: "relative",
                  width: 18,
                  height: 18,
                  display: "grid",
                  placeItems: "center",
                }}
              >
                <User size={16} />
                {(page.joinRequests?.length || 0) > 0 && (
                  <span
                    style={{
                      position: "absolute",
                      top: -6,
                      right: -7,
                      minWidth: 16,
                      height: 16,
                      borderRadius: 999,
                      background: "#ef4444",
                      color: "var(--text)",
                      fontSize: 10,
                      fontWeight: 700,
                      display: "grid",
                      placeItems: "center",
                      padding: "0 4px",
                      boxShadow: "0 0 0 2px var(--bg-elevated)",
                    }}
                  >
                    {page.joinRequests?.length || 0}
                  </span>
                )}
              </div>
            </button>
            )}
          </div>

          {/* Role badge and actions */}
          <div
            style={{
              position: "relative",
              zIndex: 1,
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginTop: 14,
              paddingTop: 14,
              borderTop: "0.5px solid var(--border-subtle)",
            }}
          >
            {(() => {
              const myRole = page.members.find(
                (m) => m.userId === currentUserId,
              )?.role;
              if (!myRole) return null;
              const style = getRoleBadgeStyles(myRole);
              return (
                <span
                  style={{
                    background: style.bg,
                    color: style.color,
                    border: `1px solid ${style.border}`,
                    padding: "4px 12px",
                    borderRadius: 20,
                    fontSize: 11,
                    fontWeight: 600,
                    textTransform: "capitalize",
                  }}
                >
                  {myRole}
                </span>
              );
            })()}
            {activeTab === "discover" && (
              <div style={{ display: "flex", gap: 8, marginLeft: "auto" }}>
                <button
                  onClick={() => joinPage(page.id, currentUserId)}
                  disabled={page.joinRequests?.includes(currentUserId)}
                  style={{
                    background: page.joinRequests?.includes(currentUserId)
                      ? "var(--border)"
                      : "#3b82f6",
                    color: page.joinRequests?.includes(currentUserId)
                      ? "var(--text-muted)"
                      : "var(--text)",
                    border: "none",
                    padding: "6px 14px",
                    borderRadius: 20,
                    cursor: page.joinRequests?.includes(currentUserId)
                      ? "not-allowed"
                      : "pointer",
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  {page.joinRequests?.includes(currentUserId)
                    ? "Requested"
                    : "Join"}
                </button>
              </div>
            )}
          </div>
        </div>
      ))}

      {activeTab === "discover" && filteredDiscoverPages.length === 0 && (
        <div
          style={{
            textAlign: "center",
            padding: "40px 20px",
            color: "var(--text-tertiary)",
            fontSize: 14,
          }}
        >
          No pages found in this category.
        </div>
      )}

      {activeTab === "my_pages" && myPages.length === 0 && (
        <div
          style={{
            textAlign: "center",
            padding: "40px 20px",
            color: "var(--text-tertiary)",
            fontSize: 14,
          }}
        >
          You haven't joined any pages yet. Head to Discover to find
          communities!
        </div>
      )}

      {/* Requests Tab */}
      {activeTab === "requests" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {allRequests.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "60px 20px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 12,
              }}
            >
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 32,
                  background: "var(--surface-subtle)",
                  display: "grid",
                  placeItems: "center",
                  color: "var(--text-tertiary)",
                }}
              >
                <Inbox size={28} />
              </div>
              <h3 style={{ margin: 0, fontWeight: 600, fontSize: 16 }}>
                No Requests
              </h3>
              <p style={{ margin: 0, color: "var(--text-tertiary)", fontSize: 13 }}>
                You don't have any pending join requests.
              </p>
            </div>
          ) : (
            allRequests.map(({ page, userId }) => {
              const u = users.find((user) => user.id === userId);
              if (!u) return null;
              return (
                <div
                  key={`${page.id}-${userId}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    background: "var(--bg-elevated)",
                    padding: 14,
                    borderRadius: 16,
                    border: "0.5px solid var(--border-subtle)",
                  }}
                >
                  <Avatar name={u.name} src={u.avatarUrl} />
                  <div style={{ flex: 1 }}>
                    <div
                      style={{ fontWeight: 600, fontSize: 14, color: "var(--text)" }}
                    >
                      {u.name}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                      Requested to join{" "}
                      <strong style={{ color: "var(--text-secondary)" }}>{page.name}</strong>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      onClick={() =>
                        acceptJoinRequest(page.id, userId, currentUserId)
                      }
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 18,
                        background: "#3b82f6",
                        border: "none",
                        color: "var(--text)",
                        cursor: "pointer",
                        display: "grid",
                        placeItems: "center",
                      }}
                      onMouseDown={(e) =>
                        (e.currentTarget.style.transform = "scale(0.92)")
                      }
                      onMouseUp={(e) =>
                        (e.currentTarget.style.transform = "scale(1)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.transform = "scale(1)")
                      }
                    >
                      <Check size={18} />
                    </button>
                    <button
                      onClick={() =>
                        rejectJoinRequest(page.id, userId, currentUserId)
                      }
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 18,
                        background: "var(--surface-hover)",
                        border: "none",
                        color: "var(--text)",
                        cursor: "pointer",
                        display: "grid",
                        placeItems: "center",
                      }}
                      onMouseDown={(e) =>
                        (e.currentTarget.style.transform = "scale(0.92)")
                      }
                      onMouseUp={(e) =>
                        (e.currentTarget.style.transform = "scale(1)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.transform = "scale(1)")
                      }
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Invites Tab Empty State */}
      {activeTab === "invites" && (
        <div
          style={{
            textAlign: "center",
            padding: "60px 20px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              background: "var(--surface-subtle)",
              display: "grid",
              placeItems: "center",
              color: "var(--text-tertiary)",
            }}
          >
            <Inbox size={28} />
          </div>
          <h3 style={{ margin: 0, fontWeight: 600, fontSize: 16 }}>
            No Invites
          </h3>
          <p style={{ margin: 0, color: "var(--text-tertiary)", fontSize: 13 }}>
            When you receive new invites, they will appear here.
          </p>
        </div>
      )}
      </div>
    </div>
  );
}
