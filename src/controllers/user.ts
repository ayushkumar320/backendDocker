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
  lastName?: string | undefined;
  password: string;
}

interface LoginRequestBody {
  email: string;
  password: string;
}

export function userPayloadToUserId(req: Request): number | null {
  const userPayload = req.userId;
  let userId: number | null = null;

  if (typeof userPayload === "string") {
    userId = Number(userPayload);
  } else if (
    userPayload &&
    typeof userPayload === "object" &&
    "id" in userPayload
  ) {
    userId = Number(userPayload.id);
  }
  return userId && !isNaN(userId) ? userId : null;
}

export async function userSignup(
  req: Request<never, any, SignupRequestBody>,
  res: Response
) {
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
        },
      });
    } else {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      const newUser = await prisma.user.create({
        data: {
          email,
          firstName,
          lastName: lastName ?? null,
          password: hashedPassword,
        },
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
      },
    });
  }
}

export async function userLogin(
  req: Request<never, any, LoginRequestBody>,
  res: Response
) {
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
        },
      });
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
          },
        });
      } else {
        const token = jwt.sign(
          {
            id: user.id,
          },
          JWT_SECRET as string,
          {
            expiresIn: "7d",
          }
        );
        return res.status(200).json({
          status: {
            code: 200,
            status: "Success",
          },
          data: {
            message: "Login successful",
            token: token,
          },
        });
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
      },
    });
  }
}

export async function getProfileDetails(req: Request, res: Response) {
  const userId = userPayloadToUserId(req);

  if (!userId) {
    return res.status(401).json({
      status: {
        code: 401,
        status: "Error",
      },
      data: {
        message: "Unauthorized - user not authenticated",
      },
    });
  }

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        posts: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        status: {
          code: 404,
          status: "Error",
        },
        data: {
          message: "User not found",
        },
      });
    }

    return res.status(200).json({
      status: {
        code: 200,
        status: "Success",
      },
      data: {
        user: user,
      },
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return res.status(500).json({
      status: {
        code: 500,
        status: "Error",
      },
      data: {
        message: "Internal server error",
        error: error,
      },
    });
  }
}

export async function updateUserProfile(
  req: Request<never, any, Partial<SignupRequestBody>>,
  res: Response
) {
  const {firstName, lastName, password} = req.body;
  const userId = userPayloadToUserId(req);

  if (!userId) {
    return res.status(401).json({
      status: {
        code: 401,
        status: "Error",
      },
      data: {
        message: "Unauthorized - user not authenticated",
      },
    });
  }

  try {
    const updateData: {
      firstName?: string;
      lastName?: string | null;
      password?: string;
    } = {};

    if (firstName) {
      updateData.firstName = firstName;
    }

    if (lastName !== undefined) {
      updateData.lastName = lastName ?? null;
    }

    if (password) {
      const passwordSalt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, passwordSalt);
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        status: {
          code: 400,
          status: "Error",
        },
        data: {
          message: "No fields to update",
        },
      });
    }

    const updatedUser = await prisma.user.update({
      where: {id: userId},
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        updatedAt: true,
      },
    });

    return res.status(200).json({
      status: {
        code: 200,
        status: "Success",
      },
      data: {
        message: "User profile updated successfully",
        user: updatedUser,
      },
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    return res.status(500).json({
      status: {
        code: 500,
        status: "Error",
      },
      data: {
        message: "Internal server error",
        error: error,
      },
    });
  }
}
