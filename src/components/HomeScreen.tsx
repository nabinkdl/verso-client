import { useEffect, useRef, useState } from "react";
import {
  Bell,
  Heart,
  MessageCircle,
  PlusSquare,
  MoreHorizontal,
  PenLine,
  Trash2,
} from "lucide-react";
import { Post, User } from "../types";
import Avatar from "./Avatar";
import CommentDialog from "./CommentDialog";

interface HomeScreenProps {
  posts: Post[];
  users: User[];
  currentUserId: string;
  onLike: (postId: string) => void;
  onComment: (postId: string, text: string) => void;
  onEditPost: (postId: string, caption: string) => void;
  onDeletePost: (postId: string) => void;
  onEditComment: (postId: string, commentId: string, text: string) => void;
  onDeleteComment: (postId: string, commentId: string) => void;
  onCreatePost: () => void;
  onOpenNotifications: () => void;
}

const PAGE_SIZE = 5;

export default function HomeScreen({
  posts,
  users,
  currentUserId,
  onLike,
  onComment,
  onEditPost,
  onDeletePost,
  onEditComment,
  onDeleteComment,
  onCreatePost,
  onOpenNotifications,
}: HomeScreenProps) {
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [commentPostId, setCommentPostId] = useState<string | null>(null);
  const [postMenuId, setPostMenuId] = useState<string | null>(null);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const getUserById = (uid: string) => users.find((u) => u.id === uid);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const handleScroll = () => {
      if (
        container.scrollTop + container.clientHeight >=
        container.scrollHeight - 60
      ) {
        setVisible((v) => Math.min(v + 3, posts.length));
      }
    };
    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [posts.length]);

  const startEditPost = (postId: string, caption: string) => {
    setEditingPostId(postId);
    setEditingCommentId(null);
    setEditText(caption);
    setPostMenuId(null);
  };

  const savePostEdit = (postId: string) => {
    if (!editText.trim()) return;
    onEditPost(postId, editText.trim());
    setEditingPostId(null);
    setEditText("");
  };

  return (
    <div style={{ flex: 1, position: "relative" }}>
      <div
        ref={containerRef}
        style={{
          position: "absolute",
          inset: 0,
          overflowY: commentPostId ? "hidden" : "auto",
          padding: "12px 16px 16px",
          display: "flex",
          flexDirection: "column",
          gap: 16,
          scrollBehavior: "smooth",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 2,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 11,
                color: "var(--text-secondary)",
                letterSpacing: 2,
                textTransform: "uppercase",
              }}
            >
              {/* verso */}
            </div>
            <div style={{ fontWeight: 800, fontSize: 22, lineHeight: 1.05 }}>
              Verso
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button
              type="button"
              onClick={onCreatePost}
              style={{
                width: 40,
                height: 40,
                borderRadius: 14,
                background: "transparent",
                border: "none",
                color: "var(--text)",
                display: "grid",
                placeItems: "center",
                cursor: "pointer",
                boxShadow: "0 8px 20px rgba(255,255,255,0.08)",
              }}
              aria-label="Create post"
            >
              <PlusSquare size={18} />
            </button>

            <button
              type="button"
              onClick={onOpenNotifications}
              style={{
                width: 40,
                height: 40,
                borderRadius: 14,
                background: "var(--bg-card)",
                border: "0.5px solid var(--border-light)",
                color: "var(--text)",
                display: "grid",
                placeItems: "center",
                cursor: "pointer",
              }}
              aria-label="Open notifications"
            >
              <Bell size={18} />
            </button>
          </div>
        </div>

        {posts.slice(0, visible).map((post) => {
          const author = getUserById(post.authorId);
          if (!author) return null;
          const isLiked = post.likes.includes(currentUserId);
          const mediaSource = post.mediaUrl ?? post.imageUrl;
          return (
            <div
              key={post.id}
              style={{
                background: "var(--bg-card)",
                borderRadius: 20,
                padding: 14,
                border: "0.5px solid var(--border)",
                position: "relative",
              }}
            >
              <button
                type="button"
                onClick={() =>
                  setPostMenuId(postMenuId === post.id ? null : post.id)
                }
                style={{
                  position: "absolute",
                  top: 12,
                  right: 12,
                  width: 32,
                  height: 32,
                  borderRadius: 10,
                  border: "0.5px solid var(--border)",
                  background: "var(--bg-card)",
                  color: "var(--text)",
                  display: "grid",
                  placeItems: "center",
                  cursor: "pointer",
                  zIndex: 2,
                }}
                aria-label="Post actions"
              >
                <MoreHorizontal size={16} />
              </button>

              {postMenuId === post.id && post.authorId === currentUserId && (
                <div
                  style={{
                    position: "absolute",
                    top: 48,
                    right: 12,
                    background: "var(--bg-card)",
                    border: "0.5px solid var(--border-light)",
                    borderRadius: 14,
                    padding: 8,
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                    minWidth: 140,
                    zIndex: 3,
                    boxShadow: "0 12px 24px rgba(0,0,0,0.35)",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => startEditPost(post.id, post.caption)}
                    style={menuButtonStyle}
                  >
                    <PenLine size={14} /> Edit post
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeletePost(post.id)}
                    style={{ ...menuButtonStyle, color: "var(--danger)" }}
                  >
                    <Trash2 size={14} /> Delete post
                  </button>
                </div>
              )}

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 12,
                }}
              >
                <Avatar name={author.name} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>
                    {author.name}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                    @{author.username}
                  </div>
                </div>
              </div>

              <div
                style={{
                  width: "100%",
                  aspectRatio: "1 / 1",
                  background: "var(--bg-input)",
                  borderRadius: 18,
                  margin: "10px 0",
                  border: "0.5px solid var(--border-light)",
                  overflow: "hidden",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--text-tertiary)",
                  fontSize: 13,
                  letterSpacing: 2,
                  position: "relative",
                }}
              >
                {post.mediaType === "video" && mediaSource ? (
                  <video
                    src={mediaSource}
                    muted
                    loop
                    playsInline
                    autoPlay
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : mediaSource ? (
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      backgroundImage: `url(${mediaSource})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  />
                ) : (
                  <span>◼ ◻</span>
                )}
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 18,
                  margin: "10px 0 8px",
                }}
              >
                <button
                  type="button"
                  onClick={() => onLike(post.id)}
                  style={{
                    background: "none",
                    border: "none",
                    color: isLiked ? "var(--heart)" : "var(--text-secondary)",
                    fontSize: 14,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: 0,
                  }}
                >
                  <Heart size={22} fill={isLiked ? "var(--heart)" : "none"} />
                  <span style={{ color: "var(--text-secondary)" }}>
                    {post.likes.length}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setCommentPostId(commentPostId === post.id ? null : post.id)
                  }
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--text-secondary)",
                    fontSize: 14,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: 0,
                  }}
                >
                  <MessageCircle size={22} />
                  <span style={{ color: "var(--text-secondary)" }}>
                    {post.comments.length}
                  </span>
                </button>
              </div>

              <div style={{ fontSize: 14, margin: "6px 0" }}>
                <strong>{author.username}</strong>{" "}
                {editingPostId === post.id ? (
                  <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                    <input
                      autoFocus
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      style={editInputStyle}
                    />
                    <button
                      type="button"
                      onClick={() => savePostEdit(post.id)}
                      style={saveButtonStyle}
                    >
                      save
                    </button>
                  </div>
                ) : (
                  post.caption
                )}
              </div>

              {post.comments.length > 0 &&
                (() => {
                  const first = post.comments[0];
                  const commentAuthor = getUserById(first.userId);
                  return (
                    <div style={{ fontSize: 14, marginTop: 2 }}>
                      <strong style={{ fontWeight: 600, marginRight: 6 }}>
                        {commentAuthor?.username ?? "unknown"}
                      </strong>
                      <span style={{ color: "var(--text-secondary)" }}>
                        {first.text}
                      </span>
                      {post.comments.length > 1 && (
                        <button
                          onClick={() => setCommentPostId(post.id)}
                          style={{
                            display: "block",
                            background: "none",
                            border: "none",
                            color: "var(--text-tertiary)",
                            cursor: "pointer",
                            padding: 0,
                            fontSize: 13,
                            marginTop: 2,
                          }}
                        >
                          view all {post.comments.length} comments
                        </button>
                      )}
                    </div>
                  );
                })()}
            </div>
          );
        })}

        <div
          ref={bottomRef}
          style={{
            height: 30,
            textAlign: "center",
            color: "var(--text-tertiary)",
            fontSize: 13,
          }}
        >
          {visible < posts.length ? "↓ scroll for more" : "· end ·"}
        </div>
      </div>

      {commentPostId &&
        (() => {
          const targetPost = posts.find((p) => p.id === commentPostId);
          if (!targetPost) return null;
          return (
            <CommentDialog
              post={targetPost}
              users={users}
              currentUserId={currentUserId}
              onClose={() => {
                setCommentPostId(null);
              }}
              onComment={(postId, text) => {
                onComment(postId, text);
              }}
              onEditComment={onEditComment}
              onDeleteComment={onDeleteComment}
            />
          );
        })()}
    </div>
  );
}

const menuButtonStyle: React.CSSProperties = {
  background: "transparent",
  border: "none",
  color: "var(--text)",
  display: "flex",
  alignItems: "center",
  gap: 8,
  padding: "8px 10px",
  borderRadius: 10,
  cursor: "pointer",
  fontSize: 12,
  fontWeight: 600,
  textAlign: "left",
};

const editInputStyle: React.CSSProperties = {
  flex: 1,
  background: "var(--bg-secondary)",
  border: "0.5px solid var(--border)",
  borderRadius: 16,
  padding: "10px 12px",
  color: "var(--text)",
  fontSize: 13,
  fontFamily: "inherit",
};

const saveButtonStyle: React.CSSProperties = {
  background: "linear-gradient(135deg, var(--text), var(--text-secondary))",
  color: "var(--bg)",
  border: "none",
  borderRadius: 16,
  padding: "0 14px",
  fontWeight: 700,
  fontSize: 13,
  cursor: "pointer",
  height: 40,
};
