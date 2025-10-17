import { Request, Response } from "express";
import EmailLog from "../models/activityLogs"; // adjust path/name to your model

// GET /api/admin/messages/stats
export const getMessageStats = async (req: Request, res: Response) => {
  try {
    // Decide which timezone to use:
    // - This uses server local time. If you must use UTC, use Date.UTC(...) below.
    const now = new Date();

    // Start of today (00:00:00) in server local time
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);

    // Start of tomorrow
    const startOfTomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);

    // Run both counts in parallel
    const [messagesToday, messagesTotal] = await Promise.all([
      EmailLog.countDocuments({ createdAt: { $gte: startOfToday, $lt: startOfTomorrow } }),
      EmailLog.countDocuments()
    ]);

    return res.json({
      ok: true,
      messagesToday,
      messagesTotal
    });
  } catch (err) {
    console.error("getMessageStats error:", err);
    return res.status(500).json({ ok: false, error: "Failed to fetch message stats" });
  }
};


/**
 * GET /api/admin/messages
 * Query params: limit, page, q (search), status, service
 * Returns: { ok: true, logs, page, limit, total, totalPages }
 */
