import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import type { UpdateProfileDto } from '../models/dto/update-profile.dto.js';
import { PRIVATE_USER_SELECT, PUBLIC_USER_SELECT } from '../models/user.selects.js';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        ...PRIVATE_USER_SELECT,
        _count: { select: { followers: true, following: true, posts: true } },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { _count, ...profile } = user;

    return {
      ...profile,
      followerCount: _count.followers,
      followingCount: _count.following,
      postCount: _count.posts,
    };
  }

  async getProfile(username: string, viewerId?: string) {
    const user = await this.prisma.user.findUnique({
      where: { username: this.normalizeUsername(username) },
      select: {
        ...PUBLIC_USER_SELECT,
        _count: { select: { followers: true, following: true, posts: true } },
        followers: {
          where: { followerId: viewerId ?? '' },
          select: { followerId: true },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { _count, followers, ...profile } = user;

    return {
      ...profile,
      followerCount: _count.followers,
      followingCount: _count.following,
      postCount: _count.posts,
      isFollowing: followers.length > 0,
      isMe: viewerId === user.id,
    };
  }

  async search(query: string, limit: number) {
    return this.prisma.user.findMany({
      where: {
        OR: [
          { username: { contains: query.toLowerCase(), mode: 'insensitive' } },
          { name: { contains: query, mode: 'insensitive' } },
        ],
      },
      select: PUBLIC_USER_SELECT,
      orderBy: { username: 'asc' },
      take: limit,
    });
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.bio !== undefined && { bio: dto.bio || null }),
        ...(dto.avatarUrl !== undefined && { avatarUrl: dto.avatarUrl || null }),
      },
      select: PRIVATE_USER_SELECT,
    });
  }

  async follow(username: string, followerId: string) {
    const target = await this.prisma.user.findUnique({
      where: { username: this.normalizeUsername(username) },
      select: { id: true },
    });

    if (!target) {
      throw new NotFoundException('User not found');
    }

    if (target.id === followerId) {
      throw new BadRequestException('You cannot follow yourself');
    }

    await this.prisma.follow.upsert({
      where: {
        followerId_followingId: { followerId, followingId: target.id },
      },
      create: { followerId, followingId: target.id },
      update: {},
    });

    return { following: true };
  }

  async unfollow(username: string, followerId: string) {
    const target = await this.prisma.user.findUnique({
      where: { username: this.normalizeUsername(username) },
      select: { id: true },
    });

    if (!target) {
      throw new NotFoundException('User not found');
    }

    await this.prisma.follow.deleteMany({
      where: { followerId, followingId: target.id },
    });

    return { following: false };
  }

  private normalizeUsername(username: string): string {
    return username.trim().toLowerCase();
  }
}
