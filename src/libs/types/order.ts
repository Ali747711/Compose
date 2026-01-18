import { Types, ObjectId } from "mongoose";
import { OrderStatus } from "../enums/order.enum";
import { Product } from "./product";
import { Address } from "./address";
import { Payment } from "./payment";

export interface Order {
  _id: ObjectId;
  orderTotal: number;
  orderStatus: OrderStatus;
  userId: ObjectId;
  deliveryDate: string;
  deliveryFee: number;
  tip: number;
  orderAddress: ObjectId;
  orderPayment: ObjectId;
  createdAt: Date;
  updatedAt: Date;

  // From aggregation
  orderItems: OrderItem[];
  productData: Product[];
}

export interface OrderItem {
  _id: Types.ObjectId;
  itemQuantity: number;
  itemPrice: number;
  productId: Types.ObjectId;
  orderId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderInput {
  deliveryFee: number;
  tip: number;
  orderAddress: Address;
  orderPayment: Payment;
  deliveryDate: string;
  orderItemInput: OrderItemInput[];
}

export interface OrderItemInput {
  itemQuantity: number;
  itemPrice: number;
  productId: Types.ObjectId;
  orderId?: Types.ObjectId;
  deliveryDate?: string;
}

export interface OrderUpdateInput {
  orderId: Types.ObjectId;
  orderStatus: OrderStatus;
}

export interface OrderInquiry {
  page: number;
  limit: number;
  orderStatus?: OrderStatus;
}
