import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongoose';
import { InspectionModel } from '@/lib/models/inspection.model';
import { updateInspectionReport } from '@/lib/repositories/inspection.repository';
import { verifyAuthSession } from '@/lib/auth-session';
import { assertInspectionAccess } from '@/lib/permissions/access-guards';
import { isValidObjectId } from '@/lib/utils/object-id';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    const { id } = params;

    let query: any = {};
    if (isValidObjectId(id)) {
      query._id = id;
    } else {
      query.inspectionReference = id;
    }

    const inspection = await InspectionModel.findOne(query)
      .populate('applicationId')
      .populate('projectId')
      .lean();

    if (!inspection) {
      return NextResponse.json({ success: false, error: 'Inspection not found' }, { status: 404 });
    }

    const authSession = await verifyAuthSession(req);
    if (authSession) {
      try {
        assertInspectionAccess(authSession, inspection);
      } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: err.statusCode || 403 });
      }
    }

    return NextResponse.json({
      success: true,
      inspection: {
        ...inspection,
        id: inspection._id.toString(),
        applicationId: inspection.applicationId ? (inspection.applicationId as any)._id?.toString() || inspection.applicationId.toString() : inspection.applicationId,
        projectId: inspection.projectId ? (inspection.projectId as any)._id?.toString() || inspection.projectId.toString() : inspection.projectId,
        application: inspection.applicationId,
        project: inspection.projectId,
      },
    });
  } catch (error: any) {
    console.error('[API /api/inspections/[id] GET Error]:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    const { id } = params;

    if (!isValidObjectId(id)) {
      return NextResponse.json({ success: false, error: 'Invalid Inspection ID format' }, { status: 400 });
    }

    const authSession = await verifyAuthSession(req);
    if (!authSession) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const inspection = await InspectionModel.findById(id);
    if (!inspection) {
      return NextResponse.json({ success: false, error: 'Inspection not found' }, { status: 404 });
    }

    assertInspectionAccess(authSession, inspection);

    const body = await req.json();
    const now = new Date();
    const updated = await updateInspectionReport(id, {
      status: body.status || 'COMPLETED',
      inspectionResult: body.inspectionResult,
      recommendation: body.recommendation,
      reportSummary: body.reportSummary,
      submittedAt: now,
      submittedByInspectorId: authSession.userId as any,
      submittedByInspectorName: authSession.name || 'Inspector',
      checklistItems: body.checklistItems,
      evidenceDocumentIds: body.evidenceDocumentIds,
      completedAt: now,
    });

    return NextResponse.json({
      success: true,
      inspection: {
        ...updated,
        id: updated?._id.toString(),
      },
    });
  } catch (error: any) {
    console.error('[API /api/inspections/[id] PATCH Error]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: error.statusCode || 500 }
    );
  }
}
