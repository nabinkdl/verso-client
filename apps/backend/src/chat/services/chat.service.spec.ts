import {
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import type { PrismaService } from '../../prisma/prisma.service.js';
import { ChatService } from './chat.service.js';

const conversationRow = {
  id: 'c1',
  type: 'DIRECT',
  directKey: 'u1:u2',
  lastMessageAt: new Date('2026-01-01T00:00:00.000Z'),
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  participants: [
    { user: { id: 'u1', username: 'alexm', name: 'Alex', avatarUrl: null } },
    { user: { id: 'u2', username: 'jamiel', name: 'Jamie', avatarUrl: null } },
  ],
  messages: [],
};

const messageRow = {
  id: 'm1',
  conversationId: 'c1',
  senderId: 'u1',
  text: 'hello',
  mediaUrl: null,
  replyToId: null,
  editedAt: null,
  deletedAt: null,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  sender: { id: 'u1', username: 'alexm', name: 'Alex', avatarUrl: null },
  replyTo: null,
  conversation: {
    participants: [{ userId: 'u1' }, { userId: 'u2' }],
  },
};

function createMocks() {
  const tx = {
    message: { create: vi.fn() },
    conversation: { update: vi.fn() },
  };

  const prisma = {
    conversation: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
    },
    conversationParticipant: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    message: { findFirst: vi.fn() },
    user: { findUnique: vi.fn() },
    $transaction: vi.fn(async (callback: (client: typeof tx) => unknown) =>
      callback(tx),
    ),
    $queryRaw: vi.fn(),
  };

  return { prisma, tx };
}

describe('ChatService', () => {
  let service: ChatService;
  let mocks: ReturnType<typeof createMocks>;

  beforeEach(() => {
    mocks = createMocks();
    service = new ChatService(mocks.prisma as unknown as PrismaService);
  });

  it('refuses to send a message to a conversation you are not in', async () => {
    mocks.prisma.conversationParticipant.findUnique.mockResolvedValue(null);

    await expect(
      service.createMessage('c1', 'u9', { text: 'hi' }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('requires text or media', async () => {
    mocks.prisma.conversationParticipant.findUnique.mockResolvedValue({
      leftAt: null,
    });

    await expect(service.createMessage('c1', 'u1', {})).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('persists a message and returns participant ids for broadcasting', async () => {
    mocks.prisma.conversationParticipant.findUnique.mockResolvedValue({
      leftAt: null,
    });
    mocks.tx.message.create.mockResolvedValue(messageRow);
    mocks.tx.conversation.update.mockResolvedValue(conversationRow);

    const result = await service.createMessage('c1', 'u1', { text: 'hello' });

    expect(result.message).toMatchObject({
      id: 'm1',
      text: 'hello',
      deleted: false,
    });
    expect(result.participantIds).toEqual(['u1', 'u2']);
    expect(mocks.tx.conversation.update).toHaveBeenCalledWith({
      where: { id: 'c1' },
      data: { lastMessageAt: messageRow.createdAt },
    });
  });

  it('rejects starting a conversation with yourself', async () => {
    mocks.prisma.user.findUnique.mockResolvedValue({ id: 'u1' });

    await expect(
      service.getOrCreateDirect('u1', { username: 'alexm' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('returns the existing direct conversation instead of creating a duplicate', async () => {
    mocks.prisma.user.findUnique.mockResolvedValue({ id: 'u2' });
    mocks.prisma.conversation.findUnique.mockResolvedValue(conversationRow);

    const result = await service.getOrCreateDirect('u1', { username: 'jamiel' });

    expect(result.id).toBe('c1');
    expect(result.participants).toHaveLength(2);
    expect(mocks.prisma.conversation.create).not.toHaveBeenCalled();
  });

  it('marks the conversation read up to now', async () => {
    mocks.prisma.conversationParticipant.findUnique.mockResolvedValue({
      leftAt: null,
    });
    mocks.prisma.conversationParticipant.update.mockResolvedValue({});

    const result = await service.markRead('c1', 'u1', {});

    expect(result.unreadCount).toBe(0);
    expect(mocks.prisma.conversationParticipant.update).toHaveBeenCalledWith({
      where: { conversationId_userId: { conversationId: 'c1', userId: 'u1' } },
      data: { lastReadAt: expect.any(Date) },
    });
  });
});
