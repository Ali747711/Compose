import mongoose, { Schema } from "mongoose";

const addressSchema = new mongoose.Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    label: String,
    street: String,
    city: String,
    state: String,
    zipcode: String,
    country: {
      type: String,
      required: true,
      default: "Uzbekistan",
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

addressSchema.index({ userId: 1, isDefault: -1 }); // Fast default lookup
addressSchema.index({ userId: 1, createdAt: -1 }); // pagination

export default mongoose.model("Address", addressSchema);
