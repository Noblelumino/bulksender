// src/controllers/bulkEmailController.ts
import { Request, Response } from "express";
import nodemailer from "nodemailer";

/**
 * Transporter reads configuration from env variables:
 *  - SMTP_HOST (default smtp.gmail.com)
 *  - SMTP_PORT (default 465)
 *  - SMTP_USER
 *  - SMTP_PASS
 */
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT || 465),
  secure: true, // true for port 465, false for 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Verify transporter at startup to catch credential errors early
transporter.verify()
  .then(() => console.log("✅ SMTP transporter verified"))
  .catch((err) => console.error("❌ SMTP verify failed:", err && err.message ? err.message : err));

/**
 * POST /api/bulkemail/campaign
 * Expects JSON body: { subject: string, html: string, contacts: string[] }
 * Returns per-recipient result array.
 */
export const sendCampaign = async (req: Request, res: Response) => {
  try {
    const { subject, html, contacts } = req.body;

    if (!subject || !html) {
      return res.status(400).json({ error: "subject and html are required" });
    }
    if (!Array.isArray(contacts) || contacts.length === 0) {
      return res.status(400).json({ error: "contacts must be a non-empty array of email strings" });
    }

    const results: Array<any> = [];

    // Send sequentially (simple & easier to debug). For large lists, use batching/queue.
    for (const to of contacts) {
      try {
        const info = await transporter.sendMail({
          from: `"${process.env.SENDER_NAME || "Bulk Sender"}" <${process.env.SMTP_USER}>`,
          to,
          subject,
          html,
        });
        results.push({ to, ok: true, messageId: info.messageId, accepted: (info as any).accepted || [] });
      } catch (err: any) {
        results.push({ to, ok: false, error: err?.message || err });
      }
    }

    return res.json({ results });
  } catch (err: any) {
    console.error("sendCampaign error:", err);
    return res.status(500).json({ error: "Internal server error", details: err?.message || err });
  }
};
