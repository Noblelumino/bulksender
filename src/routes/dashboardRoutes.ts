import { Router, Request, Response } from "express";
import { ensureAuthenticated } from "../middleware/authGuard";

const router = Router();

router.get("/dashboard", ensureAuthenticated, (req: Request, res: Response) => {
  const user = req.session.user;
  res.render("dashboard", { user });
});

router.get("/adminDashboard", ensureAuthenticated, (req: Request, res: Response) => {
  const user = req.session.user;
  res.render("adminDashboard", { user });
});

router.get("/register", ensureAuthenticated, (req: Request, res: Response) => {
  const user = req.session.user;
  res.render("register", { user });
});



export default router;
