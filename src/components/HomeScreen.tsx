import { useEffect, useRef, useState } from 'react';
import { Heart, MessageCircle } from 'lucide-react';
import { Post, User } from '../types';
import Avatar from './Avatar';

interface HomeScreenProps {
  posts: Post[];
  users: User[];
  currentUserId: string;
  onLike: (postId: string) => void;
  onComment: (postId: string, text: string) => void;
}

const PAGE_SIZE = 5;

export default function HomeScreen({ posts, users, currentUserId, onLike, onComment }: HomeScreenProps) {
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [commentPostId, setCommentPostId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const getUserById = (uid: string) => users.find(u => u.id === uid);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const handleScroll = () => {
      if (container.scrollTop + container.clientHeight >= container.scrollHeight - 60) {
        setVisible(v => Math.min(v + 3, posts.length));
      }
    };
    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [posts.length]);

  const submitComment = (postId: string) => {
    if (commentText.trim()) {
      onComment(postId, commentText.trim());
      setCommentText('');
      setCommentPostId(null);
    }
  };

  return (
    <div
      ref={containerRef}
      style={{
        flex: 1,
        overflowY: 'auto',
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 18,
        scrollBehavior: 'smooth',
      }}
    >
      {posts.slice(0, visible).map(post => {
        const author = getUserById(post.authorId);
        if (!author) return null;
        const isLiked = post.likes.includes(currentUserId);
        return (
          <div
            key={post.id}
            style={{
              background: '#0c0c0c',
              borderRadius: 20,
              padding: 14,
              border: '0.5px solid #2a2a2a',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <Avatar name={author.name} />
              <div>
                <div style={{ fontWeight: 600, fontSize: 15 }}>{author.name}</div>
                <div style={{ fontSize: 12, color: '#888' }}>@{author.username}</div>
              </div>
            </div>

            <div
              style={{
                width: '100%',
                aspectRatio: '1 / 1',
                background: '#1a1a1a',
                borderRadius: 18,
                margin: '10px 0',
                border: '0.5px solid #2c2c2c',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#444',
                fontSize: 13,
                letterSpacing: 2,
              }}
            >
              ◼ ◻
            </div>

            <div style={{ display: 'flex', gap: 24, margin: '10px 0 8px' }}>
              <button
                onClick={() => onLike(post.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: isLiked ? '#ff4d6d' : '#ddd',
                  fontSize: 14,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: 0,
                }}
              >
                <Heart size={22} fill={isLiked ? '#ff4d6d' : 'none'} />
                <span style={{ color: '#aaa' }}>{post.likes.length}</span>
              </button>
              <button
                onClick={() => setCommentPostId(commentPostId === post.id ? null : post.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#ddd',
                  fontSize: 14,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: 0,
                }}
              >
                <MessageCircle size={22} />
                <span style={{ color: '#aaa' }}>{post.comments.length}</span>
              </button>
            </div>

            <div style={{ fontSize: 14, margin: '6px 0' }}>
              <strong>{author.username}</strong>{' '}{post.caption}
            </div>

            {post.comments.length > 0 && (
              <div style={{ fontSize: 13, color: '#777', marginTop: 4 }}>
                {post.comments.length} comment{post.comments.length !== 1 ? 's' : ''}
              </div>
            )}

            {commentPostId === post.id && (
              <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
                <input
                  autoFocus
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && submitComment(post.id)}
                  placeholder="add a comment..."
                  style={{
                    flex: 1,
                    background: '#111',
                    border: '0.5px solid #333',
                    borderRadius: 30,
                    padding: '8px 12px',
                    color: 'white',
                    fontSize: 13,
                    fontFamily: 'inherit',
                  }}
                />
                <button
                  onClick={() => submitComment(post.id)}
                  style={{
                    background: 'white',
                    color: 'black',
                    border: 'none',
                    borderRadius: 30,
                    padding: '0 14px',
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: 'pointer',
                  }}
                >
                  post
                </button>
              </div>
            )}
          </div>
        );
      })}

      <div ref={bottomRef} style={{ height: 30, textAlign: 'center', color: '#555', fontSize: 13 }}>
        {visible < posts.length ? '↓ scroll for more' : '· end ·'}
      </div>
    </div>
  );
}
