// src/routes/bulkEmailRoutes.ts
import { Router } from "express";
import { sendCampaign } from "../controllers/bulkEmialController";

const router = Router();

/**
 * POST /api/bulkemail/campaign
 * Body: { senderName, emailService, emailAddress, passwordService?, smtpHost?, smtpPort?, smtpSecure?, subject, title, body, bestRegards, contactsList }
 */
router.post("/campaign", sendCampaign);

export default router;
