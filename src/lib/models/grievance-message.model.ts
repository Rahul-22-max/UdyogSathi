import mongoose, { Schema, Document, Model } from "mongoose";

export interface IGrievanceMessage extends Document {
  grievanceId: mongoose.Types.ObjectId;
  senderUserId: mongoose.Types.ObjectId;
  message: string;
  attachmentUrl?: string;
  isInternal: boolean;
  createdAt: Date;
}

const grievanceMessageSchema = new Schema<IGrievanceMessage>(
  {
    grievanceId: { type: Schema.Types.ObjectId, ref: "Grievance", required: true, index: true },
    senderUserId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    message: { type: String, required: true },
    attachmentUrl: { type: String },
    isInternal: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const GrievanceMessageModel: Model<IGrievanceMessage> =
  mongoose.models.GrievanceMessage ||
  mongoose.model<IGrievanceMessage>("GrievanceMessage", grievanceMessageSchema);
