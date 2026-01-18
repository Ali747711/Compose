import mongoose, { Schema } from "mongoose";
import { OrderStatus } from "../libs/enums/order.enum";

const orderSchema = new mongoose.Schema(
  {
    orderTotal: {
      type: Number,
      required: true,
    },
    orderStatus: {
      type: String,
      enum: OrderStatus,
      default: OrderStatus.PAUSE,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    deliveryDate: String,
    deliveryFee: Number,
    tip: Number,
    orderAddress: {
      type: Schema.Types.ObjectId,
      ref: "Address",
      required: true,
    },
    orderPayment: {
      type: Schema.Types.ObjectId,
      ref: "Payment",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
