import { createHash, randomBytes } from 'node:crypto';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';
import type { SignOptions } from 'jsonwebtoken';
import { EmailService } from '../../email/services/email.service.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import type { JwtPayload } from '../../common/types/authenticated-user.js';
import { PRIVATE_USER_SELECT, type PrivateUser } from '../../users/models/user.selects.js';
import type { LoginDto } from '../models/dto/login.dto.js';
import type { RegisterDto } from '../models/dto/register.dto.js';

const PASSWORD_ROUNDS = 12;
const GENERIC_RESET_MESSAGE =
  'If an account exists for that email, a reset link has been sent.';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly email: EmailService,
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

  async requestPasswordReset(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
      select: { id: true, email: true },
    });

    if (!user) {
      return { message: GENERIC_RESET_MESSAGE };
    }

    const ttlMinutes =
      this.config.get<number>('PASSWORD_RESET_TOKEN_TTL_MINUTES') ?? 60;
    const token = randomBytes(32).toString('hex');
    const tokenHash = createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date(Date.now() + ttlMinutes * 60_000);

    await this.prisma.$transaction([
      this.prisma.passwordResetToken.deleteMany({
        where: { userId: user.id, usedAt: null },
      }),
      this.prisma.passwordResetToken.create({
        data: { userId: user.id, tokenHash, expiresAt },
      }),
    ]);

    const appUrl = (
      this.config.get<string>('APP_URL') ?? 'http://localhost:5173'
    ).replace(/\/$/, '');
    const resetUrl = `${appUrl}/?resetToken=${token}`;

    try {
      await this.email.sendPasswordReset(user.email, resetUrl, ttlMinutes);
    } catch (error) {
      await this.prisma.passwordResetToken.deleteMany({ where: { tokenHash } });
      throw error;
    }

    return { message: GENERIC_RESET_MESSAGE };
  }

  async resetPassword(token: string, password: string) {
    const tokenHash = createHash('sha256').update(token).digest('hex');
    const record = await this.prisma.passwordResetToken.findUnique({
      where: { tokenHash },
      select: { id: true, userId: true, expiresAt: true, usedAt: true },
    });

    if (!record || record.usedAt || record.expiresAt.getTime() <= Date.now()) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const passwordHash = await bcrypt.hash(password, PASSWORD_ROUNDS);

    await this.prisma.$transaction(async (tx) => {
      const claimed = await tx.passwordResetToken.updateMany({
        where: {
          id: record.id,
          usedAt: null,
          expiresAt: { gt: new Date() },
        },
        data: { usedAt: new Date() },
      });

      if (claimed.count === 0) {
        throw new BadRequestException('Invalid or expired reset token');
      }

      await tx.user.update({
        where: { id: record.userId },
        data: { passwordHash },
      });

      await tx.passwordResetToken.deleteMany({
        where: { userId: record.userId, id: { not: record.id } },
      });
    });

    return {
      message: 'Password updated. You can sign in with your new password.',
    };
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
