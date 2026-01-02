import { Types, ObjectId } from "mongoose";
import { UserStatus, UserType } from "../enums/user.enum";
import { Request } from "express";
import { Session } from "express-session";

export interface User {
  _id: ObjectId;
  userType: UserType;
  userStatus: UserStatus;
  userNick: string;
  userPhone: string;
  userEmail?: string;
  userPassword?: string;
  userBio?: string;
  userImage?: string;
  userPoints: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserInput {
  userType?: UserType;
  userStatus?: UserStatus;
  userNick: string;
  userPhone: string;
  userEmail?: string;
  userPassword: string;
  userBio?: string;
  userImage?: string;
  userPoints?: number;
}

export interface SessionUser {
  _id: string; // String instead ObjectId, do not know yet why it is ?
  userType: UserType;
  userStatus: UserStatus;
  userNick: string;
  userPhone: string;
  userEmail?: string;
  userPassword?: string;
  userBio?: string;
  userImage?: string;
  userPoints: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserLoginInput {
  userNick: string;
  userPassword: string;
}

export interface UserUpdateInput {
  _id: Types.ObjectId;
  userType?: UserType;
  userStatus?: UserStatus;
  userNick?: string;
  userPhone?: string;
  userEmail?: string;
  userPassword?: string;
  userBio?: string;
  userImage?: string;
}

export interface ExtendedRequest extends Request {
  user: User;
  file: Express.Multer.File;
  files: Express.Multer.File[];
}

export interface AdminRequest extends Request {
  user: User;
  session: Session & { user: SessionUser };
  file: Express.Multer.File;
  files: Express.Multer.File[];
}
