import { ObjectId } from "mongoose";
import { shapeIntoMongooseObjectId } from "../libs/configs";
import {
  Payment,
  PaymentInput,
  PaymentUpdateInput,
} from "../libs/types/payment";
import PaymentModel from "../schemas/payment.schema";
import Errors, { HttpCode, Message } from "../libs/Errors";
import { User } from "../libs/types/user";

class PaymentService {
  private readonly paymentModel;
  constructor() {
    this.paymentModel = PaymentModel;
  }

  public addPayment = async (
    userId: ObjectId | null,
    input: PaymentInput
  ): Promise<Payment> => {
    input.userId = userId;
    const result = await this.paymentModel.create(input);

    if (!result)
      throw new Errors(HttpCode.INTERNAL_SERVER_ERROR, Message.CREATE_FAILED);
    return result;
  };

  public editPayment = async (
    id: string,
    input: PaymentUpdateInput
  ): Promise<Payment> => {
    id = shapeIntoMongooseObjectId(id);
    const result = await this.paymentModel.findOneAndUpdate(id, input, {
      new: true,
    });

    if (!result)
      throw new Errors(HttpCode.INTERNAL_SERVER_ERROR, Message.CREATE_FAILED);

    return result;
  };

  public updateMany = async (
    user: User,
    input: Payment
  ): Promise<Payment[]> => {
    const userId = shapeIntoMongooseObjectId(user._id);
    const productId = shapeIntoMongooseObjectId(input._id);

    await this.paymentModel.updateMany(
      { userId },
      { $set: { isDefault: false } }
    );
    await this.paymentModel.updateOne(
      { _id: productId, userId },
      { $set: { isDefault: true } }
    );

    const result = await this.paymentModel
      .find({ userId })
      .sort({ createdAt: -1 })
      .exec();

    if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.UPDATE_FAILED);
    return result;
  };

  public updateDefault = async (id: string, user: User): Promise<Payment[]> => {
    const userId = shapeIntoMongooseObjectId(user._id);
    id = shapeIntoMongooseObjectId(id);

    await this.paymentModel.updateMany(
      { userId },
      { $set: { isDefault: false } }
    );

    await this.paymentModel.updateOne(
      { _id: id, userId },
      { $set: { isDefault: true } }
    );

    const result = await this.paymentModel
      .find({ userId })
      .sort({ updatedAt: -1 })
      .exec();

    if (!result)
      throw new Errors(HttpCode.INTERNAL_SERVER_ERROR, Message.UPDATE_FAILED);
    return result;
  };

  public getPayments = async (id: ObjectId | null): Promise<Payment[]> => {
    const result = await this.paymentModel.find({ userId: id }).exec();

    if (!result)
      throw new Errors(HttpCode.INTERNAL_SERVER_ERROR, Message.CREATE_FAILED);

    return result;
  };
  public deletePayment = async (id: string): Promise<void> => {
    const result = await this.paymentModel.findOneAndDelete({ _id: id }).exec();

    if (!result)
      throw new Errors(HttpCode.INTERNAL_SERVER_ERROR, Message.DELETE_FAILED);
  };
}

export default PaymentService;
