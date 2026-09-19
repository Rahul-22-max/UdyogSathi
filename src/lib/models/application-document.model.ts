import mongoose, { Schema, Document, Model } from "mongoose";

export interface IApplicationDocument extends Document {
  applicationId: mongoose.Types.ObjectId;
  documentId?: mongoose.Types.ObjectId;
  requiredDocumentType: string;
  requiredDocumentLabel: string;
  isRequired: boolean;
  linkType: "UPLOADED_FOR_APPLICATION" | "REUSED_FROM_VAULT" | "GENERATED_FOR_APPLICATION";
  requirementStatus: string;
  verificationStatus: string;
  preValidationStatus: string;
  reuseStatus?: string;
  reuseReason?: string;
  blockReason?: string;
  linkedAt: Date;
  linkedByUserId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const applicationDocumentSchema = new Schema<IApplicationDocument>(
  {
    applicationId: { type: Schema.Types.ObjectId, ref: "Application", required: true, index: true },
    documentId: { type: Schema.Types.ObjectId, ref: "Document", index: true },
    requiredDocumentType: { type: String, required: true },
    requiredDocumentLabel: { type: String, required: true },
    isRequired: { type: Boolean, default: true },
    linkType: {
      type: String,
      enum: ["UPLOADED_FOR_APPLICATION", "REUSED_FROM_VAULT", "GENERATED_FOR_APPLICATION"],
      default: "UPLOADED_FOR_APPLICATION",
    },
    requirementStatus: { type: String, default: "PENDING" },
    verificationStatus: { type: String, default: "PENDING" },
    preValidationStatus: { type: String, default: "PASSED" },
    reuseStatus: { type: String },
    reuseReason: { type: String },
    blockReason: { type: String },
    linkedAt: { type: Date, default: Date.now },
    linkedByUserId: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

applicationDocumentSchema.index({ applicationId: 1, requiredDocumentType: 1 });

export const ApplicationDocumentModel: Model<IApplicationDocument> =
  mongoose.models.ApplicationDocument ||
  mongoose.model<IApplicationDocument>("ApplicationDocument", applicationDocumentSchema);
