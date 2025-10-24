"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendCampaign = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
/**
 * Create transporter for the given email provider.
 * Credentials (user, pass) can come from request or environment variables.
 *
 * NOTES:
 * - For 'webmail' we prefer STARTTLS on port 587 (secure: false) and fall back to 465.
 * - Use WEBMAIL_HOST and WEBMAIL_PORT environment variables to force a specific host/port.
 * - In production turn off logger/debug and set tls.rejectUnauthorized: true
 */
const createTransporterForProvider = (provider, user, pass) => {
    switch (provider) {
        case "gmail":
            return nodemailer_1.default.createTransport({
                host: "smtp.gmail.com",
                port: 465,
                secure: true,
                auth: {
                    user: user,
                    pass: pass,
                },
            });
        case "yahoo":
            return nodemailer_1.default.createTransport({
                host: "smtp.mail.yahoo.com",
                port: 465,
                secure: true,
                auth: {
                    user: user,
                    pass: pass,
                },
            });
        case "hotmail":
            return nodemailer_1.default.createTransport({
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
            const host = process.env.WEBMAIL_HOST ||
                process.env.SMTP_HOST ||
                "mail.yourdomain.com"; // <-- replace with actual smtp host if known
            // Prefer env override for port, otherwise try 587 (STARTTLS).
            const envPort = process.env.WEBMAIL_PORT ? Number(process.env.WEBMAIL_PORT) : undefined;
            const defaultPort = envPort || 587;
            const port = defaultPort;
            // NOTE: logger/debug are enabled to help you see SMTP handshake and response.
            // Turn them OFF in production (set logger: false, debug: false).
            return nodemailer_1.default.createTransport({
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
const sendCampaign = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // DO NOT log sensitive values (pass). Only indicate whether a password was provided.
        const { provider, user, pass, subject, body: html, contacts } = req.body;
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
        const transporter = createTransporterForProvider(provider || "webmail", user, pass);
        // Verify transporter to check connection and authentication
        try {
            yield transporter.verify();
            console.log(`✅ Transporter verified for ${provider || "webmail"}`);
        }
        catch (err) {
            // Log entire error object so you can see fields like `response`, `responseCode`, `command`.
            console.error("❌ SMTP verification failed (full error):", err);
            // Try to include useful info but never sensitive data
            const details = (err && err.response) ||
                (err && err.message) ||
                JSON.stringify({ code: err === null || err === void 0 ? void 0 : err.code, responseCode: err === null || err === void 0 ? void 0 : err.responseCode, command: err === null || err === void 0 ? void 0 : err.command });
            return res.status(502).json({
                error: "SMTP verification failed. Check credentials or provider settings.",
                details,
            });
        }
        const fromDisplay = process.env.SENDER_NAME
            ? `"${process.env.SENDER_NAME}" <${user || process.env.SMTP_USER}>`
            : user || process.env.SMTP_USER;
        const results = [];
        for (const to of contacts) {
            try {
                const info = yield transporter.sendMail({
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
            }
            catch (err) {
                // Log the full error (no passwords) for each recipient failure
                console.error(`Failed for ${to} (full error):`, err);
                results.push({
                    to,
                    ok: false,
                    error: err && err.message ? err.message : err,
                    // optionally include err.responseCode/command for debugging:
                    code: err === null || err === void 0 ? void 0 : err.code,
                    responseCode: err === null || err === void 0 ? void 0 : err.responseCode,
                });
            }
        }
        return res.json({ provider, results });
    }
    catch (err) {
        console.error("sendCampaign error (full):", err);
        return res.status(500).json({
            error: "Internal server error",
            details: err && err.message ? err.message : err,
        });
    }
});
exports.sendCampaign = sendCampaign;
