// index.ts (replace relevant parts or merge)
import express, { Application, Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import session from "express-session";
import path from "path";
import cors from "cors";
import connectDb from "./config/connectDb";
import adminApiRoutes from "./routes/adminApi";
import campaignRoutes from "./routes/campaigns";
import authRoutes from "./routes/authRoute"; // <- new

dotenv.config();
connectDb();

const app: Application = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "secret",
    resave: false,
    saveUninitialized: true,
  }) as any
);

// make session messages available in all views
app.use((req: Request, res: Response, next: NextFunction) => {
  res.locals.message = (req.session as any)?.message || null;
  // clear after exposing once
  if ((req.session as any)?.message) delete (req.session as any).message;
  res.locals.user = (req.session as any)?.user || null;
  next();
});

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

// routes
app.use(adminApiRoutes);
app.use(campaignRoutes);
app.use(authRoutes); // mount our auth route handlers (POST /login, POST /register)

// Default route -> login page
app.get("/", (req: Request, res: Response) => {
  res.render("login", { error: null });
});

// Middleware: Admin-only access
function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if ((req.session as any).isAdmin) return next();
  return res.redirect("/");
}

// Dashboard route (protected — currently uses requireAdmin as you had)
app.get("/dashboard", requireAdmin, (req: Request, res: Response) => {
  res.render("dashboard");
});

// Registration page (GET) - admin only
app.get("/register", requireAdmin, (req: Request, res: Response) => {
  res.render("register");
});

// admin dashboard GET/POST as you have
app.post("/adminDashboard", requireAdmin, (req: Request, res: Response) => {
  res.render("adminDashboard");
});
app.get("/adminDashboard", requireAdmin, (req: Request, res: Response) => {
  res.render("adminDashboard");
});

// Logout
app.get("/logout", (req: Request, res: Response) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
});

app.all("*", (req: Request, res: Response) => {
  res.status(404).send("Page not found");
});

app.listen(PORT, () =>
  console.log(`✅ Server running at http://localhost:${PORT}`)
);
