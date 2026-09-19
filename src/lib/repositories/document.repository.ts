if (typeof window !== 'undefined') {
  throw new Error('Server-only module');
}
import { connectToDatabase } from "@/lib/db/mongoose";
import { DocumentModel, IDocument } from "@/lib/models/document.model";

export async function findDocumentsByUser(userId: string): Promise<IDocument[]> {
  await connectToDatabase();
  return DocumentModel.find({
    $or: [{ userId: userId }, { ownerUserId: userId }],
    status: { $ne: "ARCHIVED" },
  })
    .sort({ createdAt: -1 })
    .lean<IDocument[]>();
}

export async function findDocumentById(id: string): Promise<IDocument | null> {
  await connectToDatabase();
  return DocumentModel.findById(id).lean<IDocument>();
}

export async function createDocument(data: Partial<IDocument>): Promise<IDocument> {
  await connectToDatabase();
  const doc = new DocumentModel(data);
  const saved = await doc.save();
  return saved.toObject();
}
