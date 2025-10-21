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

export async function getPosts(req: Request, res: Response) {
  try {
    const posts = await prisma.post.findMany({
      include: {
        author: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
    return res.status(200).json({
      status: {
        code: 200,
        message: "Posts fetched successfully",
      },
      data: {
        posts: posts,
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

export async function deletePost(req: Request<{id: string}>, res: Response) {
  const postIdParam = req.params.id;
  const postId = Number(postIdParam);
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

  if (!postId || isNaN(postId)) {
    return res.status(400).json({
      status: {
        code: 400,
        status: "Error",
      },
      data: {
        message: "Invalid post ID",
      },
    });
  }

  try {
    const post = await prisma.post.findUnique({
      where: {id: postId},
    });

    if (!post) {
      return res.status(404).json({
        status: {
          code: 404,
          status: "Error",
        },
        data: {
          message: "Post not found",
        },
      });
    }

    if (post.authorId !== userId) {
      return res.status(403).json({
        status: {
          code: 403,
          status: "Error",
        },
        data: {
          message: "Forbidden - you do not have permission to delete this post",
        },
      });
    }

    await prisma.post.delete({
      where: {id: postId},
    });

    return res.status(200).json({
      status: {
        code: 200,
        status: "Success",
      },
      data: {
        message: "Post deleted successfully",
      },
    });
  } catch (error) {
    console.error("Error deleting post:", error);
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
