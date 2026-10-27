import { Module } from '@nestjs/common';
import { PostsController } from './controllers/posts.controller.js';
import { PostsService } from './services/posts.service.js';

@Module({
  controllers: [PostsController],
  providers: [PostsService],
  exports: [PostsService],
})
export class PostsModule {}
