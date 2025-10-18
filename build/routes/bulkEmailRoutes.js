"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/bulkEmailRoutes.ts
const express_1 = require("express");
const bulkEmialController_1 = require("../controllers/bulkEmialController");
const router = (0, express_1.Router)();
/**
 * POST /api/bulkemail/campaign
 * Body: { senderName, emailService, emailAddress, passwordService?, smtpHost?, smtpPort?, smtpSecure?, subject, title, body, bestRegards, contactsList }
 */
router.post("/campaign", bulkEmialController_1.sendCampaign);
exports.default = router;
