import { AddressInput, AddressUpdateInput } from "./../libs/types/address";
import { ObjectId } from "mongoose";
import AddressModel from "../schemas/address.schema";
import { Address } from "../libs/types/address";
import Errors, { HttpCode, Message } from "../libs/Errors";
import { shapeIntoMongooseObjectId } from "../libs/configs";

class AddressService {
  private readonly addressModel;

  constructor() {
    this.addressModel = AddressModel;
  }

  public getUserAddresses = async (
    userId: ObjectId | null
  ): Promise<Address[]> => {
    console.log("Address service, [getAddresses]------- ");
    const result = await this.addressModel.find({ userId });
    if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);

    return result;
  };

  public createAddress = async (input: AddressInput): Promise<Address> => {
    console.log("Address service, [getAddresses] incoming input: ", input);

    const result = await this.addressModel.create(input);
    if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
    return result;
  };

  public updateAddress = async (
    id: string,
    input: AddressUpdateInput
  ): Promise<Address> => {
    console.log("Address service, [updateAddress] -------");
    id = shapeIntoMongooseObjectId(id);
    console.log("ID: ", id);
    const result = await this.addressModel.findByIdAndUpdate(id, input, {
      new: true,
    });

    if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
    return result;
  };

  public deleteAddress = async (id: string): Promise<void> => {
    id = shapeIntoMongooseObjectId(id);
    const result = await this.addressModel.findByIdAndDelete(id);
    if (!result) throw new Errors(HttpCode.BAD_REQUEST, Message.DELETE_FAILED);
  };
}

export default AddressService;
