import mongoose, { Schema, Document, Model } from "mongoose";

export interface IRenewal extends Document {
  projectId: mongoose.Types.ObjectId;
  approvalName: string;
  department: string;
  licenseNumber: string;
  expiryDate: Date;
  status: "ACTIVE" | "RENEWAL_DUE" | "EXPIRED";
  reminderDays: number;
  createdAt: Date;
}

const renewalSchema = new Schema<IRenewal>(
  {
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true, index: true },
    approvalName: { type: String, required: true },
    department: { type: String, required: true },
    licenseNumber: { type: String, required: true },
    expiryDate: { type: Date, required: true },
    status: { type: String, enum: ["ACTIVE", "RENEWAL_DUE", "EXPIRED"], default: "ACTIVE" },
    reminderDays: { type: Number, default: 30 },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const RenewalModel: Model<IRenewal> =
  mongoose.models.Renewal || mongoose.model<IRenewal>("Renewal", renewalSchema);
