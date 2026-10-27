import { useState } from 'react';
import { Search } from 'lucide-react';
import { User } from '../types';
import Avatar from './Avatar';

interface SearchScreenProps {
  users: User[];
  currentUserId: string;
  onToggleFollow: (targetId: string) => void;
  onViewProfile: (userId: string) => void;
}

export default function SearchScreen({ users, currentUserId, onToggleFollow, onViewProfile }: SearchScreenProps) {
  const [query, setQuery] = useState('');

  const currentUser = users.find(u => u.id === currentUserId)!;
  const filtered = users.filter(
    u => u.id !== currentUserId && u.username.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ position: 'relative' }}>
        <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="search by username..."
          style={{
            background: 'var(--bg-elevated-2)',
            border: '0.5px solid var(--border)',
            borderRadius: 40,
            padding: '12px 16px 12px 38px',
            color: 'var(--text)',
            fontSize: 15,
            width: '100%',
            fontFamily: 'inherit',
          }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filtered.map(user => {
          const isFollowing = currentUser.following.includes(user.id);
          return (
            <div
              key={user.id}
              onClick={() => onViewProfile(user.id)}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'var(--bg-elevated)',
                padding: 12,
                borderRadius: 16,
                border: '0.5px solid var(--border-subtle)',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Avatar name={user.name} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{user.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>@{user.username}</div>
                </div>
              </div>
              <button
                onClick={e => { e.stopPropagation(); onToggleFollow(user.id); }}
                style={{
                  background: isFollowing ? 'transparent' : 'var(--text)',
                  color: isFollowing ? 'var(--text)' : 'var(--bg)',
                  border: isFollowing ? '0.5px solid var(--text)' : 'none',
                  padding: '6px 16px',
                  borderRadius: 30,
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                {isFollowing ? 'unfollow' : 'follow'}
              </button>
            </div>
          );
        })}
        {filtered.length === 0 && query && (
          <div style={{ textAlign: 'center', color: 'var(--text-dim)', marginTop: 40, fontSize: 14 }}>no users found</div>
        )}
      </div>
    </div>
  );
}
