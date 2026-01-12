import { Router } from "express";
import { UserInput } from "../libs/types/user";
import { UserStatus, UserType } from "../libs/enums/user.enum";
import UserModel from "../schemas/user.schema";
import userController from "../controllers/user.controller";
import { upload } from "../libs/utils/multer";
const userRouter = Router();
userRouter.post("/signup", upload.single("userImage"), userController.signup);
userRouter.post("/login", userController.login);
userRouter.get("/logout", userController.verifyAuth, userController.logout);
userRouter.post(
  "/updateUser",
  userController.verifyAuth,
  upload.single("userImage"),
  userController.updateUser
);
userRouter.get("/top-users", userController.getTopUsers);
userRouter.get(
  "/user-details",
  userController.verifyAuth,
  userController.getUserDetails
);

export default userRouter;
