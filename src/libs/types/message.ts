import { ObjectId, Types } from "mongoose";
import {
  ConversationStatus,
  MessageSenderType,
  MessageStatus,
} from "../enums/message.enum";
import { User } from "./user";

export interface Conversation {
  _id: ObjectId;
  userId: ObjectId;
  adminId?: ObjectId;
  status: ConversationStatus;
  lastMessage: string;
  lastMessageAt: Date;
  unreadCount: {
    user: number;
    admin: number;
  };
  createdAt: Date;
  updatedAt: Date;

  // From aggregation
  user?: User;
  admin?: User;
  messages?: Message[];
}

export interface Message {
  _id: ObjectId;
  conversationId: ObjectId;
  senderId: ObjectId;
  senderType: MessageSenderType;
  content: string;
  status: MessageStatus;
  attachments?: string[];
  createdAt: Date;
  updatedAt: Date;

  // From aggregation
  sender?: User;
}

export interface ConversationInput {
  userId: Types.ObjectId;
}

export interface MessageInput {
  conversationId: Types.ObjectId;
  senderId: Types.ObjectId;
  senderType: MessageSenderType;
  content: string;
  attachments?: string[];
}

export interface ConversationInquiry {
  userId?: Types.ObjectId;
  status?: ConversationStatus;
  page: number;
  limit: number;
}

export interface MessageInquiry {
  conversationId: Types.ObjectId;
  page: number;
  limit: number;
}
