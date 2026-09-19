if (typeof window !== 'undefined') {
  throw new Error('Server-only module');
}
import { connectToDatabase } from "@/lib/db/mongoose";
import { ApplicationModel, IApplication } from "@/lib/models/application.model";
import { ApplicationStatusHistoryModel } from "@/lib/models/application-status-history.model";
import { InspectionModel } from "@/lib/models/inspection.model";

export async function findApplications(query: Record<string, any>): Promise<IApplication[]> {
  await connectToDatabase();
  return ApplicationModel.find(query)
    .populate("projectId")
    .sort({ createdAt: -1 })
    .lean<IApplication[]>();
}

export async function findApplicationById(id: string): Promise<IApplication | null> {
  await connectToDatabase();
  return ApplicationModel.findById(id)
    .populate("projectId")
    .lean<IApplication>();
}

export async function createApplication(data: Partial<IApplication>): Promise<IApplication> {
  await connectToDatabase();
  const application = new ApplicationModel(data);
  const saved = await application.save();

  // Create initial status history entry
  await ApplicationStatusHistoryModel.create({
    applicationId: saved._id,
    previousStatus: "NOT_STARTED",
    newStatus: saved.status,
    status: saved.status,
    action: "APPLICATION_CREATED",
    performedByUserId: saved.applicantUserId,
  });

  return saved.toObject();
}

export async function updateApplicationStatus(
  id: string,
  newStatus: string,
  userId: string,
  remarks?: string
): Promise<IApplication | null> {
  await connectToDatabase();
  const app = await ApplicationModel.findById(id);
  if (!app) return null;

  const previousStatus = app.status;
  app.status = newStatus as any;

  if (newStatus === "APPROVED") {
    app.approvedAt = new Date();
    app.approvedByUserId = userId as any;
  } else if (newStatus === "REJECTED") {
    app.rejectedAt = new Date();
    app.rejectedByUserId = userId as any;
    if (remarks) app.rejectionReason = remarks;

    // Rejecting application automatically cancels active linked inspection
    await InspectionModel.updateMany(
      { applicationId: id, status: { $in: ["SCHEDULED", "ASSIGNED", "IN_PROGRESS"] } },
      {
        $set: {
          status: "CANCELLED",
          cancelledAt: new Date(),
          cancellationReason: `Application rejected: ${remarks || "No remarks"}`,
        },
      }
    );
  }

  await app.save();

  await ApplicationStatusHistoryModel.create({
    applicationId: id,
    previousStatus,
    newStatus,
    status: newStatus,
    action: `STATUS_CHANGE_TO_${newStatus}`,
    performedByUserId: userId,
    comment: remarks,
  });

  return app.toObject();
}
