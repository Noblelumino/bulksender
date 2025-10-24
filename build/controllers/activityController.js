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
exports.getMessageById = exports.getActivityLogs = void 0;
const activityLogs_1 = __importDefault(require("../models/activityLogs"));
const activityLogs_2 = __importDefault(require("../models/activityLogs"));
/**
 * GET /api/admin/activity?limit=50&page=1
 * Returns: { ok: true, logs: [...], page, limit, totalPages, total }
 */
const getActivityLogs = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const limit = Math.max(1, Math.min(Number(req.query.limit) || 50, 500));
        const page = Math.max(1, Number(req.query.page) || 1);
        const skip = (page - 1) * limit;
        // simple text search (optional)
        const q = req.query.q || "";
        const filter = {};
        if (q.trim()) {
            // search in email, description, type
            filter.$or = [
                { email: { $regex: q, $options: "i" } },
                { description: { $regex: q, $options: "i" } },
                { type: { $regex: q, $options: "i" } },
            ];
        }
        const [total, logs] = yield Promise.all([
            activityLogs_1.default.countDocuments(filter),
            activityLogs_1.default.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean()
        ]);
        const totalPages = Math.max(1, Math.ceil(total / limit));
        return res.json({ ok: true, logs, page, limit, totalPages, total });
    }
    catch (err) {
        console.error("getActivityLogs error:", err);
        return res.status(500).json({ ok: false, error: "Failed to fetch activity logs" });
    }
});
exports.getActivityLogs = getActivityLogs;
// the message states 
// GET /api/admin/messages/:id
const getMessageById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const msg = yield activityLogs_2.default.findById(id).lean();
        if (!msg)
            return res.status(404).json({ ok: false, error: "Not found" });
        return res.json({ ok: true, msg });
    }
    catch (err) {
        console.error("getMessageById error:", err);
        return res.status(500).json({ ok: false, error: "Failed to fetch message" });
    }
});
exports.getMessageById = getMessageById;
