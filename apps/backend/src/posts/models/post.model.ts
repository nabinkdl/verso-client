import { Prisma } from '../../generated/prisma/client.js';

export const POST_AUTHOR_SELECT = {
  id: true,
  username: true,
  name: true,
  avatarUrl: true,
} satisfies Prisma.UserSelect;

export const COMMENT_AUTHOR_SELECT = {
  id: true,
  username: true,
  name: true,
  avatarUrl: true,
} satisfies Prisma.UserSelect;

export const postInclude = (viewerId?: string) =>
  ({
    author: { select: POST_AUTHOR_SELECT },
    _count: { select: { likes: true, comments: true } },
    likes: { where: { userId: viewerId ?? '' }, select: { userId: true } },
  }) satisfies Prisma.PostInclude;

export type PostWithRelations = Prisma.PostGetPayload<{
  include: ReturnType<typeof postInclude>;
}>;
