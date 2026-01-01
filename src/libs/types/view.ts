import { Types } from "mongoose";
import { ViewGroup } from "../enums/view.enum";

export interface View {
  _id: Types.ObjectId;
  viewGroup: ViewGroup;
  userid: Types.ObjectId;
  viewRefId: Types.ObjectId;
  createdAt: Date;
  updateAt: Date;
}

export interface ViewInput {
  userId: Types.ObjectId;
  viewRefId: Types.ObjectId;
  viewGroup: ViewGroup;
}
