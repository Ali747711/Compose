import mongoose, { Schema } from "mongoose";

const productReviewSchema = new Schema(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userName: String,
    userImage: String,
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    title: {
      type: String,
      required: true,
      maxlength: 100,
    },
    comment: {
      type: String,
      required: true,
      maxlenth: 1000,
    },
    helpfulCount: {
      type: Number,
      default: 0,
    },
    isVerifiedPurchase: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Indexes
productReviewSchema.index({ productId: 1, createdAt: -1 }); // Pagination
productReviewSchema.index({ userId: 1, productId: 1 }, { unique: true }); // One review per user per product

export default mongoose.model("ProductReview", productReviewSchema);
