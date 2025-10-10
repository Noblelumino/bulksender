import { Router } from "express";
import {
  renderLogin,
  loginUser,
  logoutUser,
} from "../controllers/authController";

const router = Router();

router.get("/login", renderLogin);
router.post("/login", loginUser);
router.get("/logout", logoutUser);

export default router;
