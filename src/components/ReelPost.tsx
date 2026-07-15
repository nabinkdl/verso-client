import { Heart, MessageCircle, Bookmark } from "lucide-react";
import { Post, User } from "../types";
import Avatar from "./Avatar";

interface ReelPostProps {
  post: Post;
  author: User;
  isLiked: boolean;
  isSaved: boolean;
  onLike: (postId: string) => void;
  onToggleSave: (postId: string) => void;
  onOpenComments: () => void;
}

export default function ReelPost({
  post,
  author,
  isLiked,
  isSaved,
  onLike,
  onToggleSave,
  onOpenComments,
}: ReelPostProps) {
  const mediaSource = post.mediaUrl ?? post.imageUrl;

  return (
    <article
      style={{
        position: "relative",
        height: "100%",
        width: "100%",
        flexShrink: 0,
        scrollSnapAlign: "start",
        overflow: "hidden",
        background: "var(--bg)",
      }}
    >
      {post.mediaType === "video" && mediaSource ? (
        <video
          src={mediaSource}
          autoPlay
          muted
          loop
          playsInline
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
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(145deg, var(--bg-secondary), var(--bg))",
          }}
        />
      )}

      <div
        style={{
          position: "absolute",
          inset: 0,
          padding: "16px 12px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12 }}>
          {/* Left side: Avatar, Name, Caption */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: "80%" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Avatar name={author.name} />
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontWeight: 700, fontSize: 16, color: "var(--text)" }}>{author.name}</span>
                <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>@{author.username}</span>
              </div>
            </div>
            <div>
              <p style={{ fontSize: 15, margin: "0 0 6px", lineHeight: 1.4, color: "var(--text)" }}>{post.caption}</p>
            </div>
          </div>

          {/* Right side: Actions */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16, alignItems: "center", marginBottom: 8 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <button
                type="button"
                onClick={() => onLike(post.id)}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 999,
                  border: "none",
                  background: "rgba(0,0,0,0.3)",
                  color: isLiked ? "var(--heart)" : "#fff",
                  display: "grid",
                  placeItems: "center",
                  cursor: "pointer",
                }}
              >
                <Heart size={24} fill={isLiked ? "var(--heart)" : "none"} />
              </button>
              <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text)" }}>{post.likes.length}</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <button
                type="button"
                onClick={onOpenComments}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 999,
                  background: "rgba(0,0,0,0.3)",
                  display: "grid",
                  placeItems: "center",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <MessageCircle size={22} color="#fff" />
              </button>
              <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text)" }}>{post.comments.length}</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <button
                type="button"
                onClick={() => onToggleSave(post.id)}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 999,
                  background: "rgba(0,0,0,0.3)",
                  display: "grid",
                  placeItems: "center",
                  border: "none",
                  cursor: "pointer",
                }}
                aria-label="Save post"
              >
                <Bookmark size={22} color={isSaved ? "var(--accent)" : "#fff"} fill={isSaved ? "var(--accent)" : "none"} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
