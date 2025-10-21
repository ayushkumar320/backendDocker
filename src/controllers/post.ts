import prisma from "../db/connect.js";
import type {Request, Response} from "express";
import {userPayloadToUserId} from "./user.js";

interface createPostRequestBody {
  title: string;
  content?: string;
}

export async function createPost(
  req: Request<never, any, createPostRequestBody>,
  res: Response
) {
  const {title, content} = req.body;
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
    await prisma.post.create({
      data: {
        title,
        content: content ?? null,
        authorId: userId,
      },
    });
    return res.status(201).json({
      status: {
        code: 201,
        status: "Success",
      },
      data: {
        message: "Post created successfully",
        title: title,
        description: content ?? null,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: {
        code: 500,
        message: "Internal Server Error",
      },
      data: {
        message: "Internal Server Error",
        error: error,
      },
    });
  }
}
