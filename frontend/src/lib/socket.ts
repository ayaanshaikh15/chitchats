import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;
let onlineUsersSnapshot: string[] = [];

const SOCKET_URL = import.meta.env.DEV ? "http://localhost:5000" : undefined;

export function getSocket(userId: string): Socket {
  if (!socket) {
    console.log("[socket] creating new socket to", SOCKET_URL, "userId:", userId);
    socket = io(SOCKET_URL, {
      query: { userId },
      transports: ["polling", "websocket"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
    });
    socket.on("connect", () => {
      console.log("[socket] connected, emitting requestOnlineUsers");
      socket?.emit("requestOnlineUsers");
    });
    socket.on("getOnlineUsers", (ids: string[]) => {
      console.log("[socket] getOnlineUsers received:", ids);
      onlineUsersSnapshot = ids;
    });
    socket.on("disconnect", (reason) => {
      console.log("[socket] disconnected:", reason);
    });
    socket.on("connect_error", (err) => {
      console.log("[socket] connect_error:", err.message);
    });
  }
  if (!socket.connected) {
    socket.connect();
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
