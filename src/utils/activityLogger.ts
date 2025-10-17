import ActivityLog from "../models/activityLogs";
import { Request } from "express";

export interface ActivityLogPayload {
  userId?: string;
  email?: string;
  role?: string;
  type: "register" | "login" | "logout" | "bulk_send" | "update" | "delete" | "other";
  description?: string;
  ipAddress?: string;
  userAgent?: string | string[] | undefined;
  meta?: Record<string, any>;
}

/**
 * Create an activity log entry.
 * This function does not throw to the caller — errors are caught and logged to console.
 */
export async function createActivityLog(payload: ActivityLogPayload) {
  try {
    await ActivityLog.create(payload);
  } catch (err) {
    // Don't throw — logging failure shouldn't block core flows.
    console.warn("createActivityLog failed:", err);
  }
}

/**
 * Helper to extract ip and userAgent from express Request and call createActivityLog.
 * Use when you have access to req.
 */
export async function logFromRequest(req: Request, payload: Omit<ActivityLogPayload, "ipAddress" | "userAgent">) {
  const ip = req.ip || (req.headers["x-forwarded-for"] as string) || req.socket?.remoteAddress || "";
  const ua = req.headers["user-agent"];
  return createActivityLog({
    ...payload,
    ipAddress: String(ip),
    userAgent: ua,
  });
}
