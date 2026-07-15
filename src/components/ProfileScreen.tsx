import { useMemo, useState } from "react";
import {
  Heart,
  MessageCircle,
  MoreHorizontal,
  Play,
  Bookmark,
  ArrowLeft,
} from "lucide-react";
import { Post, User } from "../types";
import Avatar from "./Avatar";
import CommentDialog from "./CommentDialog";

interface ProfileScreenProps {
  profileUserId: string;
  currentUserId: string;
  users: User[];
  posts: Post[];
  onNewPost: () => void;
  onEditName: (newName: string) => void;
  onLogout: () => void;
  onLike: (postId: string) => void;
  onToggleSave: (postId: string) => void;
  savedPosts: string[];
  onEditPost: (postId: string, caption: string) => void;
  onDeletePost: (postId: string) => void;
  onComment: (postId: string, text: string) => void;
  onEditComment: (postId: string, commentId: string, text: string) => void;
  onDeleteComment: (postId: string, commentId: string) => void;
  onToggleFollow: (targetId: string) => void;
  onMessage: () => void;
}

export default function ProfileScreen({
  profileUserId,
  currentUserId,
  users,
  posts,
  // onNewPost,
  onEditName,
  onLogout,
  onLike,
  onToggleSave,
  savedPosts,
  onEditPost,
  onDeletePost,
  onComment,
  onEditComment,
  onDeleteComment,
  onToggleFollow,
  onMessage,
}: ProfileScreenProps) {
  const [editing, setEditing] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [activeUserListType, setActiveUserListType] = useState<
    "followers" | "following" | null
  >(null);
  const [commentDialogPostId, setCommentDialogPostId] = useState<string | null>(
    null,
  );
  const [showFeed, setShowFeed] = useState(false);
  const [profileTab, setProfileTab] = useState<"posts" | "saved">("posts");
  const [feedSource, setFeedSource] = useState<"posts" | "saved">("posts");
  const [feedMenuId, setFeedMenuId] = useState<string | null>(null);
  const [feedEditId, setFeedEditId] = useState<string | null>(null);
  const [feedEditCaption, setFeedEditCaption] = useState("");

  const user = users.find((u) => u.id === profileUserId);
  const userPosts = useMemo(
    () => posts.filter((p) => p.authorId === profileUserId),
    [posts, profileUserId],
  );
  const isOwn = profileUserId === currentUserId;

  const handleEditSave = () => {
    if (nameInput.trim()) onEditName(nameInput.trim());
    setEditing(false);
    setNameInput("");
  };

  const openFeedAtPost = () => {
    setFeedSource(profileTab);
    setShowFeed(true);
  };

  const closeFeed = () => {
    setShowFeed(false);
  };

  const renderFeed = () => {
    const feedList =
      feedSource === "saved"
        ? posts.filter((p) => savedPosts.includes(p.id))
        : userPosts;
    const firstPostIsOwn = feedList[0]?.authorId === currentUserId;

    return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 50,
        background: "var(--bg)",
        color: "var(--text)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ position: "absolute", top: 10, left: 10, zIndex: 10 }}>
        <button
          onClick={closeFeed}
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
          aria-label="Back"
        >
          <ArrowLeft size={20} />
        </button>
      </div>

      {!firstPostIsOwn && (
      <div style={{ position: "absolute", top: 10, right: 10, zIndex: 10 }}>
        <button
          onClick={closeFeed}
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
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
      )}

      <div
        style={{
          flex: 1,
          overflowY: "scroll",
          display: "flex",
          flexDirection: "column",
        }}
        className="hide-scrollbar"
      >
        {(feedSource === "saved"
          ? posts.filter((p) => savedPosts.includes(p.id))
          : userPosts
        ).map((post) => {
          const author = users.find((u) => u.id === post.authorId);
          if (!author) return null;
          const isLiked = post.likes.includes(currentUserId);
          const isOwnPost = post.authorId === currentUserId;
          const currentUser = users.find((u) => u.id === currentUserId);
          const isFollowingAuthor = currentUser?.following.includes(post.authorId) ?? false;
          const mediaSource = post.mediaUrl ?? post.imageUrl;

          return (
            <div
              key={post.id}
              style={{
                borderBottom: "0.5px solid var(--border)",
                padding: "12px 0",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "0 14px",
                  marginBottom: 10,
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
                <div style={{ marginLeft: "auto", position: "relative" }}>
                  <button
                    type="button"
                    onClick={() =>
                      setFeedMenuId(feedMenuId === post.id ? null : post.id)
                    }
                    style={{
                      background: "none",
                      border: "none",
                      color: "var(--text)",
                      cursor: "pointer",
                      padding: 4,
                      display: "grid",
                      placeItems: "center",
                    }}
                    aria-label="Post options"
                  >
                    <MoreHorizontal size={20} />
                  </button>
                  {feedMenuId === post.id && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        position: "absolute",
                        top: 36,
                        right: 0,
                        background: "var(--bg-input)",
                        border: "0.5px solid var(--border)",
                        borderRadius: 12,
                        padding: 8,
                        display: "flex",
                        flexDirection: "column",
                        gap: 4,
                        minWidth: 140,
                        zIndex: 20,
                        boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
                      }}
                    >
                      {isOwnPost ? (
                        <>
                          <button
                            onClick={() => {
                              setFeedEditId(post.id);
                              setFeedEditCaption(post.caption);
                              setFeedMenuId(null);
                            }}
                            style={{
                              background: "transparent",
                              border: "none",
                              color: "var(--text)",
                              textAlign: "left",
                              padding: "8px 12px",
                              borderRadius: 6,
                              fontWeight: 600,
                              fontSize: 13,
                              cursor: "pointer",
                            }}
                          >
                            Edit post
                          </button>
                          <button
                            onClick={() => {
                              onDeletePost(post.id);
                              setFeedMenuId(null);
                            }}
                            style={{
                              background: "transparent",
                              border: "none",
                              color: "var(--danger)",
                              textAlign: "left",
                              padding: "8px 12px",
                              borderRadius: 6,
                              fontWeight: 600,
                              fontSize: 13,
                              cursor: "pointer",
                            }}
                          >
                            Delete post
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => {
                            onToggleFollow(post.authorId);
                            setFeedMenuId(null);
                          }}
                          style={{
                            background: "transparent",
                            border: "none",
                            color: "var(--text)",
                            textAlign: "left",
                            padding: "8px 12px",
                            borderRadius: 6,
                            fontWeight: 600,
                            fontSize: 13,
                            cursor: "pointer",
                          }}
                        >
                          {isFollowingAuthor ? "Unfollow" : "Follow"}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div
                style={{
                  width: "100%",
                  aspectRatio: "1 / 1",
                  background: "var(--bg-input)",
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
                ) : null}
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 18,
                  padding: "10px 14px 4px",
                }}
              >
                <button
                  type="button"
                  onClick={() => onLike(post.id)}
                  style={{
                    background: "none",
                    border: "none",
                    color: isLiked ? "var(--heart)" : "var(--text)",
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
                  onClick={() => setCommentDialogPostId(post.id)}
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
                    color: savedPosts.includes(post.id)
                      ? "var(--accent)"
                      : "var(--text-secondary)",
                    fontSize: 14,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    padding: 0,
                    marginLeft: "auto",
                  }}
                  aria-label="Save post"
                >
                  <Bookmark
                    size={22}
                    fill={
                      savedPosts.includes(post.id) ? "var(--accent)" : "none"
                    }
                  />
                </button>
              </div>

              <div style={{ fontSize: 14, padding: "4px 14px 12px" }}>
                {feedEditId === post.id ? (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 8,
                    }}
                  >
                    <input
                      autoFocus
                      value={feedEditCaption}
                      onChange={(e) => setFeedEditCaption(e.target.value)}
                      style={{
                        background: "var(--bg-input)",
                        border: "0.5px solid var(--border)",
                        color: "var(--text)",
                        padding: "8px 12px",
                        borderRadius: 12,
                        fontSize: 14,
                        outline: "none",
                        fontFamily: "inherit",
                      }}
                    />
                    <div
                      style={{
                        display: "flex",
                        gap: 8,
                        justifyContent: "flex-end",
                      }}
                    >
                      <button
                        onClick={() => setFeedEditId(null)}
                        style={{
                          background: "transparent",
                          color: "var(--text-tertiary)",
                          border: "none",
                          cursor: "pointer",
                          fontSize: 13,
                          fontWeight: 600,
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          if (feedEditCaption.trim()) {
                            onEditPost(post.id, feedEditCaption.trim());
                          }
                          setFeedEditId(null);
                        }}
                        style={{
                          background: "var(--bg)",
                          color: "var(--text)",
                          border: "none",
                          padding: "4px 12px",
                          borderRadius: 16,
                          cursor: "pointer",
                          fontSize: 13,
                          fontWeight: 600,
                        }}
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <strong>{author.username}</strong>{" "}
                    <span style={{ color: "var(--text-secondary)" }}>
                      {post.caption}
                    </span>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
  };

  const renderPostGrid = (list: Post[], emptyText: string) => (
    <div style={{ padding: "0 0 12px" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: 2,
        }}
      >
        {list.map((post) => (
          <button
            key={post.id}
            type="button"
            onClick={() => openFeedAtPost()}
            style={{
              aspectRatio: "1 / 1",
              border: "none",
              padding: 0,
              position: "relative",
              background: "var(--bg-input)",
              cursor: "pointer",
              display: "block",
            }}
          >
            {post.mediaType === "video" && post.mediaUrl ? (
              <video
                src={post.mediaUrl}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                muted
                playsInline
              />
            ) : (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  backgroundImage: post.imageUrl
                    ? `url(${post.imageUrl})`
                    : undefined,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />
            )}
            {post.mediaType === "video" && (
              <div style={{ position: "absolute", top: 8, right: 8 }}>
                <Play size={16} color="var(--text)" fill="var(--text)" />
              </div>
            )}
          </button>
        ))}
      </div>
      {list.length === 0 && (
        <div
          style={{
            padding: "48px 16px 24px",
            textAlign: "center",
            color: "var(--text-tertiary)",
            fontSize: 14,
          }}
        >
          {emptyText}
        </div>
      )}
    </div>
  );

  if (!user) return null;

  const postsCount = userPosts.length;
  const followersCount = user.followers.length;
  const followingCount = user.following.length;

  return (
    <div
      style={{
        flex: 1,
        overflowY: "auto",
        background: "var(--bg)",
        color: "var(--text)",
        display: "flex",
        flexDirection: "column",
        position: "relative",
      }}
    >
      <div
        style={{
          padding: "16px 16px 12px",
          borderBottom: "0.5px solid var(--border)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 14,
          }}
        >
          <div style={{ width: 28 }} />
          <div style={{ fontSize: 16, fontWeight: 700 }}>{user.username}</div>
          <div style={{ width: 28 }} />
        </div>

        <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
          <Avatar name={user.name} size="lg" />

          <div style={{ flex: 1, paddingTop: 6 }}>
            {editing ? (
              <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                <input
                  autoFocus
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleEditSave()}
                  placeholder={user.name}
                  style={{
                    flex: 1,
                    background: "var(--bg-card)",
                    border: "0.5px solid var(--border)",
                    borderRadius: 12,
                    padding: "10px 12px",
                    color: "var(--text)",
                    fontSize: 13,
                    fontFamily: "inherit",
                  }}
                />
                <button
                  onClick={handleEditSave}
                  style={{
                    background: "var(--bg)",
                    color: "var(--text)",
                    border: "none",
                    borderRadius: 12,
                    padding: "0 12px",
                    fontWeight: 700,
                    fontSize: 12,
                    cursor: "pointer",
                  }}
                >
                  save
                </button>
              </div>
            ) : (
              <>
                <h3
                  style={{ fontWeight: 700, fontSize: 22, margin: "0 0 2px" }}
                >
                  {user.name}
                </h3>
                <p
                  style={{
                    color: "var(--text-secondary)",
                    fontSize: 13,
                    margin: 0,
                  }}
                >
                  @{user.username}
                </p>
              </>
            )}

            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              {isOwn ? (
                <>
                  <button
                    onClick={() => {
                      setEditing(true);
                      setNameInput(user.name);
                    }}
                    style={{
                      flex: 1,
                      background: "var(--bg)",
                      color: "var(--text)",
                      border: "0.5px solid var(--border)",
                      padding: "10px 14px",
                      borderRadius: 999,
                      fontWeight: 700,
                      fontSize: 12,
                      cursor: "pointer",
                      fontFamily: "inherit",
                      transition: "opacity 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.opacity = "0.7";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = "1";
                    }}
                  >
                    Edit Profile
                  </button>
                  <button
                    onClick={onLogout}
                    style={{
                      background: "transparent",
                      color: "var(--text-secondary)",
                      border: "0.5px solid var(--border)",
                      padding: "10px 14px",
                      borderRadius: 999,
                      fontWeight: 600,
                      fontSize: 12,
                      cursor: "pointer",
                      fontFamily: "inherit",
                      transition: "color 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "var(--danger)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "var(--text-secondary)";
                    }}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <button
                  onClick={onMessage}
                  style={{
                    flex: 1,
                    background: "var(--bg)",
                    color: "var(--text)",
                    border: "none",
                    padding: "10px 14px",
                    borderRadius: 999,
                    fontWeight: 700,
                    fontSize: 12,
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  Message
                </button>
              )}
            </div>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            marginTop: 14,
            paddingTop: 12,
            borderTop: "0.5px solid var(--border)",
          }}
        >
          {[
            { label: "Posts", value: postsCount },
            { label: "Followers", value: followersCount },
            { label: "Following", value: followingCount },
          ].map((stat) => (
            <div
              key={stat.label}
              onClick={() => {
                if (stat.label === "Followers")
                  setActiveUserListType("followers");
                else if (stat.label === "Following")
                  setActiveUserListType("following");
              }}
              style={{
                textAlign: "center",
                flex: 1,
                cursor: stat.label !== "Posts" ? "pointer" : "default",
              }}
            >
              <strong style={{ fontSize: 17, display: "block" }}>
                {stat.value}
              </strong>
              <div
                style={{
                  fontSize: 11,
                  color: "var(--text-secondary)",
                  marginTop: 3,
                }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          borderTop: "0.5px solid var(--border)",
        }}
      >
        {(
          [
            { tab: "posts", label: "Posts" },
            { tab: "saved", label: "Saved" },
          ] as const
        ).map(({ tab, label }) => {
          const active = profileTab === tab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setProfileTab(tab)}
              style={{
                flex: 1,
                background: "none",
                border: "none",
                borderTop: active
                  ? "1.5px solid var(--text)"
                  : "1.5px solid transparent",
                color: active ? "var(--text)" : "var(--text-secondary)",
                padding: "8px 0",
                cursor: "pointer",
                fontSize: 11,
                fontWeight: 400,
                textTransform: "uppercase",
                letterSpacing: 1,
                opacity: active ? 1 : 0.5,
              }}
            >
              {label}
            </button>
          );
        })}
      </div>

      {profileTab === "posts"
        ? renderPostGrid(userPosts, "no posts yet")
        : renderPostGrid(
            posts.filter((p) => savedPosts.includes(p.id)),
            "no saved posts yet",
          )}

      {showFeed && renderFeed()}

      {activeUserListType && (
        <div
          onClick={() => setActiveUserListType(null)}
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 60,
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(8px)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              height: "75%",
              background: "var(--bg)",
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 -4px 30px rgba(0,0,0,0.15)",
              borderTop: "0.5px solid var(--border)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                paddingTop: 12,
                paddingBottom: 12,
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 4,
                  background: "var(--text-secondary)",
                  borderRadius: 2,
                  opacity: 0.3,
                }}
              />
            </div>

            <div
              style={{
                padding: "0 16px 12px",
                borderBottom: "0.5px solid var(--border)",
                fontWeight: 700,
                fontSize: 16,
                textAlign: "center",
                color: "var(--text)",
              }}
            >
              {activeUserListType === "followers" ? "Followers" : "Following"}
            </div>

            <div
              style={{
                flex: 1,
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
              }}
              className="hide-scrollbar"
            >
              {(activeUserListType === "followers"
                ? user.followers
                : user.following
              ).map((userId) => {
                const listUser = users.find((u) => u.id === userId);
                if (!listUser) return null;
                return (
                  <div
                    key={userId}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "12px 16px",
                    }}
                  >
                    <Avatar name={listUser.name} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>
                        {listUser.name}
                      </div>
                      <div
                        style={{ fontSize: 12, color: "var(--text-secondary)" }}
                      >
                        @{listUser.username}
                      </div>
                    </div>
                  </div>
                );
              })}
              {(activeUserListType === "followers"
                ? user.followers
                : user.following
              ).length === 0 && (
                <div
                  style={{
                    padding: "40px 16px",
                    textAlign: "center",
                    color: "var(--text-secondary)",
                    fontSize: 14,
                  }}
                >
                  No users to display
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {commentDialogPostId &&
        (() => {
          const targetPost = posts.find((p) => p.id === commentDialogPostId);
          if (!targetPost) return null;
          return (
            <CommentDialog
              post={targetPost}
              users={users}
              currentUserId={currentUserId}
              onClose={() => setCommentDialogPostId(null)}
              onComment={onComment}
              onEditComment={onEditComment}
              onDeleteComment={onDeleteComment}
            />
          );
        })()}
    </div>
  );
}
