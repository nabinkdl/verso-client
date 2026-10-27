import {
  Body,
  Controller,
  Delete,
  Get,
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
import { SearchUsersDto } from './dto/search-users.dto.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';
import { UsersService } from './users.service.js';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get the signed-in profile' })
  getMe(@CurrentUser() user: AuthenticatedUser) {
    return this.usersService.getMe(user.id);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update the signed-in profile' })
  updateMe(@CurrentUser() user: AuthenticatedUser, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(user.id, dto);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search users by name or username' })
  search(@Query() query: SearchUsersDto) {
    return this.usersService.search(query.q, query.limit);
  }

  @Get(':username')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a public profile' })
  getProfile(
    @Param('username') username: string,
    @CurrentUser() viewer: AuthenticatedUser | null,
  ) {
    return this.usersService.getProfile(username, viewer?.id);
  }

  @Post(':username/follow')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Follow a user' })
  follow(@Param('username') username: string, @CurrentUser() user: AuthenticatedUser) {
    return this.usersService.follow(username, user.id);
  }

  @Delete(':username/follow')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Unfollow a user' })
  unfollow(@Param('username') username: string, @CurrentUser() user: AuthenticatedUser) {
    return this.usersService.unfollow(username, user.id);
  }
}
