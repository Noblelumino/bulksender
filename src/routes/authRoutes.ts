// src/routes/auth.ts
import { Router } from "express";
import {
  renderLogin,
  loginUser,
  logoutUser,
  renderRegister,
  registerUser,
} from "../controllers/authController";

const router = Router();

/* ========= AUTH ROUTES ========= */

// 🔹 Login
router.get("/login", renderLogin);
router.post("/login", loginUser);

// 🔹 Register
router.get("/register", renderRegister);
router.post("/register", registerUser);

// 🔹 Logout
router.get("/logout", logoutUser);

export default router;
