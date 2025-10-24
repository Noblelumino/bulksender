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
exports.createActivityLog = createActivityLog;
exports.logFromRequest = logFromRequest;
const activityLogs_1 = __importDefault(require("../models/activityLogs"));
/**
 * Create an activity log entry.
 * This function does not throw to the caller — errors are caught and logged to console.
 */
function createActivityLog(payload) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield activityLogs_1.default.create(payload);
        }
        catch (err) {
            // Don't throw — logging failure shouldn't block core flows.
            console.warn("createActivityLog failed:", err);
        }
    });
}
/**
 * Helper to extract ip and userAgent from express Request and call createActivityLog.
 * Use when you have access to req.
 */
function logFromRequest(req, payload) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const ip = req.ip || req.headers["x-forwarded-for"] || ((_a = req.socket) === null || _a === void 0 ? void 0 : _a.remoteAddress) || "";
        const ua = req.headers["user-agent"];
        return createActivityLog(Object.assign(Object.assign({}, payload), { ipAddress: String(ip), userAgent: ua }));
    });
}
