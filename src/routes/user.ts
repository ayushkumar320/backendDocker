import express from "express";
import {userSignup, 
  userLogin,
  getProfileDetails
} from "../controllers/user.js";
import { authenticateToken } from "../middlewares/auth.js";
const router = express.Router();

router.post("/signup", userSignup);
router.post("/login", userLogin);
router.get("/profile", authenticateToken, getProfileDetails);

export default router;