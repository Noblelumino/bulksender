// src/controllers/bulkEmailController.ts
import { Request, Response } from "express";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Verify transporter at startup to catch credential errors early
transporter
  .verify()
  .then(() => console.log("✅ SMTP transporter verified"))
  .catch((err) =>
    console.error(
      "❌ SMTP verify failed:",
      err && err.message ? err.message : err
    )
  );

/**
 * POST /api/bulkemail/campaign
 * Expects JSON body: { subject: string, html: string, contacts: string[] }
 * Returns per-recipient result array.
 */
export const sendCampaign = async (req: Request, res: Response) => {
  try {
    const { subject, body: html, contacts } = req.body;
    console.log(`This is the payload sent to the server`, req.body);

    if (!subject || !html) {
      return res.status(400).json({ error: "subject and html are required" });
    }
    if (!Array.isArray(contacts) || contacts.length === 0) {
      return res
        .status(400)
        .json({ error: "contacts must be a non-empty array of email strings" });
    }

    const results: Array<any> = [];

    // Send sequentially (simple & easier to debug). For large lists, use batching/queue.
    for (const to of contacts) {
      try {
        const info = await transporter.sendMail({
          from: `"${process.env.SENDER_NAME || "Bulk Sender"}" <${
            process.env.SMTP_USER
          }>`,
          to,
          subject,
          html,
        });
        results.push({
          to,
          ok: true,
          messageId: info.messageId,
          accepted: (info as any).accepted || [],
        });
      } catch (err: any) {
        results.push({ to, ok: false, error: err?.message || err });
      }
    }

    return res.json({ results });
  } catch (err: any) {
    console.error("sendCampaign error:", err);
    return res
      .status(500)
      .json({ error: "Internal server error", details: err?.message || err });
  }
};
