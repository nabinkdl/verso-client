import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '../src/generated/prisma/client.js';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is required to run the seed script');
}

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

const DEMO_PASSWORD = 'Password123!';
const image = (seed: string) => `https://picsum.photos/seed/${seed}/900/900`;

const users = [
  {
    email: 'alex@mononet.dev',
    username: 'alexm',
    name: 'Alex Morgan',
    bio: 'Building Verso. Coffee, code, and long walks.',
    avatarUrl: image('alexm'),
  },
  {
    email: 'jamie@mononet.dev',
    username: 'jamiel',
    name: 'Jamie Lin',
    bio: 'Product designer focused on calm interfaces.',
    avatarUrl: image('jamiel'),
  },
  {
    email: 'taylor@mononet.dev',
    username: 'tray',
    name: 'Taylor Ray',
    bio: 'Photographer. Chasing light.',
    avatarUrl: image('tray'),
  },
  {
    email: 'casey@mononet.dev',
    username: 'caseyw',
    name: 'Casey Wong',
    bio: 'Frontend engineer and occasional runner.',
    avatarUrl: image('caseyw'),
  },
  {
    email: 'jordan@mononet.dev',
    username: 'jsmith',
    name: 'Jordan Smith',
    bio: 'Community builder at heart.',
    avatarUrl: image('jsmith'),
  },
  {
    email: 'riley@mononet.dev',
    username: 'rpark',
    name: 'Riley Park',
    bio: 'Music, markets, and mindful mornings.',
    avatarUrl: image('rpark'),
  },
];

const posts = [
  {
    authorUsername: 'alexm',
    caption:
      'Welcome to the Mononet community! This is the first post in our new space for creators and friends.',
    imageUrl: image('mononet-launch'),
    imageAlt: 'Mononet community launch',
  },
  {
    authorUsername: 'jamiel',
    caption: 'A quiet morning and a fresh sketchbook. What are you building today?',
    imageUrl: image('sketchbook'),
    imageAlt: 'Sketchbook on a desk',
  },
  {
    authorUsername: 'tray',
    caption: 'Golden hour never gets old.',
    imageUrl: image('golden-hour'),
    imageAlt: 'Sunset over the hills',
  },
  {
    authorUsername: 'caseyw',
    caption: 'Shipped a small accessibility fix today. Small wins matter.',
  },
  {
    authorUsername: 'jsmith',
    caption: 'Community meetup next Friday — bring a friend and a story.',
    imageUrl: image('meetup'),
    imageAlt: 'People at a community meetup',
  },
  {
    authorUsername: 'rpark',
    caption: 'Record shopping finds from the weekend.',
    imageUrl: image('records'),
    imageAlt: 'Vinyl records in a crate',
  },
  {
    authorUsername: 'alexm',
    caption: 'Working on the reels experience. Fast, full-screen, and tactile.',
  },
  {
    authorUsername: 'jamiel',
    caption: 'Design note: remove one thing from every screen before calling it done.',
    imageUrl: image('design-note'),
    imageAlt: 'Minimal design notes',
  },
];

const follows: Array<[string, string]> = [
  ['alexm', 'jamiel'],
  ['alexm', 'tray'],
  ['alexm', 'caseyw'],
  ['jamiel', 'alexm'],
  ['jamiel', 'tray'],
  ['tray', 'alexm'],
  ['tray', 'jsmith'],
  ['caseyw', 'alexm'],
  ['caseyw', 'rpark'],
  ['jsmith', 'alexm'],
  ['jsmith', 'jamiel'],
  ['rpark', 'alexm'],
];

const comments: Array<[postIndex: number, commenter: string, text: string]> = [
  [0, 'jamiel', 'So excited to be here!'],
  [0, 'tray', 'Great to see this live.'],
  [0, 'jsmith', 'The community is going to love this.'],
  [1, 'alexm', 'A sketchbook and coffee is the perfect combo.'],
  [1, 'caseyw', 'I am prototyping a feed layout today.'],
  [2, 'rpark', 'The colors in this are unreal.'],
  [3, 'alexm', 'Small wins add up. Nice work!'],
  [4, 'tray', 'Count me in.'],
  [5, 'jamiel', 'Any jazz in that crate?'],
  [7, 'alexm', 'This should be printed and framed.'],
];

async function main() {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);

  await prisma.like.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.follow.deleteMany();
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();

  await prisma.user.createMany({
    data: users.map((user) => ({ ...user, passwordHash })),
  });

  const storedUsers = await prisma.user.findMany({
    select: { id: true, username: true },
  });
  const userIds = new Map(storedUsers.map((user) => [user.username, user.id]));

  const storedPosts = await prisma.post.createManyAndReturn({
    data: posts.map(({ authorUsername, ...post }) => ({
      ...post,
      authorId: userIds.get(authorUsername)!,
    })),
    select: { id: true, authorId: true },
  });

  await prisma.follow.createMany({
    data: follows.map(([follower, following]) => ({
      followerId: userIds.get(follower)!,
      followingId: userIds.get(following)!,
    })),
  });

  await prisma.like.createMany({
    data: storedPosts.flatMap((post, postIndex) =>
      storedUsers
        .filter((user) => user.id !== storedPosts[postIndex]?.authorId)
        .filter((_, userIndex) => (postIndex + userIndex) % 3 !== 0)
        .map((user) => ({ postId: post.id, userId: user.id })),
    ),
  });

  await prisma.comment.createMany({
    data: comments.map(([postIndex, commenter, text]) => ({
      postId: storedPosts[postIndex]!.id,
      authorId: userIds.get(commenter)!,
      text,
    })),
  });

  console.log(`Seeded ${users.length} users and ${posts.length} posts.`);
  console.log(`Demo login: alex@mononet.dev / ${DEMO_PASSWORD}`);
}

main()
  .catch((error: unknown) => {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
