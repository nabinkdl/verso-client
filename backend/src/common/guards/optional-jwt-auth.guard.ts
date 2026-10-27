import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { AuthenticatedUser } from '../types/authenticated-user.js';

/**
 * Authenticates a request when a valid bearer token is present, but lets
 * anonymous requests through so public endpoints can enrich their response
 * for signed-in users.
 */
@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<TUser = AuthenticatedUser>(_error: unknown, user: TUser | false): TUser | null {
    return user || null;
  }
}
