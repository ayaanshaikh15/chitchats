import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;
let onlineUsersSnapshot: string[] = [];

const SOCKET_URL = import.meta.env.DEV ? "http://localhost:5000" : undefined;

export function getSocket(userId: string): Socket {
  if (!socket) {
    socket = io(SOCKET_URL, {
      query: { userId },
      transports: ["polling", "websocket"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
    });
    socket.on("connect", () => {
      socket?.emit("requestOnlineUsers");
    });
    socket.on("getOnlineUsers", (ids: string[]) => {
      onlineUsersSnapshot = ids;
    });
  }
  return socket;
}

export function getOnlineUsersSnapshot(): string[] {
  return onlineUsersSnapshot;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
