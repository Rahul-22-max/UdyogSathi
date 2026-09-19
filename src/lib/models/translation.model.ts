import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITranslationKey extends Document {
  key: string;
  defaultEn: string;
  mr?: string;
  hi?: string;
  ur?: string;
  category: string;
  updatedAt: Date;
}

const translationKeySchema = new Schema<ITranslationKey>(
  {
    key: { type: String, required: true, unique: true, index: true },
    defaultEn: { type: String, required: true },
    mr: { type: String },
    hi: { type: String },
    ur: { type: String },
    category: { type: String, default: "UI" },
  },
  { timestamps: { createdAt: false, updatedAt: true } }
);

export const TranslationKeyModel: Model<ITranslationKey> =
  mongoose.models.TranslationKey ||
  mongoose.model<ITranslationKey>("TranslationKey", translationKeySchema);
