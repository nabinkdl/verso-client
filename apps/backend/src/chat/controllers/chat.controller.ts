import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js';
import type { AuthenticatedUser } from '../../common/types/authenticated-user.js';
import { CreateConversationDto } from '../models/dto/create-conversation.dto.js';
import { MarkReadDto } from '../models/dto/mark-read.dto.js';
import { SendMessageDto } from '../models/dto/send-message.dto.js';
import { ChatGateway } from '../gateways/chat.gateway.js';
import { ChatService } from '../services/chat.service.js';

@ApiTags('chat')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('conversations')
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly chatGateway: ChatGateway,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List your conversations, newest activity first' })
  list(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: PaginationQueryDto,
  ) {
    return this.chatService.listConversations(user.id, query);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Count unread messages and conversations' })
  unreadCount(@CurrentUser() user: AuthenticatedUser) {
    return this.chatService.unreadCount(user.id);
  }

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get or create a direct conversation (idempotent)' })
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateConversationDto,
  ) {
    const conversation = await this.chatService.getOrCreateDirect(user.id, dto);
    this.chatGateway.broadcastConversation(conversation);
    return conversation;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one of your conversations' })
  get(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.chatService.getConversation(id, user.id);
  }

  @Get(':id/messages')
  @ApiOperation({ summary: 'Page through messages, oldest-last' })
  messages(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: PaginationQueryDto,
  ) {
    return this.chatService.listMessages(id, user.id, query);
  }

  @Post(':id/messages')
  @ApiOperation({ summary: 'Send a message over HTTP (fallback for the socket)' })
  async send(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: SendMessageDto,
  ) {
    const { message, participantIds } = await this.chatService.createMessage(
      id,
      user.id,
      dto,
    );
    await this.chatGateway.broadcastMessage(message, participantIds);
    return message;
  }

  @Post(':id/read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark a conversation as read' })
  markRead(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: MarkReadDto,
  ) {
    return this.chatService.markRead(id, user.id, dto);
  }
}
