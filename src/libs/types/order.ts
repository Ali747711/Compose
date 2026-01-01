import { Types } from "mongoose";
import { OrderStatus } from "../enums/order.enum";
import { Product } from "./product";

export interface Order {
  _id: Types.ObjectId;
  orderTotal: number;
  orderDelivery: number;
  orderStatus: OrderStatus;
  userId: Types.ObjectId;
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

export interface OrderItemInput {
  itemQuantity: number;
  itemPrice: number;
  productId: Types.ObjectId;
  orderId: Types.ObjectId;
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
