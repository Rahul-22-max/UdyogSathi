import mongoose, { Schema, Document, Model } from "mongoose";

export interface IApprovalRoadmap extends Document {
  projectId: mongoose.Types.ObjectId;
  organisationId?: mongoose.Types.ObjectId;
  applicantUserId: mongoose.Types.ObjectId;
  wizardInputSnapshot: any;
  matchedApprovalRules: any[];
  selectedApprovalRules: any[];
  state: "DRAFT" | "GENERATED" | "APPLICATIONS_CREATED";
  version: number;
  idempotencyKey?: string;
  createdAt: Date;
  updatedAt: Date;
}

const approvalRoadmapSchema = new Schema<IApprovalRoadmap>(
  {
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true, index: true },
    organisationId: { type: Schema.Types.ObjectId, ref: "Organisation" },
    applicantUserId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    wizardInputSnapshot: { type: Schema.Types.Mixed, required: true },
    matchedApprovalRules: [Schema.Types.Mixed],
    selectedApprovalRules: [Schema.Types.Mixed],
    state: { type: String, enum: ["DRAFT", "GENERATED", "APPLICATIONS_CREATED"], default: "GENERATED" },
    version: { type: Number, default: 1 },
    idempotencyKey: { type: String, unique: true, sparse: true },
  },
  { timestamps: true }
);

approvalRoadmapSchema.index({ projectId: 1, createdAt: -1 });

export const ApprovalRoadmapModel: Model<IApprovalRoadmap> =
  mongoose.models.ApprovalRoadmap ||
  mongoose.model<IApprovalRoadmap>("ApprovalRoadmap", approvalRoadmapSchema);
