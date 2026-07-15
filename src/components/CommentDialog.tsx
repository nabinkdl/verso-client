import { useState } from "react";
import { X, PenLine, Trash2, Send } from "lucide-react";
import { Post, User } from "../types";
import Avatar from "./Avatar";

interface CommentDialogProps {
  post: Post;
  users: User[];
  currentUserId: string;
  onClose: () => void;
  onComment: (postId: string, text: string) => void;
  onEditComment: (postId: string, commentId: string, text: string) => void;
  onDeleteComment: (postId: string, commentId: string) => void;
}

const getTimeAgo = (createdAt: number) => {
  const diff = Date.now() - createdAt;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  return `${days}d`;
};

export default function CommentDialog({
  post,
  users,
  currentUserId,
  onClose,
  onComment,
  onEditComment,
  onDeleteComment,
}: CommentDialogProps) {
  const [text, setText] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [menuId, setMenuId] = useState<string | null>(null);

  const getUserById = (uid: string) => users.find((u) => u.id === uid);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onComment(post.id, text.trim());
      setText("");
    }
  };

  const startEdit = (commentId: string, commentText: string) => {
    setEditingId(commentId);
    setEditText(commentText);
    setMenuId(null);
  };

  const saveEdit = (commentId: string) => {
    if (editText.trim()) {
      onEditComment(post.id, commentId, editText.trim());
      setEditingId(null);
      setEditText("");
    }
  };

  const commentList = post.comments.slice().reverse();

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 50,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        pointerEvents: "none",
      }}
    >
      <div
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.4)",
          pointerEvents: "auto",
        }}
      />
      <div
        style={{
          height: "75%",
          background: "var(--bg-card)",
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          position: "relative",
          pointerEvents: "auto",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          boxShadow: "0 -4px 24px rgba(0,0,0,0.5)",
          borderTop: "0.5px solid var(--border)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 4px" }}>
          <div style={{ width: 40, height: 4, background: "var(--text-tertiary)", borderRadius: 2 }} />
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 16px 12px" }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>
            {post.comments.length} {post.comments.length === 1 ? "comment" : "comments"}
          </h3>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", color: "var(--text)", cursor: "pointer", padding: 4 }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "0 16px 16px", minHeight: 0, overscrollBehavior: "contain" }} className="hide-scrollbar">
          {commentList.length === 0 ? (
            <div style={{ textAlign: "center", color: "var(--text-secondary)", marginTop: 40, fontSize: 14 }}>
              no comments yet
            </div>
          ) : (
            commentList.map((comment) => {
              const author = getUserById(comment.userId);
              const isOwn = comment.userId === currentUserId;
              const isEditing = editingId === comment.id;
              return (
                <div
                  key={comment.id}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 10,
                    padding: "8px 0",
                    position: "relative",
                  }}
                >
                  <Avatar name={author?.name ?? "U"} size="sm" />

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, lineHeight: 1.45 }}>
                      <strong style={{ fontWeight: 600, marginRight: 6 }}>
                        {author?.username ?? "unknown"}
                      </strong>
                      {isEditing ? (
                        <span style={{ display: "inline-flex", gap: 6, alignItems: "center", width: "100%", marginTop: 4 }}>
                          <input
                            autoFocus
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && saveEdit(comment.id)}
                            style={{
                              flex: 1,
                              background: "var(--bg-input)",
                              border: "0.5px solid var(--border)",
                              borderRadius: 10,
                              padding: "6px 10px",
                              color: "var(--text)",
                              fontSize: 13,
                              fontFamily: "inherit",
                              outline: "none",
                            }}
                          />
                          <button
                            onClick={() => saveEdit(comment.id)}
                            style={{
                              background: "none",
                              border: "none",
                              color: "var(--accent)",
                              cursor: "pointer",
                              fontWeight: 700,
                              fontSize: 13,
                              padding: 4,
                            }}
                          >
                            done
                          </button>
                        </span>
                      ) : (
                        <span style={{ wordBreak: "break-word" }}>{comment.text}</span>
                      )}
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                      <span style={{ fontSize: 11, color: "var(--text-tertiary)", fontWeight: 500 }}>
                        {comment.createdAt ? getTimeAgo(comment.createdAt) : "now"}
                      </span>
                      {isOwn && !isEditing && (
                        <>
                          <button
                            onClick={() => setMenuId(menuId === comment.id ? null : comment.id)}
                            style={{
                              background: "none",
                              border: "none",
                              color: "var(--text-tertiary)",
                              cursor: "pointer",
                              padding: 0,
                              fontSize: 11,
                              fontWeight: 600,
                            }}
                          >
                            ...
                          </button>
                          {menuId === comment.id && (
                            <div
                              style={{
                                position: "absolute",
                                right: 0,
                                top: 36,
                                background: "var(--bg-card)",
                                border: "0.5px solid var(--border)",
                                borderRadius: 12,
                                padding: 6,
                                display: "flex",
                                flexDirection: "column",
                                gap: 4,
                                zIndex: 4,
                                boxShadow: "0 8px 20px rgba(0,0,0,0.3)",
                              }}
                            >
                              <button
                                onClick={() => startEdit(comment.id, comment.text)}
                                style={{
                                  background: "transparent",
                                  border: "none",
                                  color: "var(--text)",
                                  cursor: "pointer",
                                  padding: "6px 10px",
                                  borderRadius: 8,
                                  fontSize: 12,
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 6,
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.background = "var(--bg-secondary)"; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                              >
                                <PenLine size={12} /> Edit
                              </button>
                              <button
                                onClick={() => onDeleteComment(post.id, comment.id)}
                                style={{
                                  background: "transparent",
                                  border: "none",
                                  color: "var(--danger)",
                                  cursor: "pointer",
                                  padding: "6px 10px",
                                  borderRadius: 8,
                                  fontSize: 12,
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 6,
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.background = "var(--bg-secondary)"; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                              >
                                <Trash2 size={12} /> Delete
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", gap: 10, padding: "12px 16px", borderTop: "0.5px solid var(--border)" }}>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="write a comment..."
            style={{
              flex: 1,
              background: "var(--bg-input)",
              border: "0.5px solid var(--border)",
              borderRadius: 20,
              padding: "10px 14px",
              color: "var(--text)",
              fontSize: 14,
              fontFamily: "inherit",
              outline: "none",
            }}
          />
          <button
            type="submit"
            disabled={!text.trim()}
            style={{
              background: text.trim() ? "var(--text)" : "transparent",
              color: text.trim() ? "var(--bg)" : "var(--text-tertiary)",
              border: text.trim() ? "none" : "0.5px solid var(--border)",
              borderRadius: 20,
              padding: "0 14px",
              cursor: text.trim() ? "pointer" : "default",
              display: "flex",
              alignItems: "center",
            }}
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
