import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../generated/prisma/client.js';
import {
  buildPaginatedResult,
  type PaginatedResult,
} from '../common/dto/pagination-query.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type { CreateCommentDto } from './dto/create-comment.dto.js';
import type { CreatePostDto } from './dto/create-post.dto.js';
import type { QueryPostsDto } from './dto/query-posts.dto.js';
import type { UpdatePostDto } from './dto/update-post.dto.js';

const POST_AUTHOR_SELECT = {
  id: true,
  username: true,
  name: true,
  avatarUrl: true,
} satisfies Prisma.UserSelect;

const COMMENT_AUTHOR_SELECT = {
  id: true,
  username: true,
  name: true,
  avatarUrl: true,
} satisfies Prisma.UserSelect;

const postInclude = (viewerId?: string) =>
  ({
    author: { select: POST_AUTHOR_SELECT },
    _count: { select: { likes: true, comments: true } },
    likes: { where: { userId: viewerId ?? '' }, select: { userId: true } },
  }) satisfies Prisma.PostInclude;

type PostWithRelations = Prisma.PostGetPayload<{ include: ReturnType<typeof postInclude> }>;

@Injectable()
export class PostsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: QueryPostsDto, viewerId?: string) {
    const where: Prisma.PostWhereInput = {};

    if (query.author) {
      where.author = { username: query.author.trim().toLowerCase() };
    }

    if (query.q) {
      where.caption = { contains: query.q, mode: 'insensitive' };
    }

    return this.findPage(where, query.limit, query.cursor, viewerId);
  }

  async feed(userId: string, query: QueryPostsDto) {
    const where: Prisma.PostWhereInput = {
      OR: [
        { authorId: userId },
        { author: { followers: { some: { followerId: userId } } } },
      ],
    };

    return this.findPage(where, query.limit, query.cursor, userId);
  }

  async getById(postId: string, viewerId?: string) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      include: postInclude(viewerId),
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return this.mapPost(post, viewerId);
  }

  async create(userId: string, dto: CreatePostDto) {
    this.assertHasContent(dto);

    const post = await this.prisma.post.create({
      data: {
        authorId: userId,
        caption: dto.caption?.trim() ?? '',
        imageUrl: dto.imageUrl ?? null,
        imageAlt: dto.imageAlt ?? null,
        mediaUrl: dto.mediaUrl ?? null,
        mediaType: dto.mediaType ?? null,
      },
      include: postInclude(userId),
    });

    return this.mapPost(post, userId);
  }

  async update(postId: string, userId: string, dto: UpdatePostDto) {
    await this.assertPostOwner(postId, userId);

    const data: Prisma.PostUpdateInput = {};

    if (dto.caption !== undefined) {
      data.caption = dto.caption.trim();
    }
    if (dto.imageUrl !== undefined) {
      data.imageUrl = dto.imageUrl || null;
    }
    if (dto.imageAlt !== undefined) {
      data.imageAlt = dto.imageAlt || null;
    }
    if (dto.mediaUrl !== undefined) {
      data.mediaUrl = dto.mediaUrl || null;
    }
    if (dto.mediaType !== undefined) {
      data.mediaType = dto.mediaType;
    }

    const post = await this.prisma.post.update({
      where: { id: postId },
      data,
      include: postInclude(userId),
    });

    return this.mapPost(post, userId);
  }

  async remove(postId: string, userId: string) {
    await this.assertPostOwner(postId, userId);
    await this.prisma.post.delete({ where: { id: postId } });

    return { deleted: true };
  }

  async like(postId: string, userId: string) {
    await this.assertPostExists(postId);

    await this.prisma.like.upsert({
      where: { postId_userId: { postId, userId } },
      create: { postId, userId },
      update: {},
    });

    return {
      liked: true,
      likeCount: await this.prisma.like.count({ where: { postId } }),
    };
  }

  async unlike(postId: string, userId: string) {
    await this.assertPostExists(postId);

    await this.prisma.like.deleteMany({ where: { postId, userId } });

    return {
      liked: false,
      likeCount: await this.prisma.like.count({ where: { postId } }),
    };
  }

  async listComments(postId: string) {
    await this.assertPostExists(postId);

    return this.prisma.comment.findMany({
      where: { postId },
      include: { author: { select: COMMENT_AUTHOR_SELECT } },
      orderBy: { createdAt: 'asc' },
      take: 200,
    });
  }

  async addComment(postId: string, userId: string, dto: CreateCommentDto) {
    await this.assertPostExists(postId);

    return this.prisma.comment.create({
      data: { postId, authorId: userId, text: dto.text },
      include: { author: { select: COMMENT_AUTHOR_SELECT } },
    });
  }

  async removeComment(postId: string, commentId: string, userId: string) {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
      select: {
        id: true,
        postId: true,
        authorId: true,
        post: { select: { authorId: true } },
      },
    });

    if (!comment || comment.postId !== postId) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.authorId !== userId && comment.post.authorId !== userId) {
      throw new ForbiddenException('You cannot delete this comment');
    }

    await this.prisma.comment.delete({ where: { id: commentId } });

    return { deleted: true };
  }

  private async findPage(
    where: Prisma.PostWhereInput,
    limit: number,
    cursor: string | undefined,
    viewerId?: string,
  ): Promise<PaginatedResult<ReturnType<PostsService['mapPost']>>> {
    const rows = await this.prisma.post.findMany({
      where,
      include: postInclude(viewerId),
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });

    return buildPaginatedResult(
      rows.map((post) => this.mapPost(post, viewerId)),
      limit,
    );
  }

  private mapPost(post: PostWithRelations, viewerId?: string) {
    const { _count, likes, ...rest } = post;

    return {
      ...rest,
      likeCount: _count.likes,
      commentCount: _count.comments,
      likedByMe: likes.length > 0,
      isMine: Boolean(viewerId && rest.authorId === viewerId),
    };
  }

  private assertHasContent(dto: CreatePostDto): void {
    const hasCaption = Boolean(dto.caption?.trim());
    const hasMedia = Boolean(dto.imageUrl || dto.mediaUrl);

    if (!hasCaption && !hasMedia) {
      throw new BadRequestException('Post must include text, an image, or a video');
    }
  }

  private async assertPostExists(postId: string): Promise<void> {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      select: { id: true },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }
  }

  private async assertPostOwner(postId: string, userId: string): Promise<void> {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.authorId !== userId) {
      throw new ForbiddenException('You can only modify your own posts');
    }
  }
}
