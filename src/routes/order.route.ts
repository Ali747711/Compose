import { Router } from "express";
import { OrderItemInput } from "../libs/types/order";
import OrderItemModel from "../schemas/orderItem.schema";
import userController from "../controllers/user.controller";
import orderController from "../controllers/order.controller";
const orderRouter = Router();
orderRouter.post(
  "/create-order",
  userController.verifyAuth,
  orderController.createOrder
);
orderRouter.get(
  "/get-user-orders",
  userController.verifyAuth,
  orderController.getUserOrders
);

orderRouter.put(
  "/update-order",
  userController.verifyAuth,
  orderController.updateOrder
);

export default orderRouter;
