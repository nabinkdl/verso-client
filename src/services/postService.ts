import { Post, Comment } from "../types";

export function likePost(posts: Post[], postId: string, userId: string): Post[] {
  return posts.map((p) => {
    if (p.id !== postId) return p;
    const liked = p.likes.includes(userId);
    return {
      ...p,
      likes: liked
        ? p.likes.filter((id) => id !== userId)
        : [...p.likes, userId],
    };
  });
}

export function editPost(posts: Post[], postId: string, caption: string): Post[] {
  return posts.map((post) =>
    post.id === postId ? { ...post, caption } : post,
  );
}

export function deletePost(posts: Post[], postId: string): Post[] {
  return posts.filter((post) => post.id !== postId);
}

export function addComment(
  posts: Post[],
  postId: string,
  comment: Comment,
): Post[] {
  return posts.map((p) =>
    p.id !== postId
      ? p
      : {
          ...p,
          comments: [...p.comments, comment],
        },
  );
}

export function editComment(
  posts: Post[],
  postId: string,
  commentId: string,
  text: string,
): Post[] {
  return posts.map((post) =>
    post.id !== postId
      ? post
      : {
          ...post,
          comments: post.comments.map((comment) =>
            comment.id === commentId ? { ...comment, text } : comment,
          ),
        },
  );
}

export function deleteComment(
  posts: Post[],
  postId: string,
  commentId: string,
): Post[] {
  return posts.map((post) =>
    post.id !== postId
      ? post
      : {
          ...post,
          comments: post.comments.filter(
            (comment) => comment.id !== commentId,
          ),
        },
  );
}
