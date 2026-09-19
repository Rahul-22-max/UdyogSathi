import mongoose, { Schema, Document, Model } from "mongoose";

export interface IGrievance extends Document {
  ticketId: string;
  userId: mongoose.Types.ObjectId;
  projectId?: mongoose.Types.ObjectId;
  category: string;
  subject: string;
  description: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  status: "OPEN" | "ACKNOWLEDGED" | "IN_PROGRESS" | "ESCALATED" | "RESOLVED" | "CLOSED";
  officerAssignedId?: mongoose.Types.ObjectId;
  isEscalated: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const grievanceSchema = new Schema<IGrievance>(
  {
    ticketId: { type: String, required: true, unique: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    projectId: { type: Schema.Types.ObjectId, ref: "Project", index: true },
    category: { type: String, required: true },
    subject: { type: String, required: true },
    description: { type: String, required: true },
    priority: { type: String, enum: ["LOW", "MEDIUM", "HIGH", "URGENT"], default: "MEDIUM" },
    status: {
      type: String,
      enum: ["OPEN", "ACKNOWLEDGED", "IN_PROGRESS", "ESCALATED", "RESOLVED", "CLOSED"],
      default: "OPEN",
    },
    officerAssignedId: { type: Schema.Types.ObjectId, ref: "User" },
    isEscalated: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const GrievanceModel: Model<IGrievance> =
  mongoose.models.Grievance || mongoose.model<IGrievance>("Grievance", grievanceSchema);
