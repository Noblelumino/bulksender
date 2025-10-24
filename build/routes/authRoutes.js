"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/auth.ts
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const router = (0, express_1.Router)();
/* ========= AUTH ROUTES ========= */
// 🔹 Login
router.get("/login", authController_1.renderLogin);
router.post("/login", authController_1.loginUser);
// 🔹 Register
router.get("/register", authController_1.renderRegister);
router.post("/register", authController_1.registerUser);
// 🔹 Logout
router.get("/logout", authController_1.logoutUser);
exports.default = router;
