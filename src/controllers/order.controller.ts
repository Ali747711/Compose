import { Response } from "express";
import { ExtendedRequest } from "../libs/types/user";
import OrderService from "../services/order.service";
import { P } from "../libs/types/common";
import Errors, { HttpCode } from "../libs/Errors";

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

export default orderController;
