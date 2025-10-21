import dotenv from "dotenv";
import type {Request, Response} from "express";
import jwt from "jsonwebtoken";
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

export function authenticateToken(req: Request, res: Response, next: Function) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    return res.sendStatus(401);
  }
  jwt.verify(token, JWT_SECRET as string, (err, userId) => {
    if (err) {
      return res.sendStatus(403);
    }
    req.userId = userId;
    next();
  });
}
