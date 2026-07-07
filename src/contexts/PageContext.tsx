import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Page, PageMember } from '../types';

interface PageContextType {
  pages: Page[];
  createPage: (name: string, category: string, description: string, visibility: string, currentUserId: string) => void;
  joinPage: (pageId: string, currentUserId: string) => void;
  acceptJoinRequest: (pageId: string, userId: string, currentUserId: string) => void;
  rejectJoinRequest: (pageId: string, userId: string, currentUserId: string) => void;
  inviteUser: (pageId: string, targetUserId: string, currentUserId: string) => void;
  acceptInvite: (pageId: string, currentUserId: string) => void;
  rejectInvite: (pageId: string, currentUserId: string) => void;
  updateMemberRole: (pageId: string, userId: string, role: PageMember['role'], currentUserId: string) => void;
  removeMember: (pageId: string, userId: string, currentUserId: string) => void;
}

const PageContext = createContext<PageContextType | undefined>(undefined);

export const usePages = () => {
  const context = useContext(PageContext);
  if (!context) {
    throw new Error('usePages must be used within a PageProvider');
  }
  return context;
};

interface PageProviderProps {
  children: ReactNode;
  initialPages: Page[];
}

export const PageProvider: React.FC<PageProviderProps> = ({ children, initialPages }) => {
  const [pages, setPages] = useState<Page[]>(initialPages);

  const createPage = (name: string, category: string, description: string, visibility: string, currentUserId: string) => {
    const newPage: Page = {
      id: `p${Date.now()}`,
      name,
      category,
      description,
      visibility,
      avatar: name.charAt(0).toUpperCase(),
      members: [{ userId: currentUserId, role: 'admin', joinedAt: new Date().toLocaleString('default', { month: 'short', year: 'numeric' }) }],
      isVerified: false,
    };
    setPages((prev) => [newPage, ...prev]);
  };

  const joinPage = (pageId: string, currentUserId: string) => {
    setPages(prev => prev.map(p => {
      if (p.id !== pageId) return p;
      if (p.members.find(m => m.userId === currentUserId)) return p;
      if (p.joinRequests?.includes(currentUserId)) return p;
      
      if (p.visibility === 'public') {
        return {
          ...p,
          members: [...p.members, { userId: currentUserId, role: 'member', joinedAt: new Date().toLocaleString('default', { month: 'short', year: 'numeric' }) }]
        };
      } else {
        return {
          ...p,
          joinRequests: [...(p.joinRequests || []), currentUserId]
        };
      }
    }));
  };

  const acceptJoinRequest = (pageId: string, userId: string, currentUserId: string) => {
    setPages(prev => prev.map(p => {
      if (p.id !== pageId) return p;
      const myRole = p.members.find(m => m.userId === currentUserId)?.role;
      if (myRole !== 'admin' && myRole !== 'editor') return p;
      
      return {
        ...p,
        joinRequests: (p.joinRequests || []).filter(id => id !== userId),
        members: [...p.members, { userId, role: 'member', joinedAt: new Date().toLocaleString('default', { month: 'short', year: 'numeric' }) }]
      };
    }));
  };

  const rejectJoinRequest = (pageId: string, userId: string, currentUserId: string) => {
    setPages(prev => prev.map(p => {
      if (p.id !== pageId) return p;
      const myRole = p.members.find(m => m.userId === currentUserId)?.role;
      if (myRole !== 'admin' && myRole !== 'editor') return p;
      
      return {
        ...p,
        joinRequests: (p.joinRequests || []).filter(id => id !== userId)
      };
    }));
  };

  const inviteUser = (pageId: string, targetUserId: string, currentUserId: string) => {
    setPages(prev => prev.map(p => {
      if (p.id !== pageId) return p;
      const myRole = p.members.find(m => m.userId === currentUserId)?.role;
      if (myRole !== 'admin' && myRole !== 'editor') return p;
      if (p.members.some(m => m.userId === targetUserId)) return p;
      if (p.invitedUsers?.includes(targetUserId)) return p;
      
      return {
        ...p,
        invitedUsers: [...(p.invitedUsers || []), targetUserId]
      };
    }));
  };

  const acceptInvite = (pageId: string, currentUserId: string) => {
    setPages(prev => prev.map(p => {
      if (p.id !== pageId) return p;
      if (!p.invitedUsers?.includes(currentUserId)) return p;
      
      return {
        ...p,
        invitedUsers: p.invitedUsers.filter(id => id !== currentUserId),
        members: [...p.members, { userId: currentUserId, role: 'member', joinedAt: new Date().toLocaleString('default', { month: 'short', year: 'numeric' }) }]
      };
    }));
  };

  const rejectInvite = (pageId: string, currentUserId: string) => {
    setPages(prev => prev.map(p => {
      if (p.id !== pageId) return p;
      if (!p.invitedUsers?.includes(currentUserId)) return p;
      
      return {
        ...p,
        invitedUsers: p.invitedUsers.filter(id => id !== currentUserId)
      };
    }));
  };

  const updateMemberRole = (pageId: string, userId: string, role: PageMember['role'], currentUserId: string) => {
    setPages(prev => prev.map(p => {
      if (p.id !== pageId) return p;
      const myRole = p.members.find(m => m.userId === currentUserId)?.role;
      if (myRole !== 'admin' && myRole !== 'editor') return p; // RBAC Check
      if (myRole === 'editor' && role === 'admin') return p; // Editor cannot promote to admin
      
      return {
        ...p,
        members: p.members.map(m => m.userId === userId ? { ...m, role } : m)
      };
    }));
  };

  const removeMember = (pageId: string, userId: string, currentUserId: string) => {
    setPages(prev => prev.map(p => {
      if (p.id !== pageId) return p;
      const myRole = p.members.find(m => m.userId === currentUserId)?.role;
      if (myRole !== 'admin' && myRole !== 'editor') return p; // RBAC Check
      
      return {
        ...p,
        members: p.members.filter(m => m.userId !== userId)
      };
    }));
  };

  return (
    <PageContext.Provider value={{ 
      pages, createPage, joinPage, acceptJoinRequest, rejectJoinRequest, 
      inviteUser, acceptInvite, rejectInvite,
      updateMemberRole, removeMember 
    }}>
      {children}
    </PageContext.Provider>
  );
};
