import prisma from "../db/connect.js";
import type {Request, Response} from "express";

interface createPostRequestBody {
  title: string;
  content?: string;
}

export async function createPost(
  req: Request<never, any, createPostRequestBody>,
  res: Response
) {
  const {title, content} = req.body;
  const userPayload = req.userId;

  // Extracting the user id from the JWT payload 
  let userId: number | undefined;
  if (typeof userPayload === "string") {
    userId = Number(userPayload);
  } else if (
    userPayload &&
    typeof userPayload === "object" &&
    "id" in userPayload
  ) {
    userId = Number(userPayload.id);
  }

  if (!userId || isNaN(userId)) {
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
    const newPost = await prisma.post.create({
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
