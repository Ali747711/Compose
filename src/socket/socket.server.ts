import { Server as HTTPServer } from "http";
import { Server as SocketIOServer, Socket } from "socket.io";
import MessageService from "../services/message.service";
import AuthService from "../services/auth.service";
import { User } from "../libs/types/user";
import {
  MessageSenderType,
  ConversationStatus,
} from "../libs/enums/message.enum";
import { setSocketIO } from "./socket.manager";
import {
  verifyAdminSocketToken,
  AdminSocketPayload,
} from "../libs/utils/adminSocketAuth";

interface AuthenticatedSocket extends Socket {
  user?: User;
  adminPayload?: AdminSocketPayload;
  isAdmin?: boolean;
}

class SocketServer {
  private io: SocketIOServer;
  private messageService: MessageService;
  private authService: AuthService;

  constructor(httpServer: HTTPServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.ALLOWED_ORIGINS?.split(",") || [
          "http://localhost:3003",
          "https://compose-3wf7.onrender.com",
          "http://localhost:5173",
          "http://localhost:5174",
          "http://localhost:5175",
          "https://compose-client.vercel.app",
          "https://compose-client-alis-projects-1ef90113.vercel.app",
        ],
        credentials: true,
      },
    });

    // Register io instance for global access
    setSocketIO(this.io);

    this.messageService = new MessageService();
    this.authService = new AuthService();

    this.setupMiddleware();
    this.setupEventHandlers();
  }

  // Authentication middleware
  private setupMiddleware() {
    this.io.use(async (socket: AuthenticatedSocket, next) => {
      try {
        const token = socket.handshake.auth.token;
        const adminToken = socket.handshake.auth.adminToken;

        // Check for admin token first
        if (adminToken) {
          const adminPayload = verifyAdminSocketToken(adminToken);
          if (adminPayload) {
            socket.adminPayload = adminPayload;
            socket.isAdmin = true;
            console.log(
              `Admin socket authenticated: ${adminPayload.adminNick}`,
            );
            return next();
          }
          return next(new Error("Authentication error: Invalid admin token"));
        }

        // Regular user JWT auth
        if (!token) {
          return next(new Error("Authentication error: No token provided"));
        }

        const user = await this.authService.checkAuth(token);
        if (!user) {
          return next(new Error("Authentication error: Invalid token"));
        }

        socket.user = user;
        socket.isAdmin = false;
        next();
      } catch (error) {
        console.error("Socket auth error:", error);
        next(new Error("Authentication error"));
      }
    });
  }

  // Setup event handlers
  private setupEventHandlers() {
    this.io.on("connection", (socket: AuthenticatedSocket) => {
      const userName = socket.isAdmin
        ? `Admin:${socket.adminPayload?.adminNick}`
        : socket.user?.userNick;
      console.log(`Socket connected: ${userName} (${socket.id})`);

      // User joins their conversation room
      socket.on("user:join", async () => {
        try {
          const conversation =
            await this.messageService.getOrCreateConversation(socket.user!);
          const roomId = `conversation:${conversation._id}`;

          socket.join(roomId);
          socket.emit("conversation:joined", conversation);

          console.log(`${socket.user?.userNick} joined room: ${roomId}`);
        } catch (error) {
          console.error("user:join error:", error);
          socket.emit("error", { message: "Failed to join conversation" });
        }
      });

      // Admin joins admin dashboard room
      socket.on("admin:join", () => {
        socket.join("admin:dashboard");
        const adminName = socket.isAdmin
          ? socket.adminPayload?.adminNick
          : socket.user?.userNick;
        console.log(`Admin ${adminName} joined dashboard`);
      });

      // Admin joins specific conversation
      socket.on(
        "admin:join_conversation",
        (data: { conversationId: string }) => {
          const roomId = `conversation:${data.conversationId}`;
          socket.join(roomId);
          const adminName = socket.isAdmin
            ? socket.adminPayload?.adminNick
            : socket.user?.userNick;
          console.log(`Admin ${adminName} joined room: ${roomId}`);
        },
      );

      // User sends message
      socket.on("user:send_message", async (data: { content: string }) => {
        try {
          const conversation =
            await this.messageService.getOrCreateConversation(socket.user!);

          const message = await this.messageService.sendMessage({
            conversationId: conversation._id as any,
            senderId: socket.user!._id as any,
            senderType: MessageSenderType.USER,
            content: data.content,
          });

          const roomId = `conversation:${conversation._id}`;

          // Broadcast to conversation room
          this.io.to(roomId).emit("message:new", message);

          // Notify admin dashboard
          this.io.to("admin:dashboard").emit("conversation:updated", {
            conversationId: conversation._id,
            lastMessage: data.content,
            unreadCount: conversation.unreadCount.admin + 1,
          });

          console.log(
            `Message from ${socket.user?.userNick}: ${data.content.substring(0, 50)}...`,
          );
        } catch (error) {
          console.error("user:send_message error:", error);
          socket.emit("error", { message: "Failed to send message" });
        }
      });

      // Admin sends message
      socket.on(
        "admin:send_message",
        async (data: { conversationId: string; content: string }) => {
          try {
            const message = await this.messageService.sendMessage({
              conversationId: data.conversationId as any,
              senderId: socket.user!._id as any,
              senderType: MessageSenderType.ADMIN,
              content: data.content,
            });

            const roomId = `conversation:${data.conversationId}`;

            // Broadcast to conversation room
            this.io.to(roomId).emit("message:new", message);

            console.log(`Admin ${socket.user?.userNick} replied`);
          } catch (error) {
            console.error("admin:send_message error:", error);
            socket.emit("error", { message: "Failed to send message" });
          }
        },
      );

      // Mark messages as read
      socket.on(
        "mark_read",
        async (data: {
          conversationId: string;
          userType: MessageSenderType;
        }) => {
          try {
            await this.messageService.markAsRead(
              data.conversationId,
              data.userType,
            );

            const roomId = `conversation:${data.conversationId}`;
            this.io.to(roomId).emit("messages:read", {
              conversationId: data.conversationId,
              readBy: data.userType,
            });
          } catch (error) {
            console.error("mark_read error:", error);
          }
        },
      );

      // Typing indicators
      socket.on("typing:start", (data: { conversationId: string }) => {
        const roomId = `conversation:${data.conversationId}`;
        socket.to(roomId).emit("typing:start", {
          userId: socket.user?._id,
          userNick: socket.user?.userNick,
        });
      });

      socket.on("typing:stop", (data: { conversationId: string }) => {
        const roomId = `conversation:${data.conversationId}`;
        socket.to(roomId).emit("typing:stop", {
          userId: socket.user?._id,
        });
      });

      // Admin resolves conversation
      socket.on("admin:resolve", async (data: { conversationId: string }) => {
        try {
          const conversation =
            await this.messageService.updateConversationStatus(
              data.conversationId,
              ConversationStatus.CLOSED,
            );

          const roomId = `conversation:${data.conversationId}`;
          this.io.to(roomId).emit("conversation:resolved", conversation);

          // Notify admin dashboard
          this.io.to("admin:dashboard").emit("conversation:updated", {
            conversationId: data.conversationId,
            status: ConversationStatus.CLOSED,
          });
        } catch (error) {
          console.error("admin:resolve error:", error);
          socket.emit("error", { message: "Failed to resolve conversation" });
        }
      });

      // Admin reopens conversation
      socket.on("admin:reopen", async (data: { conversationId: string }) => {
        try {
          const conversation =
            await this.messageService.updateConversationStatus(
              data.conversationId,
              ConversationStatus.OPEN,
            );

          const roomId = `conversation:${data.conversationId}`;
          this.io.to(roomId).emit("conversation:reopened", conversation);

          // Notify admin dashboard
          this.io.to("admin:dashboard").emit("conversation:updated", {
            conversationId: data.conversationId,
            status: ConversationStatus.OPEN,
          });
        } catch (error) {
          console.error("admin:reopen error:", error);
          socket.emit("error", { message: "Failed to reopen conversation" });
        }
      });

      // Disconnect
      socket.on("disconnect", () => {
        const userName = socket.isAdmin
          ? `Admin:${socket.adminPayload?.adminNick}`
          : socket.user?.userNick;
        console.log(`Socket disconnected: ${userName}`);
      });
    });
  }

  public getIO(): SocketIOServer {
    return this.io;
  }
}

export default SocketServer;
