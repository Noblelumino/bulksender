import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import User from "../models/user";
import ActivityLog from "../models/activityLogs";
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
  req.session.destroy((err) => {
    if (err) console.error(err);
    res.redirect("/login");
  });
};
