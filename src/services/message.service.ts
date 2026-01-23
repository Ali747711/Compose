import { shapeIntoMongooseObjectId } from "../libs/configs";
import Errors, { HttpCode, Message as ErrorMessage } from "../libs/Errors";
import {
  Conversation,
  Message,
  MessageInput,
  ConversationInquiry,
  MessageInquiry,
} from "../libs/types/message";
import { User } from "../libs/types/user";
import ConversationModel from "../schemas/conversation.schema";
import MessageModel from "../schemas/message.schema";
import {
  ConversationStatus,
  MessageSenderType,
  MessageStatus,
} from "../libs/enums/message.enum";
import { UserType } from "../libs/enums/user.enum";

class MessageService {
  private readonly conversationModel;
  private readonly messageModel;

  constructor() {
    this.conversationModel = ConversationModel;
    this.messageModel = MessageModel;
  }

  // Get or create conversation for user
  public async getOrCreateConversation(user: User): Promise<Conversation> {
    console.log("Message service, [getOrCreateConversation] -----");
    const userId = shapeIntoMongooseObjectId(user._id);

    let conversation = await this.conversationModel
      .findOne({ userId })
      .populate("userId", "userNick userImage")
      .populate("adminId", "userNick userImage")
      .exec();

    if (!conversation) {
      conversation = await this.conversationModel.create({ userId });
      await conversation.populate("userId", "userNick userImage");
    }

    return conversation.toJSON() as Conversation;
  }

  // Get conversation by ID (with auth check)
  public async getConversation(
    conversationId: string,
    user: User
  ): Promise<Conversation> {
    console.log("Message service, [getConversation] -----");
    const id = shapeIntoMongooseObjectId(conversationId);
    const conversation = await this.conversationModel
      .findById(id)
      .populate("userId", "userNick userImage userEmail userPhone")
      .populate("adminId", "userNick userImage")
      .exec();

    if (!conversation) {
      throw new Errors(HttpCode.NOT_FOUND, ErrorMessage.NO_DATA_FOUND);
    }

    // Auth check: User can only see their own conversation
    if (user.userType === UserType.USER) {
      if (conversation.userId._id.toString() !== user._id.toString()) {
        throw new Errors(HttpCode.FORBIDDEN, ErrorMessage.NOT_AUTHENTICATED);
      }
    }

    return conversation.toJSON() as Conversation;
  }

  // Get all conversations (admin only)
  public async getAllConversations(
    inquiry: ConversationInquiry
  ): Promise<{ data: Conversation[]; total: number }> {
    console.log("Message service, [getAllConversations] -----");
    const { page, limit, status } = inquiry;

    const match: any = {};
    if (status) match.status = status;

    const skip = (page - 1) * limit;

    const [conversations, total] = await Promise.all([
      this.conversationModel
        .find(match)
        .populate("userId", "userNick userImage userEmail")
        .populate("adminId", "userNick userImage")
        .sort({ lastMessageAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.conversationModel.countDocuments(match),
    ]);

    return {
      data: conversations.map((c) => c.toJSON()) as Conversation[],
      total,
    };
  }

  // Send message
  public async sendMessage(input: MessageInput): Promise<Message> {
    console.log("Message service, [sendMessage] -----");
    const conversationId = shapeIntoMongooseObjectId(input.conversationId);
    const senderId = shapeIntoMongooseObjectId(input.senderId);

    // Create message
    const message = await this.messageModel.create({
      conversationId,
      senderId,
      senderType: input.senderType,
      content: input.content,
      attachments: input.attachments || [],
    });

    // Update conversation
    const updateData: any = {
      lastMessage: input.content.substring(0, 100),
      lastMessageAt: new Date(),
    };

    // Increment unread count for recipient
    if (input.senderType === MessageSenderType.USER) {
      updateData.$inc = { "unreadCount.admin": 1 };
    } else {
      updateData.$inc = { "unreadCount.user": 1 };
    }

    await this.conversationModel.findByIdAndUpdate(conversationId, updateData);

    // Populate sender info
    await message.populate("senderId", "userNick userImage");

    return message.toJSON() as Message;
  }

  // Get messages for conversation
  public async getMessages(
    inquiry: MessageInquiry,
    user: User
  ): Promise<{ data: Message[]; total: number }> {
    console.log("Message service, [getMessages] -----");
    const conversationId = shapeIntoMongooseObjectId(inquiry.conversationId);
    const { page, limit } = inquiry;

    // Verify user has access to this conversation
    const conversation = await this.conversationModel.findById(conversationId);
    if (!conversation) {
      throw new Errors(HttpCode.NOT_FOUND, ErrorMessage.NO_DATA_FOUND);
    }

    if (user.userType === UserType.USER) {
      if (conversation.userId.toString() !== user._id.toString()) {
        throw new Errors(HttpCode.FORBIDDEN, ErrorMessage.NOT_AUTHENTICATED);
      }
    }

    const skip = (page - 1) * limit;

    const [messages, total] = await Promise.all([
      this.messageModel
        .find({ conversationId })
        .populate("senderId", "userNick userImage")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.messageModel.countDocuments({ conversationId }),
    ]);

    return {
      data: messages.reverse().map((m) => m.toJSON()) as Message[],
      total,
    };
  }

  // Mark messages as read
  public async markAsRead(
    conversationId: string,
    userType: MessageSenderType
  ): Promise<void> {
    console.log("Message service, [markAsRead] -----");
    const id = shapeIntoMongooseObjectId(conversationId);

    // Mark all unread messages from opposite party as read
    const senderType =
      userType === MessageSenderType.USER
        ? MessageSenderType.ADMIN
        : MessageSenderType.USER;

    await this.messageModel.updateMany(
      {
        conversationId: id,
        senderType,
        status: MessageStatus.SENT,
      },
      { status: MessageStatus.READ }
    );

    // Reset unread count
    const updateField =
      userType === MessageSenderType.USER
        ? "unreadCount.user"
        : "unreadCount.admin";

    await this.conversationModel.findByIdAndUpdate(id, {
      [updateField]: 0,
    });
  }

  // Update conversation status (admin only)
  public async updateConversationStatus(
    conversationId: string,
    status: ConversationStatus
  ): Promise<Conversation> {
    console.log("Message service, [updateConversationStatus] -----");
    const id = shapeIntoMongooseObjectId(conversationId);

    const conversation = await this.conversationModel
      .findByIdAndUpdate(id, { status }, { new: true })
      .populate("userId", "userNick userImage")
      .populate("adminId", "userNick userImage")
      .exec();

    if (!conversation) {
      throw new Errors(HttpCode.NOT_FOUND, ErrorMessage.NO_DATA_FOUND);
    }

    return conversation.toJSON() as Conversation;
  }

  // Get unread count for user
  public async getUnreadCount(userId: string): Promise<number> {
    console.log("Message service, [getUnreadCount] -----");
    const id = shapeIntoMongooseObjectId(userId);

    const conversation = await this.conversationModel.findOne({ userId: id });
    if (!conversation) return 0;

    return conversation.unreadCount.user;
  }

  // Get total unread count for admin
  public async getAdminUnreadCount(): Promise<number> {
    console.log("Message service, [getAdminUnreadCount] -----");
    const result = await this.conversationModel.aggregate([
      { $group: { _id: null, total: { $sum: "$unreadCount.admin" } } },
    ]);

    return result[0]?.total || 0;
  }
}

export default MessageService;
