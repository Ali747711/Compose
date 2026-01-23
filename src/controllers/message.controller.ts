import { Response } from "express";
import { ExtendedRequest } from "../libs/types/user";
import MessageService from "../services/message.service";
import { P } from "../libs/types/common";
import Errors, { HttpCode } from "../libs/Errors";
import { MessageInquiry } from "../libs/types/message";

const messageService = new MessageService();
const messageController: P = {};

// Get or create user's conversation
messageController.getConversation = async (
  req: ExtendedRequest,
  res: Response
) => {
  try {
    console.log("Message controller, [getConversation] -----");
    const user = req.user;
    const conversation = await messageService.getOrCreateConversation(user);
    res.status(HttpCode.OK).json(conversation);
  } catch (error) {
    console.log("Message controller, [getConversation] Error:", error);
    if (error instanceof Errors) {
      res.status(error.code).json(error);
    } else {
      res.status(Errors.standard.code).json(Errors.standard);
    }
  }
};

// Get messages for conversation
messageController.getMessages = async (
  req: ExtendedRequest,
  res: Response
) => {
  try {
    console.log("Message controller, [getMessages] -----");
    const user = req.user;
    const { conversationId, page = 1, limit = 50 } = req.query;

    const inquiry: MessageInquiry = {
      conversationId: conversationId as any,
      page: Number(page),
      limit: Number(limit),
    };

    const result = await messageService.getMessages(inquiry, user);
    res.status(HttpCode.OK).json(result);
  } catch (error) {
    console.log("Message controller, [getMessages] Error:", error);
    if (error instanceof Errors) {
      res.status(error.code).json(error);
    } else {
      res.status(Errors.standard.code).json(Errors.standard);
    }
  }
};

// Get unread count
messageController.getUnreadCount = async (
  req: ExtendedRequest,
  res: Response
) => {
  try {
    console.log("Message controller, [getUnreadCount] -----");
    const userId = req.user._id.toString();
    const count = await messageService.getUnreadCount(userId);
    res.status(HttpCode.OK).json({ count });
  } catch (error) {
    console.log("Message controller, [getUnreadCount] Error:", error);
    if (error instanceof Errors) {
      res.status(error.code).json(error);
    } else {
      res.status(Errors.standard.code).json(Errors.standard);
    }
  }
};

export default messageController;
