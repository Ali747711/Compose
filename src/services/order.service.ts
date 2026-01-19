import { ObjectId } from "mongoose";
import { shapeIntoMongooseObjectId } from "../libs/configs";
import Errors, { HttpCode, Message } from "../libs/Errors";
import {
  Order,
  OrderInput,
  OrderInquiry,
  OrderItemInput,
  OrderUpdateInput,
} from "../libs/types/order";
import { User } from "../libs/types/user";
import OrderModel from "../schemas/order.schema";
import OrderItemModel from "../schemas/orderItem.schema";
import UserService from "./user.service";

class OrderService {
  private readonly orderModel;
  private readonly orderItemModel;
  private readonly userService;

  constructor() {
    this.orderModel = OrderModel;
    this.orderItemModel = OrderItemModel;
    this.userService = new UserService();
  }

  public async createOrder(user: User, input: OrderInput): Promise<Order> {
    const userId = shapeIntoMongooseObjectId(user._id);
    const orderAddress = shapeIntoMongooseObjectId(input.orderAddress._id);
    const orderPayment = shapeIntoMongooseObjectId(input.orderPayment._id);
    const amount = input.orderItemInput.reduce(
      (accumlator: number, item: OrderItemInput) => {
        return accumlator + item.itemPrice * item.itemQuantity;
      },
      0,
    );

    try {
      const newOrder: Order = await this.orderModel.create({
        orderTotal: amount,
        userId,
        deliveryDate: input.deliveryDate,
        deliveryFee: input.deliveryFee,
        tip: input.tip,
        orderAddress,
        orderPayment,
      });
      const orderId = newOrder._id;
      await this.recordOrderItem(orderId, input.orderItemInput);
      return newOrder;
    } catch (error) {
      console.log("Order service, [createOrder] Error: ", error);
      throw new Errors(HttpCode.INTERNAL_SERVER_ERROR, Message.CREATE_FAILED);
    }
  }

  public recordOrderItem = async (
    orderId: ObjectId,
    input: OrderItemInput[],
  ): Promise<void> => {
    const promiseList = input.map(async (item: OrderItemInput) => {
      item.orderId = shapeIntoMongooseObjectId(orderId);
      item.productId = shapeIntoMongooseObjectId(item.productId);
      await this.orderItemModel.create(item);
      return " Item inserted!";
    });

    console.log("Order service, [createOrder] promiseList: ", promiseList);
    const orderItems = await Promise.all(promiseList);
    console.log("Order service, [createOrder] orderItems: ", orderItems);
  };

  public getOrder = async (id: string, user: User): Promise<Order> => {
    id = shapeIntoMongooseObjectId(id);
    const userId = shapeIntoMongooseObjectId(user._id);

    const result = this.orderModel
      .aggregate([
        { $match: { _id: id, userId } },
        {
          $lookup: {
            from: "addresses",
            localField: "orderAddress",
            foreignField: "_id",
            as: "orderAddress",
          },
        },
        {
          $lookup: {
            from: "payments",
            localField: "orderPayment",
            foreignField: "_id",
            as: "orderPayment",
          },
        },
        {
          $lookup: {
            from: "orderItems",
            localField: "_id",
            foreignField: "orderId",
            as: "orderItems",
          },
        },
        {
          $lookup: {
            from: "products",
            localField: "orderItems.productId",
            foreignField: "_id",
            as: "productData",
          },
        },
      ])
      .exec();
    if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
    return result;
  };

  public getUserOrders = async (
    user: User,
    inquiry: OrderInquiry,
  ): Promise<Order[]> => {
    const userId = shapeIntoMongooseObjectId(user._id);
    const matches = { userId: userId, orderStatus: inquiry.orderStatus };
    const result = await this.orderModel
      .aggregate([
        { $match: matches },
        { $sort: { updatedAt: -1 } },
        {
          $lookup: {
            from: "orderItems",
            localField: "_id",
            foreignField: "orderId",
            as: "orderItems",
          },
        },
        {
          $lookup: {
            from: "products",
            localField: "orderItems.productId",
            foreignField: "_id",
            as: "productData",
          },
        },
      ])
      .exec();
    if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);

    return result;
  };

  public updateOrder = async (
    user: User,
    input: OrderUpdateInput,
  ): Promise<Order> => {
    const userId = shapeIntoMongooseObjectId(user._id);
    const orderId = shapeIntoMongooseObjectId(input.orderId);

    const result = await this.orderModel
      .findOneAndUpdate(
        { _id: orderId, userId: userId },
        { orderStatus: input.orderStatus },
        { new: true },
      )
      .exec();
    if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
    return result;
  };
}

export default OrderService;
