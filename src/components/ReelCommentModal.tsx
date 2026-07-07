import { useState } from "react";
import { X, MoreHorizontal } from "lucide-react";
import { Post, User } from "../types";
import Avatar from "./Avatar";

interface ReelCommentModalProps {
  post: Post;
  users: User[];
  currentUserId: string;
  onClose: () => void;
  onComment: (postId: string, text: string) => void;
  onEditComment?: (postId: string, commentId: string, text: string) => void;
  onDeleteComment?: (postId: string, commentId: string) => void;
}

export default function ReelCommentModal({
  post,
  users,
  currentUserId,
  onClose,
  onComment,
  onEditComment,
  onDeleteComment,
}: ReelCommentModalProps) {
  const [text, setText] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [commentMenuId, setCommentMenuId] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onComment(post.id, text.trim());
      setText("");
    }
  };

  const getUserById = (uid: string) => users.find((u) => u.id === uid);

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
          height: "65%",
          background: "rgba(17, 17, 17, 0.95)",
          backdropFilter: "blur(20px)",
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          position: "relative",
          pointerEvents: "auto",
          display: "flex",
          flexDirection: "column",
          padding: 16,
          boxShadow: "0 -4px 24px rgba(0,0,0,0.5)",
          borderTop: "0.5px solid rgba(255,255,255,0.1)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
          <div style={{ width: 40, height: 4, background: "rgba(255,255,255,0.3)", borderRadius: 2 }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>{post.comments.length} comments</h3>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", color: "#fff", cursor: "pointer" }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 16, marginBottom: 16 }} className="hide-scrollbar">
          {post.comments.map((comment, i) => {
            const author = getUserById(comment.userId);
            const isOwnComment = comment.userId === currentUserId;
            const isEditing = editingCommentId === comment.id;

            return (
              <div key={i} style={{ display: "flex", gap: 12, position: "relative" }}>
                <Avatar name={author?.name ?? "U"} size="sm" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#aaa", marginBottom: 2 }}>
                    {author?.username}
                  </div>
                  {isEditing ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}>
                      <input
                        autoFocus
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        style={{
                          background: "#000",
                          border: "0.5px solid #333",
                          borderRadius: 8,
                          padding: "8px 12px",
                          color: "#fff",
                          fontSize: 13,
                          outline: "none",
                        }}
                      />
                      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                        <button
                          type="button"
                          onClick={() => setEditingCommentId(null)}
                          style={{ background: "transparent", color: "#ccc", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, padding: "4px 8px" }}
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (editText.trim() && onEditComment) {
                              onEditComment(post.id, comment.id, editText.trim());
                            }
                            setEditingCommentId(null);
                          }}
                          style={{ background: "#fff", color: "#000", border: "none", borderRadius: 12, padding: "4px 12px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ fontSize: 14, color: "#fff", lineHeight: 1.4 }}>
                      {comment.text}
                    </div>
                  )}
                </div>

                {isOwnComment && !isEditing && (
                  <button
                    type="button"
                    onClick={() => setCommentMenuId(commentMenuId === comment.id ? null : comment.id)}
                    style={{ background: "transparent", border: "none", color: "#888", cursor: "pointer", padding: 4, alignSelf: "flex-start" }}
                  >
                    <MoreHorizontal size={16} />
                  </button>
                )}

                {commentMenuId === comment.id && isOwnComment && (
                  <div
                    style={{
                      position: "absolute",
                      right: 24,
                      top: 16,
                      background: "#1a1a1a",
                      border: "0.5px solid #333",
                      borderRadius: 12,
                      padding: 8,
                      display: "flex",
                      flexDirection: "column",
                      gap: 4,
                      minWidth: 130,
                      zIndex: 10,
                      boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setEditingCommentId(comment.id);
                        setEditText(comment.text);
                        setCommentMenuId(null);
                      }}
                      style={{ background: "transparent", border: "none", color: "#fff", textAlign: "left", padding: "8px 12px", borderRadius: 6, fontWeight: 600, fontSize: 13, cursor: "pointer" }}
                    >
                      Edit Comment
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (onDeleteComment) onDeleteComment(post.id, comment.id);
                        setCommentMenuId(null);
                      }}
                      style={{ background: "transparent", border: "none", color: "#ff4d4d", textAlign: "left", padding: "8px 12px", borderRadius: 6, fontWeight: 600, fontSize: 13, cursor: "pointer" }}
                    >
                      Delete Comment
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", gap: 12 }}>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Add a comment..."
            style={{
              flex: 1,
              background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 20,
              padding: "10px 16px",
              color: "#fff",
              fontSize: 14,
              outline: "none",
            }}
          />
          <button
            type="submit"
            disabled={!text.trim()}
            style={{
              background: text.trim() ? "#fff" : "rgba(255,255,255,0.2)",
              color: text.trim() ? "#000" : "rgba(255,255,255,0.5)",
              border: "none",
              borderRadius: 20,
              padding: "0 16px",
              fontWeight: 600,
              cursor: text.trim() ? "pointer" : "default",
              transition: "background 0.2s",
            }}
          >
            Post
          </button>
        </form>
      </div>
    </div>
  );
}
