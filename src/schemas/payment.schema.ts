import mongoose, { Schema } from "mongoose";
import { PaymentType } from "../libs/enums/payment.enum";

const paymentSchema = new mongoose.Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    cardName: String,

    cardNumber: {
      type: String,
      required: true,
      index: { unique: true, sparse: true },
    },
    expiryMonth: Number,
    expiryYear: Number,
    cardCVC: {
      type: String,
      minlength: [1, "CVC must be 3-4 digits!"],
      maxlength: [4, "CVC must be 3-4 digits!"],
      default: 123,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Indexes
paymentSchema.index({ userId: 1, isDefault: -1 });
paymentSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model("Payment", paymentSchema);
