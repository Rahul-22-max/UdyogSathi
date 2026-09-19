import mongoose, { Schema, Document, Model } from "mongoose";

export interface IDocumentVerification extends Document {
  documentId: mongoose.Types.ObjectId;
  applicationId: mongoose.Types.ObjectId;
  verifiedByUserId: mongoose.Types.ObjectId;
  status: "VERIFIED" | "REJECTED" | "PENDING";
  comment?: string;
  createdAt: Date;
}

const documentVerificationSchema = new Schema<IDocumentVerification>(
  {
    documentId: { type: Schema.Types.ObjectId, ref: "Document", required: true, index: true },
    applicationId: { type: Schema.Types.ObjectId, ref: "Application", required: true, index: true },
    verifiedByUserId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["VERIFIED", "REJECTED", "PENDING"], default: "PENDING" },
    comment: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const DocumentVerificationModel: Model<IDocumentVerification> =
  mongoose.models.DocumentVerification ||
  mongoose.model<IDocumentVerification>("DocumentVerification", documentVerificationSchema);
