import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  role: "admin" | "user";
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    role: { type: String, enum: ["admin", "user"], default: "user" },
    password: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IUser>("User", UserSchema);
