import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Heart, MessageCircle, MoreHorizontal } from "lucide-react";
import { Post, User } from "../types";
import Avatar from "./Avatar";

interface ProfileScreenProps {
  profileUserId: string;
  currentUserId: string;
  users: User[];
  posts: Post[];
  onNewPost: () => void;
  onEditName: (newName: string) => void;
  onLogout: () => void; // Add this line
}

export default function ProfileScreen({
  profileUserId,
  currentUserId,
  users,
  posts,
  // onNewPost,
  onEditName,
  onLogout, // Add this line
}: ProfileScreenProps) {
  const [editing, setEditing] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

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
              {isOwn && (
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
            <div key={stat.label} style={{ textAlign: "center", flex: 1 }}>
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
            gap: 3,
            padding: "0 16px",
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
                borderRadius: 12,
                overflow: "hidden",
                position: "relative",
                background: "#0c0c0c",
                cursor: "pointer",
                boxShadow: "inset 0 0 0 0.5px rgba(255,255,255,0.08)",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  backgroundImage: post.imageUrl
                    ? `url(${post.imageUrl})`
                    : undefined,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  filter: post.imageUrl ? "grayscale(100%)" : undefined,
                  opacity: post.imageUrl ? 0.96 : 1,
                }}
              />
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
            position: "fixed",
            inset: 0,
            zIndex: 50,
            background: "rgba(0,0,0,0.92)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 420,
              maxHeight: "92vh",
              background: "#080808",
              border: "0.5px solid #232323",
              borderRadius: 18,
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 14px",
                borderBottom: "0.5px solid #202020",
              }}
            >
              <button
                type="button"
                onClick={() => setSelectedPostId(null)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#fff",
                  cursor: "pointer",
                  padding: 0,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                <ArrowLeft size={18} />
              </button>
              <button
                type="button"
                style={{
                  background: "none",
                  border: "none",
                  color: "#fff",
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                <MoreHorizontal size={18} />
              </button>
            </div>

            <div
              style={{
                flex: 1,
                overflowY: "auto",
              }}
            >
              <div
                style={{
                  aspectRatio: "1 / 1",
                  background: selectedPost.imageUrl
                    ? `center / cover no-repeat url(${selectedPost.imageUrl})`
                    : "#111",
                  borderBottom: "0.5px solid #202020",
                }}
              />

              <div
                style={{
                  padding: 14,
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 12 }}
                  >
                    <Avatar name={user.name} />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13 }}>
                        {user.name}
                      </div>
                      <div style={{ fontSize: 11, color: "#8a8a8a" }}>
                        @{user.username}
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                  <button
                    type="button"
                    style={{
                      background: "none",
                      border: "none",
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      padding: 0,
                      fontSize: 12,
                      cursor: "pointer",
                    }}
                  >
                    <Heart size={16} />
                    {selectedPost.likes.length}
                  </button>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      color: "#cfcfcf",
                      fontSize: 12,
                    }}
                  >
                    <MessageCircle size={16} />
                    {selectedPost.comments.length}
                  </div>
                </div>

                <div>
                  <div
                    style={{ fontSize: 12, lineHeight: 1.6, color: "#f1f1f1" }}
                  >
                    <strong style={{ color: "#fff" }}>{user.username}</strong>{" "}
                    {selectedPost.caption}
                  </div>
                  <div style={{ marginTop: 6, color: "#747474", fontSize: 11 }}>
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

                <div
                  style={{ borderTop: "0.5px solid #202020", paddingTop: 12 }}
                >
                  <div
                    style={{ color: "#9a9a9a", fontSize: 11, marginBottom: 8 }}
                  >
                    {selectedPost.comments.length === 0
                      ? "No comments yet"
                      : "Comments"}
                  </div>
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 8 }}
                  >
                    {selectedPost.comments.slice(0, 3).map((comment, index) => {
                      const commentUser = users.find(
                        (candidate) => candidate.id === comment.userId,
                      );
                      return (
                        <div
                          key={`${selectedPost.id}-comment-${index}`}
                          style={{ display: "flex", gap: 10 }}
                        >
                          <Avatar name={commentUser?.name ?? "U"} />
                          <div style={{ flex: 1 }}>
                            <div
                              style={{
                                fontSize: 12,
                                lineHeight: 1.45,
                                color: "#ececec",
                              }}
                            >
                              <strong>{commentUser?.username ?? "user"}</strong>{" "}
                              {comment.text}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
