import { Play, Heart, MessageCircle } from "lucide-react";
import { Post, User } from "../types";
import Avatar from "./Avatar";

interface ReelScreenProps {
  posts: Post[];
  users: User[];
  currentUserId: string;
  onLike: (postId: string) => void;
}

export default function ReelScreen({
  posts,
  users,
  currentUserId,
  onLike,
}: ReelScreenProps) {
  const getUserById = (uid: string) => users.find((u) => u.id === uid);
  const reelPosts = [...posts]
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 6);

  return (
    <div
      style={{
        flex: 1,
        overflowY: "auto",
        padding: 16,
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <h2 style={{ fontWeight: 800, fontSize: 22, margin: 0 }}>reels</h2>
          <div style={{ fontSize: 12, color: "#777", marginTop: 4 }}>
            short videos and fast cuts
          </div>
        </div>
        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: 14,
            background: "#111",
            display: "grid",
            placeItems: "center",
            border: "0.5px solid #2c2c2c",
          }}
        >
          <Play size={18} />
        </div>
      </div>

      {reelPosts.map((post) => {
        const author = getUserById(post.authorId);
        if (!author) return null;
        const isLiked = post.likes.includes(currentUserId);
        const mediaSource = post.mediaUrl ?? post.imageUrl;

        return (
          <article
            key={post.id}
            style={{
              position: "relative",
              minHeight: 420,
              borderRadius: 28,
              overflow: "hidden",
              border: "0.5px solid #2a2a2a",
              background: "#0b0b0b",
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
                  background: "linear-gradient(145deg, #161616, #050505)",
                }}
              />
            )}

            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(180deg, rgba(0,0,0,0.12) 0%, rgba(0,0,0,0.55) 100%)",
              }}
            />

            <div
              style={{
                position: "absolute",
                inset: 0,
                padding: 16,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: 12,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Avatar name={author.name} />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>
                      {author.name}
                    </div>
                    <div style={{ fontSize: 12, color: "#d0d0d0" }}>
                      @{author.username}
                    </div>
                  </div>
                </div>
                <div
                  style={{
                    padding: "8px 12px",
                    borderRadius: 999,
                    background: "rgba(255,255,255,0.12)",
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  {post.mediaType === "video" ? "video" : "photo"}
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "flex-end",
                  justifyContent: "space-between",
                  gap: 12,
                }}
              >
                <div style={{ maxWidth: "72%" }}>
                  <p
                    style={{ fontSize: 17, fontWeight: 700, margin: "0 0 6px" }}
                  >
                    {post.caption}
                  </p>
                  <p style={{ fontSize: 12, color: "#d1d1d1", margin: 0 }}>
                    {post.comments.length} comments · {post.likes.length} likes
                  </p>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                    alignItems: "center",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => onLike(post.id)}
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 999,
                      border: "none",
                      background: "rgba(0,0,0,0.45)",
                      color: isLiked ? "#ff4d6d" : "#fff",
                      display: "grid",
                      placeItems: "center",
                      cursor: "pointer",
                    }}
                  >
                    <Heart size={20} fill={isLiked ? "#ff4d6d" : "none"} />
                  </button>
                  <div style={{ fontSize: 11, color: "#fff", opacity: 0.8 }}>
                    {post.likes.length}
                  </div>
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 999,
                      background: "rgba(0,0,0,0.45)",
                      display: "grid",
                      placeItems: "center",
                    }}
                  >
                    <MessageCircle size={19} />
                  </div>
                </div>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
