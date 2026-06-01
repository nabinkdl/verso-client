import { User, Post, Chat } from './types';

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
  caption: `minimal black & white ${i + 1}`,
  imageUrl: makePostImage(`NO.${i + 1}`),
  imageAlt: `Minimal black and white post ${i + 1}`,
  likes: [(i + 1) % 3 === 0 ? 'u3' : 'u1'],
  comments: [{ userId: 'u2', text: 'nice!' }],
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
