import express from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
} from "../controllers/auth.controller.js";
import { verifyJwt } from "../middleware/verifyJWT.js";

const router = express.Router();

router.post("/register-user", registerUser);
router.post("/login-user", loginUser);
router.get("/logout-user", verifyJwt, logoutUser);
router.get("/me", verifyJwt, getCurrentUser);

export default router;