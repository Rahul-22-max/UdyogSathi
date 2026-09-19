import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  name: string;
  role: "APPLICANT" | "DEPARTMENT_OFFICER" | "OFFICER" | "INSPECTOR" | "ADMINISTRATOR" | "ADMIN" | "GUEST" | string;
  mobile?: string;
  language: string;
  accessibilityPreferences: {
    highContrast: boolean;
    fontSize: string;
    reducedMotion: boolean;
  };
  departmentId?: string;
  department?: string;
  designation?: string;
  isActive: boolean;
  isDemoUser: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true },
    role: {
      type: String,
      default: "APPLICANT",
      index: true,
    },
    mobile: { type: String },
    language: { type: String, default: "en" },
    accessibilityPreferences: {
      highContrast: { type: Boolean, default: false },
      fontSize: { type: String, default: "normal" },
      reducedMotion: { type: Boolean, default: false },
    },
    departmentId: { type: Schema.Types.ObjectId, ref: "Department", index: true },
    department: { type: String },
    designation: { type: String },
    isActive: { type: Boolean, default: true },
    isDemoUser: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const UserModel: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", userSchema);
