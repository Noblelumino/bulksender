import mongoose, { Schema, Document } from "mongoose";

export interface IActivityLog extends Document {
  userId: mongoose.Types.ObjectId; // Reference to user performing the action
  email: string; // User email (redundant but useful for quick lookups)
  role: "admin" | "user"; // User role at the time

  type: "login" | "logout" | "bulk_send" | "bulk_send_result"; // Event type
  description?: string; // Human-readable summary (e.g., “Admin logged in”, “Sent campaign to 500 contacts”)

  // 🕓 Generic metadata for all logs
  ipAddress?: string;
  userAgent?: string;

  // 📨 For bulk email events
  bulkDetails?: {
    campaignId?: mongoose.Types.ObjectId;
    totalRecipients?: number;
    deliveredCount?: number;
    failedCount?: number;
    subject?: string;
    serviceUsed?: string; // e.g. “SendGrid”, “Gmail OAuth”, etc.
  };

  // ❌ For errors (optional)
  error?: string;

  createdAt: Date;
  updatedAt: Date;
}

const ActivityLogSchema = new Schema<IActivityLog>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    email: { type: String, required: true },
    role: { type: String, enum: ["admin", "user"], required: true },
    type: {
      type: String,
      enum: ["login", "logout", "bulk_send", "bulk_send_result"],
      required: true,
    },
    description: String,
    ipAddress: String,
    userAgent: String,
    bulkDetails: {
      campaignId: { type: Schema.Types.ObjectId, ref: "Campaign" },
      totalRecipients: Number,
      deliveredCount: Number,
      failedCount: Number,
      subject: String,
      serviceUsed: String,
    },
    error: String,
  },
  { timestamps: true }
);

export default mongoose.models.ActivityLog ||
  mongoose.model<IActivityLog>("ActivityLog", ActivityLogSchema);
