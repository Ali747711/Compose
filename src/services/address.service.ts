import { AddressInput, AddressUpdateInput } from "./../libs/types/address";
import { ObjectId } from "mongoose";
import AddressModel from "../schemas/address.schema";
import { Address } from "../libs/types/address";
import Errors, { HttpCode, Message } from "../libs/Errors";
import { shapeIntoMongooseObjectId } from "../libs/configs";
import { User } from "../libs/types/user";

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

  public updateDefault = async (user: User, id: string): Promise<Address[]> => {
    console.log("Address service, [updateAddress] -------");
    const userId = shapeIntoMongooseObjectId(user._id);
    id = shapeIntoMongooseObjectId(id);
    await this.addressModel.updateMany(
      { userId },
      { $set: { isDefault: false } }
    );

    await this.addressModel.updateOne(
      { _id: id, userId },
      { $set: { isDefault: true } }
    );

    const result = await this.addressModel
      .find({ userId })
      .sort({ createdAt: -1 })
      .exec();

    return result;
  };

  public updateMany = async (
    user: User,
    input: Address
  ): Promise<Address[]> => {
    const id = shapeIntoMongooseObjectId(user._id);
    const productId = shapeIntoMongooseObjectId(input._id);
    await this.addressModel.updateMany(
      { userId: id },
      { $set: { isDefault: false } }
    );
    await this.addressModel.updateOne(
      { _id: productId, userId: id },
      { $set: { isDefault: true } }
    );
    const result = await this.addressModel
      .find({ userId: id })
      .sort({ createdAt: -1 })
      .exec();
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
