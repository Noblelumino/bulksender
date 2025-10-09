// src/routes/authRoutes.ts
import express from "express";
import { postRegister, postLogin } from "../controllers/authController";

const router = express.Router();

// POST register (admin only - your index.ts will protect GET/POST /register via requireAdmin)
router.post("/register", postRegister);

// POST login
router.post("/login", postLogin);

export default router;
