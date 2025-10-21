import {
  createPost,
  getPosts,
  deletePost
} from "../controllers/post.js";
import {authenticateToken} from "../middlewares/auth.js";
import express from "express";
const router = express.Router();

router.post("/create", authenticateToken, createPost);
router.get("/", getPosts);
router.delete("/delete/:id", authenticateToken, deletePost);
export default router;
