import { Router } from "express";
import messageController from "../controllers/message.controller";
import userController from "../controllers/user.controller";

const messageRouter = Router();

// User routes (all require auth)
messageRouter.get(
  "/conversation",
  userController.verifyAuth,
  messageController.getConversation
);

messageRouter.get(
  "/messages",
  userController.verifyAuth,
  messageController.getMessages
);

messageRouter.get(
  "/unread-count",
  userController.verifyAuth,
  messageController.getUnreadCount
);

export default messageRouter;
