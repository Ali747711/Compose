import { Response } from "express";
import { ExtendedRequest } from "../libs/types/user";
import OrderService from "../services/order.service";
import { P } from "../libs/types/common";
import Errors, { HttpCode } from "../libs/Errors";
import { OrderInquiry, OrderUpdateInput } from "../libs/types/order";
import { OrderStatus } from "../libs/enums/order.enum";

const orderService = new OrderService();
const orderController: P = {};

orderController.createOrder = async (req: ExtendedRequest, res: Response) => {
  try {
    console.log("Order controller, [createOrder] ------");
    const user = req.user;
    const input = req.body;

    const result = await orderService.createOrder(user, input);
    res.status(HttpCode.OK).json(result);
  } catch (error) {
    console.log("Order controller, [createOrder] Error: ", error);
    if (error instanceof Errors) {
      res.status(error.code).json(error);
    } else {
      res.status(Errors.standard.code).json(Errors.standard);
    }
  }
};

orderController.getUserOrders = async (req: ExtendedRequest, res: Response) => {
  try {
    console.log("Order controller, [getUserOrders] ---------");
    const user = req.user;
    const { page, limit, orderStatus } = req.query;
    const inquiry: OrderInquiry = {
      page: Number(page),
      limit: Number(limit),
      orderStatus: orderStatus as OrderStatus,
    };
    const result = await orderService.getUserOrders(user, inquiry);
    res.status(HttpCode.OK).json(result);
  } catch (error) {
    console.log("Order controller, [getUserOrders] Error: ", error);
    if (error instanceof Errors) {
      res.status(error.code).json(error);
    } else {
      res.status(Errors.standard.code).json(Errors.standard);
    }
  }
};

orderController.updateOrder = async (req: ExtendedRequest, res: Response) => {
  try {
    console.log("Order controller, [updateOrder] --------");
    const user = req.user;
    const input: OrderUpdateInput = req.body;

    const result = await orderService.updateOrder(user, input);
    res.status(HttpCode.OK).json(result);
  } catch (error) {
    console.log("Order controller, [updateOrder] Error: ", error);
    if (error instanceof Errors) {
      res.status(error.code).json(error);
    } else {
      res.status(Errors.standard.code).json(Errors.standard);
    }
  }
};

export default orderController;
