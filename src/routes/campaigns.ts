import express from "express";
import multer from "multer";
import fs from "fs";
import csvParser from "csv-parser";
import nodemailer from "nodemailer";
import MessageLog from "../models/messageLogs";

const router = express.Router();
const upload = multer({ dest: "tmp/" });

// helper sleep
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * POST /api/campaigns/send
 * Form fields:
 * - senderName
 * - fromEmail
 * - subject
 * - body (HTML)
 * - contacts (file, CSV) -> CSV must contain `email` column (case-insensitive)
 */
// router.post("/api/campaigns/send", upload.single("contacts"), async (req, res) => {
//   try {
//     if (!req.file) return res.status(400).json({ error: "Missing contacts CSV" });
//     const { subject = "", body = "", senderName = "", fromEmail = process.env.FROM_EMAIL } = req.body;

//     // parse csv
//     const recipients: string[] = [];
//     await new Promise<void>((resolve, reject) => {
//       fs.createReadStream(req.file.path)
//         .pipe(csvParser())
//         .on("data", (row) => {
//           const email = row.email || row.Email || row.email_address || row.emailAddress;
//           if (email && typeof email === "string") recipients.push(email.trim());
//         })
//         .on("end", () => resolve())
//         .on("error", (err) => reject(err));
//     });

//     // cleanup uploaded file
//     try { fs.unlinkSync(req.file.path); } catch (e) {}

//     if (recipients.length === 0) return res.status(400).json({ error: "No recipient emails found in CSV" });

//     // create SMTP transporter (use env vars)
//     const transporter = nodemailer.createTransport({
//       host: process.env.SMTP_HOST,
//       port: Number(process.env.SMTP_PORT) || 587,
//       secure: process.env.SMTP_SECURE === "true",
//       auth: {
//         user: process.env.SMTP_USER,
//         pass: process.env.SMTP_PASS,
//       },
//     });

//     // send in batches to avoid hitting limits
//     const batchSize = Number(process.env.SEND_BATCH_SIZE || 50);
//     const delayBetweenBatchesMs = Number(process.env.SEND_BATCH_DELAY_MS || 1000);

//     let sent = 0;
//     for (let i = 0; i < recipients.length; i += batchSize) {
//       const batch = recipients.slice(i, i + batchSize);
//       await Promise.all(
//         batch.map(async (to) => {
//           try {
//             await transporter.sendMail({
//               from: `${senderName} <${fromEmail}>`,
//               to,
//               subject,
//               html: body,
//             });
//             await MessageLog.create({ from: fromEmail, to, subject, body, status: "sent" });
//             sent++;
//           } catch (err: any) {
//             console.error("send error", err?.message || err);
//             await MessageLog.create({ from: fromEmail, to, subject, body, status: "failed", error: err?.message || String(err) });
//           }
//         }),
//       );
//       // pause between batches
//       await sleep(delayBetweenBatchesMs);
//     }

//     return res.json({ ok: true, total: recipients.length, sent });
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({ error: "Failed to process campaign" });
//   }
// });

export default router;
