import { Types } from "mongoose";

export interface Payment {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  cardName: string;
  cardNumber: string;
  expiryMonth: number;
  expiryYear: number;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentInput {
  userId: Types.ObjectId;
  cardName?: string;
  cardnumber?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault?: boolean;
}

export interface PaymentUpdateInput {
  userId: Types.ObjectId;
  cardName?: string;
  cardNumber?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault?: boolean;
}
