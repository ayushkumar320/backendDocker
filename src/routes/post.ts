import {createPost} from "../controllers/post.js";
import {authenticateToken} from "../middlewares/auth.js";
import express from "express";
const router = express.Router();

router.post("/create", authenticateToken, createPost);
export default router;
