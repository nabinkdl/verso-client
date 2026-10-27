import { Heart, MessageCircle, Bookmark, ArrowLeft } from "lucide-react";
import { Post, User } from "../types";
import Avatar from "./Avatar";
import CommentDialog from "./CommentDialog";
import { useState } from "react";

interface SavedScreenProps {
  posts: Post[];
  users: User[];
  currentUserId: string;
  savedPosts: string[];
  onToggleSave: (postId: string) => void;
  onLike: (postId: string) => void;
  onComment: (postId: string, text: string) => void;
  onEditComment: (postId: string, commentId: string, text: string) => void;
  onDeleteComment: (postId: string, commentId: string) => void;
  onClose: () => void;
}

export default function SavedScreen({
  posts,
  users,
  currentUserId,
  savedPosts,
  onToggleSave,
  onLike,
  onComment,
  onEditComment,
  onDeleteComment,
  onClose,
}: SavedScreenProps) {
  const [commentPostId, setCommentPostId] = useState<string | null>(null);

  const saved = posts
    .filter((p) => savedPosts.includes(p.id))
    .sort((a, b) => b.createdAt - a.createdAt);

  const getUserById = (uid: string) => users.find((u) => u.id === uid);

  return (
    <div style={{ flex: 1, position: "relative", background: "var(--bg)", color: "var(--text)" }}>
      <div
        style={{
          position: "absolute",
          top: 10,
          left: 10,
          zIndex: 10,
        }}
      >
        <button
          onClick={onClose}
          style={{
            background: "var(--bg-input)",
            border: "0.5px solid var(--border)",
            borderRadius: 999,
            width: 36,
            height: 36,
            display: "grid",
            placeItems: "center",
            cursor: "pointer",
            color: "var(--text)",
          }}
        >
          <ArrowLeft size={20} />
        </button>
      </div>

      <div
        style={{
          position: "absolute",
          top: 14,
          left: 0,
          right: 0,
          textAlign: "center",
          fontSize: 16,
          fontWeight: 700,
        }}
      >
        Saved
      </div>

      <div
        style={{
          position: "absolute",
          inset: 0,
          top: 56,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 16,
          padding: "12px 16px 16px",
        }}
        className="hide-scrollbar"
      >
        {saved.length === 0 ? (
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              color: "var(--text-tertiary)",
              paddingTop: 80,
            }}
          >
            <Bookmark size={48} strokeWidth={1} />
            <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-secondary)" }}>
              No saved posts yet
            </div>
            <div style={{ fontSize: 13, color: "var(--text-tertiary)", textAlign: "center", maxWidth: 240 }}>
              Tap the bookmark icon on any post to save it here.
            </div>
          </div>
        ) : (
          saved.map((post) => {
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
                }}
              >
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
                  ) : null}
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
                  <button
                    type="button"
                    onClick={() => onToggleSave(post.id)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "var(--accent)",
                      fontSize: 14,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      padding: 0,
                      marginLeft: "auto",
                    }}
                    aria-label="Unsave post"
                  >
                    <Bookmark size={22} fill="var(--accent)" />
                  </button>
                </div>

                <div style={{ fontSize: 14, margin: "6px 0" }}>
                  <strong>{author.username}</strong>{" "}
                  <span style={{ color: "var(--text-secondary)" }}>
                    {post.caption}
                  </span>
                </div>
              </div>
            );
          })
        )}
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
              onClose={() => setCommentPostId(null)}
              onComment={(postId, text) => onComment(postId, text)}
              onEditComment={onEditComment}
              onDeleteComment={onDeleteComment}
            />
          );
        })()}
    </div>
  );
}
