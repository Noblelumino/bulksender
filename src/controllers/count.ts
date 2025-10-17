import { Request, Response } from "express";
import User from "../models/user";

// GET /api/admin/users/count
export const getUsersCount = async (req: Request, res: Response) => {
  try {
    const [totalCount, adminCount] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "admin" }),
    ]);

    return res.json({ ok: true, count: totalCount, adminCount });
  } catch (err) {
    console.error("getUsersCount error:", err);
    return res.status(500).json({ ok: false, error: "Failed to fetch users count" });
  }
};

// GET /api/admin/users
export const getUsers = async (req: Request, res: Response) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 20, 100);
    const users = await User.find()
      .select("name email role createdAt")
      .limit(limit)
      .sort({ createdAt: -1 });

    return res.json({ ok: true, users });
  } catch (err) {
    console.error("getUsers error:", err);
    return res.status(500).json({ ok: false, error: "Failed to fetch users" });
  }
};
