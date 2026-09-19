if (typeof window !== 'undefined') {
  throw new Error('Server-only module');
}
import { connectToDatabase } from "@/lib/db/mongoose";
import { ProjectModel, IProject } from "@/lib/models/project.model";

export async function findProjectsByUser(userId: string): Promise<IProject[]> {
  await connectToDatabase();
  return ProjectModel.find({
    $or: [{ ownerUserId: userId }, { createdByUserId: userId }],
    status: { $ne: "ARCHIVED" },
  })
    .sort({ createdAt: -1 })
    .lean<IProject[]>();
}

export async function findProjectById(id: string): Promise<IProject | null> {
  await connectToDatabase();
  return ProjectModel.findById(id).lean<IProject>();
}

export async function createProject(data: Partial<IProject>): Promise<IProject> {
  await connectToDatabase();
  const project = new ProjectModel(data);
  const saved = await project.save();
  return saved.toObject();
}

export async function updateProject(id: string, updates: Partial<IProject>): Promise<IProject | null> {
  await connectToDatabase();
  return ProjectModel.findByIdAndUpdate(id, { $set: updates }, { new: true }).lean<IProject>();
}
