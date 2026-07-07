import { useState } from 'react';
import { ArrowLeft, Bell, Heart, MessageCircle, MoreVertical } from 'lucide-react';
import Avatar from './Avatar';

import { usePages } from '../contexts/PageContext';
import { Page, User, Post } from '../types';
import MemberManagementModal from './MemberManagementModal';

interface PageViewScreenProps {
  page: Page;
  users: User[];
  posts: Post[];
  currentUserId: string;
  onClose: () => void;
  onNewPostClick?: () => void;
}

export default function PageViewScreen({ 
  page, 
  users, 
  posts,
  currentUserId, 
  onClose,
  onNewPostClick,
}: PageViewScreenProps) {
  const { joinPage } = usePages();
  const [activeTab, setActiveTab] = useState<'feed' | 'members' | 'about'>('feed');
  const [showMemberManagement, setShowMemberManagement] = useState(false);
  
  const myRole = page.members.find(m => m.userId === currentUserId)?.role;
  const isMember = !!myRole;
  const isAdminOrEditor = myRole === 'admin' || myRole === 'editor';

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 45,
        background: '#000',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Header with Cover */}
      <div style={{ position: 'relative', borderBottom: '0.5px solid #2a2a2a' }}>
        {/* Cover Background */}
        <div style={{ 
          position: 'absolute', 
          top: 0, left: 0, right: 0, 
          height: 120, 
          background: 'linear-gradient(135deg, #1e3a8a, #4c1d95, #9d174d)', 
          opacity: 0.6,
          zIndex: 0
        }} />
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 120, background: 'linear-gradient(to bottom, transparent, #000)', zIndex: 1 }} />
        
        {/* Header Content */}
        <div style={{ position: 'relative', zIndex: 2, padding: '16px 16px 12px', paddingTop: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button onClick={onClose} style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)', width: 36, height: 36, borderRadius: 18, border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ArrowLeft size={20} />
            </button>
            <button style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)', width: 36, height: 36, borderRadius: 18, border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MoreVertical size={20} />
            </button>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, marginTop: 16 }}>
            <div style={{ width: 72, height: 72, borderRadius: 36, background: '#111', display: 'grid', placeItems: 'center', fontSize: 28, fontWeight: 700, border: '3px solid #000' }}>
              {page.avatar}
            </div>
            <div style={{ flex: 1, paddingBottom: 4 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 800, fontSize: 22, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>{page.name}</span>
                {page.isVerified && (
                  <span style={{ background: '#3b82f6', color: '#fff', fontSize: 10, padding: '2px 8px', borderRadius: 12 }}>
                    ✓ Verified
                  </span>
                )}
              </div>
              <p style={{ color: '#aaa', fontSize: 13, margin: '4px 0 0' }}>{page.category}</p>
            </div>
          </div>
        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
          {!isMember && (
            <button
              onClick={() => joinPage(page.id, currentUserId)}
              disabled={page.joinRequests?.includes(currentUserId)}
              style={{
                flex: 1,
                padding: '8px',
                background: page.joinRequests?.includes(currentUserId) ? '#333' : '#fff',
                color: page.joinRequests?.includes(currentUserId) ? '#888' : '#000',
                border: 'none',
                borderRadius: 12,
                fontWeight: 700,
                fontSize: 13,
                cursor: page.joinRequests?.includes(currentUserId) ? 'not-allowed' : 'pointer',
                transform: 'scale(1)',
                transition: 'all 0.2s ease',
              }}
              onMouseDown={(e) => { if(!page.joinRequests?.includes(currentUserId)) e.currentTarget.style.transform = 'scale(0.96)' }}
              onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              {page.joinRequests?.includes(currentUserId) ? 'Requested' : 'Join Page'}
            </button>
          )}
          <button
            aria-label="Notify"
            style={{
              width: 36,
              height: 36,
              background: 'rgba(255,255,255,0.05)',
              color: '#bfbfbf',
              border: 'none',
              borderRadius: 12,
              cursor: 'pointer',
              display: 'grid',
              placeItems: 'center',
              flexShrink: 0,
            }}
          >
            <Bell size={18} />
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 24px', marginTop: 12, paddingTop: 12, borderTop: '0.5px solid #2a2a2a' }}>
          <span style={{ fontSize: 13, color: '#8a8a8a' }}>👥 {page.members.length.toLocaleString()} members</span>
          <span style={{ fontSize: 13, color: '#8a8a8a' }}>📝 {posts.filter(p => p.pageId === page.id).length} posts</span>
        </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, padding: '8px 16px', borderBottom: '0.5px solid #2a2a2a' }}>
        {['feed', 'members', 'about'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            style={{
              padding: '6px 16px',
              background: activeTab === tab ? '#fff' : 'transparent',
              color: activeTab === tab ? '#000' : '#8a8a8a',
              border: 'none',
              borderRadius: 16,
              fontWeight: 600,
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
        {activeTab === 'feed' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {isMember && onNewPostClick && (
              <div
                onClick={onNewPostClick}
                style={{
                  background: '#1a1a1a',
                  border: '0.5px solid #333',
                  padding: '14px 16px',
                  borderRadius: 16,
                  color: '#8a8a8a',
                  fontSize: 14,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <div style={{ width: 32, height: 32, borderRadius: 16, background: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>+</div>
                <span>Share something with the community...</span>
              </div>
            )}
            
            {posts.filter(p => p.pageId === page.id).map((post) => {
              const u = users.find(user => user.id === post.authorId);
              return (
                <div
                  key={post.id}
                  style={{
                    background: '#0c0c0c',
                    borderRadius: 16,
                    padding: 14,
                    border: '0.5px solid #2a2a2a',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                    <Avatar name={u?.name.charAt(0) || 'U'} />
                    <div>
                      <h4 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>{u?.name || 'Unknown User'}</h4>
                      <p style={{ margin: 0, fontSize: 12, color: '#666' }}>{new Date(post.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <p style={{ margin: '0 0 12px 0', fontSize: 14, lineHeight: 1.5, color: '#e5e5e5' }}>
                    {post.caption}
                  </p>
                  {post.imageUrl && (
                    <div style={{ width: '100%', borderRadius: 12, overflow: 'hidden', marginBottom: 12 }}>
                      <img src={post.imageUrl} alt={post.imageAlt || "Post Image"} style={{ width: '100%', display: 'block' }} />
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#8a8a8a', fontSize: 13 }}>
                      <Heart size={16} /> {post.likes.length}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#8a8a8a', fontSize: 13 }}>
                      <MessageCircle size={16} /> {post.comments.length}
                    </div>
                  </div>
                </div>
              );
            })}
            {posts.filter(p => p.pageId === page.id).length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: '#666', fontSize: 14 }}>
                No posts yet. Be the first to post!
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'members' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {isAdminOrEditor && (
              <button
                onClick={() => setShowMemberManagement(true)}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  color: '#fff',
                  border: '1px solid #333',
                  padding: '10px',
                  borderRadius: 12,
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: 'pointer',
                  marginBottom: 10,
                }}
              >
                Manage Members
              </button>
            )}
            {[...page.members].sort((a, b) => {
              const weight = { admin: 3, editor: 2, moderator: 1, member: 0 };
              return weight[b.role] - weight[a.role];
            }).map((m) => {
              const u = users.find(user => user.id === m.userId);
              if (!u) return null;
              return (
                <div
                  key={m.userId}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '8px 12px',
                    background: '#0c0c0c',
                    borderRadius: 12,
                    border: '0.5px solid #2a2a2a',
                  }}
                >
                  <Avatar name={u.name} />
                  <span style={{ fontWeight: 500 }}>{u.name}</span>
                  {m.role === 'admin' && (
                    <span style={{ marginLeft: 'auto', color: '#3b82f6', fontSize: 12 }}>Admin</span>
                  )}
                  {m.role === 'editor' && (
                    <span style={{ marginLeft: 'auto', color: '#8b5cf6', fontSize: 12 }}>Editor</span>
                  )}
                  {m.role === 'moderator' && (
                    <span style={{ marginLeft: 'auto', color: '#f59e0b', fontSize: 12 }}>Moderator</span>
                  )}
                  {m.role === 'member' && (
                    <span style={{ marginLeft: 'auto', color: '#666', fontSize: 12 }}>Member</span>
                  )}
                </div>
              );
            })}
          </div>
        )}
        
        {activeTab === 'about' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: '#0c0c0c', borderRadius: 16, padding: 16, border: '0.5px solid #2a2a2a' }}>
              <h4 style={{ margin: 0, marginBottom: 8, color: '#fff', fontSize: 15 }}>About this page</h4>
              <p style={{ lineHeight: 1.6, color: '#8a8a8a', fontSize: 14, margin: 0 }}>{page.description}</p>
            </div>
            <div style={{ background: '#0c0c0c', borderRadius: 16, padding: 16, border: '0.5px solid #2a2a2a' }}>
              <h4 style={{ margin: 0, marginBottom: 12, color: '#fff', fontSize: 15 }}>Details</h4>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '0.5px solid #222' }}>
                <span style={{ color: '#8a8a8a', fontSize: 14 }}>Category</span>
                <span style={{ color: '#fff', fontSize: 14, fontWeight: 500 }}>{page.category}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '0.5px solid #222' }}>
                <span style={{ color: '#8a8a8a', fontSize: 14 }}>Visibility</span>
                <span style={{ color: '#fff', fontSize: 14, fontWeight: 500, textTransform: 'capitalize' }}>{page.visibility}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 10 }}>
                <span style={{ color: '#8a8a8a', fontSize: 14 }}>Members</span>
                <span style={{ color: '#fff', fontSize: 14, fontWeight: 500 }}>{page.members.length.toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {showMemberManagement && (
        <MemberManagementModal 
          onClose={() => setShowMemberManagement(false)} 
          page={page}
          users={users}
          currentUserId={currentUserId}
        />
      )}
    </div>
  );
}
