import mongoose, { Schema, Document, Model } from "mongoose";

export interface IScheme extends Document {
  schemeId: string;
  title: string;
  department: string;
  description: string;
  sector: string;
  minInvestment: number;
  maxInvestment: number;
  district: string;
  benefits: string;
  eligibilityCriteria: string;
  requiredDocs: string;
  deadline?: Date;
  officialUrl?: string;
  isActive: boolean;
  createdAt: Date;
}

const schemeSchema = new Schema<IScheme>(
  {
    schemeId: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    department: { type: String, required: true },
    description: { type: String, required: true },
    sector: { type: String, default: "ALL" },
    minInvestment: { type: Number, default: 0 },
    maxInvestment: { type: Number, default: 100000000 },
    district: { type: String, default: "ALL" },
    benefits: { type: String, required: true },
    eligibilityCriteria: { type: String, required: true },
    requiredDocs: { type: String, required: true },
    deadline: { type: Date },
    officialUrl: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const SchemeModel: Model<IScheme> =
  mongoose.models.Scheme || mongoose.model<IScheme>("Scheme", schemeSchema);
