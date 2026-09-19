import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongoose';
import {
  InspectionModel,
  ApplicationModel,
  ApplicationStatusHistoryModel,
  AuditLogModel,
  NotificationModel,
} from '@/lib/models/index';
import { verifyAuthSession } from '@/lib/auth-session';
import { normalizeRole } from '@/lib/rbac';
import { isValidObjectId } from '@/lib/utils/object-id';
import { isInspectorAssignedToInspection } from '@/lib/permissions/inspector-identity';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    const { id } = params;

    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid Inspection ID format' },
        { status: 400 }
      );
    }

    // 1. Authenticate Session
    const authSession = await verifyAuthSession(req);
    if (!authSession || !authSession.userId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // 2. Authorise Inspector Role
    const normRole = normalizeRole(authSession.role);
    if (normRole !== 'inspector' && normRole !== 'administrator') {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Inspector role required' },
        { status: 403 }
      );
    }

    // 3. Load Inspection
    const inspection = await InspectionModel.findById(id);
    if (!inspection) {
      return NextResponse.json(
        { success: false, error: 'Inspection not found' },
        { status: 404 }
      );
    }

    // 4. Validate Assignment Guard with Safe Diagnostic Logs
    const isAssigned = isInspectorAssignedToInspection(inspection, authSession);

    console.log(`[inspection-auth] currentUserId=${authSession.userId}`);
    console.log(`[inspection-auth] currentUserRole=${authSession.role}`);
    console.log(`[inspection-auth] inspectionId=${id}`);
    console.log(`[inspection-auth] assignedInspectorId=${inspection.assignedInspectorId}`);
    console.log(`[inspection-auth] assignmentComparison=${isAssigned}`);

    if (!isAssigned) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: You are not assigned to conduct this site inspection.' },
        { status: 403 }
      );
    }

    // 5. Active Status & Duplicate Guards
    if (inspection.status === 'CANCELLED') {
      return NextResponse.json(
        { success: false, error: 'Cannot submit report for a cancelled inspection.' },
        { status: 400 }
      );
    }

    if (inspection.status === 'COMPLETED') {
      return NextResponse.json(
        {
          success: false,
          error: 'Inspection report has already been submitted.',
          alreadySubmitted: true,
          data: {
            inspectionId: inspection._id.toString(),
            inspectionReference: inspection.inspectionReference,
            inspectionResult: inspection.inspectionResult,
            recommendation: inspection.recommendation,
            reportSummary: inspection.reportSummary,
            submittedAt: inspection.submittedAt || inspection.completedAt,
            status: inspection.status,
          },
        },
        { status: 409 }
      );
    }

    // 6. Validate Payload
    const body = await req.json();
    const { inspectionResult, recommendation, reportSummary, checklistItems, evidenceDocumentIds } = body;

    const validResults = ['PASSED', 'FAILED', 'NEEDS_CORRECTION'];
    const validRecommendations = ['RECOMMEND_APPROVAL', 'RECOMMEND_REJECTION', 'REQUIRE_CLARIFICATION'];

    if (!inspectionResult || !validResults.includes(inspectionResult)) {
      return NextResponse.json(
        { success: false, error: 'Select an inspection result before submitting.' },
        { status: 400 }
      );
    }

    if (!recommendation || !validRecommendations.includes(recommendation)) {
      return NextResponse.json(
        { success: false, error: 'Select an inspector recommendation before submitting.' },
        { status: 400 }
      );
    }

    if (!reportSummary || typeof reportSummary !== 'string' || !reportSummary.trim()) {
      return NextResponse.json(
        { success: false, error: 'Enter report summary remarks before submitting.' },
        { status: 400 }
      );
    }

    // 7. Load Linked Application
    const application = await ApplicationModel.findById(inspection.applicationId);
    if (!application) {
      return NextResponse.json(
        { success: false, error: 'Linked application record not found.' },
        { status: 404 }
      );
    }

    if (['REJECTED', 'WITHDRAWN', 'CLOSED', 'EXPIRED'].includes(application.status)) {
      return NextResponse.json(
        {
          success: false,
          error: `Linked application is in ${application.status} state and cannot accept inspection reports.`,
        },
        { status: 400 }
      );
    }

    // 8. Atomic Conditional Update on Inspection
    const now = new Date();
    const updatedInspection = await InspectionModel.findOneAndUpdate(
      { _id: id, status: { $ne: 'COMPLETED' } },
      {
        $set: {
          status: 'COMPLETED',
          inspectionResult,
          recommendation,
          reportSummary: reportSummary.trim(),
          submittedAt: now,
          submittedByInspectorId: authSession.userId,
          submittedByInspectorName: authSession.name || 'Senior Inspector',
          completedAt: now,
          ...(checklistItems ? { checklistItems } : {}),
          ...(evidenceDocumentIds ? { evidenceDocumentIds } : {}),
        },
      },
      { new: true }
    );

    if (!updatedInspection) {
      return NextResponse.json(
        {
          success: false,
          error: 'Inspection report has already been submitted or completed concurrently.',
        },
        { status: 409 }
      );
    }

    // 9. Update Linked Application Status (Transition to INSPECTION_COMPLETED)
    const oldAppStatus = application.status;
    const newAppStatus = 'INSPECTION_COMPLETED';

    await ApplicationModel.findByIdAndUpdate(application._id, {
      $set: {
        status: newAppStatus,
        inspectionStatus: 'COMPLETED',
        updatedAt: now,
      },
    });

    // 10. Record ApplicationStatusHistory
    await ApplicationStatusHistoryModel.create({
      applicationId: application._id,
      previousStatus: oldAppStatus,
      newStatus: newAppStatus,
      status: newAppStatus,
      action: 'INSPECTION_REPORT_SUBMITTED',
      comment: `Inspection report submitted by ${authSession.name || 'Inspector'}. Result: ${inspectionResult}, Recommendation: ${recommendation}`,
      remarks: reportSummary.trim(),
      performedByUserId: authSession.userId,
      changedByUserId: authSession.userId,
      performedByRole: 'INSPECTOR',
    });

    // 11. Record AuditLog
    await AuditLogModel.create({
      userId: authSession.userId,
      actorUserId: authSession.userId,
      actorRole: 'INSPECTOR',
      action: 'INSPECTION_REPORT_SUBMITTED',
      eventType: 'inspection_report_submitted',
      entityType: 'Inspection',
      entityId: id,
      details: `Inspection ${inspection.inspectionReference} report submitted. Result: ${inspectionResult}, Recommendation: ${recommendation}`,
      metadata: {
        inspectionId: id,
        applicationId: application._id.toString(),
        projectId: inspection.projectId?.toString(),
        organisationId: inspection.organisationId?.toString(),
        inspectionResult,
        recommendation,
        submittedAt: now,
      },
    });

    // 12. Create Targeted Notifications
    const officerRecipientId =
      application.assignedOfficerId || inspection.assignedOfficerId || inspection.officerId;

    if (officerRecipientId) {
      await NotificationModel.create({
        recipientUserId: officerRecipientId,
        recipientRole: 'DEPARTMENT_OFFICER',
        relatedApplicationId: application._id.toString(),
        relatedEntityId: id,
        relatedEntityType: 'Inspection',
        type: 'inspection_report_submitted',
        priority: 'high',
        title: 'Inspection report submitted',
        message: `The inspection report for ${application.applicationNumber} is ready for department review.`,
        route: `/applications/${application._id}`,
        deliveryStatus: 'delivered_in_app',
        isRead: false,
      });
    }

    if (application.applicantUserId) {
      await NotificationModel.create({
        recipientUserId: application.applicantUserId,
        recipientRole: 'APPLICANT',
        relatedApplicationId: application._id.toString(),
        relatedEntityId: id,
        relatedEntityType: 'Inspection',
        type: 'inspection_completed',
        priority: 'normal',
        title: 'Inspection completed',
        message: `The inspection for your ${application.approvalName} application has been completed. Your application is awaiting department decision.`,
        route: `/applications/${application._id}`,
        deliveryStatus: 'delivered_in_app',
        isRead: false,
      });
    }

    // 13. Return Safe Response Data
    return NextResponse.json({
      success: true,
      message: 'Inspection report submitted successfully.',
      data: {
        inspectionId: id,
        inspectionReference: inspection.inspectionReference,
        applicationId: application._id.toString(),
        applicationNumber: application.applicationNumber,
        inspectionResult,
        recommendation,
        reportSummary: reportSummary.trim(),
        submittedAt: now,
        inspectionStatus: 'COMPLETED',
        applicationStatus: newAppStatus,
      },
    });
  } catch (error: any) {
    console.error('[API /api/inspections/[id]/submit-report POST Error]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
