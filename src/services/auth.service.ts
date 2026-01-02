import jwt from "jsonwebtoken";
import { User } from "../libs/types/user";
import { AUTH_TIMER } from "../libs/configs";
import Errors, { HttpCode, Message } from "../libs/Errors";

class AuthService {
  private readonly secretToken;
  private readonly duration;

  constructor() {
    this.secretToken = process.env.SECRET_TOKEN as string;
    this.duration = `${AUTH_TIMER}h`;
  }

  public createToken = async (payload: User) => {
    console.log("Token service, [createToken] -----------");
    console.log("Token service, [createToken] ENV string: ", this.secretToken);
    console.log("Token service, [createToken] Incoming Payload: ", payload);
    return new Promise((reject, resolve) => {
      const duration = `${AUTH_TIMER}h`;
      console.log("Token service, [createToken], Duration: ", duration);
      jwt.sign(
        payload,
        this.secretToken,
        { expiresIn: duration },
        (err, token) => {
          if (err) {
            reject(
              new Errors(HttpCode.BAD_REQUEST, Message.TOKEN_CREATION_FAILED)
            );
          } else {
            resolve(token as string);
          }
        }
      );
    });
  };

  public token = async (payload: User) => {
    try {
      const duration = `${AUTH_TIMER}h`;
      const token = await jwt.sign(payload, this.secretToken, {
        expiresIn: duration,
      });
      return token;
    } catch (error) {
      console.log("Auth service, [token] Error: ", error);
      throw new Errors(HttpCode.BAD_REQUEST, Message.TOKEN_CREATION_FAILED);
    }
  };

  public checkAuth = async (token: string) => {
    const result = (await jwt.verify(token, this.secretToken)) as User;
    console.log("Token service, [checkAuth] User: ", result);
    return result;
  };
}

export default AuthService;
