import { Chat, Message } from "../types";

export function sendMessage(
  chats: Chat[],
  chatId: string,
  message: Message,
): Chat[] {
  return chats.map((c) =>
    c.id !== chatId
      ? c
      : {
          ...c,
          messages: [...c.messages, message],
          lastUpdated: Date.now(),
        },
  );
}

export function findOrCreateChat(
  chats: Chat[],
  currentUserId: string,
  targetUserId: string,
): { chats: Chat[]; chatId: string } {
  let existing = chats.find(
    (c) =>
      c.participants.includes(currentUserId) &&
      c.participants.includes(targetUserId),
  );
  if (!existing) {
    existing = {
      id: `c${Date.now()}`,
      participants: [currentUserId, targetUserId],
      messages: [],
      lastUpdated: Date.now(),
    };
    return { chats: [...chats, existing], chatId: existing.id };
  }
  return { chats, chatId: existing.id };
}
