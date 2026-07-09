import { useState } from "react";
import { X, MoreHorizontal } from "lucide-react";
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
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [commentMenuId, setCommentMenuId] = useState<string | null>(null);

  const handleSubmit = () => {
    if (text.trim()) {
      onComment(post.id, text.trim());
      setText("");
    }
  };

  const getUserById = (uid: string) => users.find((u) => u.id === uid);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
      }}
    >
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.5)",
        }}
      />
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: "100%",
          maxWidth: 480,
          height: "65%",
          background: "#0f0f0f",
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          display: "flex",
          flexDirection: "column",
          padding: 16,
          borderTop: "0.5px solid rgba(255,255,255,0.08)",
          boxShadow: "0 -4px 24px rgba(0,0,0,0.5)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
          <div style={{ width: 40, height: 4, background: "rgba(255,255,255,0.2)", borderRadius: 2 }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#fff" }}>
            Comments ({post.comments.length})
          </h3>
          <button
            onClick={onClose}
            style={{ background: "rgba(255,255,255,0.05)", border: "none", color: "#fff", cursor: "pointer", width: 32, height: 32, borderRadius: 16, display: "grid", placeItems: "center" }}
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 14, marginBottom: 14 }} className="hide-scrollbar">
          {post.comments.length === 0 && (
            <div style={{ textAlign: "center", padding: "40px 20px", color: "#666", fontSize: 14 }}>
              No comments yet. Be the first to comment!
            </div>
          )}
          {post.comments.map((comment) => {
            const author = getUserById(comment.userId);
            const isOwnComment = comment.userId === currentUserId;
            const isEditing = editingCommentId === comment.id;

            return (
              <div key={comment.id} style={{ display: "flex", gap: 10, position: "relative" }}>
                <Avatar name={author?.name ?? "U"} size="sm" />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#999", marginBottom: 2 }}>
                    {author?.username || "user"}
                  </div>
                  {isEditing ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 4 }}>
                      <input
                        autoFocus
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        style={{
                          background: "#1a1a1a",
                          border: "0.5px solid #333",
                          borderRadius: 8,
                          padding: "8px 12px",
                          color: "#fff",
                          fontSize: 13,
                          outline: "none",
                          fontFamily: "inherit",
                        }}
                      />
                      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                        <button
                          onClick={() => setEditingCommentId(null)}
                          style={{ background: "transparent", color: "#999", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, padding: "4px 8px" }}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => {
                            if (editText.trim()) {
                              onEditComment(post.id, comment.id, editText.trim());
                            }
                            setEditingCommentId(null);
                          }}
                          style={{ background: "#3b82f6", color: "#fff", border: "none", borderRadius: 12, padding: "4px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ fontSize: 14, color: "#eee", lineHeight: 1.4 }}>
                      {comment.text}
                    </div>
                  )}
                </div>

                {isOwnComment && !isEditing && (
                  <div style={{ position: "relative" }}>
                  <button
                    onClick={() => setCommentMenuId(commentMenuId === comment.id ? null : comment.id)}
                    style={{ background: "transparent", border: "none", color: "#666", cursor: "pointer", padding: 2, display: "flex", alignItems: "center" }}
                  >
                    <MoreHorizontal size={14} />
                  </button>

                  {commentMenuId === comment.id && (
                    <div
                      style={{
          position: "fixed",
                        top: 24,
                        right: 0,
                        background: "#1a1a1a",
                        border: "0.5px solid #333",
                        borderRadius: 10,
                        padding: 6,
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                        minWidth: 130,
                        zIndex: 10,
                        boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
                      }}
                    >
                      <button
                        onClick={() => {
                          setEditingCommentId(comment.id);
                          setEditText(comment.text);
                          setCommentMenuId(null);
                        }}
                        style={{ background: "transparent", border: "none", color: "#fff", textAlign: "left", padding: "8px 10px", borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: "pointer" }}
                      >
                        Edit Comment
                      </button>
                      <button
                        onClick={() => {
                          onDeleteComment(post.id, comment.id);
                          setCommentMenuId(null);
                        }}
                        style={{ background: "transparent", border: "none", color: "#ff4d4d", textAlign: "left", padding: "8px 10px", borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: "pointer" }}
                      >
                        Delete Comment
                      </button>
                    </div>
                  )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            placeholder="Add a comment..."
            style={{
              flex: 1,
              background: "#1a1a1a",
              border: "0.5px solid #333",
              borderRadius: 20,
              padding: "10px 16px",
              color: "#fff",
              fontSize: 14,
              outline: "none",
              fontFamily: "inherit",
            }}
          />
          <button
            onClick={handleSubmit}
            disabled={!text.trim()}
            style={{
              background: text.trim() ? "#3b82f6" : "#333",
              border: "none",
              borderRadius: 20,
              padding: "0 18px",
              color: text.trim() ? "#fff" : "#666",
              fontWeight: 600,
              fontSize: 14,
              cursor: text.trim() ? "pointer" : "not-allowed",
              fontFamily: "inherit",
            }}
          >
            Post
          </button>
        </div>
      </div>
    </div>
  );
}
