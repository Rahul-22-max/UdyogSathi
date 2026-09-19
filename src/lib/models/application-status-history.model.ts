import mongoose, { Schema, Document, Model } from "mongoose";

export interface IApplicationStatusHistory extends Document {
  applicationId: mongoose.Types.ObjectId;
  previousStatus?: string;
  newStatus: string;
  status: string;
  action?: string;
  comment?: string;
  remarks?: string;
  performedByUserId?: mongoose.Types.ObjectId;
  changedByUserId?: mongoose.Types.ObjectId;
  performedByRole?: string;
  createdAt: Date;
}

const applicationStatusHistorySchema = new Schema<IApplicationStatusHistory>(
  {
    applicationId: { type: Schema.Types.ObjectId, ref: "Application", required: true, index: true },
    previousStatus: { type: String },
    newStatus: { type: String },
    status: { type: String, required: true },
    action: { type: String },
    comment: { type: String },
    remarks: { type: String },
    performedByUserId: { type: Schema.Types.ObjectId, ref: "User" },
    changedByUserId: { type: Schema.Types.ObjectId, ref: "User" },
    performedByRole: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

applicationStatusHistorySchema.index({ applicationId: 1, createdAt: -1 });

export const ApplicationStatusHistoryModel: Model<IApplicationStatusHistory> =
  mongoose.models.ApplicationStatusHistory ||
  mongoose.model<IApplicationStatusHistory>("ApplicationStatusHistory", applicationStatusHistorySchema);
