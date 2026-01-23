import { Server as SocketIOServer } from "socket.io";

// Singleton to hold the Socket.io instance
let io: SocketIOServer | null = null;

export const setSocketIO = (socketIO: SocketIOServer) => {
  io = socketIO;
};

export const getSocketIO = (): SocketIOServer | null => {
  return io;
};

// Helper function to broadcast a message to a conversation room
export const broadcastToConversation = (
  conversationId: string,
  event: string,
  data: any
) => {
  if (io) {
    const roomId = `conversation:${conversationId}`;
    io.to(roomId).emit(event, data);
    console.log(`Broadcast [${event}] to room: ${roomId}`);
  }
};

// Helper function to broadcast to admin dashboard
export const broadcastToAdminDashboard = (event: string, data: any) => {
  if (io) {
    io.to("admin:dashboard").emit(event, data);
    console.log(`Broadcast [${event}] to admin:dashboard`);
  }
};
