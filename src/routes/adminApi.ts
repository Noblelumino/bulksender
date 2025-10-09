import express from "express";
import User from "../models/user";
import MessageLog from "../models/messageLogs";

const router = express.Router();

// GET /admin/api/stats
router.get("/admin/api/stats", async (req, res) => {
  try {
    const usersCount = await User.countDocuments();
    const adminsCount = await User.countDocuments({ role: "admin" });
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const messagesSentToday = await MessageLog.countDocuments({ createdAt: { $gte: startOfToday } });
    const messagesSentTotal = await MessageLog.countDocuments();

    return res.json({ usersCount, adminsCount, messagesSentToday, messagesSentTotal });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to load stats" });
  }
});

// GET /admin/api/activity?page=1&limit=50
router.get("/admin/api/activity", async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(200, Number(req.query.limit) || 50);
    const total = await MessageLog.countDocuments();
    const items = await MessageLog.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const mapped = items.map(it => ({
      id: it._id,
      time: it.createdAt,
      user: it.to,
      action: it.status === "sent" ? "sent_message" : "failed_send",
      detail: it.subject || "",
    }));

    return res.json({ items: mapped, page, limit, total });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to load activity" });
  }
});

// GET /admin/api/messages/:id
// router.get("/admin/api/messages/:id", async (req, res) => {
//   try {
//     const m = await MessageLog.findById(req.params.id).lean();
//     if (!m) return res.status(404).json({ error: "Not found" });
//     return res.json({
//       id: m._id,
//       from: m.from,
//       toCount: 1,
//       subject: m.subject,
//       body: m.body,
//       status: m.status,
//       error: m.error,
//       createdAt: m.createdAt,
//     });
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({ error: "Failed to load message" });
//   }
// });

export default router;
