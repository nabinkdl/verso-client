import { useState } from 'react';
import { X, Crown } from 'lucide-react';
import Avatar from './Avatar';

import { Page, User } from '../types';
import { usePages } from '../contexts/PageContext';

interface MemberManagementModalProps {
  onClose: () => void;
  page: Page;
  users: User[];
  currentUserId: string;
  onUpdateMemberRole: (userId: string, role: any) => void;
  onRemoveMember: (userId: string) => void;
}

export default function MemberManagementModal({
  onClose,
  page,
  users,
  currentUserId,
  onUpdateMemberRole,
  onRemoveMember
}: MemberManagementModalProps) {
  const { inviteUser } = usePages();

  // Combine page members with global user data
  const members = page.members.map(pm => {
    const u = users.find(user => user.id === pm.userId);
    return {
      id: pm.userId,
      name: u?.name || 'Unknown User',
      username: u?.username || 'unknown',
      role: pm.role,
      joinedAt: pm.joinedAt,
      avatar: u?.name.charAt(0) || 'U',
    };
  });

  const [filter, setFilter] = useState<'all' | 'invite' | 'admin' | 'editor' | 'moderator' | 'member'>('all');

  const filteredMembers = filter === 'all' ? members : members.filter(m => m.role === filter);
  const nonMembers = users.filter(u => !page.members.some(pm => pm.userId === u.id));

  const roleColors = {
    admin: '#3b82f6',
    editor: '#8b5cf6',
    moderator: '#f59e0b',
    member: '#6b7280',
  };

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 60,
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
      }}
    >
      <div
        style={{
          width: '100%',
          height: '85%',
          background: '#0c0c0c',
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Drag Handle */}
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 12, paddingBottom: 4 }}>
          <div style={{ width: 40, height: 4, background: '#333', borderRadius: 2 }} />
        </div>

        {/* Header */}
        <div style={{ padding: '8px 20px 16px', borderBottom: '0.5px solid #2a2a2a' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontWeight: 700, fontSize: 18, margin: 0 }}>Members</h3>
              <p style={{ color: '#8a8a8a', fontSize: 12, margin: '4px 0 0' }}>{page.name} · {members.length} members</p>
            </div>
            <button
              onClick={onClose}
              style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}
            >
              <X size={24} />
            </button>
          </div>

          {/* Role filter tabs */}
          <div style={{ display: 'flex', gap: 6, marginTop: 12, overflowX: 'auto' }} className="hide-scrollbar">
            {['all', 'invite', 'admin', 'editor', 'moderator', 'member'].map((role) => (
              <button
                key={role}
                onClick={() => setFilter(role as any)}
                style={{
                  background: filter === role ? 'rgba(255,255,255,0.1)' : 'transparent',
                  color: filter === role ? '#fff' : '#8a8a8a',
                  border: '0.5px solid #333',
                  padding: '4px 14px',
                  borderRadius: 20,
                  fontSize: 12,
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                  whiteSpace: 'nowrap',
                }}
              >
                {role} {role === 'all' ? `(${members.length})` : role === 'invite' ? `(${nonMembers.length})` : ''}
              </button>
            ))}
          </div>
        </div>

        {/* Member list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filter === 'invite' ? (
              nonMembers.map(user => {
                const isInvited = page.invitedUsers?.includes(user.id);
                return (
                  <div key={user.id} style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 14, padding: '10px 12px', borderRadius: 14, background: '#111', border: '0.5px solid #262626' }}>
                    <Avatar name={user.name.charAt(0)} />
                    <div style={{ flex: 1, minWidth: 150 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontWeight: 600, fontSize: 14 }}>{user.name}</span>
                      </div>
                      <div style={{ color: '#8a8a8a', fontSize: 12, marginTop: 2 }}>@{user.username}</div>
                    </div>
                    <button
                      disabled={isInvited}
                      onClick={() => inviteUser(page.id, user.id, currentUserId)}
                      style={{
                        background: isInvited ? 'rgba(255,255,255,0.1)' : '#fff',
                        color: isInvited ? '#888' : '#000',
                        border: 'none',
                        padding: '6px 14px',
                        borderRadius: 20,
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: isInvited ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseDown={e => { if(!isInvited) e.currentTarget.style.transform = 'scale(0.96)' }}
                      onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                    >
                      {isInvited ? 'Invited' : 'Invite'}
                    </button>
                  </div>
                );
              })
            ) : (
              filteredMembers.map((member) => (
                <div
                  key={member.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 14,
                    padding: '10px 12px',
                    borderRadius: 14,
                    background: '#111',
                    border: '0.5px solid #262626',
                  }}
                >
                  <Avatar name={member.avatar} />
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 600, fontSize: 14 }}>{member.name}</span>
                      <span style={{ color: '#8a8a8a', fontSize: 12 }}>@{member.username}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                      <span
                        style={{
                          background: roleColors[member.role],
                          color: '#fff',
                          padding: '2px 10px',
                          borderRadius: 12,
                          fontSize: 10,
                          fontWeight: 600,
                          textTransform: 'capitalize',
                        }}
                      >
                        {member.role}
                      </span>
                      <span style={{ color: '#666', fontSize: 11 }}>Joined {member.joinedAt}</span>
                    </div>
                  </div>

                  {/* Action buttons based on role */}
                  <div style={{ display: 'flex', gap: 6, width: '100%', justifyContent: 'flex-end', marginTop: 4 }}>
                    {member.role !== 'admin' && (
                      <>
                        <button
                          onClick={() => onUpdateMemberRole(member.id, member.role === 'member' ? 'moderator' : member.role === 'moderator' ? 'editor' : 'admin')}
                          style={{
                            background: 'transparent',
                            border: '0.5px solid #333',
                            color: '#fff',
                            padding: '4px 10px',
                            borderRadius: 12,
                            fontSize: 11,
                            cursor: 'pointer',
                          }}
                        >
                          Promote
                        </button>
                        <button
                          onClick={() => onRemoveMember(member.id)}
                          style={{
                            background: 'transparent',
                            border: '0.5px solid #ff4d6d',
                            color: '#ff4d6d',
                            padding: '4px 10px',
                            borderRadius: 12,
                            fontSize: 11,
                            cursor: 'pointer',
                          }}
                        >
                          Remove
                        </button>
                      </>
                    )}
                    {member.role === 'admin' && (
                      <span style={{ color: '#666', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Crown size={14} color="#f59e0b" /> Owner
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}




