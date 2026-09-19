import mongoose, { Schema, Document, Model } from "mongoose";

export interface IInspectionChecklistItem extends Document {
  inspectionId: mongoose.Types.ObjectId;
  category: string;
  itemTitle: string;
  isCompliant: "COMPLIANT" | "NON_COMPLIANT" | "NEEDS_REVIEW" | "NOT_APPLICABLE" | "NOT_CHECKED";
  notes?: string;
  evidencePhotoUrl?: string;
  createdAt: Date;
}

const inspectionChecklistItemSchema = new Schema<IInspectionChecklistItem>(
  {
    inspectionId: { type: Schema.Types.ObjectId, ref: "Inspection", required: true, index: true },
    category: { type: String, required: true },
    itemTitle: { type: String, required: true },
    isCompliant: {
      type: String,
      enum: ["COMPLIANT", "NON_COMPLIANT", "NEEDS_REVIEW", "NOT_APPLICABLE", "NOT_CHECKED"],
      default: "NOT_CHECKED",
    },
    notes: { type: String },
    evidencePhotoUrl: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const InspectionChecklistItemModel: Model<IInspectionChecklistItem> =
  mongoose.models.InspectionChecklistItem ||
  mongoose.model<IInspectionChecklistItem>("InspectionChecklistItem", inspectionChecklistItemSchema);
