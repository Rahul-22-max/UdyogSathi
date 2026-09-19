if (typeof window !== 'undefined') {
  throw new Error('Server-only module');
}
import { connectToDatabase } from "@/lib/db/mongoose";
import { InspectionModel, IInspection } from "@/lib/models/inspection.model";
import { ApplicationModel } from "@/lib/models/application.model";

export async function findInspections(query: Record<string, any>): Promise<IInspection[]> {
  await connectToDatabase();
  return InspectionModel.find(query)
    .populate("applicationId")
    .populate("projectId")
    .sort({ scheduledDate: 1 })
    .lean<IInspection[]>();
}

export async function findInspectionById(id: string): Promise<IInspection | null> {
  await connectToDatabase();
  return InspectionModel.findById(id)
    .populate("applicationId")
    .populate("projectId")
    .lean<IInspection>();
}

export async function createInspection(data: Partial<IInspection>): Promise<IInspection> {
  await connectToDatabase();
  const inspection = new InspectionModel(data);
  const saved = await inspection.save();
  return saved.toObject();
}

export async function updateInspectionReport(
  id: string,
  data: {
    status?: string;
    inspectionResult?: string;
    recommendation?: string;
    reportSummary?: string;
    submittedAt?: Date;
    submittedByInspectorId?: any;
    submittedByInspectorName?: string;
    checklistItems?: any[];
    evidenceDocumentIds?: any[];
    completedAt?: Date;
  }
): Promise<IInspection | null> {
  await connectToDatabase();
  const inspection = await InspectionModel.findByIdAndUpdate(id, { $set: data }, { new: true });
  if (!inspection) return null;

  // Sync state with associated application - Inspector submission sets application status to INSPECTION_COMPLETED
  const newAppStatus = "INSPECTION_COMPLETED";

  await ApplicationModel.findByIdAndUpdate(inspection.applicationId, {
    $set: { status: newAppStatus, inspectionStatus: data.status || "COMPLETED" },
  });

  return inspection.toObject();
}
