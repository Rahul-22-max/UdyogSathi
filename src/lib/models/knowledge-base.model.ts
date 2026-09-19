import mongoose, { Schema, Document, Model } from "mongoose";

export interface IKnowledgeBaseArticle extends Document {
  slug: string;
  title: string;
  category: string;
  content: string;
  language: string;
  viewCount: number;
  isPublished: boolean;
  createdAt: Date;
}

const knowledgeBaseArticleSchema = new Schema<IKnowledgeBaseArticle>(
  {
    slug: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    category: { type: String, required: true },
    content: { type: String, required: true },
    language: { type: String, default: "en" },
    viewCount: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const KnowledgeBaseArticleModel: Model<IKnowledgeBaseArticle> =
  mongoose.models.KnowledgeBaseArticle ||
  mongoose.model<IKnowledgeBaseArticle>("KnowledgeBaseArticle", knowledgeBaseArticleSchema);
