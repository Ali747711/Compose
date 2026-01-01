import mongoose, { Schema } from "mongoose";
import { ViewGroup } from "../libs/enums/view.enum";

const viewSchema = new mongoose.Schema(
  {
    viewGroup: {
      type: String,
      enum: ViewGroup,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    viewRefId: {
      type: Schema.Types.ObjectId, // no ref means, you can reference any collection later
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("View", viewSchema);
