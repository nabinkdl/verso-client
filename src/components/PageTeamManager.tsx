import { useState, useMemo } from 'react';
import { Search, Settings, Shield, ShieldAlert, Check, X, UserPlus } from 'lucide-react';
import { AdminRole, PermissionDef, Page, User } from '../types';
import Avatar from './Avatar';
import { usePages } from '../contexts/PageContext';

const PERMISSIONS: PermissionDef[] = [
  // Content (Blue)
  { id: 'read', label: 'Read Content', category: 'content', description: 'Can read posts and comments' },
  { id: 'post', label: 'Create Posts', category: 'content', description: 'Can create new posts' },
  { id: 'comment', label: 'Comment', category: 'content', description: 'Can comment on posts' },
  { id: 'like', label: 'Like & React', category: 'content', description: 'Can like posts' },
  { id: 'edit_own', label: 'Edit Own Content', category: 'content', description: 'Can edit own posts and comments' },
  { id: 'edit_any', label: 'Edit Any Content', category: 'content', description: 'Can edit any post or comment' },
  { id: 'delete_any', label: 'Delete Any Content', category: 'content', description: 'Can delete any post or comment' },
  // Social (Green)
  { id: 'follow', label: 'Follow Users', category: 'social', description: 'Can follow other users' },
  { id: 'dm', label: 'Direct Messages', category: 'social', description: 'Can send direct messages' },
  { id: 'mention', label: 'Mention Users', category: 'social', description: 'Can mention other users' },
  // Moderation (Amber)
  { id: 'suspend', label: 'Suspend Users', category: 'moderation', description: 'Can suspend users temporarily' },
  { id: 'ban', label: 'Ban Users', category: 'moderation', description: 'Can ban users permanently' },
  { id: 'view_reports', label: 'View Reports', category: 'moderation', description: 'Can view user reports' },
  { id: 'pin_posts', label: 'Pin Posts', category: 'moderation', description: 'Can pin posts to top' },
  // System (Purple)
  { id: 'manage_roles', label: 'Manage Roles', category: 'system', description: 'Can change user roles' },
  { id: 'manage_perms', label: 'Manage Permissions', category: 'system', description: 'Can edit individual permissions' },
  { id: 'analytics', label: 'View Analytics', category: 'system', description: 'Can view system analytics' },
  { id: 'settings', label: 'System Settings', category: 'system', description: 'Can access system settings' },
  { id: 'audit_log', label: 'View Audit Log', category: 'system', description: 'Can view security audit log' }
];

const TEMPLATES: Record<AdminRole, string[]> = {
  admin: ['read','post','comment','like','edit_own','edit_any','delete_any','follow','dm','mention','suspend','ban','view_reports','pin_posts','manage_roles','manage_perms','analytics','settings','audit_log'],
  editor: ['read','post','comment','like','edit_own','edit_any','delete_any','follow','dm','mention','view_reports','pin_posts'],
  moderator: ['read','post','comment','like','edit_own','edit_any','delete_any','follow','dm','mention','suspend','ban','view_reports','pin_posts'],
  member: ['read','post','comment','like','edit_own','follow','dm','mention'],
  guest: ['read'],
  custom: []
};

interface PageTeamManagerProps {
  page: Page;
  users: User[];
  currentUserId: string;
}

export default function PageTeamManager({ page, users, currentUserId }: PageTeamManagerProps) {
  const { updatePageMember, inviteUser, removeMember } = usePages();

  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState<AdminRole | 'all' | 'invite'>('all');
  
  // Modal state
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [modalRole, setModalRole] = useState<AdminRole>('member');
  const [modalPerms, setModalPerms] = useState<string[]>([]);
  
  const myRole = page.members.find(m => m.userId === currentUserId)?.role;
  const isSuperAdmin = myRole === 'admin';

  const members = useMemo(() => {
    return page.members.map(pm => {
      const u = users.find(user => user.id === pm.userId);
      return {
        ...pm,
        name: u?.name || 'Unknown User',
        username: u?.username || 'unknown',
        email: (u as any)?.email || '',
        permissions: pm.permissions || TEMPLATES[pm.role as AdminRole] || []
      };
    });
  }, [page.members, users]);

  const nonMembers = useMemo(() => {
    return users.filter(u => !page.members.some(pm => pm.userId === u.id));
  }, [page.members, users]);

  const filteredMembers = useMemo(() => {
    let result = members;
    if (filterRole !== 'all' && filterRole !== 'invite') {
      result = result.filter(m => m.role === filterRole);
    }
    if (search && filterRole !== 'invite') {
      const q = search.toLowerCase();
      result = result.filter(m => 
        m.name.toLowerCase().includes(q) || 
        m.username.toLowerCase().includes(q) || 
        m.email.toLowerCase().includes(q)
      );
    }
    return result;
  }, [members, filterRole, search]);

  const filteredNonMembers = useMemo(() => {
    if (!search) return nonMembers;
    const q = search.toLowerCase();
    return nonMembers.filter(u => u.name.toLowerCase().includes(q) || u.username.toLowerCase().includes(q));
  }, [nonMembers, search]);

  const stats = {
    total: members.length,
    admins: members.filter(u => u.role === 'admin').length,
    mods: members.filter(u => u.role === 'moderator' || u.role === 'editor').length,
    custom: members.filter(u => u.role === 'custom').length,
  };

  const handleOpenEdit = (userId: string) => {
    const member = members.find(m => m.userId === userId);
    if (!member) return;
    
    // Moderators/Editors cannot edit Admins
    if (!isSuperAdmin && member.role === 'admin') return;
    
    setEditingUserId(userId);
    setModalRole(member.role as AdminRole);
    setModalPerms([...member.permissions]);
  };

  const handleApplyTemplate = (role: AdminRole) => {
    if (role === 'custom') return;
    setModalRole(role);
    setModalPerms([...TEMPLATES[role]]);
  };

  const handleTogglePerm = (permId: string) => {
    setModalRole('custom');
    setModalPerms(prev => 
      prev.includes(permId) ? prev.filter(p => p !== permId) : [...prev, permId]
    );
  };

  const handleToggleCategory = (category: string, allInCat: string[]) => {
    setModalRole('custom');
    const hasAll = allInCat.every(p => modalPerms.includes(p));
    if (hasAll) {
      setModalPerms(prev => prev.filter(p => !allInCat.includes(p)));
    } else {
      setModalPerms(prev => Array.from(new Set([...prev, ...allInCat])));
    }
  };

  const handleSave = () => {
    if (!editingUserId) return;
    updatePageMember(page.id, editingUserId, modalRole, modalPerms, currentUserId);
    setEditingUserId(null);
  };

  const editingUserDisplay = useMemo(() => {
    if (!editingUserId) return null;
    return members.find(m => m.userId === editingUserId);
  }, [editingUserId, members]);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'transparent', color: '#fff', overflow: 'hidden' }}>
      
      {/* Stats Bar */}
      <div style={{ display: 'flex', gap: 12, padding: '0 0 16px', overflowX: 'auto' }} className="hide-scrollbar">
        <div style={{ background: 'rgba(139, 92, 246, 0.1)', padding: '12px 16px', borderRadius: 12, flex: 1, minWidth: 100, border: '1px solid rgba(139, 92, 246, 0.2)' }}>
          <div style={{ color: '#a78bfa', fontSize: 12, marginBottom: 4 }}>Invites</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#c4b5fd' }}>{page.invitedUsers?.length || 0}</div>
        </div>
        <div style={{ background: '#111', padding: '12px 16px', borderRadius: 12, flex: 1, minWidth: 100, border: '1px solid #222' }}>
          <div style={{ color: '#888', fontSize: 12, marginBottom: 4 }}>Total Members</div>
          <div style={{ fontSize: 24, fontWeight: 700 }}>{stats.total}</div>
        </div>
        <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '12px 16px', borderRadius: 12, flex: 1, minWidth: 100, border: '1px solid rgba(59, 130, 246, 0.2)' }}>
          <div style={{ color: '#60a5fa', fontSize: 12, marginBottom: 4 }}>Admins</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#3b82f6' }}>{stats.admins}</div>
        </div>
        <div style={{ background: 'rgba(139, 92, 246, 0.1)', padding: '12px 16px', borderRadius: 12, flex: 1, minWidth: 100, border: '1px solid rgba(139, 92, 246, 0.2)' }}>
          <div style={{ color: '#a78bfa', fontSize: 12, marginBottom: 4 }}>Mods/Editors</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#8b5cf6' }}>{stats.mods}</div>
        </div>
        <div style={{ background: 'rgba(236, 72, 153, 0.1)', padding: '12px 16px', borderRadius: 12, flex: 1, minWidth: 100, border: '1px solid rgba(236, 72, 153, 0.2)' }}>
          <div style={{ color: '#f472b6', fontSize: 12, marginBottom: 4 }}>Custom</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#ec4899' }}>{stats.custom}</div>
        </div>
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 12, flexDirection: 'column', marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }} className="hide-scrollbar">
          {(['invite', 'all', 'admin', 'moderator', 'editor', 'member', 'guest', 'custom'] as const).map(role => (
            <button
              key={role}
              onClick={() => setFilterRole(role)}
              style={{
                padding: '6px 14px',
                borderRadius: 20,
                border: filterRole === role ? 'none' : '1px solid #333',
                background: filterRole === role ? '#fff' : 'transparent',
                color: filterRole === role ? '#000' : '#888',
                fontWeight: 600,
                fontSize: 13,
                cursor: 'pointer',
                textTransform: 'capitalize',
                whiteSpace: 'nowrap'
              }}
            >
              {role} {role === 'all' ? `(${members.length})` : role === 'invite' ? `(${page.invitedUsers?.length || 0})` : ''}
            </button>
          ))}
        </div>
        
        <div style={{ position: 'relative' }}>
          <Search size={16} color="#666" style={{ position: 'absolute', left: 12, top: 12 }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users..."
            style={{
              width: '100%',
              padding: '10px 12px 10px 36px',
              background: '#111',
              border: '1px solid #222',
              borderRadius: 12,
              color: '#fff',
              fontSize: 14,
              boxSizing: 'border-box'
            }}
          />
        </div>
      </div>

      {/* Users List */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filterRole === 'invite' ? (
            filteredNonMembers.map(user => {
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
                  >
                    {isInvited ? 'Invited' : 'Invite'}
                  </button>
                </div>
              );
            })
          ) : (
            filteredMembers.map(m => {
              const canEdit = isSuperAdmin || m.role !== 'admin';
              return (
                <div key={m.userId} style={{ background: '#111', border: '1px solid #222', borderRadius: 16, padding: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
                  <Avatar name={m.name} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ fontWeight: 700, fontSize: 15, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.name}</div>
                      <div style={{ 
                        fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 10, textTransform: 'uppercase',
                        background: m.role === 'admin' ? 'rgba(59, 130, 246, 0.15)' : 
                                    (m.role === 'moderator' || m.role === 'editor') ? 'rgba(139, 92, 246, 0.15)' : 
                                    m.role === 'custom' ? 'rgba(236, 72, 153, 0.15)' : 'rgba(255, 255, 255, 0.1)',
                        color: m.role === 'admin' ? '#60a5fa' : 
                               (m.role === 'moderator' || m.role === 'editor') ? '#a78bfa' : 
                               m.role === 'custom' ? '#f472b6' : '#aaa',
                      }}>
                        {m.role}
                      </div>
                    </div>
                    <div style={{ color: '#888', fontSize: 13, marginTop: 4 }}>
                      @{m.username} {m.email && `• ${m.email}`}
                    </div>
                    <div style={{ color: '#666', fontSize: 12, marginTop: 6, display: 'flex', gap: 6, alignItems: 'center' }}>
                      <Shield size={12} />
                      {m.permissions.length} permissions
                    </div>
                  </div>
                  
                  {canEdit && m.userId !== currentUserId ? (
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        onClick={() => handleOpenEdit(m.userId)}
                        style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#ccc', width: 36, height: 36, borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                      >
                        <Settings size={18} />
                      </button>
                      <button
                        onClick={() => removeMember(page.id, m.userId, currentUserId)}
                        style={{ background: 'rgba(255,77,109,0.1)', border: 'none', color: '#ff4d6d', width: 36, height: 36, borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                      >
                        <X size={18} />
                      </button>
                    </div>
                  ) : (
                    <div style={{ color: '#444', fontSize: 12, fontStyle: 'italic' }}>{m.userId === currentUserId ? 'You' : 'Protected'}</div>
                  )}
                </div>
              );
            })
          )}
          
          {(filterRole === 'invite' ? filteredNonMembers : filteredMembers).length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#666' }}>
              No users found matching your criteria.
            </div>
          )}
        </div>
      </div>

      {/* Permission Editor Modal */}
      {editingUserId && editingUserDisplay && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
          <div style={{ background: '#111', height: '90%', borderTopLeftRadius: 24, borderTopRightRadius: 24, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 20px 12px', borderBottom: '1px solid #222' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Edit Permissions</h3>
                <div style={{ color: '#888', fontSize: 13, marginTop: 4 }}>Editing {editingUserDisplay.name}</div>
              </div>
              <button onClick={() => setEditingUserId(null)} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
              {/* Quick Templates */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#aaa', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>Quick Templates</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {(['admin', 'editor', 'moderator', 'member', 'guest'] as AdminRole[]).map(r => (
                    <button
                      key={r}
                      onClick={() => handleApplyTemplate(r)}
                      style={{
                        padding: '8px 16px',
                        borderRadius: 8,
                        background: modalRole === r ? 'rgba(255,255,255,0.1)' : 'transparent',
                        border: modalRole === r ? '1px solid #fff' : '1px solid #333',
                        color: modalRole === r ? '#fff' : '#888',
                        fontWeight: 600,
                        fontSize: 13,
                        cursor: 'pointer',
                        textTransform: 'capitalize'
                      }}
                    >
                      {r}
                    </button>
                  ))}
                  <div style={{ padding: '8px 16px', borderRadius: 8, border: '1px dashed #333', color: modalRole === 'custom' ? '#ec4899' : '#555', fontWeight: 600, fontSize: 13 }}>
                    Custom
                  </div>
                </div>
              </div>

              {/* Permissions List by Category */}
              {['content', 'social', 'moderation', 'system'].map(cat => {
                const catPerms = PERMISSIONS.filter(p => p.category === cat);
                const allInCat = catPerms.map(p => p.id);
                const hasAll = allInCat.every(p => modalPerms.includes(p));
                
                const catColors: Record<string, string> = {
                  content: '#3b82f6',
                  social: '#10b981',
                  moderation: '#f59e0b',
                  system: '#8b5cf6'
                };
                
                return (
                  <div key={cat} style={{ marginBottom: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: catColors[cat], textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        {cat}
                      </div>
                      <button
                        onClick={() => handleToggleCategory(cat, allInCat)}
                        style={{ background: 'none', border: 'none', color: '#aaa', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}
                      >
                        {hasAll ? 'Deselect All' : 'Select All'}
                      </button>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      {catPerms.map(perm => {
                        const isSelected = modalPerms.includes(perm.id);
                        return (
                          <div
                            key={perm.id}
                            onClick={() => handleTogglePerm(perm.id)}
                            style={{
                              background: isSelected ? 'rgba(255,255,255,0.05)' : 'transparent',
                              border: isSelected ? `1px solid ${catColors[cat]}` : '1px solid #333',
                              padding: 12,
                              borderRadius: 12,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: 12
                            }}
                          >
                            <div style={{ 
                              width: 20, height: 20, borderRadius: 6, 
                              border: isSelected ? `2px solid ${catColors[cat]}` : '2px solid #555',
                              background: isSelected ? catColors[cat] : 'transparent',
                              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2
                            }}>
                              {isSelected && <Check size={14} color="#000" />}
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, fontSize: 14, color: isSelected ? '#fff' : '#aaa' }}>{perm.label}</div>
                              <div style={{ fontSize: 11, color: '#666', marginTop: 4, lineHeight: 1.3 }}>{perm.description}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ padding: 20, borderTop: '1px solid #222', background: '#0a0a0a' }}>
              <button
                onClick={handleSave}
                style={{
                  width: '100%',
                  background: '#fff',
                  color: '#000',
                  border: 'none',
                  padding: 16,
                  borderRadius: 16,
                  fontWeight: 700,
                  fontSize: 16,
                  cursor: 'pointer'
                }}
              >
                Save Permissions
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
