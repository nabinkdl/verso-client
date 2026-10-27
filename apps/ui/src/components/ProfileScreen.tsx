import { useEffect, useMemo, useRef, useState } from "react";
import { Heart, MessageCircle, MoreHorizontal, Play, AlertTriangle, Trash2, Bookmark, PenLine, Camera } from "lucide-react";
import { Post, User } from "../types";
import Avatar from "./Avatar";
import CommentDialog from "./CommentDialog";

interface ProfileScreenProps {
  profileUserId: string;
  currentUserId: string;
  users: User[];
  posts: Post[];
  savedPosts: string[];
  onToggleSave: (postId: string) => void;
  onNewPost: () => void;
  onEditProfile: (newName: string, newUsername: string, avatarUrl?: string) => void;
  onLogout: () => void;
  onEditPost: (postId: string, caption: string) => void;
  onDeletePost: (postId: string) => void;
  onMessage: () => void;
  onLike: (postId: string) => void;
  onComment: (postId: string, text: string) => void;
  onEditComment: (postId: string, commentId: string, text: string) => void;
  onDeleteComment: (postId: string, commentId: string) => void;
}

export default function ProfileScreen({
  profileUserId,
  currentUserId,
  users,
  posts,
  savedPosts,
  onToggleSave,
  // onNewPost,
  onEditProfile,
  onLogout,
  onEditPost,
  onDeletePost,
  onMessage,
  onLike,
  onComment,
  onEditComment,
  onDeleteComment,
}: ProfileScreenProps) {
  const [editing, setEditing] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [usernameInput, setUsernameInput] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editCaption, setEditCaption] = useState("");
  const [activeUserListType, setActiveUserListType] = useState<"followers" | "following" | null>(null);
  const [headerMenuOpen, setHeaderMenuOpen] = useState(false);
  const [showCommentDialog, setShowCommentDialog] = useState(false);
  const [profileTab, setProfileTab] = useState<"posts" | "saved">("posts");

  const user = users.find((u) => u.id === profileUserId);
  const isOwn = profileUserId === currentUserId;
  const userPosts = useMemo(
    () => posts.filter((p) => p.authorId === profileUserId),
    [posts, profileUserId],
  );
  const savedPostsList = useMemo(
    () => posts.filter((p) => savedPosts.includes(p.id)),
    [posts, savedPosts],
  );
  const displayedPosts =
    isOwn && profileTab === "saved" ? savedPostsList : userPosts;
  const selectedPost =
    displayedPosts.find((post) => post.id === selectedPostId) ?? null;

  useEffect(() => {
    if (selectedPostId && !selectedPost) {
      setSelectedPostId(null);
    }
  }, [selectedPost, selectedPostId]);

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = selectedPost ? "hidden" : originalOverflow;
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [selectedPost]);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-header-menu]')) {
        setHeaderMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  if (!user) return null;

  const selectedPostAuthor = selectedPost
    ? users.find((u) => u.id === selectedPost.authorId) ?? user
    : null;
  const canOpenPostMenu =
    selectedPost !== null &&
    (selectedPost.authorId === currentUserId || !isOwn);
  const postsCount = userPosts.length;
  const followersCount = user.followerCount ?? user.followers.length;
  const followingCount = user.followingCount ?? user.following.length;

  const startEditing = () => {
    setNameInput(user.name);
    setUsernameInput(user.username);
    setAvatarPreview(null);
    setEditing(true);
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(String(reader.result));
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const handleEditSave = () => {
    const nextName = nameInput.trim();
    const nextUsername = usernameInput.trim().replace(/^@+/, "");
    if (!nextName || !nextUsername) return;
    if (!/^[a-zA-Z0-9._]+$/.test(nextUsername)) {
      window.alert(
        "Usernames can only contain letters, numbers, dots, and underscores.",
      );
      return;
    }
    const taken = users.some(
      (u) =>
        u.id !== user.id &&
        u.username.toLowerCase() === nextUsername.toLowerCase(),
    );
    if (taken) {
      window.alert("That username is already taken.");
      return;
    }
    onEditProfile(
      nextName,
      nextUsername,
      avatarPreview === null ? undefined : avatarPreview,
    );
    setEditing(false);
    setNameInput("");
    setUsernameInput("");
    setAvatarPreview(null);
  };

  return (
    <div
      style={{
        flex: 1,
        overflowY: "auto",
        background: "var(--bg)",
        color: "var(--text)",
        display: "flex",
        flexDirection: "column",
        gap: 12,
        position: "relative",
      }}
    >
      <div
        style={{
          padding: "16px 16px 12px",
          borderBottom: "0.5px solid var(--surface)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 14,
          }}
        >
          <div style={{ width: 28 }} />
          <div style={{ fontSize: 16, fontWeight: 700 }}>{user.username}</div>
          <div style={{ position: "relative" }} data-header-menu>
          <button
            type="button"
            onClick={() => setHeaderMenuOpen(!headerMenuOpen)}
            style={{
              background: "none",
              border: "none",
              color: "var(--text)",
              padding: 4,
              cursor: "pointer",
            }}
          >
            <MoreHorizontal size={20} />
          </button>
          {headerMenuOpen && (
            <div
              style={{
                position: "absolute",
                top: 36,
                right: 0,
                background: "var(--bg-raised)",
                border: "0.5px solid var(--border)",
                borderRadius: 12,
                padding: 8,
                display: "flex",
                flexDirection: "column",
                gap: 4,
                minWidth: 180,
                zIndex: 10,
                boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
              }}
            >
              {isOwn ? (
                <>
                  <button
                    onClick={() => {
                      startEditing();
                      setHeaderMenuOpen(false);
                    }}
                    style={{ background: "transparent", border: "none", color: "var(--text)", textAlign: "left", padding: "8px 12px", borderRadius: 6, fontWeight: 600, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <PenLine size={16} />
                    Edit Profile
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm("Are you sure you want to request account deletion? This action cannot be undone.")) {
                        window.alert("Account deletion requested.");
                      }
                      setHeaderMenuOpen(false);
                    }}
                    style={{ background: "transparent", border: "none", color: "#ff4d4d", textAlign: "left", padding: "8px 12px", borderRadius: 6, fontWeight: 600, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <Trash2 size={16} />
                    Request Delete Account
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    window.alert("Thanks — your report has been submitted.");
                    setHeaderMenuOpen(false);
                  }}
                  style={{ background: "transparent", border: "none", color: "var(--danger-soft)", textAlign: "left", padding: "8px 12px", borderRadius: 6, fontWeight: 600, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}
                >
                  <AlertTriangle size={16} />
                  Report Account
                </button>
              )}
            </div>
          )}
          </div>
        </div>

        <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
          <div style={{ position: "relative", flexShrink: 0 }}>
            <Avatar
              name={user.name}
              src={
                editing ? (avatarPreview ?? user.avatarUrl) : user.avatarUrl
              }
              size="lg"
            />
            {editing && (
              <>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  style={{ display: "none" }}
                />
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  aria-label="Change profile photo"
                  style={{
                    position: "absolute",
                    right: -2,
                    bottom: -2,
                    width: 30,
                    height: 30,
                    borderRadius: 15,
                    background: "var(--text)",
                    color: "var(--bg)",
                    border: "2px solid var(--bg)",
                    display: "grid",
                    placeItems: "center",
                    cursor: "pointer",
                  }}
                >
                  <Camera size={14} />
                </button>
              </>
            )}
          </div>

          <div style={{ flex: 1, paddingTop: 6 }}>
            {editing ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 10 }}>
                <input
                  autoFocus
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleEditSave()}
                  placeholder="Profile name"
                  aria-label="Profile name"
                  style={{
                    width: "100%",
                    background: "var(--bg)",
                    border: "0.5px solid var(--surface-2)",
                    borderRadius: 12,
                    padding: "10px 12px",
                    color: "var(--text)",
                    fontSize: 13,
                    fontFamily: "inherit",
                  }}
                />
                <div style={{ display: "flex", gap: 8 }}>
                  <div style={{ position: "relative", flex: 1 }}>
                    <span
                      style={{
                        position: "absolute",
                        left: 12,
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "var(--text-tertiary)",
                        fontSize: 13,
                      }}
                    >
                      @
                    </span>
                    <input
                      value={usernameInput}
                      onChange={(e) => setUsernameInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleEditSave()}
                      placeholder="username"
                      aria-label="Username"
                      style={{
                        width: "100%",
                        background: "var(--bg)",
                        border: "0.5px solid var(--surface-2)",
                        borderRadius: 12,
                        padding: "10px 12px 10px 28px",
                        color: "var(--text)",
                        fontSize: 13,
                        fontFamily: "inherit",
                      }}
                    />
                  </div>
                  <button
                    onClick={handleEditSave}
                    style={{
                      background: "var(--text)",
                      color: "var(--bg)",
                      border: "none",
                      borderRadius: 12,
                      padding: "0 12px",
                      fontWeight: 700,
                      fontSize: 12,
                      cursor: "pointer",
                    }}
                  >
                    save
                  </button>
                </div>
                {(avatarPreview ?? user.avatarUrl) && (
                  <button
                    type="button"
                    onClick={() => setAvatarPreview("")}
                    style={{
                      alignSelf: "flex-start",
                      background: "transparent",
                      border: "none",
                      color: "var(--text-muted)",
                      fontSize: 12,
                      cursor: "pointer",
                      padding: 0,
                    }}
                  >
                    Remove photo
                  </button>
                )}
              </div>
            ) : (
              <>
                <h3
                  style={{ fontWeight: 700, fontSize: 22, margin: "0 0 2px" }}
                >
                  {user.name}
                </h3>
                <p style={{ color: "var(--text-secondary)", fontSize: 13, margin: 0 }}>
                  @{user.username}
                </p>
              </>
            )}

            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              {isOwn ? (
                <>
                  <button
                    onClick={startEditing}
                    style={{
                      flex: 1,
                      background: "var(--text)",
                      color: "var(--bg)",
                      border: "none",
                      padding: "10px 14px",
                      borderRadius: 999,
                      fontWeight: 700,
                      fontSize: 12,
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    Edit Profile
                  </button>
                  <button
                    onClick={onLogout}
                    style={{
                      background: "transparent",
                      color: "var(--text-soft)",
                      border: "0.5px solid var(--border-subtle)",
                      padding: "10px 14px",
                      borderRadius: 999,
                      fontWeight: 600,
                      fontSize: 12,
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <button
                  onClick={onMessage}
                  style={{
                    flex: 1,
                    background: "var(--text)",
                    color: "var(--bg)",
                    border: "none",
                    padding: "10px 14px",
                    borderRadius: 999,
                    fontWeight: 700,
                    fontSize: 12,
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  Message
                </button>
              )}
            </div>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            marginTop: 14,
            paddingTop: 12,
            borderTop: "0.5px solid var(--surface)",
          }}
        >
          {[
            { label: "Posts", value: postsCount },
            { label: "Followers", value: followersCount },
            { label: "Following", value: followingCount },
          ].map((stat) => (
            <div
              key={stat.label}
              onClick={() => {
                if (stat.label === "Followers") setActiveUserListType("followers");
                else if (stat.label === "Following") setActiveUserListType("following");
              }}
              style={{ textAlign: "center", flex: 1, cursor: stat.label !== "Posts" ? "pointer" : "default" }}
            >
              <strong style={{ fontSize: 17, display: "block" }}>
                {stat.value}
              </strong>
              <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 3 }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {isOwn && (
        <div
          style={{
            display: "flex",
            margin: "0 16px 12px",
            border: "0.5px solid var(--border-subtle)",
            borderRadius: 12,
            overflow: "hidden",
            background: "var(--bg-elevated)",
          }}
        >
          {(
            [
              { tab: "posts", label: "Posts" },
              { tab: "saved", label: "Saved" },
            ] as const
          ).map(({ tab, label }) => {
            const active = profileTab === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => {
                  setProfileTab(tab);
                  setSelectedPostId(null);
                  setMenuOpen(false);
                }}
                style={{
                  flex: 1,
                  background: active ? "var(--surface-hover)" : "transparent",
                  border: "none",
                  color: active ? "var(--text)" : "var(--text-muted)",
                  padding: "9px 0",
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  transition: "all 0.15s",
                }}
              >
                {tab === "saved" && (
                  <Bookmark
                    size={14}
                    fill={active ? "var(--accent-amber-soft)" : "none"}
                    color={
                      active
                        ? "var(--accent-amber-soft)"
                        : "var(--text-muted)"
                    }
                  />
                )}
                {label}
              </button>
            );
          })}
        </div>
      )}

      <div style={{ padding: "0 16px 12px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: 2,
          }}
        >
          {displayedPosts.map((post) => (
            <button
              key={post.id}
              type="button"
              onClick={() => setSelectedPostId(post.id)}
              style={{
                aspectRatio: "1 / 1",
                border: "none",
                padding: 0,
                position: "relative",
                background: "var(--bg-raised)",
                cursor: "pointer",
                display: "block",
              }}
            >
              {post.mediaType === "video" && post.mediaUrl ? (
                <video
                  src={post.mediaUrl}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  muted
                  playsInline
                />
              ) : (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    backgroundImage: post.imageUrl
                      ? `url(${post.imageUrl})`
                      : undefined,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                />
              )}
              {post.mediaType === "video" && (
                <div style={{ position: "absolute", top: 8, right: 8 }}>
                  <Play size={16} color="var(--text)" fill="var(--text)" />
                </div>
              )}
            </button>
          ))}
        </div>
        {displayedPosts.length === 0 && (
          <div
            style={{
              padding: "48px 16px 24px",
              textAlign: "center",
              color: "var(--text-muted)",
              fontSize: 14,
            }}
          >
            {isOwn && profileTab === "saved" ? "no saved posts yet" : "no posts yet"}
          </div>
        )}
      </div>

      {selectedPost && (
        <div
          onClick={() => setSelectedPostId(null)}
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 50,
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(8px)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              height: "85%",
              background: "var(--bg-elevated)",
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 -4px 30px rgba(0,0,0,0.5)",
              borderTop: "1px solid var(--surface-hover)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "center", paddingTop: 12, paddingBottom: 12 }}>
              <div style={{ width: 40, height: 4, background: "var(--surface-active)", borderRadius: 2 }} />
            </div>

            <div
              style={{
                flex: 1,
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
              }}
              className="hide-scrollbar"
            >
              {selectedPost.mediaType === "video" && selectedPost.mediaUrl ? (
                <video
                  src={selectedPost.mediaUrl}
                  style={{ width: "100%", aspectRatio: "1 / 1", objectFit: "cover", background: "var(--bg-elevated-2)" }}
                  autoPlay
                  muted
                  loop
                  playsInline
                />
              ) : (
                <div
                  style={{
                    width: "100%",
                    aspectRatio: "1 / 1",
                    background: selectedPost.imageUrl
                      ? `center / cover no-repeat url(${selectedPost.imageUrl})`
                      : "var(--bg-elevated-2)",
                    borderBottom: "1px solid var(--surface-subtle)",
                  }}
                />
              )}

              <div
                style={{
                  padding: 16,
                  display: "flex",
                  flexDirection: "column",
                  gap: 16,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    position: "relative",
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 12 }}
                  >
                    <Avatar
                      name={selectedPostAuthor?.name ?? user.name}
                      src={selectedPostAuthor?.avatarUrl}
                    />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>
                        {selectedPostAuthor?.name ?? user.name}
                      </div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                        @{selectedPostAuthor?.username ?? user.username}
                      </div>
                    </div>
                  </div>

                  {canOpenPostMenu && (
                    <button
                      type="button"
                      onClick={() => setMenuOpen(!menuOpen)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "var(--text)",
                        cursor: "pointer",
                        padding: 4,
                      }}
                    >
                      <MoreHorizontal size={20} />
                    </button>
                  )}

                  {canOpenPostMenu && menuOpen && (
                    <div
                      style={{
                        position: "absolute",
                        top: 36,
                        right: 0,
                        background: "var(--bg-raised)",
                        border: "0.5px solid var(--border)",
                        borderRadius: 12,
                        padding: 8,
                        display: "flex",
                        flexDirection: "column",
                        gap: 4,
                        minWidth: 140,
                        zIndex: 10,
                        boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
                      }}
                    >
                      {selectedPost.authorId === currentUserId ? (
                        <>
                          <button
                            onClick={() => {
                              setEditingPostId(selectedPost.id);
                              setEditCaption(selectedPost.caption);
                              setMenuOpen(false);
                            }}
                            style={{ background: "transparent", border: "none", color: "var(--text)", textAlign: "left", padding: "8px 12px", borderRadius: 6, fontWeight: 600, fontSize: 13, cursor: "pointer" }}
                          >
                            Edit Post
                          </button>
                          <button
                            onClick={() => {
                              onDeletePost(selectedPost.id);
                              setSelectedPostId(null);
                              setMenuOpen(false);
                            }}
                            style={{ background: "transparent", border: "none", color: "#ff4d4d", textAlign: "left", padding: "8px 12px", borderRadius: 6, fontWeight: 600, fontSize: 13, cursor: "pointer" }}
                          >
                            Delete Post
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => {
                            onMessage();
                            setMenuOpen(false);
                          }}
                          style={{ background: "transparent", border: "none", color: "var(--text)", textAlign: "left", padding: "8px 12px", borderRadius: 6, fontWeight: 600, fontSize: 13, cursor: "pointer" }}
                        >
                          Message
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                  <button
                    onClick={() => onLike(selectedPost.id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      fontSize: 14,
                      fontWeight: 600,
                      background: "none",
                      border: "none",
                      color: "var(--text)",
                      cursor: "pointer",
                      padding: 0,
                    }}
                  >
                    <Heart size={20} color={selectedPost.likes.includes(currentUserId) ? "#ff4d6d" : "var(--text)"} fill={selectedPost.likes.includes(currentUserId) ? "#ff4d6d" : "none"} />
                    {selectedPost.likes.length}
                  </button>
                  <button
                    onClick={() => setShowCommentDialog(true)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      color: "var(--text-soft)",
                      fontSize: 14,
                      fontWeight: 600,
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: 0,
                    }}
                  >
                    <MessageCircle size={20} />
                    {selectedPost.comments.length}
                  </button>
                  <button
                    type="button"
                    onClick={() => onToggleSave(selectedPost.id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      background: "none",
                      border: "none",
                      color: savedPosts.includes(selectedPost.id)
                        ? "var(--accent-amber-soft)"
                        : "var(--text-soft)",
                      cursor: "pointer",
                      padding: 0,
                      marginLeft: "auto",
                    }}
                    aria-label={
                      savedPosts.includes(selectedPost.id)
                        ? "Unsave post"
                        : "Save post"
                    }
                  >
                    <Bookmark
                      size={20}
                      fill={
                        savedPosts.includes(selectedPost.id)
                          ? "var(--accent-amber-soft)"
                          : "none"
                      }
                    />
                  </button>
                </div>

                <div>
                  {editingPostId === selectedPost.id ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      <input
                        value={editCaption}
                        onChange={(e) => setEditCaption(e.target.value)}
                        autoFocus
                        style={{
                          background: "var(--bg-raised)",
                          border: "1px solid var(--border)",
                          color: "var(--text)",
                          padding: "8px 12px",
                          borderRadius: 8,
                          fontSize: 14,
                          outline: "none",
                        }}
                      />
                      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                        <button
                          onClick={() => setEditingPostId(null)}
                          style={{ background: "transparent", color: "var(--text-soft-2)", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600 }}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => {
                            if (editCaption.trim()) {
                              onEditPost(selectedPost.id, editCaption.trim());
                            }
                            setEditingPostId(null);
                          }}
                          style={{ background: "var(--text)", color: "var(--bg)", border: "none", padding: "4px 12px", borderRadius: 16, cursor: "pointer", fontSize: 13, fontWeight: 600 }}
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ fontSize: 14, lineHeight: 1.5, color: "var(--text)" }}>
                      <strong style={{ fontWeight: 700 }}>{selectedPostAuthor?.username ?? user.username}</strong>{" "}
                      {selectedPost.caption}
                    </div>
                  )}
                  <div style={{ marginTop: 8, color: "var(--text-muted)", fontSize: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>
                    {new Date(selectedPost.createdAt).toLocaleDateString(
                      undefined,
                      {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      },
                    )}
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}

      {showCommentDialog && selectedPost && (
        <CommentDialog
          post={selectedPost}
          users={users}
          currentUserId={currentUserId}
          onClose={() => setShowCommentDialog(false)}
          onComment={onComment}
          onEditComment={onEditComment}
          onDeleteComment={onDeleteComment}
        />
      )}

      {activeUserListType && (
        <div
          onClick={() => setActiveUserListType(null)}
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 60,
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(8px)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              height: "75%",
              background: "var(--bg-elevated)",
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 -4px 30px rgba(0,0,0,0.5)",
              borderTop: "1px solid var(--surface-hover)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "center", paddingTop: 12, paddingBottom: 12 }}>
              <div style={{ width: 40, height: 4, background: "var(--surface-active)", borderRadius: 2 }} />
            </div>

            <div style={{ padding: "0 16px 12px", borderBottom: "1px solid var(--surface-subtle)", fontWeight: 700, fontSize: 16, textAlign: "center" }}>
              {activeUserListType === "followers" ? "Followers" : "Following"}
            </div>

            <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }} className="hide-scrollbar">
              {(activeUserListType === "followers" ? user.followers : user.following).map(userId => {
                const listUser = users.find(u => u.id === userId);
                if (!listUser) return null;
                return (
                  <div key={userId} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px" }}>
                    <Avatar name={listUser.name} src={listUser.avatarUrl} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{listUser.name}</div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)" }}>@{listUser.username}</div>
                    </div>
                  </div>
                );
              })}
              {(activeUserListType === "followers" ? user.followers : user.following).length === 0 && (
                <div style={{ padding: "40px 16px", textAlign: "center", color: "var(--text-tertiary)", fontSize: 14 }}>
                  No users to display
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
