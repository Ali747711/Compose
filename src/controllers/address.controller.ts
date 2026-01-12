import { Response, Request } from "express";
import { P } from "../libs/types/common";
import { ExtendedRequest, User } from "../libs/types/user";
import AddressService from "../services/address.service";
import Errors, { HttpCode } from "../libs/Errors";
import {
  Address,
  AddressInput,
  AddressUpdateInput,
} from "../libs/types/address";

const addressService = new AddressService();
const addressController: P = {};

addressController.getUserAddresses = async (
  req: ExtendedRequest,
  res: Response
) => {
  try {
    console.log("Address controller, [getAddresses] ------");
    const userId = req.user._id;
    const result = await addressService.getUserAddresses(userId);
    res.status(HttpCode.OK).json(result);
  } catch (error) {
    console.log("Address controller, [getAddresses] Error: ", error);
    if (error instanceof Errors) {
      res.status(error.code).json(error);
    } else {
      res.status(Errors.standard.code).json(Errors.standard);
    }
  }
};

addressController.createAddress = async (
  req: ExtendedRequest,
  res: Response
) => {
  try {
    console.log("Address controller, [createAddress] ------");
    const userId = req.user._id;
    const input: AddressInput = req.body;
    input.userId = userId;
    const result = await addressService.createAddress(input);
    res.status(HttpCode.OK).json(result);
  } catch (error) {
    console.log("Address controller, [createAddress] Error: ", error);
    if (error instanceof Errors) {
      res.status(error.code).json(error);
    } else {
      res.status(Errors.standard.code).json(Errors.standard);
    }
  }
};

addressController.updateAddress = async (req: Request, res: Response) => {
  try {
    console.log("Address controller, [updateAddress] ------");
    const { id } = req.params;
    const input: AddressUpdateInput = req.body;
    console.log("Address controller, [updateAddress] incoming ID param: ", id);
    const result = await addressService.updateAddress(id, input);
    res.status(HttpCode.OK).json(result);
  } catch (error) {
    console.log("Address controller, [updateAddress] Error: ", error);
    if (error instanceof Errors) {
      res.status(error.code).json(error);
    } else {
      res.status(Errors.standard.code).json(Errors.standard);
    }
  }
};

addressController.updateDefault = async (
  req: ExtendedRequest,
  res: Response
) => {
  try {
    console.log("Address controller, [updateDefault] ------");
    const user = req.user;
    const { id } = req.params;
    console.log(req.params);
    const result: Address[] = await addressService.updateDefault(user, id);
    res.status(HttpCode.OK).json(result);
  } catch (error) {
    console.log("Address controller, [updateDefault] Error: ", error);
    if (error instanceof Errors) {
      res.status(error.code).json(error);
    } else {
      res.status(Errors.standard.code).json(Errors.standard);
    }
  }
};

addressController.updateMany = async (req: ExtendedRequest, res: Response) => {
  try {
    console.log("Address controller, [updateMany] ------");
    const user: User = req.user;
    const input = req.body;

    // console.log("Incoming data for Default true: ", req.body);
    const result = await addressService.updateMany(user, input);
    // console.log("Update Many result: ", result);
    res.status(HttpCode.OK).json(result);
  } catch (error) {
    console.log("Address controller, [updateMany] Error: ", error);
    if (error instanceof Errors) {
      res.status(error.code).json(error);
    } else {
      res.status(Errors.standard.code).json(Errors.standard);
    }
  }
};

addressController.deleteAddress = async (req: Request, res: Response) => {
  try {
    console.log("Address controller, [deleteAddress] ------");
    const { id } = req.params;
    const result = await addressService.deleteAddress(id);
    res
      .status(HttpCode.OK)
      .json({ success: true, message: "Address successfully deleted!" });
  } catch (error) {
    console.log("Address controller, [deleteAddress] Error: ", error);
    if (error instanceof Errors) {
      res.status(error.code).json(error);
    } else {
      res.status(Errors.standard.code).json(Errors.standard);
    }
  }
};

export default addressController;
