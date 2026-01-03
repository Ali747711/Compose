import { ObjectId } from "mongoose";
import { shapeIntoMongooseObjectId } from "../libs/configs";
import {
  Payment,
  PaymentInput,
  PaymentUpdateInput,
} from "../libs/types/payment";
import PaymentModel from "../schemas/payment.schema";
import Errors, { HttpCode, Message } from "../libs/Errors";

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

  public getPayments = async (id: ObjectId | null): Promise<Payment[]> => {
    const result = await this.paymentModel.find({ userId: id }).exec();

    if (!result)
      throw new Errors(HttpCode.INTERNAL_SERVER_ERROR, Message.CREATE_FAILED);

    return result;
  };
  public deletePayment = async (id: string): Promise<void> => {
    const result = await this.paymentModel.findOneAndDelete({ _id: id }).exec();

    if (!result)
      throw new Errors(HttpCode.INTERNAL_SERVER_ERROR, Message.CREATE_FAILED);
  };
}

export default PaymentService;
