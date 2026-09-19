import mongoose, { Schema, Document, Model } from "mongoose";

export interface IDepartment extends Document {
  code: string;
  name: string;
  description?: string;
  nodalOfficerUserId?: mongoose.Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const departmentSchema = new Schema<IDepartment>(
  {
    code: { type: String, required: true, unique: true, uppercase: true, index: true },
    name: { type: String, required: true },
    description: { type: String },
    nodalOfficerUserId: { type: Schema.Types.ObjectId, ref: "User" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const DepartmentModel: Model<IDepartment> =
  mongoose.models.Department || mongoose.model<IDepartment>("Department", departmentSchema);
