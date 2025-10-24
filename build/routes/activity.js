"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const activityController_1 = require("../controllers/activityController");
// import requireAdmin from "../middleware/auth"; // uncomment if you have auth middleware
const router = express_1.default.Router();
router.get("/", /* requireAdmin, */ activityController_1.getActivityLogs);
exports.default = router;
