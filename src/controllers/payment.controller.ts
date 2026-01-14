import { Request, Response } from "express";
import Errors, { HttpCode } from "../libs/Errors";
import { P } from "../libs/types/common";
import { ExtendedRequest, User } from "../libs/types/user";
import PaymentService from "../services/payment.service";
import { shapeIntoMongooseObjectId } from "../libs/configs";
import {
  Payment,
  PaymentInput,
  PaymentUpdateInput,
} from "../libs/types/payment";

const paymentService = new PaymentService();
const paymentController: P = {};

paymentController.addPayment = async (req: ExtendedRequest, res: Response) => {
  try {
    console.log("Payment controller, [addPayment] --------");
    const userId = shapeIntoMongooseObjectId(req.user._id);
    const input: PaymentInput = req.body;

    const result = await paymentService.addPayment(userId, input);
    res.status(HttpCode.OK).json(result);
  } catch (error) {
    console.log("Payment controller, [addPayment] Error: ", error);
    if (error instanceof Errors) {
      res.status(error.code).json(error);
    } else {
      res.status(Errors.standard.code).json(Errors.standard);
    }
  }
};

paymentController.editPayment = async (req: Request, res: Response) => {
  try {
    console.log("Payment controller, [editPayment] --------");
    const { id } = req.params;
    const input: PaymentUpdateInput = req.body;

    const result = await paymentService.editPayment(id, input);
    res.status(HttpCode.OK).json(result);
  } catch (error) {
    console.log("Payment controller, [editPayment] Error: ", error);
    if (error instanceof Errors) {
      res.status(error.code).json(error);
    } else {
      res.status(Errors.standard.code).json(Errors.standard);
    }
  }
};

paymentController.updateDefault = async (
  req: ExtendedRequest,
  res: Response
) => {
  try {
    const user = req.user;
    const { id } = req.params;
    const result = await paymentService.updateDefault(id, user);
    res.status(HttpCode.OK).json(result);
  } catch (error) {
    console.log("Payment controller, [updateDefault] Error: ", error);
    if (error instanceof Errors) {
      res.status(error.code).json(error);
    } else {
      res.status(Errors.standard.code).json(Errors.standard);
    }
  }
};

paymentController.updateMany = async (req: ExtendedRequest, res: Response) => {
  try {
    const user: User = req.user;
    const input: Payment = req.body;
    const result = await paymentService.updateMany(user, input);
    res.status(HttpCode.OK).json(result);
  } catch (error) {
    console.log("Payment controller, [updateMany payments] Error: ", error);
    if (error instanceof Errors) {
      res.status(error.code).json(error);
    } else {
      res.status(Errors.standard.code).json(Errors.standard);
    }
  }
};

paymentController.getPayments = async (req: ExtendedRequest, res: Response) => {
  try {
    console.log("Payment controller, [getPayments] -------");
    const id = shapeIntoMongooseObjectId(req.user._id);

    const result = await paymentService.getPayments(id);
    res.status(HttpCode.OK).json(result);
  } catch (error) {
    console.log("Payment controller, [getPayments] Error: ", error);
    if (error instanceof Errors) {
      res.status(error.code).json(error);
    } else {
      res.status(Errors.standard.code).json(Errors.standard);
    }
  }
};
paymentController.deletePayment = async (req: Request, res: Response) => {
  try {
    console.log("Payment controller, [getPayments] -------");
    const { id } = req.params;

    const result = await paymentService.deletePayment(id);
    res
      .status(HttpCode.OK)
      .json({ success: true, message: "Payment successfully deleted!" });
  } catch (error) {
    console.log("Payment controller, [getPayments] Error: ", error);
    if (error instanceof Errors) {
      res.status(error.code).json(error);
    } else {
      res.status(Errors.standard.code).json(Errors.standard);
    }
  }
};

export default paymentController;
