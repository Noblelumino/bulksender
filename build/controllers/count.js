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
exports.getUsers = exports.getUsersCount = void 0;
const user_1 = __importDefault(require("../models/user"));
// GET /api/admin/users/count
const getUsersCount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [totalCount, adminCount] = yield Promise.all([
            user_1.default.countDocuments(),
            user_1.default.countDocuments({ role: "admin" }),
        ]);
        return res.json({ ok: true, count: totalCount, adminCount });
    }
    catch (err) {
        console.error("getUsersCount error:", err);
        return res.status(500).json({ ok: false, error: "Failed to fetch users count" });
    }
});
exports.getUsersCount = getUsersCount;
// GET /api/admin/users
const getUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const limit = Math.min(Number(req.query.limit) || 20, 100);
        const users = yield user_1.default.find()
            .select("name email role createdAt")
            .limit(limit)
            .sort({ createdAt: -1 });
        return res.json({ ok: true, users });
    }
    catch (err) {
        console.error("getUsers error:", err);
        return res.status(500).json({ ok: false, error: "Failed to fetch users" });
    }
});
exports.getUsers = getUsers;
