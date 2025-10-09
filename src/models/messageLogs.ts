import mongoose, { Schema, Document } from "mongoose";

export interface IMessageLog extends Document {
  campaignId?: mongoose.Types.ObjectId;
  from?: string;
  to: string;
  subject?: string;
  body?: string;
  status: "sent" | "failed";
  error?: string;
  createdAt?: Date;
}

const MessageLogSchema = new Schema<IMessageLog>({
  campaignId: { type: Schema.Types.ObjectId, ref: "Campaign" },
  from: String,
  to: { type: String, required: true },
  subject: String,
  body: String,
  status: { type: String, enum: ["sent", "failed"], default: "sent" },
  error: String,
}, { timestamps: true });

export default mongoose.models.MessageLog || mongoose.model<IMessageLog>("MessageLog", MessageLogSchema);
