// src/controllers/bulkEmailController.ts
import { Request, Response } from "express";
import nodemailer, { Transporter } from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

type Provider = "gmail" | "yahoo" | "hotmail" | "webmail" | "sendgrid";

/**
 * Create transporter for the given email provider.
 */
const createTransporterForProvider = (
  provider: Provider,
  user?: string,
  pass?: string
): Transporter => {
  switch (provider) {
    case "gmail":
      return nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: { user, pass },
      });

    case "yahoo":
      return nodemailer.createTransport({
        host: "smtp.mail.yahoo.com",
        port: 465,
        secure: true,
        auth: { user, pass },
      });

    case "hotmail":
      return nodemailer.createTransport({
        host: "smtp.office365.com",
        port: 587,
        secure: false,
        auth: { user, pass },
        tls: { ciphers: "TLSv1.2" },
      });

    case "webmail":
    default: {
      const host =
        process.env.WEBMAIL_HOST ||
        process.env.SMTP_HOST ||
        "mail.yourdomain.com"; // update if needed
      const port = process.env.WEBMAIL_PORT
        ? Number(process.env.WEBMAIL_PORT)
        : 587;

      return nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
        logger: true,
        debug: true,
        tls: { rejectUnauthorized: false },
      });
    }
  }
};

// Helper to clean up display name
function sanitizeDisplayName(name?: unknown, maxLen = 128): string | undefined {
  if (!name || typeof name !== "string") return undefined;
  let s = name.trim().replace(/[\r\n]+/g, " ").replace(/\s+/g, " ");
  if (!s) return undefined;
  if (s.length > maxLen) s = s.slice(0, maxLen).trim();
  s = s.replace(/"/g, '\\"');
  return s || undefined;
}

export const sendCampaign = async (req: Request, res: Response) => {
  try {
    const {
      provider,
      user,
      pass,
      subject,
      body: html,
      contacts,
      companyName, // supplied from dashboard
    } = req.body as {
      provider?: Provider;
      user?: string;
      pass?: string;
      subject?: string;
      body?: string;
      contacts?: string[];
      companyName?: string;
    };

    console.log("📨 Incoming campaign:", {
      provider,
      subject,
      contactsCount: contacts?.length || 0,
      user,
      hasPass: !!pass,
      hasCompanyName: !!companyName,
    });

    if (!subject || !html)
      return res.status(400).json({ error: "subject and body (html) are required" });

    if (!Array.isArray(contacts) || contacts.length === 0)
      return res
        .status(400)
        .json({ error: "contacts must be a non-empty array of email addresses" });

    const transporter = createTransporterForProvider(
      (provider as Provider) || "webmail",
      user,
      pass
    );

    // Verify SMTP connection/auth
    try {
      await transporter.verify();
      console.log(`✅ SMTP verified for ${provider || "webmail"}`);
    } catch (err: any) {
      console.error("❌ SMTP verification failed:", err);
      return res.status(502).json({
        error: "SMTP verification failed. Check credentials or provider settings.",
        details: err?.message || err,
      });
    }

    // companyName replaces SENDER_NAME completely
    const sanitizedCompanyName = sanitizeDisplayName(companyName);
    const fromAddress = (user && String(user)) || process.env.SMTP_USER || "";

    // Build from header
    const fromDisplay = sanitizedCompanyName
      ? `"${sanitizedCompanyName}" <${fromAddress}>`
      : fromAddress;

    const results: any[] = [];

    for (const to of contacts) {
      try {
        const info = await transporter.sendMail({
          from: fromDisplay,
          to,
          subject,
          html,
        });

        results.push({
          to,
          ok: true,
          messageId: info.messageId,
          accepted: info.accepted || [],
        });
      } catch (err: any) {
        console.error(`❌ Failed for ${to}:`, err.message);
        results.push({
          to,
          ok: false,
          error: err.message || "Unknown error",
        });
      }
    }

    return res.json({ provider, from: fromDisplay, results });
  } catch (err: any) {
    console.error("sendCampaign error:", err);
    return res.status(500).json({
      error: "Internal server error",
      details: err?.message || err,
    });
  }
};
