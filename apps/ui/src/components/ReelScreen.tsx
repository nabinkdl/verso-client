import { useState } from "react";
import { Play } from "lucide-react";
import { Post, User } from "../types";
import ReelPost from "./ReelPost";
import ReelCommentModal from "./ReelCommentModal";

interface ReelScreenProps {
  posts: Post[];
  users: User[];
  currentUserId: string;
  savedPosts: string[];
  onToggleSave: (postId: string) => void;
  onLike: (postId: string) => void;
  onComment: (postId: string, text: string) => void;
  onEditComment?: (postId: string, commentId: string, text: string) => void;
  onDeleteComment?: (postId: string, commentId: string) => void;
}

export default function ReelScreen({
  posts,
  users,
  currentUserId,
  savedPosts,
  onToggleSave,
  onLike,
  onComment,
  onEditComment,
  onDeleteComment,
}: ReelScreenProps) {
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);

  const getUserById = (uid: string) => users.find((u) => u.id === uid);
  const reelPosts = [...posts]
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 6);

  const activePost = activeCommentPostId ? posts.find(p => p.id === activeCommentPostId) : null;

  return (
    <div style={{ flex: 1, position: "relative", display: "flex", flexDirection: "column", background: "var(--bg)" }}>
      {/* Header overlay */}
      <div
        style={{
          position: "absolute",
          top: 16,
          left: 16,
          right: 16,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          zIndex: 10,
          pointerEvents: "none",
          color: "var(--text-on-media)",
        }}
      >
        <div>
          <h2 style={{ fontWeight: 800, fontSize: 22, margin: 0, textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}>reels</h2>
          <div style={{ fontSize: 12, color: "var(--text-on-media)", marginTop: 4, textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}>
            short videos and fast cuts
          </div>
        </div>
        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: 14,
            background: "var(--overlay-surface-soft)",
            backdropFilter: "blur(10px)",
            display: "grid",
            placeItems: "center",
            border: "0.5px solid var(--surface-hover)",
          }}
        >
          <Play size={18} color="var(--text-on-media)" />
        </div>
      </div>

      {/* Scroll container */}
      <div
        style={{
          flex: 1,
          overflowY: "scroll",
          scrollSnapType: "y mandatory",
          display: "flex",
          flexDirection: "column",
        }}
        className="hide-scrollbar"
      >

      {reelPosts.map((post) => {
        const author = getUserById(post.authorId);
        if (!author) return null;
        const isLiked = post.likes.includes(currentUserId);

        return (
          <ReelPost
            key={post.id}
            post={post}
            author={author}
            isLiked={isLiked}
            isSaved={savedPosts.includes(post.id)}
            onLike={onLike}
            onToggleSave={onToggleSave}
            onOpenComments={() => setActiveCommentPostId(post.id)}
          />
        );
      })}
      </div>

      {activePost && (
        <ReelCommentModal
          post={activePost}
          users={users}
          currentUserId={currentUserId}
          onClose={() => setActiveCommentPostId(null)}
          onComment={onComment}
          onEditComment={onEditComment}
          onDeleteComment={onDeleteComment}
        />
      )}
    </div>
  );
}
