import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';
import type { SignOptions } from 'jsonwebtoken';
import { PrismaService } from '../prisma/prisma.service.js';
import type { JwtPayload } from '../common/types/authenticated-user.js';
import { PRIVATE_USER_SELECT, type PrivateUser } from '../users/user.selects.js';
import type { LoginDto } from './dto/login.dto.js';
import type { RegisterDto } from './dto/register.dto.js';

const PASSWORD_ROUNDS = 12;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: dto.email }, { username: dto.username }],
      },
      select: { email: true, username: true },
    });

    if (existing) {
      const field = existing.email === dto.email ? 'Email' : 'Username';
      throw new ConflictException(`${field} is already in use`);
    }

    const passwordHash = await bcrypt.hash(dto.password, PASSWORD_ROUNDS);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        username: dto.username,
        name: dto.name,
        passwordHash,
      },
      select: PRIVATE_USER_SELECT,
    });

    return this.buildAuthResponse(user);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: dto.identifier }, { username: dto.identifier }],
      },
      select: { ...PRIVATE_USER_SELECT, passwordHash: true },
    });

    const passwordMatches = user
      ? await bcrypt.compare(dto.password, user.passwordHash)
      : false;

    if (!user || !passwordMatches) {
      throw new UnauthorizedException('Invalid email/username or password');
    }

    const { passwordHash: _passwordHash, ...safeUser } = user;
    void _passwordHash;

    return this.buildAuthResponse(safeUser);
  }

  async getCurrentUser(userId: string): Promise<PrivateUser> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: PRIVATE_USER_SELECT,
    });

    if (!user) {
      throw new UnauthorizedException('Account no longer exists');
    }

    return user;
  }

  private async buildAuthResponse(user: PrivateUser) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      username: user.username,
    };

    return {
      accessToken: await this.jwt.signAsync(payload, {
        secret: this.config.getOrThrow<string>('JWT_SECRET'),
        expiresIn: this.config.getOrThrow<string>('JWT_EXPIRES_IN') as SignOptions['expiresIn'],
      }),
      user,
    };
  }
}
