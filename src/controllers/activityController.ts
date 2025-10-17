import { Request, Response } from "express";
import ActivityLog from "../models/activityLogs";
import activityLogs from "../models/activityLogs";

/**
 * GET /api/admin/activity?limit=50&page=1
 * Returns: { ok: true, logs: [...], page, limit, totalPages, total }
 */
export const getActivityLogs = async (req: Request, res: Response) => {
  try {
    const limit = Math.max(1, Math.min(Number(req.query.limit) || 50, 500));
    const page = Math.max(1, Number(req.query.page) || 1);
    const skip = (page - 1) * limit;

    // simple text search (optional)
    const q = (req.query.q as string) || "";

    const filter: any = {};
    if (q.trim()) {
      // search in email, description, type
      filter.$or = [
        { email: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
        { type: { $regex: q, $options: "i" } },
      ];
    }

    const [total, logs] = await Promise.all([
      ActivityLog.countDocuments(filter),
      ActivityLog.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
    ]);

    const totalPages = Math.max(1, Math.ceil(total / limit));

    return res.json({ ok: true, logs, page, limit, totalPages, total });
  } catch (err) {
    console.error("getActivityLogs error:", err);
    return res.status(500).json({ ok: false, error: "Failed to fetch activity logs" });
  }
};


// the message states 
// GET /api/admin/messages/:id
export const getMessageById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const msg = await activityLogs.findById(id).lean();
    if (!msg) return res.status(404).json({ ok: false, error: "Not found" });
    return res.json({ ok: true, msg });
  } catch (err) {
    console.error("getMessageById error:", err);
    return res.status(500).json({ ok: false, error: "Failed to fetch message" });
  }
};
