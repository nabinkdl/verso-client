import { Prisma } from '../../generated/prisma/client.js';

export const CHAT_USER_SELECT = {
  id: true,
  username: true,
  name: true,
  avatarUrl: true,
} satisfies Prisma.UserSelect;

export const messageInclude = {
  sender: { select: CHAT_USER_SELECT },
  replyTo: {
    select: {
      id: true,
      senderId: true,
      text: true,
      deletedAt: true,
    },
  },
} satisfies Prisma.MessageInclude;

export const conversationInclude = {
  participants: {
    where: { leftAt: null },
    include: { user: { select: CHAT_USER_SELECT } },
  },
  messages: {
    where: { deletedAt: null },
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    take: 1,
    include: messageInclude,
  },
} satisfies Prisma.ConversationInclude;

export type MessageWithRelations = Prisma.MessageGetPayload<{
  include: typeof messageInclude;
}>;

export type ConversationWithRelations = Prisma.ConversationGetPayload<{
  include: typeof conversationInclude;
}>;

export function mapMessage(message: MessageWithRelations) {
  const deleted = Boolean(message.deletedAt);

  return {
    id: message.id,
    conversationId: message.conversationId,
    senderId: message.senderId,
    text: deleted ? null : message.text,
    mediaUrl: deleted ? null : message.mediaUrl,
    editedAt: message.editedAt,
    deleted,
    createdAt: message.createdAt,
    sender: message.sender,
    replyTo: message.replyTo
      ? {
          id: message.replyTo.id,
          senderId: message.replyTo.senderId,
          text: message.replyTo.deletedAt ? null : message.replyTo.text,
        }
      : null,
  };
}

export function mapConversation(
  conversation: ConversationWithRelations,
  unreadCount: number,
) {
  const lastMessage = conversation.messages[0];

  return {
    id: conversation.id,
    type: conversation.type,
    participants: conversation.participants.map((participant) => participant.user),
    lastMessage: lastMessage ? mapMessage(lastMessage) : null,
    lastMessageAt: conversation.lastMessageAt,
    unreadCount,
    createdAt: conversation.createdAt,
  };
}
