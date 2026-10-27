import { Prisma } from '../generated/prisma/client.js';

export const PUBLIC_USER_SELECT = {
  id: true,
  username: true,
  name: true,
  bio: true,
  avatarUrl: true,
  createdAt: true,
} satisfies Prisma.UserSelect;

export const PRIVATE_USER_SELECT = {
  ...PUBLIC_USER_SELECT,
  email: true,
} satisfies Prisma.UserSelect;

export type PublicUser = Prisma.UserGetPayload<{ select: typeof PUBLIC_USER_SELECT }>;
export type PrivateUser = Prisma.UserGetPayload<{ select: typeof PRIVATE_USER_SELECT }>;
