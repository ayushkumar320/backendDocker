import express from "express";
import {userSignup, 
  userLogin,
  getProfileDetails,
  updateUserProfile
} from "../controllers/user.js";
import { authenticateToken } from "../middlewares/auth.js";
const router = express.Router();

router.post("/signup", userSignup);
router.post("/login", userLogin);
router.get("/profile", authenticateToken, getProfileDetails);
router.put("/profile", authenticateToken, updateUserProfile);
export default router;