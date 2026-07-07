import { User, Post, Chat, NotificationItem, Page } from './types';

export const CURRENT_USER_ID = 'u1';

const makePostImage = (seed: string) => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="900" height="900" viewBox="0 0 900 900">
      <defs>
        <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#f2f2f2"/>
          <stop offset="45%" stop-color="#6a6a6a"/>
          <stop offset="100%" stop-color="#050505"/>
        </linearGradient>
      </defs>
      <rect width="900" height="900" fill="url(#g)"/>
      <circle cx="170" cy="180" r="92" fill="rgba(255,255,255,0.22)"/>
      <rect x="96" y="634" width="708" height="106" rx="53" fill="rgba(0,0,0,0.26)"/>
      <text x="96" y="592" fill="#ffffff" font-family="Arial, Helvetica, sans-serif" font-size="54" font-weight="700">${seed}</text>
    </svg>
  `.replace(/\s+/g, ' ').trim();

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

export const initialUsers: User[] = [
  { id: 'u1', name: 'Alex Morgan', username: 'alexm', followers: ['u2'], following: ['u3'] },
  { id: 'u2', name: 'Jamie Lin', username: 'jamieL', followers: [], following: ['u1'] },
  { id: 'u3', name: 'Taylor Ray', username: 'tray', followers: ['u1'], following: [] },
  { id: 'u4', name: 'Casey Wong', username: 'caseyw', followers: [], following: [] },
];

export const initialPosts: Post[] = Array.from({ length: 6 }, (_, i) => ({
  id: `p${i + 1}`,
  authorId: (i + 1) % 2 === 0 ? 'u2' : 'u1',
  pageId: i === 0 ? 'p1' : (i === 1 ? 'p2' : undefined),
  caption: i === 0 ? 'Welcome to the Verso Community! We are excited to start sharing our technology projects.' : `minimal black & white ${i + 1}`,
  imageUrl: makePostImage(`NO.${i + 1}`),
  imageAlt: `Minimal black and white post ${i + 1}`,
  likes: [(i + 1) % 3 === 0 ? 'u3' : 'u1'],
  comments: [{ id: `c${i + 1}`, userId: 'u2', text: 'nice!' }],
  createdAt: Date.now() - (i + 1) * 3600000,
}));

export const initialChats: Chat[] = [
  {
    id: 'chat1',
    participants: ['u1', 'u2'],
    messages: [{ from: 'u2', text: 'hey! how are you?', timestamp: Date.now() }],
    lastUpdated: Date.now(),
  },
  {
    id: 'chat2',
    participants: ['u1', 'u3'],
    messages: [{ from: 'u3', text: 'love your latest post', timestamp: Date.now() }],
    lastUpdated: Date.now(),
  },
];

export const initialNotifications: NotificationItem[] = [
  {
    id: 'n1',
    title: 'Jamie Lin liked your post',
    message: 'Your monochrome post is getting attention.',
    kind: 'like',
    createdAt: Date.now() - 1000 * 60 * 18,
  },
  {
    id: 'n2',
    title: 'Taylor Ray started following you',
    message: 'They are now following your profile updates.',
    kind: 'follow',
    createdAt: Date.now() - 1000 * 60 * 47,
  },
  {
    id: 'n3',
    title: 'A new reel is ready',
    message: 'Switch to the reels tab to watch short-form clips.',
    kind: 'reel',
    createdAt: Date.now() - 1000 * 60 * 78,
  },
];

export const initialPages: Page[] = [
  {
    id: 'p1',
    name: 'Verso Community',
    category: 'Technology',
    description: 'A community for tech enthusiasts and creators',
    visibility: 'public',
    avatar: 'V',
    members: [
      { userId: CURRENT_USER_ID, role: 'admin', joinedAt: 'Jan 2024' },
      { userId: 'u2', role: 'moderator', joinedAt: 'Jan 2024' },
      { userId: 'u3', role: 'editor', joinedAt: 'Feb 2024' }
    ],
    joinRequests: ['u4', 'u5'],
    isVerified: true,
  },
  {
    id: 'p2',
    name: 'Design Collective',
    category: 'Art & Design',
    description: 'For all things design and creativity',
    visibility: 'public',
    avatar: 'D',
    members: [
      { userId: 'u4', role: 'admin', joinedAt: 'Feb 2024' },
      { userId: CURRENT_USER_ID, role: 'editor', joinedAt: 'Feb 2024' },
      { userId: 'u5', role: 'member', joinedAt: 'Mar 2024' }
    ],
    joinRequests: [],
    isVerified: false,
  },
  {
    id: 'p3',
    name: 'Creative Writing Club',
    category: 'Education',
    description: 'Share your stories and get feedback from fellow writers.',
    visibility: 'public',
    avatar: 'C',
    members: [
      { userId: 'u2', role: 'admin', joinedAt: 'Jan 2024' },
      { userId: 'u3', role: 'editor', joinedAt: 'Mar 2024' },
      { userId: CURRENT_USER_ID, role: 'member', joinedAt: 'Apr 2024' }
    ],
    joinRequests: [],
    isVerified: false,
  },
  {
    id: 'p4',
    name: 'Global Travelers',
    category: 'Travel',
    description: 'Explore the world, share itineraries, and post travel photos.',
    visibility: 'restricted',
    avatar: 'G',
    members: [
      { userId: 'u4', role: 'admin', joinedAt: 'Nov 2023' },
      { userId: 'u5', role: 'editor', joinedAt: 'Dec 2023' }
    ],
    joinRequests: [],
    isVerified: true,
  },

];
