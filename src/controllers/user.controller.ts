import { NextFunction, Request, Response } from "express";
import { P } from "../libs/types/common";
import {
  ExtendedRequest,
  UserInput,
  UserLoginInput,
  UserUpdateInput,
} from "../libs/types/user";
import Errors, { HttpCode, Message } from "../libs/Errors";
import AuthService from "../services/auth.service";
import { AUTH_TIMER } from "../libs/configs";
import UserService from "../services/user.service";
import { uploader } from "../libs/utils/uploadToCloudinary";
import { logger } from "../libs/utils/logger";
import rateLimit from "../libs/utils/upstash";

const authService = new AuthService();
const userService = new UserService();
const userController: P = {};

userController.signup = async (req: ExtendedRequest, res: Response) => {
  try {
    console.log("User controller, [signup] -----------");
    const input: UserInput = req.body;
    if (!req.file)
      input.userImage =
        "https://res.cloudinary.com/dmenptrzv/image/upload/v1767322700/users/akw9yyu4atuaunmchip8.png";
    else {
      const image: any = await uploader(req.file, "users");
      input.userImage = image?.secure_url;
    }
    const result = await userService.signup(input);
    const token = await authService.createToken(result);

    // setting cookie
    res.cookie("accessToken", token, {
      maxAge: AUTH_TIMER * 3600 * 1000,
      secure: true,
      sameSite: "none",
      httpOnly: true,
    });
    res.status(HttpCode.OK).json({ user: result, token });
  } catch (error) {
    console.log("User controller, [signup] Error: ", error);
    if (error instanceof Errors) {
      res.status(error.code).json(error);
    } else {
      res.status(Errors.standard.code).json(Errors.standard);
    }
  }
};
userController.login = async (req: Request, res: Response) => {
  try {
    logger.info("User controller", "login", "user is logging in!");
    const input: UserLoginInput = req.body;

    const result = await userService.login(input);
    const token = await authService.createToken(result);

    // Cookie
    res.cookie("accessToken", token, {
      maxAge: AUTH_TIMER * 3600 * 1000,
      secure: true,
      sameSite: "none",
      httpOnly: true,
    });

    res.status(HttpCode.OK).json({ user: result, token });
  } catch (error) {
    console.log("User controller, [login] Error: ", error);
    if (error instanceof Errors) {
      res.status(error.code).json(error);
    } else {
      res.status(Errors.standard.code).json(Errors.standard);
    }
  }
};

userController.logout = async (req: Request, res: Response) => {
  try {
    console.log("User controller, [logout]--------");
    res.cookie("accessToken", null, {
      secure: true,
      httpOnly: true,
      sameSite: "none",
    });
    res
      .status(HttpCode.OK)
      .json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    console.log("User controller, [logout] Error: ", error);
    if (error instanceof Errors) {
      res.status(error.code).json(error);
    } else {
      res.status(Errors.standard.code).json(Errors.standard);
    }
  }
};

userController.updateUser = async (req: ExtendedRequest, res: Response) => {
  try {
    console.log("User controller, [updateUser]--------");
    console.log("File: ", req.file);
    const user = req.user;
    const input: UserUpdateInput = req.body;
    // if (!req.file)
    //   input.userImage =
    //     "https://res.cloudinary.com/dmenptrzv/image/upload/v1767322700/users/akw9yyu4atuaunmchip8.png";
    // else {
    //   const image: any = await uploader(req.file, "users");
    //   input.userImage = image?.secure_url;
    // }
    const image: any = await uploader(req.file, "users");
    input.userImage = image?.secure_url;

    const result = await userService.updateUser(user, input);
    res.status(HttpCode.OK).json({ success: true, user: result });
  } catch (error) {
    console.log("User controller, [updateUser] Error: ", error);
    if (error instanceof Errors) {
      res.status(error.code).json(error);
    } else {
      res.status(Errors.standard.code).json(Errors.standard);
    }
  }
};

userController.getTopUsers = async (req: Request, res: Response) => {
  try {
    console.log("User controller, [getTopUsers]--------");
    const result = await userService.getTopUsers();
    res.status(HttpCode.OK).json({ success: true, users: result });
  } catch (error) {
    console.log("User controller, [getUsers] Error: ", error);
    if (error instanceof Errors) {
      res.status(error.code).json(error);
    } else {
      res.status(Errors.standard.code).json(Errors.standard);
    }
  }
};

// Middlewares

userController.verifyAuth = async (
  req: ExtendedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log("User controller, [verifyAuth]--------");

    let token;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
      // console.log("Token from Auth header: ", token);
    }

    //const token = req.cookies["accessToken"];
    if (!token && req.cookies.accessToken) {
      token = req.cookies.accessToken;
      // console.log("COOKIE: ", req.cookies);
    }
    if (token) req.user = await authService.checkAuth(token);
    if (!req.user)
      throw new Errors(HttpCode.UNAUTHORIZED, Message.NOT_AUTHENTICATED);

    next();
  } catch (error) {
    console.log("User controller, [verifyAuth] Error: ", error);
    if (error instanceof Errors) {
      res.status(error.code).json(error);
    } else {
      res.status(Errors.standard.code).json(Errors.standard);
    }
  }
};

userController.rateLimiter = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { success } = await rateLimit.limit("my-rate-limiter");
    if (!success) {
      return res.status(429).json({
        message: "Too Many Requests, Please wait and try again later!",
      });
    }
    next();
  } catch (error) {
    logger.error("User controller", "rate limiter", error);
    console.error("Rate limiting error:", error);
    next(error);
  }
};

userController.getUserDetails = async (req: ExtendedRequest, res: Response) => {
  try {
    console.log("User controller, [getUserDetails]--------");
    const result = await userService.getUserDetails(req.user);
    res.status(HttpCode.OK).json(result);
  } catch (error) {
    console.log("User controller, [getUserDetails] Error: ", error);
    if (error instanceof Errors) {
      res.status(error.code).json(error);
    } else {
      res.status(Errors.standard.code).json(Errors.standard);
    }
  }
};
export default userController;
