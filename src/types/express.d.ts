import { HydratedDocument } from "mongoose";
import { IUser } from "../model/user.model.js";

declare global {
  namespace Express {
    interface Request {
      user?: HydratedDocument<IUser>;
    }
  }
}

export {};
