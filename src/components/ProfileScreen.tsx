import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Heart, MessageCircle, MoreHorizontal, Play } from "lucide-react";
import { Post, User } from "../types";
import Avatar from "./Avatar";

interface ProfileScreenProps {
  profileUserId: string;
  currentUserId: string;
  users: User[];
  posts: Post[];
  onNewPost: () => void;
  onEditName: (newName: string) => void;
  onLogout: () => void;
  onEditPost: (postId: string, caption: string) => void;
  onDeletePost: (postId: string) => void;
  onMessage: () => void;
}

export default function ProfileScreen({
  profileUserId,
  currentUserId,
  users,
  posts,
  // onNewPost,
  onEditName,
  onLogout,
  onEditPost,
  onDeletePost,
  onMessage,
}: ProfileScreenProps) {
  const [editing, setEditing] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editCaption, setEditCaption] = useState("");
  const [activeUserListType, setActiveUserListType] = useState<"followers" | "following" | null>(null);

  const user = users.find((u) => u.id === profileUserId);
  const userPosts = useMemo(
    () => posts.filter((p) => p.authorId === profileUserId),
    [posts, profileUserId],
  );
  const selectedPost =
    userPosts.find((post) => post.id === selectedPostId) ?? null;
  const isOwn = profileUserId === currentUserId;

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

  if (!user) return null;

  const postsCount = userPosts.length;
  const followersCount = user.followers.length;
  const followingCount = user.following.length;

  const handleEditSave = () => {
    if (nameInput.trim()) onEditName(nameInput.trim());
    setEditing(false);
    setNameInput("");
  };

  return (
    <div
      style={{
        flex: 1,
        overflowY: "auto",
        background: "#000",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        gap: 12,
        position: "relative",
      }}
    >
      <div
        style={{
          padding: "16px 16px 12px",
          borderBottom: "0.5px solid #222",
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
          <button
            type="button"
            style={{
              background: "none",
              border: "none",
              color: "#fff",
              padding: 4,
              cursor: "pointer",
            }}
          >
            <MoreHorizontal size={20} />
          </button>
        </div>

        <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
          <Avatar name={user.name} size="lg" />

          <div style={{ flex: 1, paddingTop: 6 }}>
            {editing ? (
              <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                <input
                  autoFocus
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleEditSave()}
                  placeholder={user.name}
                  style={{
                    flex: 1,
                    background: "#0d0d0d",
                    border: "0.5px solid #262626",
                    borderRadius: 12,
                    padding: "10px 12px",
                    color: "#fff",
                    fontSize: 13,
                    fontFamily: "inherit",
                  }}
                />
                <button
                  onClick={handleEditSave}
                  style={{
                    background: "#fff",
                    color: "#000",
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
            ) : (
              <>
                <h3
                  style={{ fontWeight: 700, fontSize: 22, margin: "0 0 2px" }}
                >
                  {user.name}
                </h3>
                <p style={{ color: "#9a9a9a", fontSize: 13, margin: 0 }}>
                  @{user.username}
                </p>
              </>
            )}

            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              {isOwn ? (
                <>
                  <button
                    onClick={() => {
                      setEditing(true);
                      setNameInput(user.name);
                    }}
                    style={{
                      flex: 1,
                      background: "#fff",
                      color: "#000",
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
                      color: "#cfcfcf",
                      border: "0.5px solid #2b2b2b",
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
                    background: "#fff",
                    color: "#000",
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
            borderTop: "0.5px solid #222",
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
              <div style={{ fontSize: 11, color: "#8a8a8a", marginTop: 3 }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: "0 0 12px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: 2,
          }}
        >
          {userPosts.map((post) => (
            <button
              key={post.id}
              type="button"
              onClick={() => setSelectedPostId(post.id)}
              style={{
                aspectRatio: "1 / 1",
                border: "none",
                padding: 0,
                position: "relative",
                background: "#1a1a1a",
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
                  <Play size={16} color="#fff" fill="#fff" />
                </div>
              )}
            </button>
          ))}
        </div>
        {userPosts.length === 0 && (
          <div
            style={{
              padding: "48px 16px 24px",
              textAlign: "center",
              color: "#686868",
              fontSize: 14,
            }}
          >
            no posts yet
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
              background: "#0c0c0c",
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 -4px 30px rgba(0,0,0,0.5)",
              borderTop: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "center", paddingTop: 12, paddingBottom: 12 }}>
              <div style={{ width: 40, height: 4, background: "rgba(255,255,255,0.3)", borderRadius: 2 }} />
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
                  style={{ width: "100%", aspectRatio: "1 / 1", objectFit: "cover", background: "#111" }}
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
                      : "#111",
                    borderBottom: "1px solid rgba(255,255,255,0.05)",
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
                    <Avatar name={user.name} />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>
                        {user.name}
                      </div>
                      <div style={{ fontSize: 12, color: "#8a8a8a" }}>
                        @{user.username}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setMenuOpen(!menuOpen)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#fff",
                      cursor: "pointer",
                      padding: 4,
                    }}
                  >
                    <MoreHorizontal size={20} />
                  </button>

                  {menuOpen && (
                    <div
                      style={{
                        position: "absolute",
                        top: 36,
                        right: 0,
                        background: "#1a1a1a",
                        border: "0.5px solid #333",
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
                      {isOwn ? (
                        <>
                          <button
                            onClick={() => {
                              setEditingPostId(selectedPost.id);
                              setEditCaption(selectedPost.caption);
                              setMenuOpen(false);
                            }}
                            style={{ background: "transparent", border: "none", color: "#fff", textAlign: "left", padding: "8px 12px", borderRadius: 6, fontWeight: 600, fontSize: 13, cursor: "pointer" }}
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
                          style={{ background: "transparent", border: "none", color: "#fff", textAlign: "left", padding: "8px 12px", borderRadius: 6, fontWeight: 600, fontSize: 13, cursor: "pointer" }}
                        >
                          Message
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      fontSize: 14,
                      fontWeight: 600,
                    }}
                  >
                    <Heart size={20} color="#ff4d6d" fill="#ff4d6d" />
                    {selectedPost.likes.length}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      color: "#cfcfcf",
                      fontSize: 14,
                      fontWeight: 600,
                    }}
                  >
                    <MessageCircle size={20} />
                    {selectedPost.comments.length}
                  </div>
                </div>

                <div>
                  {editingPostId === selectedPost.id ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      <input
                        value={editCaption}
                        onChange={(e) => setEditCaption(e.target.value)}
                        autoFocus
                        style={{
                          background: "#1a1a1a",
                          border: "1px solid #333",
                          color: "#fff",
                          padding: "8px 12px",
                          borderRadius: 8,
                          fontSize: 14,
                          outline: "none",
                        }}
                      />
                      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                        <button
                          onClick={() => setEditingPostId(null)}
                          style={{ background: "transparent", color: "#ccc", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600 }}
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
                          style={{ background: "#fff", color: "#000", border: "none", padding: "4px 12px", borderRadius: 16, cursor: "pointer", fontSize: 13, fontWeight: 600 }}
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ fontSize: 14, lineHeight: 1.5, color: "#fff" }}>
                      <strong style={{ fontWeight: 700 }}>{user.username}</strong>{" "}
                      {selectedPost.caption}
                    </div>
                  )}
                  <div style={{ marginTop: 8, color: "#777", fontSize: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>
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

                {selectedPost.comments.length > 0 && (
                  <div
                    style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: 16, display: "flex", flexDirection: "column", gap: 12 }}
                  >
                    <div
                      style={{ color: "#aaa", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}
                    >
                      Comments ({selectedPost.comments.length})
                    </div>
                    {selectedPost.comments.slice(0, 3).map((comment, index) => {
                      const commentUser = users.find(
                        (candidate) => candidate.id === comment.userId,
                      );
                      return (
                        <div
                          key={`${selectedPost.id}-comment-${index}`}
                          style={{ display: "flex", gap: 12, alignItems: "flex-start" }}
                        >
                          <Avatar name={commentUser?.name ?? "U"} size="sm" />
                          <div style={{ flex: 1, marginTop: 2 }}>
                            <div
                              style={{
                                fontSize: 13,
                                lineHeight: 1.4,
                                color: "#eee",
                              }}
                            >
                              <strong style={{ fontWeight: 600 }}>{commentUser?.username ?? "user"}</strong>{" "}
                              {comment.text}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
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
              background: "#0c0c0c",
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 -4px 30px rgba(0,0,0,0.5)",
              borderTop: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "center", paddingTop: 12, paddingBottom: 12 }}>
              <div style={{ width: 40, height: 4, background: "rgba(255,255,255,0.3)", borderRadius: 2 }} />
            </div>

            <div style={{ padding: "0 16px 12px", borderBottom: "1px solid rgba(255,255,255,0.05)", fontWeight: 700, fontSize: 16, textAlign: "center" }}>
              {activeUserListType === "followers" ? "Followers" : "Following"}
            </div>

            <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }} className="hide-scrollbar">
              {(activeUserListType === "followers" ? user.followers : user.following).map(userId => {
                const listUser = users.find(u => u.id === userId);
                if (!listUser) return null;
                return (
                  <div key={userId} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px" }}>
                    <Avatar name={listUser.name} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{listUser.name}</div>
                      <div style={{ fontSize: 12, color: "#888" }}>@{listUser.username}</div>
                    </div>
                  </div>
                );
              })}
              {(activeUserListType === "followers" ? user.followers : user.following).length === 0 && (
                <div style={{ padding: "40px 16px", textAlign: "center", color: "#666", fontSize: 14 }}>
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
