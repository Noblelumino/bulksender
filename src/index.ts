import express, { Application, Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import session from "express-session";
import path from "path";
import cors from "cors";
import connectDb from "./config/connectDb";
import authRoutes from "./routes/authRoutes";
import dashboardRoutes from "./routes/dashboardRoutes";
import bulkEmailRoutes from "./routes/bulkEmailRoutes";


dotenv.config();
connectDb();

const app: Application = express();
const PORT = process.env.PORT || 3000;

// ---------- MIDDLEWARES ----------
app.use(
  cors({
    credentials: true,
    origin: [process.env.FRONTEND_ORIGIN || "http://localhost:3000"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Sessions
app.use(
  session({
    secret: process.env.SESSION_SECRET || "secret",
    resave: false,
    saveUninitialized: true,
  }) as any
);

// ✅ Make user and message available to all views
app.use((req: Request, res: Response, next: NextFunction) => {
  res.locals.message = (req.session as any)?.message || null;
  if ((req.session as any)?.message) delete (req.session as any).message;
  res.locals.user = (req.session as any)?.user || null;
  next();
});

app.use("/api/bulkemail", bulkEmailRoutes);


// ---------- VIEW ENGINE ----------
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

// ---------- ROUTES ----------

// 🏠 Default route → redirect to login
app.get("/", (req: Request, res: Response) => {
  return res.redirect("/login");
});

// Mount API routes
import campaignRoutes from "./routes/campaign";
app.use("/api/bulkemail", campaignRoutes);


// 🧭 Mount modular routes (recommended order)
app.use("/", authRoutes);

app.use(dashboardRoutes);



// Logout & 404
app.get("/logout", (req: Request, res: Response) => {
  req.session.destroy(() => res.redirect("/"));
});



// ---------- FALLBACK ----------
app.all("*", (req: Request, res: Response) => {
  res.status(404).send("Page not found");
});

// ---------- START SERVER ----------
app.listen(PORT, () =>
  console.log(`✅ Server running at http://localhost:${PORT}`)
);
