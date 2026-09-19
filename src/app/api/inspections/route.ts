import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthSession } from '@/lib/auth-session';
import { connectToDatabase } from '@/lib/db/mongoose';
import { InspectionModel } from '@/lib/models/inspection.model';
import { ApplicationModel } from '@/lib/models/application.model';
import { getInspectorIdentityKeys } from '@/lib/permissions/inspector-identity';
import mongoose from 'mongoose';

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const authSession = await verifyAuthSession(req);
    let query: any = {};

    if (authSession) {
      const roleUpper = (authSession.role || '').toUpperCase();
      if (roleUpper === 'INSPECTOR') {
        const identityKeys = getInspectorIdentityKeys(authSession);
        const objectIds = identityKeys
          .filter((k) => mongoose.Types.ObjectId.isValid(k))
          .map((k) => new mongoose.Types.ObjectId(k));

        query.$or = [
          { assignedInspectorId: { $in: [...objectIds, ...identityKeys] } },
          { inspectorId: { $in: [...objectIds, ...identityKeys] } },
        ];
      }
    }

    const rawInspections = await InspectionModel.find(query)
      .populate('applicationId')
      .populate('projectId')
      .sort({ scheduledDate: 1 })
      .lean();

    const inspections = rawInspections.map((insp: any) => ({
      ...insp,
      id: insp._id.toString(),
      applicationId: insp.applicationId?._id?.toString() || insp.applicationId?.toString(),
      projectId: insp.projectId?._id?.toString() || insp.projectId?.toString(),
      application: insp.applicationId,
      project: insp.projectId,
    }));

    return NextResponse.json({ success: true, inspections });
  } catch (error: any) {
    console.error('[API /api/inspections GET Error]:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { inspectionId, inspectionResult, recommendation, reportSummary, status = 'COMPLETED' } = body;

    if (!inspectionId) {
      return NextResponse.json({ success: false, error: 'Missing inspectionId' }, { status: 400 });
    }

    const authSession = await verifyAuthSession(req);
    const now = new Date();

    const inspection = await InspectionModel.findByIdAndUpdate(
      inspectionId,
      {
        $set: {
          status,
          inspectionResult,
          recommendation,
          reportSummary,
          submittedAt: now,
          submittedByInspectorId: authSession?.userId as any,
          submittedByInspectorName: authSession?.name || 'Inspector',
          completedAt: now,
        },
      },
      { new: true }
    );

    if (!inspection) {
      return NextResponse.json({ success: false, error: 'Inspection not found' }, { status: 404 });
    }

    // Update associated application to INSPECTION_COMPLETED
    const newAppStatus = 'INSPECTION_COMPLETED';

    await ApplicationModel.findByIdAndUpdate(inspection.applicationId, {
      $set: { status: newAppStatus, inspectionStatus: 'COMPLETED' },
    });

    return NextResponse.json({
      success: true,
      inspection: {
        ...inspection.toObject(),
        id: inspection._id.toString(),
      },
    });
  } catch (error: any) {
    console.error('[API /api/inspections POST Error]:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
