import mongoose, { Schema } from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    cardName: String,
    cardNumber: String,
    expiryMonth: Number,
    expiryYear: Number,
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
