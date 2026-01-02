import { Router } from "express";
import addressController from "../controllers/address.controller";
import userController from "../controllers/user.controller";

const addressRouter = Router();

addressRouter.get(
  "/addresses",
  userController.verifyAuth,
  addressController.getUserAddresses
);
addressRouter.post(
  "/add-address",
  userController.verifyAuth,
  addressController.createAddress
);

addressRouter.put(
  "/update-address/:id",
  userController.verifyAuth,
  addressController.updateAddress
);

addressRouter.delete(
  "/delete-address/:id",
  userController.verifyAuth,
  addressController.deleteAddress
);
export default addressRouter;
