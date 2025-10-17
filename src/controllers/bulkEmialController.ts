// src/controllers/bulkEmailController.ts
import { Request, Response } from "express";
import nodemailer, { Transporter } from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

type Provider = "gmail" | "yahoo" | "hotmail" | "webmail" | "sendgrid";

/**
 * Create transporter for the given email provider.
 * Credentials (user, pass) can come from request or environment variables.
 *
 * NOTES:
 * - For 'webmail' we prefer STARTTLS on port 587 (secure: false) and fall back to 465.
 * - Use WEBMAIL_HOST and WEBMAIL_PORT environment variables to force a specific host/port.
 * - In production turn off logger/debug and set tls.rejectUnauthorized: true
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
        auth: {
          user: user,
          pass: pass,
        },
      });

    case "yahoo":
      return nodemailer.createTransport({
        host: "smtp.mail.yahoo.com",
        port: 465,
        secure: true,
        auth: {
          user: user,
          pass: pass,
        },
      });

    case "hotmail":
      return nodemailer.createTransport({
        host: "smtp.office365.com",
        port: 587,
        secure: false,
        auth: {
          user: user,
          pass: pass,
        },
        tls: { ciphers: "TLSv1.2" },
      });

    case "webmail":
    default: {
      // Preferred host/port come from env, otherwise try common defaults.
      const host =
        process.env.WEBMAIL_HOST ||
        process.env.SMTP_HOST ||
        "mail.yourdomain.com"; // <-- replace with actual smtp host if known

      // Prefer env override for port, otherwise try 587 (STARTTLS).
      const envPort = process.env.WEBMAIL_PORT ? Number(process.env.WEBMAIL_PORT) : undefined;
      const defaultPort = envPort || 587;
      const port = defaultPort;

      // NOTE: logger/debug are enabled to help you see SMTP handshake and response.
      // Turn them OFF in production (set logger: false, debug: false).
      return nodemailer.createTransport({
        host,
        port,
        secure: port === 465, // true for 465 (SSL), false for 587 (STARTTLS)
        auth: {
          user: user,
          pass: pass,
        },
        // Useful while debugging SMTP issues. Disable in prod.
        logger: true,
        debug: true,
        tls: {
          // while debugging allow self-signed certs; set to true in prod
          rejectUnauthorized: false,
        },
      });
    }
  }
};

/**
 * POST /api/bulkemail/campaign
 * Body:
 * {
 *   provider: "gmail" | "yahoo" | "hotmail" | "webmail",
 *   user: string,
 *   pass: string,
 *   subject: string,
 *   body: string,
 *   contacts: string[]
 * }
 */
export const sendCampaign = async (req: Request, res: Response) => {
  try {
    // DO NOT log sensitive values (pass). Only indicate whether a password was provided.
    const { provider, user, pass, subject, body: html, contacts } =
      req.body as {
        provider?: Provider;
        user?: string;
        pass?: string;
        subject?: string;
        body?: string;
        contacts?: string[];
      };

    console.log("📨 Incoming campaign request:", {
      provider,
      subject,
      contacts: Array.isArray(contacts) ? contacts.length : 0,
      user,
      hasPass: !!pass,
    });

    if (!subject || !html)
      return res.status(400).json({ error: "subject and body (html) are required" });

    if (!Array.isArray(contacts) || contacts.length === 0)
      return res
        .status(400)
        .json({ error: "contacts must be a non-empty array of email addresses" });

    // Create transporter dynamically based on provider + credentials
    const transporter = createTransporterForProvider((provider as Provider) || "webmail", user, pass);

    // Verify transporter to check connection and authentication
    try {
      await transporter.verify();
      console.log(`✅ Transporter verified for ${provider || "webmail"}`);
    } catch (err: any) {
      // Log entire error object so you can see fields like `response`, `responseCode`, `command`.
      console.error("❌ SMTP verification failed (full error):", err);

      // Try to include useful info but never sensitive data
      const details =
        (err && err.response) ||
        (err && err.message) ||
        JSON.stringify({ code: err?.code, responseCode: err?.responseCode, command: err?.command });

      return res.status(502).json({
        error: "SMTP verification failed. Check credentials or provider settings.",
        details,
      });
    }

    const fromDisplay = process.env.SENDER_NAME
      ? `"${process.env.SENDER_NAME}" <${user || process.env.SMTP_USER}>`
      : user || process.env.SMTP_USER;

    const results: Array<any> = [];

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
          accepted: (info as any).accepted || [],
        });
      } catch (err: any) {
        // Log the full error (no passwords) for each recipient failure
        console.error(`Failed for ${to} (full error):`, err);
        results.push({
          to,
          ok: false,
          error: err && err.message ? err.message : err,
          // optionally include err.responseCode/command for debugging:
          code: err?.code,
          responseCode: err?.responseCode,
        });
      }
    }

    return res.json({ provider, results });
  } catch (err: any) {
    console.error("sendCampaign error (full):", err);
    return res.status(500).json({
      error: "Internal server error",
      details: err && err.message ? err.message : err,
    });
  }
};
