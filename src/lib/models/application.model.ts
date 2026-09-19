import mongoose, { Schema, Document, Model } from "mongoose";

export interface IApplication extends Document {
  applicationNumber: string;
  projectId: mongoose.Types.ObjectId;
  organisationId?: mongoose.Types.ObjectId;
  applicantUserId: mongoose.Types.ObjectId;
  approvalRuleId?: mongoose.Types.ObjectId;
  approvalName: string;
  department: string;
  departmentId?: mongoose.Types.ObjectId;
  assignedOfficerId?: mongoose.Types.ObjectId;
  status:
    | "NOT_STARTED"
    | "DOCUMENTS_PENDING"
    | "READY_FOR_SUBMISSION"
    | "SUBMITTED"
    | "UNDER_REVIEW"
    | "QUERY_RAISED"
    | "RESPONSE_SUBMITTED"
    | "INSPECTION_REQUIRED"
    | "INSPECTION_SCHEDULED"
    | "INSPECTION_IN_PROGRESS"
    | "INSPECTION_COMPLETED"
    | "APPROVED"
    | "REJECTED"
    | "RETURNED_FOR_CORRECTION"
    | "RENEWAL_DUE"
    | "EXPIRED"
    | "CLOSED"
    | "WITHDRAWN";
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  slaDays: number;
  submissionDate?: Date;
  submittedAt?: Date;
  slaDueDate?: Date;
  expectedDecisionDate?: Date;
  requiresInspection: boolean;
  inspectionStage?: string;
  inspectionStatus?: string;
  assignedInspectorId?: mongoose.Types.ObjectId;
  decisionRemarks?: string;
  rejectionReason?: string;
  approvedByUserId?: mongoose.Types.ObjectId;
  approvedAt?: Date;
  rejectedByUserId?: mongoose.Types.ObjectId;
  rejectedAt?: Date;
  approvalReferenceNumber?: string;
  validUntil?: Date;
  renewalDueDate?: Date;
  idempotencyKey?: string;
  isDemoSandboxRecord: boolean;
  isDemoRecord: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const applicationSchema = new Schema<IApplication>(
  {
    applicationNumber: { type: String, required: true, unique: true, index: true },
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true, index: true },
    organisationId: { type: Schema.Types.ObjectId, ref: "Organisation", index: true },
    applicantUserId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    approvalRuleId: { type: Schema.Types.ObjectId, ref: "ApprovalRule" },
    approvalName: { type: String, required: true },
    department: { type: String, required: true, index: true },
    departmentId: { type: Schema.Types.ObjectId, ref: "Department" },
    assignedOfficerId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    status: {
      type: String,
      default: "NOT_STARTED",
      index: true,
    },
    riskLevel: { type: String, enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"], default: "MEDIUM" },
    slaDays: { type: Number, default: 30 },
    submissionDate: { type: Date },
    submittedAt: { type: Date },
    slaDueDate: { type: Date, index: true },
    expectedDecisionDate: { type: Date },
    requiresInspection: { type: Boolean, default: false },
    inspectionStage: { type: String, default: "before_decision" },
    inspectionStatus: { type: String },
    assignedInspectorId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    decisionRemarks: { type: String },
    rejectionReason: { type: String },
    approvedByUserId: { type: Schema.Types.ObjectId, ref: "User" },
    approvedAt: { type: Date },
    rejectedByUserId: { type: Schema.Types.ObjectId, ref: "User" },
    rejectedAt: { type: Date },
    approvalReferenceNumber: { type: String },
    validUntil: { type: Date },
    renewalDueDate: { type: Date },
    idempotencyKey: { type: String, unique: true, sparse: true },
    isDemoSandboxRecord: { type: Boolean, default: false },
    isDemoRecord: { type: Boolean, default: false },
  },
  { timestamps: true }
);

applicationSchema.index({ projectId: 1, status: 1 });
applicationSchema.index({ applicantUserId: 1, status: 1 });

export const ApplicationModel: Model<IApplication> =
  mongoose.models.Application || mongoose.model<IApplication>("Application", applicationSchema);
