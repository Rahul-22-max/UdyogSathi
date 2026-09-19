import mongoose, { Schema, Document, Model } from "mongoose";

export interface IQueryResponse extends Document {
  queryId: mongoose.Types.ObjectId;
  respondedByUserId: mongoose.Types.ObjectId;
  message: string;
  attachmentUrl?: string;
  createdAt: Date;
}

const queryResponseSchema = new Schema<IQueryResponse>(
  {
    queryId: { type: Schema.Types.ObjectId, ref: "Query", required: true, index: true },
    respondedByUserId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    message: { type: String, required: true },
    attachmentUrl: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const QueryResponseModel: Model<IQueryResponse> =
  mongoose.models.QueryResponse || mongoose.model<IQueryResponse>("QueryResponse", queryResponseSchema);
