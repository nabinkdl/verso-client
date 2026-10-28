import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import type { Server, Socket } from 'socket.io';
import type { JwtPayload } from '../../common/types/authenticated-user.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { mapMessage } from '../models/chat.models.js';
import type { MarkReadDto } from '../models/dto/mark-read.dto.js';
import type { SendMessageDto } from '../models/dto/send-message.dto.js';
import { ChatService } from '../services/chat.service.js';

type SocketUser = { id: string; username: string };
type ChatMessage = ReturnType<typeof mapMessage>;

type ConversationPayload = { conversationId?: string };
type SendPayload = SendMessageDto & ConversationPayload & { clientId?: string };

@WebSocketGateway({ namespace: '/chat' })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(ChatGateway.name);

  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly chat: ChatService,
    private readonly jwt: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async handleConnection(client: Socket): Promise<void> {
    const token = this.extractToken(client);

    if (!token) {
      this.reject(client, 'Missing access token');
      return;
    }

    try {
      // Verify synchronously and attach the user before any event can be
      // processed: Socket.IO emits `connect` before async work in
      // handleConnection finishes, so awaiting here would race the first emits.
      const payload = this.jwt.verify<JwtPayload>(token);
      client.data.user = { id: payload.sub, username: payload.username };
      await client.join(this.userRoom(payload.sub));

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: { id: true },
      });

      if (!user) {
        client.data.user = undefined;
        this.reject(client, 'Account no longer exists');
      }
    } catch {
      this.reject(client, 'Invalid or expired access token');
    }
  }

  handleDisconnect(client: Socket): void {
    const user = this.currentUser(client);
    if (user) {
      this.logger.debug(`Socket ${client.id} disconnected for ${user.username}`);
    }
  }

  @SubscribeMessage('conversation:join')
  async joinConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: ConversationPayload,
  ) {
    const user = this.requireUser(client);
    const conversationId = this.requireConversationId(payload);
    const conversation = await this.chat.getConversationForMember(
      conversationId,
      user.id,
    );

    await client.join(this.conversationRoom(conversationId));

    return { conversation };
  }

  @SubscribeMessage('message:send')
  async sendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: SendPayload,
  ) {
    const user = this.requireUser(client);
    const conversationId = this.requireConversationId(payload);

    const { message, participantIds } = await this.chat.createMessage(
      conversationId,
      user.id,
      {
        text: payload.text,
        mediaUrl: payload.mediaUrl,
        replyToId: payload.replyToId,
      },
    );

    await this.broadcastMessage(message, participantIds);

    return { message, clientId: payload.clientId ?? null };
  }

  @SubscribeMessage('message:read')
  async markRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: ConversationPayload & MarkReadDto,
  ) {
    const user = this.requireUser(client);
    const conversationId = this.requireConversationId(payload);
    const result = await this.chat.markRead(conversationId, user.id, {
      messageId: payload.messageId,
    });

    this.server.to(this.conversationRoom(conversationId)).emit('conversation:read', result);

    return result;
  }

  @SubscribeMessage('typing:start')
  startTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: ConversationPayload,
  ) {
    return this.emitTyping(client, payload, true);
  }

  @SubscribeMessage('typing:stop')
  stopTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: ConversationPayload,
  ) {
    return this.emitTyping(client, payload, false);
  }

  async broadcastMessage(
    message: ChatMessage,
    participantIds?: string[],
  ): Promise<void> {
    this.server
      .to(this.conversationRoom(message.conversationId))
      .emit('message:created', message);

    const participants =
      participantIds ?? (await this.chat.getParticipantIds(message.conversationId));

    for (const userId of participants) {
      this.server.to(this.userRoom(userId)).emit('conversation:updated', {
        conversationId: message.conversationId,
        lastMessage: message,
      });
    }
  }

  broadcastConversation(conversation: { id: string; participants: SocketUser[] }): void {
    const room = this.conversationRoom(conversation.id);

    for (const participant of conversation.participants) {
      this.server.to(this.userRoom(participant.id)).emit('conversation:updated', {
        conversationId: conversation.id,
      });
    }

    this.server.to(room).emit('conversation:updated', { conversationId: conversation.id });
  }

  private emitTyping(
    client: Socket,
    payload: ConversationPayload,
    isTyping: boolean,
  ) {
    const user = this.requireUser(client);
    const conversationId = this.requireConversationId(payload);
    const room = this.conversationRoom(conversationId);

    if (!client.rooms.has(room)) {
      throw new WsException('Join the conversation before typing');
    }

    client.to(room).emit('typing', {
      conversationId,
      userId: user.id,
      isTyping,
    });

    return { conversationId, isTyping };
  }

  private requireUser(client: Socket): SocketUser {
    const user = this.currentUser(client);

    if (!user) {
      throw new WsException('Unauthorized');
    }

    return user;
  }

  private currentUser(client: Socket): SocketUser | null {
    const user = (client.data as { user?: SocketUser }).user;
    return user ?? null;
  }

  private requireConversationId(payload: ConversationPayload | undefined): string {
    if (!payload?.conversationId || typeof payload.conversationId !== 'string') {
      throw new WsException('conversationId is required');
    }

    return payload.conversationId;
  }

  private extractToken(client: Socket): string | null {
    const authToken = (client.handshake.auth as { token?: unknown } | undefined)?.token;
    if (typeof authToken === 'string' && authToken.length > 0) {
      return authToken;
    }

    const header = client.handshake.headers.authorization;
    if (typeof header === 'string' && header.startsWith('Bearer ')) {
      return header.slice('Bearer '.length);
    }

    const queryToken = client.handshake.query.token;
    return typeof queryToken === 'string' && queryToken.length > 0 ? queryToken : null;
  }

  private reject(client: Socket, message: string): void {
    client.emit('chat:error', { message });
    client.disconnect(true);
  }

  private userRoom(userId: string): string {
    return `user:${userId}`;
  }

  private conversationRoom(conversationId: string): string {
    return `conversation:${conversationId}`;
  }
}
