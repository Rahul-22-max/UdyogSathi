import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { connectToDatabase } from '@/lib/db/mongoose';
import { ApplicationModel, InspectionModel, GrievanceModel } from '@/lib/models/index';
import { UserSession } from '@/types';
import { normalizeRole } from '@/lib/rbac';

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
    if (normRole !== 'department_officer' && normRole !== 'administrator') {
      return NextResponse.json({ error: 'Forbidden: Officer access required' }, { status: 403 });
    }

    await connectToDatabase();

    const officerDepartment = user.department || 'Maharashtra Pollution Control Board (MPCB)';

    const deptRegex = new RegExp(officerDepartment.split(' ')[0] || officerDepartment, 'i');
    const filter = {
      $or: [
        { department: { $regex: deptRegex } },
        { assignedOfficerId: user.id },
      ],
    };

    const [
      pendingReview,
      underReview,
      queriesAwaitingResponse,
      inspectionsAwaitingAssignment,
      inspectionsScheduled,
      approvedCount,
      rejectedCount,
      openGrievances,
      recentApplications,
    ] = await Promise.all([
      ApplicationModel.countDocuments({ ...filter, status: 'SUBMITTED' }),
      ApplicationModel.countDocuments({ ...filter, status: 'UNDER_REVIEW' }),
      ApplicationModel.countDocuments({ ...filter, status: 'QUERY_RAISED' }),
      ApplicationModel.countDocuments({ ...filter, status: 'INSPECTION_REQUIRED', assignedInspectorId: { $exists: false } }),
      ApplicationModel.countDocuments({ ...filter, status: 'INSPECTION_SCHEDULED' }),
      ApplicationModel.countDocuments({ ...filter, status: 'APPROVED' }),
      ApplicationModel.countDocuments({ ...filter, status: 'REJECTED' }),
      GrievanceModel.countDocuments({ status: { $ne: 'RESOLVED' } }),
      ApplicationModel.find(filter)
        .select('applicationNumber approvalName status riskLevel slaDays submittedAt expectedDecisionDate projectId organisationId applicantUserId')
        .populate('projectId', 'name district')
        .populate('organisationId', 'name')
        .sort({ submittedAt: -1 })
        .limit(10)
        .lean(),
    ]);

    const durationMs = Date.now() - startTime;
    console.log(`[perf] officer-summary API: dept=${officerDepartment} duration=${durationMs}ms`);

    return NextResponse.json({
      success: true,
      data: {
        department: officerDepartment,
        pendingReview,
        underReview,
        queriesAwaitingResponse,
        inspectionsAwaitingAssignment,
        inspectionsScheduled,
        approvedCount,
        rejectedCount,
        openGrievances,
        recentApplications,
      },
      perfMs: durationMs,
    });
  } catch (error: any) {
    console.error('[perf] officer-summary error:', error);
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}
