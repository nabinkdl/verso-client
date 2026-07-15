import { useState } from "react";
import { X } from "lucide-react";
import { Post, User } from "../types";
import Avatar from "./Avatar";

interface ReelCommentModalProps {
  post: Post;
  users: User[];
  currentUserId: string;
  onClose: () => void;
  onComment: (postId: string, text: string) => void;
}

export default function ReelCommentModal({
  post,
  users,
  onClose,
  onComment,
}: ReelCommentModalProps) {
  const [text, setText] = useState("");

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
          background: "var(--bg)",
          backdropFilter: "blur(20px)",
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          position: "relative",
          pointerEvents: "auto",
          display: "flex",
          flexDirection: "column",
          padding: 16,
          boxShadow: "0 -4px 24px rgba(0,0,0,0.15)",
          borderTop: "0.5px solid var(--border)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
          <div style={{ width: 40, height: 4, background: "var(--text-secondary)", borderRadius: 2, opacity: 0.3 }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>{post.comments.length} comments</h3>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", color: "var(--text)", cursor: "pointer" }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 16, marginBottom: 16 }} className="hide-scrollbar">
          {post.comments.map((comment, i) => {
            const author = getUserById(comment.userId);
            return (
              <div key={i} style={{ display: "flex", gap: 12 }}>
                <Avatar name={author?.name ?? "U"} size="sm" />
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 2 }}>
                    {author?.username}
                  </div>
                  <div style={{ fontSize: 14, color: "var(--text)", lineHeight: 1.4 }}>
                    {comment.text}
                  </div>
                </div>
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
              background: "color-mix(in srgb, var(--text) 10%, var(--bg))",
              border: "1px solid var(--border)",
              borderRadius: 20,
              padding: "10px 16px",
              color: "var(--text)",
              fontSize: 14,
              outline: "none",
            }}
          />
          <button
            type="submit"
            disabled={!text.trim()}
            style={{
              background: text.trim() ? "var(--text)" : "color-mix(in srgb, var(--text) 15%, var(--bg))",
              color: text.trim() ? "var(--bg)" : "color-mix(in srgb, var(--text) 50%, var(--bg))",
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
