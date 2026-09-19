import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { connectToDatabase } from '@/lib/db/mongoose';
import { InspectionModel } from '@/lib/models/index';
import { UserSession } from '@/types';
import { normalizeRole } from '@/lib/rbac';
import { getInspectorIdentityKeys } from '@/lib/permissions/inspector-identity';
import { reconcileInspectorAssignments } from '@/lib/db/seed-helper';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

function getSessionUser(): UserSession | null {
  try {
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get('udyogsathi_session');
    if (!sessionCookie || !sessionCookie.value) return null;
    return JSON.parse(sessionCookie.value);
  } catch {
    return null;
  }
}

export async function GET() {
  const startTime = Date.now();
  try {
    const user = getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const normRole = normalizeRole(user.role);
    if (normRole !== 'inspector' && normRole !== 'administrator') {
      return NextResponse.json({ error: 'Forbidden: Inspector access required' }, { status: 403 });
    }

    await connectToDatabase();
    await reconcileInspectorAssignments();

    const identityKeys = getInspectorIdentityKeys(user);
    const objectIds = identityKeys
      .filter((k) => mongoose.Types.ObjectId.isValid(k))
      .map((k) => new mongoose.Types.ObjectId(k));

    const filter = {
      $or: [
        { assignedInspectorId: { $in: [...objectIds, ...identityKeys] } },
        { inspectorId: { $in: [...objectIds, ...identityKeys] } },
      ],
    };

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const [
      assignedInspections,
      scheduledToday,
      upcomingInspections,
      inProgressInspections,
      reportsAwaitingSubmission,
      completedThisMonth,
      highRiskInspections,
      activeInspections,
      cancelledInspections,
    ] = await Promise.all([
      InspectionModel.countDocuments(filter),
      InspectionModel.countDocuments({ ...filter, scheduledDate: { $gte: startOfToday, $lte: endOfToday } }),
      InspectionModel.countDocuments({ ...filter, scheduledDate: { $gt: endOfToday } }),
      InspectionModel.countDocuments({ ...filter, status: 'IN_PROGRESS' }),
      InspectionModel.countDocuments({ ...filter, status: 'SCHEDULED' }),
      InspectionModel.countDocuments({ ...filter, status: 'COMPLETED' }),
      InspectionModel.countDocuments({ ...filter, riskLevel: 'HIGH' }),
      InspectionModel.find({ ...filter, status: { $ne: 'CANCELLED' } })
        .select('inspectionReference applicationId projectId organisationId department status scheduledDate slotTime locationAddress riskLevel instructions unitName title venue')
        .populate('projectId', 'name')
        .sort({ scheduledDate: 1 })
        .limit(10)
        .lean(),
      InspectionModel.find({ ...filter, status: 'CANCELLED' })
        .select('inspectionReference applicationId projectId organisationId department status scheduledDate locationAddress cancellationReason unitName title venue inspectorName')
        .sort({ cancelledAt: -1 })
        .limit(10)
        .lean(),
    ]);

    const durationMs = Date.now() - startTime;
    console.log(`[perf] inspector-summary API: user=${user.email} duration=${durationMs}ms`);

    return NextResponse.json({
      success: true,
      data: {
        assignedInspections,
        scheduledToday,
        upcomingInspections,
        inProgressInspections,
        reportsAwaitingSubmission,
        completedThisMonth,
        highRiskInspections,
        activeInspections,
        cancelledInspections,
      },
      perfMs: durationMs,
    });
  } catch (error: any) {
    console.error('[perf] inspector-summary error:', error);
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}
