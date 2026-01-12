import mongoose from "mongoose";

export const AUTH_TIMER = 100; //hours

export const MORGAN_FOMRAT =
  "Method: :method |URL: :url | :response-time |S-code: [:status] | HTTP/:http-version |req-header: :req[header]\n";

export const shapeIntoMongooseObjectId = (target: any) => {
  return typeof target === "string"
    ? new mongoose.Types.ObjectId(target)
    : target;
};
