import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import User from "../models/user";
import ActivityLog from "../models/activityLogs";
import { logFromRequest } from "../utils/activityLogger";

// Render register page
export const renderRegister = (req: Request, res: Response) => {
  res.render("register", { error: null });
};

/**
 * POST /auth/register
 * Body: { name, email, password, confirmPassword, role? }
 * Renders register view on error; redirects to /dashboard on success.
 */
export const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password, confirmPassword, role } = req.body as {
      name?: string;
      email?: string;
      password?: string;
      confirmPassword?: string;
      role?: "admin" | "user";
    };

    // Basic validation
    if (!name || !email || !password || !confirmPassword) {
      return res.render("register", { error: "All fields are required" });
    }
    if (password !== confirmPassword) {
      return res.render("register", { error: "Passwords do not match" });
    }
    if (password.length < 6) {
      return res.render("register", { error: "Password must be at least 6 characters" });
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // Check for existing user
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.render("register", { error: "Email already in use" });
    }

    // Hash password
    const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS || 10);
    const hashed = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = new User({
      name: name.trim(),
      email: normalizedEmail,
      password: hashed,
      role: role === "admin" ? "admin" : "user",
    });

    await user.save();

    // Log activity: registration
    try {
      await ActivityLog.create({
        userId: user._id,
        email: user.email,
        role: user.role,
        type: "register",
        description: `${user.name} registered.`,
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
      });
    } catch (logErr) {
      console.warn("ActivityLog create failed:", logErr);
    }

    // Auto-login on register (create session)
    req.session.user = {
      _id: String(user._id),
      name: user.name,
      email: user.email,
      role: user.role,
    };

    return res.redirect("/adminDashboard");
  } catch (err) {
    console.error("registerUser error:", err);
    return res.render("register", { error: "Something went wrong. Please try again." });
  }
};




// login section 
export const renderLogin = (req: Request, res: Response) => {
  res.render("login", { error: null });
};

export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.render("login", { error: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.render("login", { error: "Incorrect password" });
    }

    // Save user session
    req.session.user = {
      _id: String(user._id),
      name: user.name,
      email: user.email,
      role: user.role,
    };

    // ✅ Log the login event
    await ActivityLog.create({
      userId: user._id,
      email: user.email,
      role: user.role,
      type: "login",
      description: `${user.name} logged in.`,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });

    //TODO: REMOVE THIS FROM HERE TO WHERE YOU NEED IT, THIS IS FOR WHEN A USER SENDS A BULK EMAIL
    // await ActivityLog.create({
    //   userId: user._id,
    //   email: user.email,
    //   role: user.role,
    //   type: "bulk_send",
    //   description: `Sent campaign "${subject}" to ${recipients.length} users.`,
    //   bulkDetails: {
    //     campaignId: campaign._id,
    //     totalRecipients: recipients.length,
    //     deliveredCount: delivered.length,
    //     failedCount: failed.length,
    //     subject,
    //     serviceUsed: "SendGrid",
    //   },
    // });

    //TODO: MOVE THIS TO YOUR LOG OUT ROUTE
    // await ActivityLog.create({
    //   userId: user._id,
    //   email: user.email,
    //   role: user.role,
    //   type: "logout",
    //   description: `${user.name} logged out.`,
    //   ipAddress: req.ip,
    // });

    res.redirect("/dashboard");
  } catch (err) {
    console.error(err);
    res.render("login", { error: "Something went wrong. Please try again." });
  }
};

export const logoutUser = (req: Request, res: Response) => {
  const sessionUser = req.session.user;
  if (sessionUser) {
    // log logout (do not await)
    logFromRequest(req, {
      userId: sessionUser._id,
      email: sessionUser.email,
      role: sessionUser.role,
      type: "logout",
      description: `${sessionUser.name} logged out.`,
    });
  }

  req.session.destroy((err) => {
    if (err) console.error(err);
    res.redirect("/login");
  });
};