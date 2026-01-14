import { Router } from "express";
import userController from "../controllers/user.controller";
import paymentController from "../controllers/payment.controller";

const paymentRouter = Router();
paymentRouter.post(
  "/add-payment",
  userController.verifyAuth,
  paymentController.addPayment
);
paymentRouter.get(
  "/get-payments",
  userController.verifyAuth,
  paymentController.getPayments
);

paymentRouter.put(
  "/edit-payment/:id",
  userController.verifyAuth,
  paymentController.editPayment
);

paymentRouter.put(
  "/update-default/:id",
  userController.verifyAuth,
  paymentController.updateDefault
);

paymentRouter.put(
  "/update-many",
  userController.verifyAuth,
  paymentController.updateMany
);
paymentRouter.delete(
  "/delete-payment/:id",
  userController.verifyAuth,
  paymentController.deletePayment
);
export default paymentRouter;
