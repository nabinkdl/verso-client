import { useEffect, useRef, useState } from "react";
import {
  Bell,
  Heart,
  MessageCircle,
  PlusSquare,
  MoreHorizontal,
  ChevronDown,
  ChevronUp,
  PenLine,
  Trash2,
} from "lucide-react";
import { Post, User } from "../types";
import Avatar from "./Avatar";

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
  const [expandedCommentsPostId, setExpandedCommentsPostId] = useState<
    string | null
  >(null);
  const [postMenuId, setPostMenuId] = useState<string | null>(null);
  const [commentMenuId, setCommentMenuId] = useState<string | null>(null);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [commentText, setCommentText] = useState("");
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

  const submitComment = (postId: string) => {
    if (commentText.trim()) {
      onComment(postId, commentText.trim());
      setCommentText("");
      setCommentPostId(null);
      setExpandedCommentsPostId(postId);
    }
  };

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

  const startEditComment = (
    postId: string,
    commentId: string,
    text: string,
  ) => {
    setEditingCommentId(commentId);
    setEditingPostId(null);
    setEditText(text);
    setCommentMenuId(null);
    setExpandedCommentsPostId(postId);
  };

  const saveCommentEdit = (postId: string, commentId: string) => {
    if (!editText.trim()) return;
    onEditComment(postId, commentId, editText.trim());
    setEditingCommentId(null);
    setEditText("");
  };

  return (
    <div
      ref={containerRef}
      style={{
        flex: 1,
        overflowY: "auto",
        padding: "12px 16px 16px",
        display: "flex",
        flexDirection: "column",
        gap: 16,
        scrollBehavior: "smooth",
        position: "relative",
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
              color: "#8a8a8a",
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
              background: "linear-gradient(135deg, #ffffff, #bfbfbf)",
              border: "none",
              color: "#000",
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
              background: "#111",
              border: "0.5px solid #2c2c2c",
              color: "#fff",
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
        const commentsExpanded = expandedCommentsPostId === post.id;
        const commentsToShow = commentsExpanded
          ? post.comments
          : post.comments.slice(0, 2);
        return (
          <div
            key={post.id}
            style={{
              background: "#0c0c0c",
              borderRadius: 20,
              padding: 14,
              border: "0.5px solid #2a2a2a",
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
                border: "0.5px solid #2b2b2b",
                background: "#111",
                color: "#fff",
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
                  background: "#111",
                  border: "0.5px solid #2c2c2c",
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
                  style={{ ...menuButtonStyle, color: "#ff6b6b" }}
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
                <div style={{ fontSize: 12, color: "#888" }}>
                  @{author.username}
                </div>
              </div>
            </div>

            <div
              style={{
                width: "100%",
                aspectRatio: "1 / 1",
                background: "#1a1a1a",
                borderRadius: 18,
                margin: "10px 0",
                border: "0.5px solid #2c2c2c",
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#444",
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
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
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
                  color: isLiked ? "#ff4d6d" : "#ddd",
                  fontSize: 14,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: 0,
                }}
              >
                <Heart size={22} fill={isLiked ? "#ff4d6d" : "none"} />
                <span style={{ color: "#aaa" }}>{post.likes.length}</span>
              </button>
              <button
                type="button"
                onClick={() =>
                  setCommentPostId(commentPostId === post.id ? null : post.id)
                }
                style={{
                  background: "none",
                  border: "none",
                  color: commentsExpanded ? "#fff" : "#ddd",
                  fontSize: 14,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: 0,
                }}
              >
                <MessageCircle size={22} />
                <span style={{ color: "#aaa" }}>{post.comments.length}</span>
                {commentsExpanded ? (
                  <ChevronUp size={14} />
                ) : (
                  <ChevronDown size={14} />
                )}
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

            {post.comments.length > 0 && (
              <div
                style={{
                  marginTop: 8,
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                <button
                  type="button"
                  onClick={() =>
                    setExpandedCommentsPostId(commentsExpanded ? null : post.id)
                  }
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#9f9f9f",
                    cursor: "pointer",
                    padding: 0,
                    alignSelf: "flex-start",
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  {commentsExpanded
                    ? "hide comments"
                    : `view all ${post.comments.length} comments`}
                </button>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                    maxHeight: commentsExpanded ? 220 : 86,
                    overflowY: commentsExpanded ? "auto" : "hidden",
                    paddingRight: 4,
                  }}
                >
                  {commentsToShow.map((comment, index) => {
                    const commentAuthor = getUserById(comment.userId);
                    const isOwnComment = comment.userId === currentUserId;
                    const isEditingComment = editingCommentId === comment.id;
                    return (
                      <div
                        key={`${post.id}-comment-${index}`}
                        style={{
                          display: "flex",
                          gap: 10,
                          alignItems: "flex-start",
                          background: "#111",
                          border: "0.5px solid #262626",
                          borderRadius: 14,
                          padding: "10px 12px",
                          position: "relative",
                        }}
                      >
                        <Avatar name={commentAuthor?.name ?? "A"} size="sm" />
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                              marginBottom: 4,
                            }}
                          >
                            <strong style={{ fontSize: 12 }}>
                              {commentAuthor?.username ?? "unknown"}
                            </strong>
                            <span style={{ fontSize: 11, color: "#777" }}>
                              comment
                            </span>
                          </div>
                          <div
                            style={{
                              fontSize: 13,
                              color: "#e5e5e5",
                              lineHeight: 1.45,
                              wordBreak: "break-word",
                            }}
                          >
                            {isEditingComment ? (
                              <div
                                style={{
                                  display: "flex",
                                  gap: 8,
                                  marginTop: 6,
                                }}
                              >
                                <input
                                  autoFocus
                                  value={editText}
                                  onChange={(e) => setEditText(e.target.value)}
                                  style={editInputStyle}
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    saveCommentEdit(post.id, comment.id)
                                  }
                                  style={saveButtonStyle}
                                >
                                  save
                                </button>
                              </div>
                            ) : (
                              comment.text
                            )}
                          </div>
                        </div>

                        {isOwnComment && !isEditingComment && (
                          <button
                            type="button"
                            onClick={() =>
                              setCommentMenuId(
                                commentMenuId === comment.id
                                  ? null
                                  : comment.id,
                              )
                            }
                            style={{
                              background: "transparent",
                              border: "none",
                              color: "#8f8f8f",
                              cursor: "pointer",
                              padding: 4,
                              alignSelf: "center",
                            }}
                            aria-label="Comment actions"
                          >
                            <MoreHorizontal size={14} />
                          </button>
                        )}

                        {commentMenuId === comment.id && isOwnComment && (
                          <div
                            style={{
                              position: "absolute",
                              right: 10,
                              top: 40,
                              background: "#111",
                              border: "0.5px solid #2c2c2c",
                              borderRadius: 12,
                              padding: 8,
                              display: "flex",
                              flexDirection: "column",
                              gap: 6,
                              minWidth: 130,
                              zIndex: 4,
                              boxShadow: "0 12px 24px rgba(0,0,0,0.35)",
                            }}
                          >
                            <button
                              type="button"
                              onClick={() =>
                                startEditComment(
                                  post.id,
                                  comment.id,
                                  comment.text,
                                )
                              }
                              style={menuButtonStyle}
                            >
                              <PenLine size={14} /> Edit comment
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                onDeleteComment(post.id, comment.id)
                              }
                              style={{ ...menuButtonStyle, color: "#ff6b6b" }}
                            >
                              <Trash2 size={14} /> Delete comment
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setCommentPostId(commentPostId === post.id ? null : post.id)
                  }
                  style={{
                    alignSelf: "flex-start",
                    background: "transparent",
                    border: "none",
                    color: "#ffffff",
                    cursor: "pointer",
                    padding: 0,
                    fontSize: 12,
                    fontWeight: 700,
                    opacity: 0.9,
                  }}
                >
                  {commentPostId === post.id
                    ? "close reply"
                    : "write a comment"}
                </button>
              </div>
            )}

            {commentPostId === post.id && (
              <div
                style={{
                  marginTop: 10,
                  display: "flex",
                  gap: 8,
                  alignItems: "center",
                }}
              >
                <input
                  autoFocus
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && submitComment(post.id)}
                  placeholder="add a comment..."
                  style={{
                    flex: 1,
                    background: "#0f0f0f",
                    border: "0.5px solid #303030",
                    borderRadius: 18,
                    padding: "10px 12px",
                    color: "white",
                    fontSize: 13,
                    fontFamily: "inherit",
                  }}
                />
                <button
                  onClick={() => submitComment(post.id)}
                  style={{
                    background: "linear-gradient(135deg, #ffffff, #d8d8d8)",
                    color: "black",
                    border: "none",
                    borderRadius: 16,
                    padding: "0 14px",
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: "pointer",
                    height: 40,
                  }}
                >
                  post
                </button>
              </div>
            )}
          </div>
        );
      })}

      <div
        ref={bottomRef}
        style={{ height: 30, textAlign: "center", color: "#555", fontSize: 13 }}
      >
        {visible < posts.length ? "↓ scroll for more" : "· end ·"}
      </div>
    </div>
  );
}

const menuButtonStyle: React.CSSProperties = {
  background: "transparent",
  border: "none",
  color: "#fff",
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
  background: "#0f0f0f",
  border: "0.5px solid #303030",
  borderRadius: 16,
  padding: "10px 12px",
  color: "white",
  fontSize: 13,
  fontFamily: "inherit",
};

const saveButtonStyle: React.CSSProperties = {
  background: "linear-gradient(135deg, #ffffff, #d8d8d8)",
  color: "black",
  border: "none",
  borderRadius: 16,
  padding: "0 14px",
  fontWeight: 700,
  fontSize: 13,
  cursor: "pointer",
  height: 40,
};
