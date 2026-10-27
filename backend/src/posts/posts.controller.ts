import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { OptionalJwtAuthGuard } from '../common/guards/optional-jwt-auth.guard.js';
import type { AuthenticatedUser } from '../common/types/authenticated-user.js';
import { CreateCommentDto } from './dto/create-comment.dto.js';
import { CreatePostDto } from './dto/create-post.dto.js';
import { QueryPostsDto } from './dto/query-posts.dto.js';
import { UpdatePostDto } from './dto/update-post.dto.js';
import { PostsService } from './posts.service.js';

@ApiTags('posts')
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List posts, newest first' })
  list(@Query() query: QueryPostsDto, @CurrentUser() viewer: AuthenticatedUser | null) {
    return this.postsService.list(query, viewer?.id);
  }

  @Get('feed')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Posts from people you follow, plus your own' })
  feed(@Query() query: QueryPostsDto, @CurrentUser() user: AuthenticatedUser) {
    return this.postsService.feed(user.id, query);
  }

  @Get(':id')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a single post' })
  getById(@Param('id') id: string, @CurrentUser() viewer: AuthenticatedUser | null) {
    return this.postsService.getById(id, viewer?.id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a post' })
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreatePostDto) {
    return this.postsService.create(user.id, dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update one of your posts' })
  update(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdatePostDto,
  ) {
    return this.postsService.update(id, user.id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete one of your posts' })
  remove(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.postsService.remove(id, user.id);
  }

  @Post(':id/like')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Like a post (idempotent)' })
  like(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.postsService.like(id, user.id);
  }

  @Delete(':id/like')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove a like from a post (idempotent)' })
  unlike(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.postsService.unlike(id, user.id);
  }

  @Get(':id/comments')
  @ApiOperation({ summary: 'List comments on a post' })
  listComments(@Param('id') id: string) {
    return this.postsService.listComments(id);
  }

  @Post(':id/comments')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Comment on a post' })
  addComment(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateCommentDto,
  ) {
    return this.postsService.addComment(id, user.id, dto);
  }

  @Delete(':id/comments/:commentId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a comment (comment author or post author)' })
  removeComment(
    @Param('id') id: string,
    @Param('commentId') commentId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.postsService.removeComment(id, commentId, user.id);
  }
}
