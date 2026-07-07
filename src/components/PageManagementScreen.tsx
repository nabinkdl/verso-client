import { useState } from 'react';
import { Plus, Settings, Users, MoreVertical, Inbox, Check, X } from 'lucide-react';
import Avatar from './Avatar';

import { Page, User } from '../types';
import { usePages } from '../contexts/PageContext';

interface PageManagementScreenProps {
  currentUserId: string;
  users: User[];
  onCreatePage: () => void;
  onViewPage: (pageId: string) => void;
}

export default function PageManagementScreen({ currentUserId, users, onCreatePage, onViewPage }: PageManagementScreenProps) {
  const { pages, acceptJoinRequest, rejectJoinRequest } = usePages();

  const [activeTab, setActiveTab] = useState<'pages' | 'requests' | 'invites'>('pages');

  // Compute pending requests for pages where current user is admin/editor
  const managedPages = pages.filter(p => {
    const role = p.members.find(m => m.userId === currentUserId)?.role;
    return role === 'admin' || role === 'editor';
  });

  const allRequests = managedPages.flatMap(p => 
    (p.joinRequests || []).map(reqUserId => ({
      page: p,
      userId: reqUserId
    }))
  );

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px 16px', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>Pages</h2>
          <p style={{ color: '#8a8a8a', fontSize: 13, marginTop: 4 }}>Manage your communities and pages</p>
        </div>
        <button
          onClick={onCreatePage}
          style={{
            width: 40,
            height: 40,
            borderRadius: 14,
            background: "rgba(255,255,255,0.05)",
            border: "none",
            color: "#bfbfbf",
            display: "grid",
            placeItems: "center",
            cursor: "pointer",
            boxShadow: "0 8px 20px rgba(255,255,255,0.08)",
            flexShrink: 0,
            transition: 'all 0.2s',
          }}
          onMouseDown={e => e.currentTarget.style.transform = 'scale(0.92)'}
          onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          aria-label="Create Page"
        >
          <Plus size={18} />
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, borderBottom: '0.5px solid #2c2c2c', paddingBottom: 12, overflowX: 'auto' }} className="hide-scrollbar">
        {['pages', 'requests', 'invites'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            style={{
              background: activeTab === tab ? '#fff' : 'transparent',
              color: activeTab === tab ? '#000' : '#8a8a8a',
              border: 'none',
              padding: '8px 16px',
              borderRadius: 20,
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: 13,
              display: 'flex',
              alignItems: 'center',
              transition: 'all 0.2s',
            }}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
            {tab === 'requests' && allRequests.length > 0 && (
              <span style={{ marginLeft: 8, background: '#ff4d6d', color: '#fff', padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 700 }}>
                {allRequests.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Page Cards */}
      {activeTab === 'pages' && pages.map((page) => (
        <div
          key={page.id}
          style={{
            position: 'relative',
            background: '#0c0c0c',
            borderRadius: 20,
            padding: 16,
            border: '0.5px solid #2a2a2a',
            marginBottom: 16,
            overflow: 'hidden',
          }}
        >
          {/* Rich Gradient Banner */}
          <div style={{
            position: 'absolute',
            top: 0, left: 0, right: 0,
            height: '40px',
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1))',
            borderBottom: '0.5px solid rgba(255,255,255,0.05)',
            zIndex: 0
          }} />

          <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
            <div
              style={{ display: 'flex', gap: 12, cursor: 'pointer', flex: 1, minWidth: 0, marginTop: 4 }}
              onClick={() => onViewPage(page.id)}
            >
              <Avatar name={page.avatar} size="lg" />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <h3 style={{ fontWeight: 700, fontSize: 16, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{page.name}</h3>
                  {page.isVerified && (
                    <span style={{ background: '#3b82f6', color: '#fff', fontSize: 10, padding: '2px 8px', borderRadius: 12 }}>
                      ✓ Verified
                    </span>
                  )}
                </div>
                <p style={{ color: '#8a8a8a', fontSize: 13, margin: '4px 0' }}>{page.category}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 16px', marginTop: 8 }}>
                  <span style={{ fontSize: 13, color: '#aaa' }}>👥 {page.members.length.toLocaleString()} members</span>
                </div>
              </div>
            </div>
            <button style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 12, border: 'none', color: '#fff', padding: 6, cursor: 'pointer', marginTop: 4 }}>
              <MoreVertical size={16} />
            </button>
          </div>

          {/* Role badge and actions */}
          <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 12, marginTop: 14, paddingTop: 14, borderTop: '0.5px solid #2a2a2a' }}>
            {(() => {
              const myRole = page.members.find(m => m.userId === currentUserId)?.role;
              if (!myRole) return null;
              return (
                <span
                  style={{
                    background: myRole === 'admin' ? 'rgba(59, 130, 246, 0.2)' : myRole === 'editor' ? 'rgba(139, 92, 246, 0.2)' : myRole === 'moderator' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(107, 114, 128, 0.2)',
                    color: myRole === 'admin' ? '#60a5fa' : myRole === 'editor' ? '#a78bfa' : myRole === 'moderator' ? '#fbbf24' : '#9ca3af',
                    border: `1px solid ${myRole === 'admin' ? 'rgba(59, 130, 246, 0.3)' : myRole === 'editor' ? 'rgba(139, 92, 246, 0.3)' : myRole === 'moderator' ? 'rgba(245, 158, 11, 0.3)' : 'rgba(107, 114, 128, 0.3)'}`,
                    padding: '4px 12px',
                    borderRadius: 20,
                    fontSize: 11,
                    fontWeight: 600,
                    textTransform: 'capitalize',
                  }}
                >
                  {myRole}
                </span>
              );
            })()}
            <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
              <button
                onClick={() => onViewPage(page.id)}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(10px)',
                  border: '0.5px solid rgba(255,255,255,0.1)',
                  color: '#fff',
                  padding: '6px 14px',
                  borderRadius: 20,
                  cursor: 'pointer',
                  fontSize: 12,
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  transition: 'all 0.2s ease'
                }}
                onMouseDown={e => e.currentTarget.style.transform = 'scale(0.95)'}
                onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                <Users size={14} />
                Manage
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* Requests Tab */}
      {activeTab === 'requests' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {allRequests.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 64, height: 64, borderRadius: 32, background: 'rgba(255,255,255,0.05)', display: 'grid', placeItems: 'center', color: '#666' }}>
                <Inbox size={28} />
              </div>
              <h3 style={{ margin: 0, fontWeight: 600, fontSize: 16 }}>No Requests</h3>
              <p style={{ margin: 0, color: '#666', fontSize: 13 }}>You don't have any pending join requests.</p>
            </div>
          ) : (
            allRequests.map(({ page, userId }) => {
              const u = users.find(user => user.id === userId);
              if (!u) return null;
              return (
                <div key={`${page.id}-${userId}`} style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#0c0c0c', padding: 14, borderRadius: 16, border: '0.5px solid #2a2a2a' }}>
                  <Avatar name={u.name} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: '#fff' }}>{u.name}</div>
                    <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>Requested to join <strong style={{ color: '#aaa' }}>{page.name}</strong></div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => acceptJoinRequest(page.id, userId, currentUserId)}
                      style={{ width: 36, height: 36, borderRadius: 18, background: '#3b82f6', border: 'none', color: '#fff', cursor: 'pointer', display: 'grid', placeItems: 'center' }}
                      onMouseDown={e => e.currentTarget.style.transform = 'scale(0.92)'}
                      onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                    >
                      <Check size={18} />
                    </button>
                    <button
                      onClick={() => rejectJoinRequest(page.id, userId, currentUserId)}
                      style={{ width: 36, height: 36, borderRadius: 18, background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', cursor: 'pointer', display: 'grid', placeItems: 'center' }}
                      onMouseDown={e => e.currentTarget.style.transform = 'scale(0.92)'}
                      onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Invites Tab Empty State */}
      {activeTab === 'invites' && (
        <div style={{ textAlign: 'center', padding: '60px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 64, height: 64, borderRadius: 32, background: 'rgba(255,255,255,0.05)', display: 'grid', placeItems: 'center', color: '#666' }}>
            <Inbox size={28} />
          </div>
          <h3 style={{ margin: 0, fontWeight: 600, fontSize: 16 }}>No Invites</h3>
          <p style={{ margin: 0, color: '#666', fontSize: 13 }}>When you receive new invites, they will appear here.</p>
        </div>
      )}
    </div>
  );
}
