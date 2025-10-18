"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/campaigns.ts
const express_1 = __importDefault(require("express"));
const bulkEmialController_1 = require("../controllers/bulkEmialController");
const router = express_1.default.Router();
// POST /api/bulkemail/campaign
router.post("/campaign", bulkEmialController_1.sendCampaign);
exports.default = router;
