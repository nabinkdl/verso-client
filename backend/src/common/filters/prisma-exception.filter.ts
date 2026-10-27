import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';
import { Prisma } from '../../generated/prisma/client.js';

const PRISMA_ERROR_MAP: Record<string, { status: number; message: string }> = {
  P2002: {
    status: HttpStatus.CONFLICT,
    message: 'A record with this value already exists',
  },
  P2003: {
    status: HttpStatus.CONFLICT,
    message: 'This operation conflicts with a related record',
  },
  P2025: {
    status: HttpStatus.NOT_FOUND,
    message: 'The requested record was not found',
  },
};

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(PrismaExceptionFilter.name);

  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const mapped = PRISMA_ERROR_MAP[exception.code];

    if (mapped) {
      response.status(mapped.status).json({
        statusCode: mapped.status,
        message: mapped.message,
        error: HttpStatus[mapped.status],
      });
      return;
    }

    this.logger.error(`Unhandled Prisma error ${exception.code}`, exception.stack);
    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
      error: 'Internal Server Error',
    });
  }
}
