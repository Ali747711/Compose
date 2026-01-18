import { Types, ObjectId } from "mongoose";
import { PaymentType } from "../enums/payment.enum";

export interface Payment {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  cardName: string;
  cardNumber: string;
  expiryMonth: number;
  expiryYear: number;
  cardCVC: number;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentInput {
  userId: ObjectId;
  cardName?: string;
  cardNumber?: string;
  expiryMonth?: number;
  expiryYear?: number;
  cardCVC: number;
  isDefault?: boolean;
}

export interface PaymentUpdateInput {
  userId: ObjectId;
  cardName?: string;
  cardNumber?: string;
  expiryMonth?: number;
  expiryYear?: number;
  cardCVC: number;
  isDefault?: boolean;
}
