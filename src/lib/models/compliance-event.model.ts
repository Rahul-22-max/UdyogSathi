import mongoose, { Schema, Document, Model } from "mongoose";

export interface IComplianceEvent extends Document {
  projectId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  title: string;
  department: string;
  category: string;
  dueDate: Date;
  isCompleted: boolean;
  reminderDate?: Date;
  notes?: string;
  createdAt: Date;
}

const complianceEventSchema = new Schema<IComplianceEvent>(
  {
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true },
    department: { type: String, required: true },
    category: { type: String, default: "FILING" },
    dueDate: { type: Date, required: true },
    isCompleted: { type: Boolean, default: false },
    reminderDate: { type: Date },
    notes: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const ComplianceEventModel: Model<IComplianceEvent> =
  mongoose.models.ComplianceEvent ||
  mongoose.model<IComplianceEvent>("ComplianceEvent", complianceEventSchema);
