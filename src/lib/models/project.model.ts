import mongoose, { Schema, Document, Model } from "mongoose";

export interface IProject extends Document {
  projectCode?: string;
  organisationId: mongoose.Types.ObjectId;
  ownerUserId: mongoose.Types.ObjectId;
  createdByUserId: mongoose.Types.ObjectId;
  name: string;
  sector: string;
  subSector: string;
  district: string;
  taluka: string;
  isMIDC: boolean;
  locationType: string;
  landArea: number;
  builtUpArea: number;
  investmentAmount: number;
  workforce: number;
  waterReq: number;
  powerReq: number;
  wasteCategory: string;
  hazardousMaterials: boolean;
  environmentalCategory?: string;
  factoryRequired?: boolean;
  fireSafetyRequired?: boolean;
  boilerRequired?: boolean;
  stage: string;
  status: "DRAFT" | "ACTIVE" | "ARCHIVED";
  isDemoRecord: boolean;
  archivedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const projectSchema = new Schema<IProject>(
  {
    projectCode: { type: String, unique: true, sparse: true, index: true },
    organisationId: { type: Schema.Types.ObjectId, ref: "Organisation", required: true, index: true },
    ownerUserId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    createdByUserId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    sector: { type: String, required: true, index: true },
    subSector: { type: String, required: true },
    district: { type: String, required: true, index: true },
    taluka: { type: String, required: true },
    isMIDC: { type: Boolean, default: true },
    locationType: { type: String, default: "MIDC" },
    landArea: { type: Number, required: true },
    builtUpArea: { type: Number, required: true },
    investmentAmount: { type: Number, required: true },
    workforce: { type: Number, required: true },
    waterReq: { type: Number, default: 500 },
    powerReq: { type: Number, default: 50 },
    wasteCategory: { type: String, default: "GREEN" },
    hazardousMaterials: { type: Boolean, default: false },
    environmentalCategory: { type: String },
    factoryRequired: { type: Boolean, default: false },
    fireSafetyRequired: { type: Boolean, default: false },
    boilerRequired: { type: Boolean, default: false },
    stage: { type: String, default: "SETUP" },
    status: { type: String, enum: ["DRAFT", "ACTIVE", "ARCHIVED"], default: "ACTIVE", index: true },
    isDemoRecord: { type: Boolean, default: false },
    archivedAt: { type: Date },
  },
  { timestamps: true }
);

projectSchema.index({ organisationId: 1, status: 1 });
projectSchema.index({ ownerUserId: 1, status: 1 });

export const ProjectModel: Model<IProject> =
  mongoose.models.Project || mongoose.model<IProject>("Project", projectSchema);
