import { io, type Socket } from 'socket.io-client';
import { API_URL } from './api';

const SOCKET_URL =
  (import.meta.env.VITE_SOCKET_URL as string | undefined)?.replace(/\/$/, '') ??
  API_URL.replace(/\/api$/, '');

let socket: Socket | null = null;

/**
 * Connect to the `/chat` Socket.IO namespace with the current access token.
 * Returns the existing connection when one is already open.
 */
export function connectChatSocket(token: string): Socket {
  if (socket) {
    return socket;
  }

  socket = io(`${SOCKET_URL}/chat`, {
    auth: { token },
    transports: ['websocket', 'polling'],
  });

  return socket;
}

export function getChatSocket(): Socket | null {
  return socket;
}

export function disconnectChatSocket(): void {
  socket?.disconnect();
  socket = null;
}
