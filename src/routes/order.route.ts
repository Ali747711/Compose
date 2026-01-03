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
export default orderRouter;
