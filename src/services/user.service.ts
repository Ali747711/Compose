import userController from "../controllers/user.controller";
import { shapeIntoMongooseObjectId } from "../libs/configs";
import { UserStatus } from "../libs/enums/user.enum";
import Errors, { HttpCode, Message } from "../libs/Errors";
import {
  User,
  UserInput,
  UserLoginInput,
  UserUpdateInput,
} from "../libs/types/user";
import UserModel from "../schemas/user.schema";
import bcrypt from "bcryptjs";

class UserService {
  private readonly userModel;

  constructor() {
    this.userModel = UserModel;
  }

  public signup = async (input: UserInput): Promise<User> => {
    console.log("User service, [signup] -----");
    // console.log("User service, [signup] Incoming data: ", input);

    // Password hashing
    const salt = await bcrypt.genSalt();
    input.userPassword = await bcrypt.hash(input.userPassword, salt);

    const exist = await this.userModel
      .findOne({
        $or: [
          { userEmail: input.userEmail },
          { userNick: input.userNick },
          { userPhone: input.userPhone },
        ],
      })
      .exec();
    if (exist) {
      throw new Errors(HttpCode.BAD_REQUEST, Message.USED_NICK_PHONE);
    }

    try {
      const user = await this.userModel.create(input);
      return user.toJSON();
    } catch (error) {
      // ✅ LOG THE ACTUAL ERROR
      console.error("User service, [signup] Database Error:", error);
      console.error("Error code:", error.code);
      console.error("Error message:", error.message);

      // ✅ Handle duplicate key (E11000)
      if (error.code === 11000) {
        console.error("Duplicate field:", error.keyPattern);
        throw new Errors(HttpCode.BAD_REQUEST, Message.USED_NICK_PHONE);
      }

      // ✅ Handle validation errors
      if (error.name === "ValidationError") {
        console.error("Validation errors:", error.errors);
        throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED);
      }

      throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED);
    }
  };

  public login = async (input: UserLoginInput): Promise<User> => {
    console.log("User service, [login] -----");

    const user = await this.userModel
      .findOne(
        {
          userNick: input.userNick,
          userStatus: { $ne: UserStatus.DELETE },
        },
        { userNick: 1, userPassword: 1, userStatus: 1 }
      )
      .exec();
    if (!user) {
      throw new Errors(HttpCode.NOT_FOUND, Message.NO_MEMBER_NICK);
    } else if (user.userStatus === UserStatus.BLOCK) {
      throw new Errors(HttpCode.FORBIDDEN, Message.BLOCKED_USER);
    }
    // Comparing passwords
    const isMatch = await bcrypt.compare(input.userPassword, user.userPassword);

    if (!isMatch) {
      throw new Errors(HttpCode.UNAUTHORIZED, Message.WRONG_PASSWORD);
    }
    const result = await this.userModel.findById(user._id).exec();
    return result?.toJSON() as User;
  };

  public getUserDetails = async (user: User): Promise<User> => {
    const userId = shapeIntoMongooseObjectId(user._id);
    const match = { _id: userId, userStatus: UserStatus.ACTIVE };
    const result = await this.userModel
      .aggregate([
        { $match: match },
        {
          $lookup: {
            from: "addresses",
            localField: "_id",
            foreignField: "userId",
            as: "userAddresses",
          },
        },
        {
          $lookup: {
            from: "payments",
            localField: "_id",
            foreignField: "userId",
            as: "userPayments",
          },
        },
        {
          $lookup: {
            from: "orders",
            localField: "_id",
            foreignField: "userId",
            as: "userOrders",
          },
        },
      ])
      .exec();

    if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
    return result[0];
  };

  public updateUser = async (
    user: User,
    input: UserUpdateInput
  ): Promise<User> => {
    const userId = shapeIntoMongooseObjectId(user._id);
    const result = await this.userModel
      .findOneAndUpdate({ _id: userId }, input, { new: true })
      .exec();

    if (!result) throw new Errors(HttpCode.NOT_MODIFIED, Message.UPDATE_FAILED);
    return result;
  };

  public updateChosenUser = async (input: UserUpdateInput): Promise<User> => {
    const userId = shapeIntoMongooseObjectId(input._id);
    const result = await this.userModel
      .findOneAndUpdate(
        {
          _id: userId,
        },
        input,
        { new: true }
      )
      .exec();

    if (!result) throw new Errors(HttpCode.NOT_MODIFIED, Message.UPDATE_FAILED);
    return result;
  };

  public getTopUsers = async (): Promise<User[]> => {
    const result = await this.userModel
      .find({
        userStatus: UserStatus.ACTIVE,
        userPoints: { $gte: 0 },
      })
      .sort({ userPoints: -1 })
      .limit(5)
      .exec();
    if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
    return result;
  };
}

export default UserService;
