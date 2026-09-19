import mongoose, { Schema, Document, Model } from "mongoose";

export interface IInspection extends Document {
  inspectionReference: string;
  applicationId: mongoose.Types.ObjectId;
  projectId: mongoose.Types.ObjectId;
  organisationId?: mongoose.Types.ObjectId;
  applicantUserId?: mongoose.Types.ObjectId;
  departmentId?: mongoose.Types.ObjectId;
  department?: string;
  officerId?: mongoose.Types.ObjectId;
  assignedOfficerId?: mongoose.Types.ObjectId;
  inspectorId?: mongoose.Types.ObjectId;
  assignedInspectorId?: mongoose.Types.ObjectId;
  assignedByUserId?: mongoose.Types.ObjectId;
  scheduledDate: Date;
  slotTime: string;
  locationAddress: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  instructions?: string;
  status:
    | "PENDING_ASSIGNMENT"
    | "ASSIGNED"
    | "SCHEDULED"
    | "ACCEPTED"
    | "IN_PROGRESS"
    | "COMPLETED"
    | "CANCELLED"
    | "RESCHEDULE_REQUESTED";
  notes?: string;
  reportSummary?: string;
  inspectionResult?: "PASSED" | "FAILED" | "NEEDS_CORRECTION" | string;
  recommendation?: "RECOMMEND_APPROVAL" | "RECOMMEND_REJECTION" | "REQUIRE_CLARIFICATION" | string;
  submittedAt?: Date;
  submittedByInspectorId?: mongoose.Types.ObjectId;
  submittedByInspectorName?: string;
  evidenceDocumentIds?: (mongoose.Types.ObjectId | string)[];
  checklistItems?: Array<{ id: string; title: string; status: string; notes?: string }>;
  reportPdfUrl?: string;
  riskLevel?: string;
  completedAt?: Date;
  cancelledAt?: Date;
  cancellationReason?: string;
  isDemoSandboxRecord: boolean;
  isDemoRecord: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const inspectionSchema = new Schema<IInspection>(
  {
    inspectionReference: { type: String, required: true, unique: true, index: true },
    applicationId: { type: Schema.Types.ObjectId, ref: "Application", required: true, index: true },
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true, index: true },
    organisationId: { type: Schema.Types.ObjectId, ref: "Organisation" },
    applicantUserId: { type: Schema.Types.ObjectId, ref: "User" },
    departmentId: { type: Schema.Types.ObjectId, ref: "Department" },
    department: { type: String },
    officerId: { type: Schema.Types.ObjectId, ref: "User" },
    assignedOfficerId: { type: Schema.Types.ObjectId, ref: "User" },
    inspectorId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    assignedInspectorId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    assignedByUserId: { type: Schema.Types.ObjectId, ref: "User" },
    scheduledDate: { type: Date, required: true, index: true },
    slotTime: { type: String, default: "10:00 AM - 12:00 PM" },
    locationAddress: { type: String, required: true },
    location: { type: String },
    latitude: { type: Number },
    longitude: { type: Number },
    instructions: { type: String },
    status: {
      type: String,
      default: "SCHEDULED",
      index: true,
    },
    notes: { type: String },
    reportSummary: { type: String },
    inspectionResult: { type: String },
    recommendation: { type: String },
    submittedAt: { type: Date },
    submittedByInspectorId: { type: Schema.Types.ObjectId, ref: "User" },
    submittedByInspectorName: { type: String },
    evidenceDocumentIds: [{ type: Schema.Types.Mixed }],
    checklistItems: [
      {
        id: { type: String },
        title: { type: String },
        status: { type: String },
        notes: { type: String },
      },
    ],
    reportPdfUrl: { type: String },
    riskLevel: { type: String, default: "MEDIUM" },
    completedAt: { type: Date },
    cancelledAt: { type: Date },
    cancellationReason: { type: String },
    isDemoSandboxRecord: { type: Boolean, default: false },
    isDemoRecord: { type: Boolean, default: false },
  },
  { timestamps: true }
);

inspectionSchema.index({ assignedInspectorId: 1, status: 1 });
inspectionSchema.index({ inspectorId: 1, status: 1 });

export const InspectionModel: Model<IInspection> =
  mongoose.models.Inspection || mongoose.model<IInspection>("Inspection", inspectionSchema);
