import { Router } from "express";
import { OrderItemInput } from "../libs/types/order";
import OrderItemModel from "../schemas/orderItem.schema";
const orderRouter = Router();
orderRouter.get("/", async (req, res) => {
  const input: OrderItemInput = {
    itemQuantity: 1,
    itemPrice: 89.0,
    productId: Object("69535c5f040e89c45bdb90a9"),
    orderId: Object("69535c5f040e89c45bdb90a8"),
  };
  const order = await OrderItemModel.create(input);
  res.json({ order: order });
});
export default orderRouter;
