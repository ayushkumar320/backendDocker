import type {JwtPayload} from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      userId?: JwtPayload | string | null | undefined;
    }
  }
}

export {};
