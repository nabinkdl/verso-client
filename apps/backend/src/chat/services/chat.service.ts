import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client.js';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import type { CreateConversationDto } from '../models/dto/create-conversation.dto.js';
import type { MarkReadDto } from '../models/dto/mark-read.dto.js';
import type { SendMessageDto } from '../models/dto/send-message.dto.js';
import {
  conversationInclude,
  mapConversation,
  mapMessage,
  messageInclude,
} from '../models/chat.models.js';

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}

  async listConversations(userId: string, query: PaginationQueryDto) {
    const rows = await this.prisma.conversation.findMany({
      where: { participants: { some: { userId, leftAt: null } } },
      include: conversationInclude,
      orderBy: [{ lastMessageAt: 'desc' }, { id: 'desc' }],
      take: query.limit + 1,
      ...(query.cursor ? { cursor: { id: query.cursor }, skip: 1 } : {}),
    });

    const hasMore = rows.length > query.limit;
    const page = hasMore ? rows.slice(0, query.limit) : rows;
    const unread = await this.unreadByConversation(
      userId,
      page.map((conversation) => conversation.id),
    );
    const data = page.map((conversation) =>
      mapConversation(conversation, unread.get(conversation.id) ?? 0),
    );

    return {
      data,
      meta: {
        nextCursor: hasMore ? (data.at(-1)?.id ?? null) : null,
        hasMore,
        limit: query.limit,
      },
    };
  }

  async getOrCreateDirect(userId: string, dto: CreateConversationDto) {
    const target = await this.resolveTarget(dto);

    if (target.id === userId) {
      throw new BadRequestException('You cannot start a conversation with yourself');
    }

    const directKey = [userId, target.id].sort().join(':');
    const existing = await this.prisma.conversation.findUnique({
      where: { directKey },
      include: conversationInclude,
    });

    if (existing) {
      return mapConversation(existing, 0);
    }

    try {
      const conversation = await this.prisma.conversation.create({
        data: {
          type: 'DIRECT',
          directKey,
          participants: {
            create: [{ userId }, { userId: target.id }],
          },
        },
        include: conversationInclude,
      });

      return mapConversation(conversation, 0);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        const raced = await this.prisma.conversation.findUnique({
          where: { directKey },
          include: conversationInclude,
        });

        if (raced) {
          return mapConversation(raced, 0);
        }
      }

      throw error;
    }
  }

  async getConversation(conversationId: string, userId: string) {
    const conversation = await this.findConversationForMember(conversationId, userId);
    const unread = await this.unreadByConversation(userId, [conversation.id]);

    return mapConversation(conversation, unread.get(conversation.id) ?? 0);
  }

  /** Membership check + conversation in a single query (no unread count). */
  async getConversationForMember(conversationId: string, userId: string) {
    const conversation = await this.findConversationForMember(conversationId, userId);
    return mapConversation(conversation, 0);
  }

  async listMessages(
    conversationId: string,
    userId: string,
    query: PaginationQueryDto,
  ) {
    await this.assertParticipant(conversationId, userId);

    const rows = await this.prisma.message.findMany({
      where: { conversationId, deletedAt: null },
      include: messageInclude,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: query.limit + 1,
      ...(query.cursor ? { cursor: { id: query.cursor }, skip: 1 } : {}),
    });

    const hasMore = rows.length > query.limit;
    const page = hasMore ? rows.slice(0, query.limit) : rows;
    const data = page.map(mapMessage).reverse();

    return {
      data,
      meta: {
        nextCursor: hasMore ? (data[0]?.id ?? null) : null,
        hasMore,
        limit: query.limit,
      },
    };
  }

  async createMessage(
    conversationId: string,
    senderId: string,
    dto: SendMessageDto,
  ) {
    await this.assertParticipant(conversationId, senderId);

    const text = dto.text?.trim();

    if (!text && !dto.mediaUrl) {
      throw new BadRequestException('Message must include text or media');
    }

    if (dto.replyToId) {
      const replyTo = await this.prisma.message.findFirst({
        where: { id: dto.replyToId, conversationId },
        select: { id: true },
      });

      if (!replyTo) {
        throw new NotFoundException('Reply target not found in this conversation');
      }
    }

    const created = await this.prisma.$transaction(async (tx) => {
      const message = await tx.message.create({
        data: {
          conversationId,
          senderId,
          text: text || null,
          mediaUrl: dto.mediaUrl || null,
          replyToId: dto.replyToId || null,
        },
        include: {
          ...messageInclude,
          conversation: {
            select: {
              participants: {
                where: { leftAt: null },
                select: { userId: true },
              },
            },
          },
        },
      });

      await tx.conversation.update({
        where: { id: conversationId },
        data: { lastMessageAt: message.createdAt },
      });

      return message;
    });

    return {
      message: mapMessage(created),
      participantIds: created.conversation.participants.map(
        (participant) => participant.userId,
      ),
    };
  }

  async markRead(conversationId: string, userId: string, dto: MarkReadDto) {
    await this.assertParticipant(conversationId, userId);

    let readAt = new Date();

    if (dto.messageId) {
      const message = await this.prisma.message.findFirst({
        where: { id: dto.messageId, conversationId },
        select: { createdAt: true },
      });

      if (!message) {
        throw new NotFoundException('Message not found in this conversation');
      }

      readAt = message.createdAt;
    }

    await this.prisma.conversationParticipant.update({
      where: { conversationId_userId: { conversationId, userId } },
      data: { lastReadAt: readAt },
    });

    return {
      conversationId,
      userId,
      lastReadAt: readAt.toISOString(),
      unreadCount: 0,
    };
  }

  async unreadCount(userId: string) {
    const [row] = await this.prisma.$queryRaw<
      Array<{ unreadMessages: number; unreadConversations: number }>
    >`
      SELECT
        COUNT(m.id)::int AS "unreadMessages",
        COUNT(DISTINCT CASE WHEN m.id IS NOT NULL THEN c.id END)::int AS "unreadConversations"
      FROM conversation_participants p
      JOIN conversations c ON c.id = p."conversationId"
      LEFT JOIN messages m
        ON m."conversationId" = c.id
       AND m."senderId" <> ${userId}
       AND m."deletedAt" IS NULL
       AND (p."lastReadAt" IS NULL OR m."createdAt" > p."lastReadAt")
      WHERE p."userId" = ${userId}
        AND p."leftAt" IS NULL
    `;

    return {
      count: row?.unreadMessages ?? 0,
      conversations: row?.unreadConversations ?? 0,
    };
  }

  async getParticipantIds(conversationId: string): Promise<string[]> {
    const participants = await this.prisma.conversationParticipant.findMany({
      where: { conversationId, leftAt: null },
      select: { userId: true },
    });

    return participants.map((participant) => participant.userId);
  }

  private async unreadByConversation(userId: string, ids: string[]) {
    if (ids.length === 0) {
      return new Map<string, number>();
    }

    const rows = await this.prisma.$queryRaw<
      Array<{ conversationId: string; unreadCount: number }>
    >`
      SELECT c.id AS "conversationId", COUNT(m.id)::int AS "unreadCount"
      FROM conversation_participants p
      JOIN conversations c ON c.id = p."conversationId"
      LEFT JOIN messages m
        ON m."conversationId" = c.id
       AND m."senderId" <> ${userId}
       AND m."deletedAt" IS NULL
       AND (p."lastReadAt" IS NULL OR m."createdAt" > p."lastReadAt")
      WHERE p."userId" = ${userId}
        AND p."leftAt" IS NULL
        AND c.id IN (${Prisma.join(ids)})
      GROUP BY c.id
    `;

    return new Map(
      rows.map((row) => [row.conversationId, Number(row.unreadCount)]),
    );
  }

  private async resolveTarget(dto: CreateConversationDto) {
    if (!dto.username && !dto.userId) {
      throw new BadRequestException('Provide a username or userId');
    }

    const target = dto.username
      ? await this.prisma.user.findUnique({
          where: { username: dto.username.trim().toLowerCase() },
          select: { id: true },
        })
      : await this.prisma.user.findUnique({
          where: { id: dto.userId },
          select: { id: true },
        });

    if (!target) {
      throw new NotFoundException('User not found');
    }

    return target;
  }

  private async findConversationForMember(
    conversationId: string,
    userId: string,
  ) {
    const conversation = await this.prisma.conversation.findFirst({
      where: {
        id: conversationId,
        participants: { some: { userId, leftAt: null } },
      },
      include: conversationInclude,
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    return conversation;
  }

  private async assertParticipant(conversationId: string, userId: string) {
    const participant = await this.prisma.conversationParticipant.findUnique({
      where: { conversationId_userId: { conversationId, userId } },
      select: { leftAt: true },
    });

    if (!participant || participant.leftAt) {
      throw new NotFoundException('Conversation not found');
    }
  }
}
