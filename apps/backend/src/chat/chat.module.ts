import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { ChatController } from './controllers/chat.controller.js';
import { ChatGateway } from './gateways/chat.gateway.js';
import { ChatService } from './services/chat.service.js';

@Module({
  imports: [AuthModule],
  controllers: [ChatController],
  providers: [ChatService, ChatGateway],
  exports: [ChatService],
})
export class ChatModule {}
