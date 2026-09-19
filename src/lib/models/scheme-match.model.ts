import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISchemeMatch extends Document {
  projectId: mongoose.Types.ObjectId;
  schemeId: mongoose.Types.ObjectId;
  matchScore: number;
  explanation: string;
  isSaved: boolean;
  createdAt: Date;
}

const schemeMatchSchema = new Schema<ISchemeMatch>(
  {
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true, index: true },
    schemeId: { type: Schema.Types.ObjectId, ref: "Scheme", required: true, index: true },
    matchScore: { type: Number, default: 85 },
    explanation: { type: String, required: true },
    isSaved: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const SchemeMatchModel: Model<ISchemeMatch> =
  mongoose.models.SchemeMatch || mongoose.model<ISchemeMatch>("SchemeMatch", schemeMatchSchema);
