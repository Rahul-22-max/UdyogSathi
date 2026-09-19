import mongoose, { Schema, Document, Model } from "mongoose";

export interface IApprovalRule extends Document {
  ruleId: string;
  version: number;
  title: string;
  sector: string;
  subSector?: string;
  locationType?: string;
  district?: string;
  projectStage?: string;
  minInvestment?: number;
  maxInvestment?: number;
  minWorkforce?: number;
  maxWorkforce?: number;
  envCategory?: string;
  hazardousCondition?: boolean;
  requiredApproval: string;
  department: string;
  departmentId?: string;
  requiredDocs: string[];
  dependencies: string[];
  canRunInParallel: boolean;
  slaDays: number;
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  priority: number;
  requiresInspection: boolean;
  inspectionStage?: string;
  explanation: string;
  sourceRef?: string;
  sourceReference?: string;
  verificationStatus: string;
  isActive: boolean;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const approvalRuleSchema = new Schema<IApprovalRule>(
  {
    ruleId: { type: String, required: true, unique: true, index: true },
    version: { type: Number, default: 1 },
    title: { type: String, required: true },
    sector: { type: String, required: true, index: true },
    subSector: { type: String },
    locationType: { type: String },
    district: { type: String },
    projectStage: { type: String },
    minInvestment: { type: Number, default: 0 },
    maxInvestment: { type: Number },
    minWorkforce: { type: Number, default: 0 },
    maxWorkforce: { type: Number },
    envCategory: { type: String },
    hazardousCondition: { type: Boolean, default: false },
    requiredApproval: { type: String, required: true },
    department: { type: String, required: true, index: true },
    departmentId: { type: String },
    requiredDocs: { type: [String], default: [] },
    dependencies: { type: [String], default: [] },
    canRunInParallel: { type: Boolean, default: true },
    slaDays: { type: Number, default: 30 },
    riskLevel: { type: String, enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"], default: "MEDIUM" },
    priority: { type: Number, default: 1 },
    requiresInspection: { type: Boolean, default: false },
    inspectionStage: { type: String, default: "before_decision" },
    explanation: { type: String, required: true },
    sourceRef: { type: String },
    sourceReference: { type: String },
    verificationStatus: { type: String, default: "VERIFIED" },
    isActive: { type: Boolean, default: true, index: true },
    published: { type: Boolean, default: true },
  },
  { timestamps: true }
);

approvalRuleSchema.index({ isActive: 1, published: 1 });

export const ApprovalRuleModel: Model<IApprovalRule> =
  mongoose.models.ApprovalRule || mongoose.model<IApprovalRule>("ApprovalRule", approvalRuleSchema);
