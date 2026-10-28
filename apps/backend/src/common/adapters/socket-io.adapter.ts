import type { INestApplicationContext } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import type { ServerOptions } from 'socket.io';

/**
 * Socket.IO adapter that applies the same CORS policy as the HTTP app.
 * The default adapter ignores `enableCors`, so browsers on the Vite origin
 * would otherwise be rejected during the WebSocket handshake.
 */
export class SocketIoAdapter extends IoAdapter {
  constructor(
    app: INestApplicationContext,
    private readonly corsOrigin: string,
  ) {
    super(app);
  }

  override createIOServer(port: number, options?: ServerOptions) {
    const origin =
      this.corsOrigin === '*'
        ? true
        : this.corsOrigin.split(',').map((value) => value.trim());

    return super.createIOServer(port, {
      ...options,
      cors: { origin, credentials: true },
    } as ServerOptions);
  }
}
