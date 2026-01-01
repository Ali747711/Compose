import { Router } from "express";
import { UserInput } from "../libs/types/user";
import { UserStatus, UserType } from "../libs/enums/user.enum";
import UserModel from "../schemas/user.schema";
const userRouter = Router();
userRouter.get("/", async (req, res) => {
  const input: UserInput = {
    userType: UserType.USER, // assuming UserType enum has "customer" | "admin" etc.
    userStatus: UserStatus.ACTIVE, // assuming UserStatus: "active" | "inactive" | "banned"
    userNick: "orangeLover99",
    userPhone: "+201234567890",
    userPassword: "SuperSecurePass123!",
    userAddress: ["123 Cairo St, Nasr City, Egypt"],
    userBio: "I love fresh fruits and fast delivery!",
    userImage: "https://example.com/images/users/orangeLover.jpg",
    userPoints: 450,
  };

  const user = await UserModel.create(input);
  res.json({ user: user });
});
export default userRouter;
