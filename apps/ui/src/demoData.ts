import type { AdminUser, ChatMessage, ChatUser, Conversation, Post } from './types';

export const makePostImage = (seed: string, hue = '6a6a6a') => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="900" height="900" viewBox="0 0 900 900">
      <defs>
        <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#f2f2f2"/>
          <stop offset="45%" stop-color="#${hue}"/>
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

export const initialPosts: Post[] = [
  // Verso Community posts
  {
    id: 'post1',
    authorId: 'u1',
    pageId: 'page1',
    caption: 'Welcome to the Verso Community! We are so excited to launch this space for tech enthusiasts and creators. Looking forward to building something amazing together.',
    imageUrl: makePostImage('VERSO', '3b82f6'),
    imageAlt: 'Verso Community launch post',
    likes: ['u2', 'u3', 'u4', 'u5'],
    comments: [
      { id: 'c1a', userId: 'u2', text: 'So excited to be here! 🚀' },
      { id: 'c1b', userId: 'u3', text: 'Welcome to everyone joining today!' },
    ],
    createdAt: Date.now() - 86400000 * 2,
  },
  {
    id: 'post2',
    authorId: 'u2',
    pageId: 'page1',
    caption: 'Just shipped a new feature using Rust and WebAssembly. The performance gains are insane — 3x faster than our previous JS implementation. Happy to share learnings if anyone is interested!',
    imageUrl: makePostImage('RUST+WASM', 'f59e0b'),
    imageAlt: 'Rust and WebAssembly code snippet',
    likes: ['u1', 'u5', 'u7'],
    comments: [
      { id: 'c2a', userId: 'u1', text: 'Would love a deep dive on this!' },
    ],
    createdAt: Date.now() - 86400000 * 1.5,
  },
  {
    id: 'post3',
    authorId: 'u3',
    pageId: 'page1',
    caption: 'Reminder: Our community call is happening this Friday at 5 PM. Bring your projects and questions!',
    imageUrl: makePostImage('CALL', '8b5cf6'),
    imageAlt: 'Community call reminder',
    likes: ['u2', 'u4'],
    comments: [],
    createdAt: Date.now() - 86400000 * 0.8,
  },
  // Design Collective posts
  {
    id: 'post4',
    authorId: 'u4',
    pageId: 'page2',
    caption: 'Been exploring brutalist web design this week. There is something powerful about raw, unpolished aesthetics that just works.',
    imageUrl: makePostImage('BRUTAL', 'dc2626'),
    imageAlt: 'Brutalist design exploration',
    likes: ['u1', 'u3', 'u6', 'u7', 'u8'],
    comments: [
      { id: 'c4a', userId: 'u5', text: 'Love this direction!' },
      { id: 'c4b', userId: 'u3', text: 'The contrast is incredible.' },
    ],
    createdAt: Date.now() - 86400000 * 3,
  },
  {
    id: 'post5',
    authorId: 'u5',
    pageId: 'page2',
    caption: 'Typography is the backbone of good design. Spent the morning refactoring our design system — always amazed how much small kerning adjustments change the whole feel.',
    imageUrl: makePostImage('TYPO', '059669'),
    imageAlt: 'Typography design system',
    likes: ['u1', 'u2', 'u4'],
    comments: [
      { id: 'c5a', userId: 'u1', text: 'Type matters so much more than people think.' },
    ],
    createdAt: Date.now() - 86400000 * 2.2,
  },
  // Creative Writing Club posts
  {
    id: 'post6',
    authorId: 'u2',
    pageId: 'page3',
    caption: 'This week prompt: "The last door." Write whatever comes to mind — no rules, no limits. Share your pieces in the comments!',
    imageUrl: makePostImage('WRITE', '7c3aed'),
    imageAlt: 'Writing prompt illustration',
    likes: ['u1', 'u3', 'u6', 'u8'],
    comments: [
      { id: 'c6a', userId: 'u3', text: 'Here is my piece: It was wooden, old, and it would not open no matter how hard I pushed. But the warmth behind it...' },
      { id: 'c6b', userId: 'u8', text: 'Beautiful prompt!' },
    ],
    createdAt: Date.now() - 86400000 * 1,
  },
  // Global Travelers posts
  {
    id: 'post7',
    authorId: 'u7',
    pageId: 'page4',
    caption: 'Just returned from a 3-week backpacking trip through Patagonia. The landscapes are otherworldly — words do not do it justice.',
    imageUrl: makePostImage('PATAGONIA', '0369a1'),
    imageAlt: 'Patagonia landscape',
    likes: ['u1', 'u2', 'u4', 'u5', 'u6', 'u8'],
    comments: [
      { id: 'c7a', userId: 'u1', text: 'Add it to my bucket list immediately.' },
      { id: 'c7b', userId: 'u5', text: 'What gear did you bring?' },
      { id: 'c7c', userId: 'u7', text: '@jsmith: Osprey pack, Merino layers, and a good tent. Happy to share a full gear list!' },
    ],
    createdAt: Date.now() - 86400000 * 4,
  },
  {
    id: 'post8',
    authorId: 'u8',
    pageId: 'page4',
    caption: 'Pro tip for Tokyo: skip the tourist traps and head to Yanaka. The old-town charm, incredible coffee, and zero crowds. This neighborhood is a hidden gem.',
    imageUrl: makePostImage('YANAKA', 'be185d'),
    imageAlt: 'Yanaka neighborhood Tokyo',
    likes: ['u1', 'u3', 'u7'],
    comments: [
      { id: 'c8a', userId: 'u7', text: 'Bookmarked for my next trip!' },
    ],
    createdAt: Date.now() - 86400000 * 5.5,
  },
  // Standalone / home feed posts
  {
    id: 'post9',
    authorId: 'u6',
    pageId: undefined,
    caption: 'Morning light hits different in autumn. Took this on my walk to work.',
    imageUrl: makePostImage('AUTUMN', 'd97706'),
    imageAlt: 'Autumn morning light',
    likes: ['u1', 'u2', 'u3', 'u4', 'u5'],
    comments: [
      { id: 'c9a', userId: 'u1', text: 'This is stunning!' },
      { id: 'c9b', userId: 'u2', text: 'The composition is perfect.' },
    ],
    createdAt: Date.now() - 3600000 * 6,
  },
  {
    id: 'post10',
    authorId: 'u1',
    pageId: undefined,
    caption: 'Black and white minimal series. Sometimes less really is more.',
    imageUrl: makePostImage('B&W 01', '525252'),
    imageAlt: 'Minimal black and white photograph',
    likes: ['u3', 'u7'],
    comments: [{ id: 'c10a', userId: 'u2', text: 'clean.' }],
    createdAt: Date.now() - 3600000 * 3,
  },
  {
    id: 'post11',
    authorId: 'u3',
    pageId: undefined,
    caption: 'Spent the weekend learning watercolor. Definitely not my strength but it was incredibly relaxing.',
    imageUrl: makePostImage('WATER', '0891b2'),
    imageAlt: 'Watercolor painting attempt',
    likes: ['u1', 'u5'],
    comments: [],
    createdAt: Date.now() - 3600000 * 1,
  },
  {
    id: 'post12',
    authorId: 'u9',
    pageId: undefined,
    caption: 'Just finished reading "Project Hail Mary" — one of the best sci-fi books I have ever picked up. The pacing, the humor, the science. Andy Weir did it again.',
    imageUrl: makePostImage('PHM', 'dc2626'),
    imageAlt: 'Project Hail Mary book cover',
    likes: ['u1', 'u3', 'u7', 'u10'],
    comments: [
      { id: 'c12a', userId: 'u1', text: 'The soundtrack in the audiobook is incredible.' },
      { id: 'c12b', userId: 'u10', text: 'Fist my bump!' },
    ],
    createdAt: Date.now() - 3600000 * 2,
  },
  {
    id: 'post13',
    authorId: 'u10',
    pageId: undefined,
    caption: 'Built my first mechanical keyboard from scratch. Holy Panda switches, brass plate, GMK keycaps. It sounds like rain on a tin roof.',
    imageUrl: makePostImage('KEYS', '0369a1'),
    imageAlt: 'Custom mechanical keyboard',
    likes: ['u1', 'u2', 'u5', 'u11'],
    comments: [
      { id: 'c13a', userId: 'u5', text: 'Holy Pandas are endgame.' },
    ],
    createdAt: Date.now() - 3600000 * 8,
  },
  {
    id: 'post14',
    authorId: 'u11',
    pageId: undefined,
    caption: 'Does anyone else organize their entire music library by genre and mood? Or am I the only one with 47 meticulously curated playlists?',
    imageUrl: makePostImage('PLAYLISTS', '7c3aed'),
    imageAlt: 'Music playlist organization',
    likes: ['u3', 'u6', 'u9', 'u12'],
    comments: [
      { id: 'c14a', userId: 'u3', text: 'I have 62. You are not alone.' },
      { id: 'c14b', userId: 'u12', text: 'Drop your top 3 playlists!' },
    ],
    createdAt: Date.now() - 86400000 * 0.5,
  },
  {
    id: 'post15',
    authorId: 'u12',
    pageId: undefined,
    caption: 'Golden hour hike at Mount Rainier. No filter needed.',
    imageUrl: makePostImage('RAINIER', 'd97706'),
    imageAlt: 'Mount Rainier golden hour',
    likes: ['u1', 'u2', 'u4', 'u7', 'u9'],
    comments: [
      { id: 'c15a', userId: 'u7', text: 'This is breathtaking.' },
      { id: 'c15b', userId: 'u4', text: 'What trail did you take?' },
    ],
    createdAt: Date.now() - 86400000 * 0.3,
  },
  // More Design Collective posts
  {
    id: 'post16',
    authorId: 'u6',
    pageId: 'page2',
    caption: 'Made a moodboard for a client project. Going for a warm, retro-futuristic vibe with muted earth tones and neon accents.',
    imageUrl: makePostImage('MOOD', 'be185d'),
    imageAlt: 'Retro-futuristic moodboard',
    likes: ['u4', 'u5', 'u1'],
    comments: [],
    createdAt: Date.now() - 86400000 * 1.2,
  },
  {
    id: 'post17',
    authorId: 'u4',
    pageId: 'page2',
    caption: 'New icon set I have been working on — 240 icons, consistent 2px stroke, pixel-perfect at every size.',
    imageUrl: makePostImage('ICONS', '059669'),
    imageAlt: 'Custom icon set preview',
    likes: ['u1', 'u5', 'u6', 'u10'],
    comments: [
      { id: 'c17a', userId: 'u1', text: 'Will these be available for the community?' },
    ],
    createdAt: Date.now() - 86400000 * 0.7,
  },
  // More Creative Writing Club posts
  {
    id: 'post18',
    authorId: 'u8',
    pageId: 'page3',
    caption: 'Just published my first short story on Substack. Its a speculative fiction piece about AI consciousness. Feedback would mean the world to me.',
    imageUrl: makePostImage('AI STORY', '7c3aed'),
    imageAlt: 'Short story cover art',
    likes: ['u2', 'u3', 'u6', 'u11'],
    comments: [
      { id: 'c18a', userId: 'u3', text: 'Link please! Would love to read it.' },
      { id: 'c18b', userId: 'u2', text: 'So proud of you! This is huge.' },
    ],
    createdAt: Date.now() - 86400000 * 1.8,
  },
  // More Global Travelers posts
  {
    id: 'post19',
    authorId: 'u5',
    pageId: 'page4',
    caption: 'Three countries, two weeks, one backpack. My Southeast Asia itinerary — Bangkok → Chiang Mai → Luang Prabang → Hanoi.',
    imageUrl: makePostImage('SEA', '0369a1'),
    imageAlt: 'Southeast Asia travel collage',
    likes: ['u1', 'u4', 'u7', 'u8', 'u9'],
    comments: [
      { id: 'c19a', userId: 'u1', text: 'Luang Prabang is pure magic.' },
      { id: 'c19b', userId: 'u7', text: 'Did you take the slow boat?' },
    ],
    createdAt: Date.now() - 86400000 * 2.5,
  },
  {
    id: 'post20',
    authorId: 'u12',
    pageId: 'page4',
    caption: 'The Northern Lights in Tromsø. Words cannot describe what it feels like to watch the sky dance in green and purple.',
    imageUrl: makePostImage('AURORA', '6366f1'),
    imageAlt: 'Northern Lights in Tromsø',
    likes: ['u1', 'u3', 'u4', 'u7', 'u10', 'u11'],
    comments: [
      { id: 'c20a', userId: 'u3', text: 'Bucket list item right there.' },
      { id: 'c20b', userId: 'u1', text: 'What time of year did you go?' },
    ],
    createdAt: Date.now() - 86400000 * 6,
  },
  // Verso Community posts
  {
    id: 'post21',
    authorId: 'u9',
    pageId: 'page1',
    caption: 'Built a real-time collaborative whiteboard using CRDTs. No merge conflicts, no save buttons, just seamless collaboration.',
    imageUrl: makePostImage('CRDT', '3b82f6'),
    imageAlt: 'Collaborative whiteboard architecture',
    likes: ['u1', 'u2', 'u5', 'u10'],
    comments: [
      { id: 'c21a', userId: 'u1', text: 'Yjs or Automerge?' },
      { id: 'c21b', userId: 'u9', text: 'Yjs! Love the performance.' },
    ],
    createdAt: Date.now() - 86400000 * 0.9,
  },
  {
    id: 'post22',
    authorId: 'u10',
    pageId: 'page1',
    caption: 'Ideal weekend setup: Terminal, Neovim, a good playlist, and no meetings.',
    imageUrl: makePostImage('DEV SETUP', '525252'),
    imageAlt: 'Developer workspace setup',
    likes: ['u1', 'u3', 'u6', 'u9', 'u11'],
    comments: [
      { id: 'c22a', userId: 'u1', text: 'What terminal emulator is that?' },
    ],
    createdAt: Date.now() - 86400000 * 0.4,
  },
];

export const DEMO_EMAIL = 'alex@mononet.dev';
export const DEMO_PASSWORD = 'Password123!';

const ALL_PERMISSIONS = [
  'read', 'post', 'comment', 'like', 'edit_own', 'edit_any', 'delete_any',
  'follow', 'dm', 'mention', 'suspend', 'ban', 'view_reports', 'pin_posts',
  'manage_roles', 'manage_perms', 'analytics', 'settings', 'audit_log',
];

export const DEMO_USER: AdminUser = {
  id: 'u1',
  name: 'Alex Morgan',
  username: 'alexm',
  email: DEMO_EMAIL,
  followers: ['u2', 'u3', 'u5', 'u9', 'u11', 'u13', 'u14'],
  following: ['u3', 'u7', 'u10', 'u12', 'u15'],
  role: 'admin',
  status: 'active',
  joinedAt: Date.now() - 86400000 * 180,
  permissions: ALL_PERMISSIONS,
};

const demoChatUsers: Record<string, ChatUser> = {
  u1: { id: 'u1', username: 'alexm', name: 'Alex Morgan' },
  u2: { id: 'u2', username: 'jamieL', name: 'Jamie Lin' },
  u3: { id: 'u3', username: 'tray', name: 'Taylor Ray' },
  u5: { id: 'u5', username: 'jsmith', name: 'Jordan Smith' },
  u7: { id: 'u7', username: 'morgs', name: 'Morgan Lee' },
  u9: { id: 'u9', username: 'srivera', name: 'Sam Rivera' },
  u10: { id: 'u10', username: 'averyc', name: 'Avery Chen' },
  u12: { id: 'u12', username: 'blaket', name: 'Blake Turner' },
};

function demoChatUser(id: string): ChatUser {
  return demoChatUsers[id] ?? { id, username: id, name: 'Verso user' };
}

function demoMessage(
  conversationId: string,
  senderId: string,
  text: string,
  minutesAgo: number,
): ChatMessage {
  return {
    id: `demo-msg-${conversationId}-${senderId}-${minutesAgo}`,
    conversationId,
    senderId,
    text,
    editedAt: null,
    deleted: false,
    createdAt: new Date(Date.now() - minutesAgo * 60_000).toISOString(),
    sender: demoChatUser(senderId),
    replyTo: null,
  };
}

const demoChatSeeds: Array<{ id: string; otherId: string; messages: ChatMessage[] }> = [
  {
    id: 'demo-chat-1',
    otherId: 'u2',
    messages: [
      demoMessage('demo-chat-1', 'u2', 'hey! how are you?', 300),
      demoMessage('demo-chat-1', 'u1', 'Doing great! Working on the new feature.', 288),
      demoMessage('demo-chat-1', 'u2', 'Nice! Need any help?', 240),
      demoMessage('demo-chat-1', 'u1', 'Actually yes, can you review the PR later?', 210),
    ],
  },
  {
    id: 'demo-chat-2',
    otherId: 'u3',
    messages: [
      demoMessage('demo-chat-2', 'u3', 'love your latest post', 120),
      demoMessage('demo-chat-2', 'u1', 'Thanks! Took a while to get right.', 108),
    ],
  },
  {
    id: 'demo-chat-3',
    otherId: 'u7',
    messages: [
      demoMessage('demo-chat-3', 'u7', 'Hey! I saw your message about the design system.', 1440),
      demoMessage('demo-chat-3', 'u1', 'Yes! Let me know when you have some time to chat.', 1380),
      demoMessage('demo-chat-3', 'u7', 'Tomorrow evening works for me!', 1200),
    ],
  },
  {
    id: 'demo-chat-4',
    otherId: 'u9',
    messages: [
      demoMessage('demo-chat-4', 'u9', 'Hey Alex! Loved your B&W series. Do you sell prints?', 720),
      demoMessage('demo-chat-4', 'u1', 'Thanks Sam! I have not set up a store yet but I am planning to.', 660),
    ],
  },
  {
    id: 'demo-chat-5',
    otherId: 'u10',
    messages: [
      demoMessage('demo-chat-5', 'u10', 'Great talk at the Verso meetup last night!', 960),
      demoMessage('demo-chat-5', 'u1', 'Really glad you found it useful!', 930),
      demoMessage('demo-chat-5', 'u10', 'Building a side project with Tauri and Svelte. Would love your feedback.', 900),
    ],
  },
];

export const initialDemoMessages: Record<string, ChatMessage[]> = Object.fromEntries(
  demoChatSeeds.map(({ id, messages }) => [id, messages]),
);

export const initialDemoConversations: Conversation[] = demoChatSeeds.map(
  ({ id, otherId, messages }) => {
    const last = messages[messages.length - 1] ?? null;
    return {
      id,
      type: 'DIRECT',
      participants: [demoChatUser('u1'), demoChatUser(otherId)],
      lastMessage: last,
      lastMessageAt: last?.createdAt ?? new Date().toISOString(),
      unreadCount: 0,
      createdAt: messages[0]?.createdAt ?? new Date().toISOString(),
    };
  },
);
