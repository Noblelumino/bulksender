import { Router, Request, Response } from "express";
import { ensureAuthenticated } from "../middleware/authGuard";

const router = Router();

router.get("/dashboard", ensureAuthenticated, (req: Request, res: Response) => {
  const user = req.session.user;
  res.render("dashboard", { user });
});

export default router;
