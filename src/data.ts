import { User, Post, Chat, NotificationItem, Page } from './types';

export const CURRENT_USER_ID = 'u1';

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

export const initialUsers: User[] = [
  { id: 'u1', name: 'Alex Morgan', username: 'alexm', followers: ['u2', 'u3', 'u5'], following: ['u3', 'u7'] },
  { id: 'u2', name: 'Jamie Lin', username: 'jamieL', followers: ['u1', 'u4'], following: ['u1'] },
  { id: 'u3', name: 'Taylor Ray', username: 'tray', followers: ['u1', 'u5', 'u6'], following: [] },
  { id: 'u4', name: 'Casey Wong', username: 'caseyw', followers: ['u2'], following: ['u5', 'u7'] },
  { id: 'u5', name: 'Jordan Smith', username: 'jsmith', followers: ['u3'], following: ['u1', 'u4'] },
  { id: 'u6', name: 'Riley Park', username: 'rpark', followers: [], following: ['u3'] },
  { id: 'u7', name: 'Morgan Lee', username: 'morgs', followers: ['u1', 'u4'], following: [] },
  { id: 'u8', name: 'Drew Kim', username: 'dkim', followers: [], following: ['u1', 'u2'] },
];

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
];

export const initialChats: Chat[] = [
  {
    id: 'chat1',
    participants: ['u1', 'u2'],
    messages: [
      { from: 'u2', text: 'hey! how are you?', timestamp: Date.now() - 3600000 * 5 },
      { from: 'u1', text: 'Doing great! Working on the new feature.', timestamp: Date.now() - 3600000 * 4.8 },
      { from: 'u2', text: 'Nice! Need any help?', timestamp: Date.now() - 3600000 * 4 },
      { from: 'u1', text: 'Actually yes, can you review the PR later?', timestamp: Date.now() - 3600000 * 3.5 },
    ],
    lastUpdated: Date.now() - 3600000 * 3.5,
  },
  {
    id: 'chat2',
    participants: ['u1', 'u3'],
    messages: [
      { from: 'u3', text: 'love your latest post', timestamp: Date.now() - 3600000 * 2 },
      { from: 'u1', text: 'Thanks! Took a while to get right.', timestamp: Date.now() - 3600000 * 1.8 },
    ],
    lastUpdated: Date.now() - 3600000 * 1.8,
  },
  {
    id: 'chat3',
    participants: ['u1', 'u7'],
    messages: [
      { from: 'u7', text: 'Hey! I saw your message about the design system.', timestamp: Date.now() - 86400000 },
      { from: 'u1', text: 'Yes! Let me know when you have some time to chat.', timestamp: Date.now() - 82800000 },
      { from: 'u7', text: 'Tomorrow evening works for me!', timestamp: Date.now() - 72000000 },
    ],
    lastUpdated: Date.now() - 72000000,
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
  {
    id: 'n4',
    title: 'Casey Wong commented on your post',
    message: '"The composition is perfect."',
    kind: 'comment',
    createdAt: Date.now() - 1000 * 60 * 120,
  },
  {
    id: 'n5',
    title: 'Jordan Smith liked your post',
    message: 'Your Patagonia travel post is getting popular.',
    kind: 'like',
    createdAt: Date.now() - 1000 * 60 * 240,
  },
  {
    id: 'n6',
    title: 'Morgan Lee commented',
    message: '"This direction is incredible, would love to collaborate."',
    kind: 'comment',
    createdAt: Date.now() - 1000 * 60 * 60 * 8,
  },
];

export const initialPages: Page[] = [
  {
    id: 'page1',
    name: 'Verso Community',
    category: 'Technology',
    description: 'A community for tech enthusiasts and creators. Share your projects, ask questions, and connect with fellow developers.',
    visibility: 'public',
    avatar: 'V',
    members: [
      { userId: CURRENT_USER_ID, role: 'admin', joinedAt: 'Jan 2024' },
      { userId: 'u2', role: 'moderator', joinedAt: 'Jan 2024' },
      { userId: 'u3', role: 'editor', joinedAt: 'Feb 2024' },
    ],
    joinRequests: ['u4', 'u5'],
    invitedUsers: [],
    isVerified: true,
    events: [
      {
        id: 'e1',
        title: 'Community Call #1',
        date: Date.now() + 86400000 * 3,
        description: 'Monthly community hangout — share what you are building and get feedback.',
      },
      {
        id: 'e2',
        title: 'Rust Workshop',
        date: Date.now() + 86400000 * 10,
        description: 'Hands-on Rust programming workshop for beginners and intermediates.',
      },
    ],
    rules: [
      'Be respectful and constructive in all discussions.',
      'No spam or self-promotion without prior approval.',
      'Help others whenever you can — that is what community is about.',
      'Share source code and resources generously.',
    ],
    analytics: { views: 4820, membersTrend: 14 },
  },
  {
    id: 'page2',
    name: 'Design Collective',
    category: 'Art & Design',
    description: 'A creative space for designers, illustrators, and visual artists. Share your work, give feedback, and grow together.',
    visibility: 'public',
    avatar: 'D',
    members: [
      { userId: 'u4', role: 'admin', joinedAt: 'Feb 2024' },
      { userId: CURRENT_USER_ID, role: 'editor', joinedAt: 'Feb 2024' },
      { userId: 'u5', role: 'member', joinedAt: 'Mar 2024' },
      { userId: 'u6', role: 'member', joinedAt: 'Apr 2024' },
    ],
    joinRequests: [],
    invitedUsers: ['u8'],
    isVerified: false,
    events: [
      {
        id: 'e3',
        title: 'Design Critique Session',
        date: Date.now() + 86400000 * 5,
        description: 'Bring your work in progress and get constructive feedback from the community.',
      },
    ],
    rules: [
      'Critique the work, not the person.',
      'Credit inspirations and references.',
      'Weekly challenges are optional but encouraged.',
    ],
    analytics: { views: 3210, membersTrend: 7 },
  },
  {
    id: 'page3',
    name: 'Creative Writing Club',
    category: 'Education',
    description: 'For writers of all levels. Weekly prompts, peer reviews, and a supportive community to help you grow.',
    visibility: 'public',
    avatar: 'C',
    members: [
      { userId: 'u2', role: 'admin', joinedAt: 'Jan 2024' },
      { userId: 'u3', role: 'editor', joinedAt: 'Mar 2024' },
      { userId: CURRENT_USER_ID, role: 'member', joinedAt: 'Apr 2024' },
      { userId: 'u8', role: 'member', joinedAt: 'May 2024' },
    ],
    joinRequests: [],
    invitedUsers: [],
    isVerified: false,
    events: [
      {
        id: 'e4',
        title: 'Weekly Writing Prompt',
        date: Date.now() + 86400000 * 7,
        description: 'This week: "The last door." Submit your piece by Sunday midnight.',
      },
    ],
    rules: [
      'Be kind with feedback — we are all learning.',
      'No posting full-length novels in the feed.',
      'Engage with at least two other writers per week.',
    ],
    analytics: { views: 1850, membersTrend: 3 },
  },
  {
    id: 'page4',
    name: 'Global Travelers',
    category: 'Travel',
    description: 'Explore the world together. Share itineraries, travel photos, and hidden gems from around the globe.',
    visibility: 'restricted',
    avatar: 'G',
    members: [
      { userId: 'u4', role: 'admin', joinedAt: 'Nov 2023' },
      { userId: 'u5', role: 'editor', joinedAt: 'Dec 2023' },
      { userId: 'u7', role: 'member', joinedAt: 'Jan 2024' },
    ],
    joinRequests: [CURRENT_USER_ID],
    invitedUsers: [],
    isVerified: true,
    rules: [
      'Photos must be your own or properly credited.',
      'No promotional content for travel agencies.',
      'Share honest reviews — the good and the bad.',
    ],
    analytics: { views: 6740, membersTrend: -2 },
  },
  {
    id: 'page5',
    name: 'Fitness & Wellness',
    category: 'Sports',
    description: 'Track your progress, share tips, and motivate each other. All fitness levels welcome.',
    visibility: 'public',
    avatar: 'F',
    members: [
      { userId: 'u6', role: 'admin', joinedAt: 'Oct 2023' },
      { userId: 'u7', role: 'member', joinedAt: 'Dec 2023' },
    ],
    joinRequests: [],
    invitedUsers: [],
    isVerified: false,
    rules: [
      'No medical advice — consult professionals for injury concerns.',
      'Support each other, do not judge.',
    ],
    analytics: { views: 2200, membersTrend: 5 },
  },
  {
    id: 'page6',
    name: 'Foodie Finds',
    category: 'Food',
    description: 'Recipes, restaurant recommendations, and food photography from around the world.',
    visibility: 'public',
    avatar: '🍳',
    members: [
      { userId: 'u3', role: 'admin', joinedAt: 'Sep 2023' },
      { userId: 'u8', role: 'editor', joinedAt: 'Nov 2023' },
    ],
    joinRequests: [],
    invitedUsers: [],
    isVerified: false,
    analytics: { views: 4100, membersTrend: 11 },
  },
];
