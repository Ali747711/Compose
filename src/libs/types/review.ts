import { Types } from "mongoose";

export interface Review {
  _id: Types.ObjectId;
  productId: Types.ObjectId;
  userId: Types.ObjectId;
  userName: string;
  userImage: string;
  rating: number; // 1-5
  title: string;
  comment: string;
  helpfulCount: number;
  isVerifiedPurchase: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReviewInput {
  productId: Types.ObjectId;
  userId: Types.ObjectId;
  userName: string;
  userImage?: string;
  rating: number;
  title: string;
  comment?: string;
  helpfulCount?: number;
  isVerifiedPurchase: boolean;
}

export interface ReviewUpdateInput {
  _id?: Types.ObjectId;
  userName?: string;
  userImage?: string;
  rating?: number;
  title?: string;
  comment?: string;
  helpfulCount?: number;
  isVerifiedPurchase?: boolean;
}
