// src/controllers/authController.ts
import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import User from "../models/user";

export const postRegister = async (req: Request, res: Response) => {
  try {
    const { name, email, sex, role, password, confirmPassword } = req.body;

    // Basic validation
    if (!name || !email || !sex || !role || !password || !confirmPassword) {
      req.session!.message = { type: "danger", text: "Please fill all fields." };
      return res.redirect("/register");
    }
    if (password !== confirmPassword) {
      req.session!.message = { type: "danger", text: "Passwords do not match." };
      return res.redirect("/register");
    }
    if (password.length < 6) {
      req.session!.message = { type: "danger", text: "Password must be at least 6 characters." };
      return res.redirect("/register");
    }

    // Check existing user
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      req.session!.message = { type: "danger", text: "Email already registered." };
      return res.redirect("/register");
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    // Save user
    const user = new User({
      name,
      email: email.toLowerCase(),
      sex,
      role,
      password: hashed,
    });

    await user.save();

    req.session!.message = { type: "success", text: "User registered successfully." };
    return res.redirect("/register");
  } catch (err) {
    console.error("Register Error:", err);
    req.session!.message = { type: "danger", text: "Server error. Try again." };
    return res.redirect("/register");
  }
};

export const postLogin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.render("login", { error: "Please provide email and password" });
    }

    // first check environment admin fallback
    if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
      (req.session as any).isAdmin = true;
      (req.session as any).user = { email, name: "Super Admin", role: "Admin" };
      return res.redirect("/dashboard");
    }

    // Check DB
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.render("login", { error: "Invalid email or password" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.render("login", { error: "Invalid email or password" });

    // Successful login — mark session
    (req.session as any).user = { id: user._id, email: user.email, name: user.name, role: user.role };

    // If user is admin in DB, give admin privileges
    (req.session as any).isAdmin = user.role === "Admin";

    return res.redirect("/dashboard");
  } catch (err) {
    console.error("Login Error:", err);
    return res.render("login", { error: "Server error. Try again later" });
  }
};
