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
exports.getMessageStats = void 0;
const activityLogs_1 = __importDefault(require("../models/activityLogs")); // adjust path/name to your model
// GET /api/admin/messages/stats
const getMessageStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Decide which timezone to use:
        // - This uses server local time. If you must use UTC, use Date.UTC(...) below.
        const now = new Date();
        // Start of today (00:00:00) in server local time
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
        // Start of tomorrow
        const startOfTomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);
        // Run both counts in parallel
        const [messagesToday, messagesTotal] = yield Promise.all([
            activityLogs_1.default.countDocuments({ createdAt: { $gte: startOfToday, $lt: startOfTomorrow } }),
            activityLogs_1.default.countDocuments()
        ]);
        return res.json({
            ok: true,
            messagesToday,
            messagesTotal
        });
    }
    catch (err) {
        console.error("getMessageStats error:", err);
        return res.status(500).json({ ok: false, error: "Failed to fetch message stats" });
    }
});
exports.getMessageStats = getMessageStats;
/**
 * GET /api/admin/messages
 * Query params: limit, page, q (search), status, service
 * Returns: { ok: true, logs, page, limit, total, totalPages }
 */
