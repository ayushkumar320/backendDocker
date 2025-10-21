import prisma from "../db/connect.js";
import type {Request, Response} from "express";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

interface SignupRequestBody {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
}

export async function userSignup(req: Request, res: Response) {
  const {email, firstName, lastName, password} = req.body;
  try {
    const existingUser = await prisma.user.findUnique({where: {email}});
    if (existingUser) {
      return res.json({
        status: {
          code: 400,
          status: "Error",
        }, 
        data: {
          message: "User with this email already exists, try logging in",
        }
      })
    } else {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      const newUser = await prisma.user.create({
        data: {email, firstName, lastName, password: hashedPassword},
      });
      return res.json({
        status: {
          code: 200,
          status: "Success",
        },
        data: {
          message: "User created successfully",
          user: {
            id: newUser.id,
            email: newUser.email,
            firstName: newUser.firstName,
            lastName: newUser.lastName,
          },
        },
      });
    }
  } catch (error) {
    console.error("Error signing up user:", error);
    return res.status(500).json({
      status: {
        code: 500,
        status: "Error",
      },
      data: {
        message: "Internal server error",
        error: error,
      }
    })
  }
}

export async function userLogin(req: Request, res: Response) {
  const {email, password} = req.body;
  try {
    const user = await prisma.user.findUnique({where: {email}});
    if (!user) {
      return res.json({
        status: {
          code: 400,
          status: "Error",
        }, 
        data: {
          message: "Invalid email or password",
        }
      })
    } else {
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.json({
          status: {
            code: 500,
            status: "Error",
          },
          data: {
            message: "Invalid password",
          }
        })
      } else {
        const token = jwt.sign({
          id: user.id,
        }, JWT_SECRET as string, {
          expiresIn: "7d"
        });
        return res.status(200).json({
          status: {
            code: 200,
            status: "Success",
          },
          data: {
            message: "Login successful",
            token: token,
          }
        })
      }
    }
  } catch (error) {
    return res.status(500).json({
      status: {
        code: 500,
        status: "Error",
      },
      data: {
        message: "Internal server error",
        error: error,
      }
    })
  }
}