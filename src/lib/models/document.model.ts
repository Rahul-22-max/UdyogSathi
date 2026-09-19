import mongoose, { Schema, Document, Model } from "mongoose";

export interface IDocument extends Document {
  ownerUserId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  organisationId?: mongoose.Types.ObjectId;
  projectId?: mongoose.Types.ObjectId;
  name: string;
  category: string;
  documentType?: string;
  documentName?: string;
  originalFileName?: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  storageProvider?: string;
  storageKey?: string;
  mimeType?: string;
  sourceType: "ONBOARDING" | "VAULT" | "APPLICATION" | "INSPECTION";
  uploadedAt?: Date;
  expiryDate?: Date;
  isVerified: boolean;
  preValidationScore: number;
  preValidationStatus?: string;
  preValidationResult?: any;
  verificationStatus?: string;
  verifiedAt?: Date;
  verifiedByUserId?: mongoose.Types.ObjectId;
  verificationNotes?: string;
  rejectionReason?: string;
  issuedDate?: Date;
  version: number;
  parentDocumentId?: mongoose.Types.ObjectId;
  supersededByDocumentId?: mongoose.Types.ObjectId;
  isLatestVersion: boolean;
  reuseConsent: boolean;
  reusableForApprovalTypes: string[];
  sensitivity?: string;
  status: string;
  metadata?: string;
  isDemoRecord: boolean;
  createdAt: Date;
  updatedAt: Date;
  archivedAt?: Date;
}

const documentSchema = new Schema<IDocument>(
  {
    ownerUserId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    organisationId: { type: Schema.Types.ObjectId, ref: "Organisation", index: true },
    projectId: { type: Schema.Types.ObjectId, ref: "Project", index: true },
    name: { type: String, required: true },
    category: { type: String, default: "IDENTITY" },
    documentType: { type: String },
    documentName: { type: String },
    originalFileName: { type: String },
    fileUrl: { type: String, required: true },
    fileType: { type: String, required: true },
    fileSize: { type: Number, required: true },
    storageProvider: { type: String, default: "local" },
    storageKey: { type: String },
    mimeType: { type: String },
    sourceType: {
      type: String,
      enum: ["ONBOARDING", "VAULT", "APPLICATION", "INSPECTION"],
      default: "VAULT",
    },
    uploadedAt: { type: Date, default: Date.now },
    expiryDate: { type: Date },
    isVerified: { type: Boolean, default: false },
    preValidationScore: { type: Number, default: 100 },
    preValidationStatus: { type: String, default: "PASSED" },
    preValidationResult: { type: Schema.Types.Mixed },
    verificationStatus: { type: String, default: "PENDING" },
    verifiedAt: { type: Date },
    verifiedByUserId: { type: Schema.Types.ObjectId, ref: "User" },
    verificationNotes: { type: String },
    rejectionReason: { type: String },
    issuedDate: { type: Date },
    version: { type: Number, default: 1 },
    parentDocumentId: { type: Schema.Types.ObjectId, ref: "Document" },
    supersededByDocumentId: { type: Schema.Types.ObjectId, ref: "Document" },
    isLatestVersion: { type: Boolean, default: true },
    reuseConsent: { type: Boolean, default: true },
    reusableForApprovalTypes: { type: [String], default: [] },
    sensitivity: { type: String, default: "CONFIDENTIAL" },
    status: { type: String, default: "ACTIVE", index: true },
    metadata: { type: String },
    isDemoRecord: { type: Boolean, default: false },
    archivedAt: { type: Date },
  },
  { timestamps: true }
);

documentSchema.index({ organisationId: 1, category: 1 });
documentSchema.index({ userId: 1, status: 1 });

export const DocumentModel: Model<IDocument> =
  mongoose.models.Document || mongoose.model<IDocument>("Document", documentSchema);
