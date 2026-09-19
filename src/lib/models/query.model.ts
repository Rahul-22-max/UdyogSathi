import mongoose, { Schema, Document, Model } from "mongoose";

export interface IQuery extends Document {
  applicationId: mongoose.Types.ObjectId;
  raisedByUserId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  status: "OPEN" | "RESPONDED" | "CLOSED";
  createdAt: Date;
  updatedAt: Date;
}

const querySchema = new Schema<IQuery>(
  {
    applicationId: { type: Schema.Types.ObjectId, ref: "Application", required: true, index: true },
    raisedByUserId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    status: { type: String, enum: ["OPEN", "RESPONDED", "CLOSED"], default: "OPEN" },
  },
  { timestamps: true }
);

export const QueryModel: Model<IQuery> =
  mongoose.models.Query || mongoose.model<IQuery>("Query", querySchema);
