// src/routes/campaigns.ts
import express from "express";
import { sendCampaign } from "../controllers/bulkEmialController";

const router = express.Router();

// POST /api/bulkemail/campaign
router.post("/campaign", sendCampaign);

export default router;
