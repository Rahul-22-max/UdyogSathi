import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { connectToDatabase } from '@/lib/db/mongoose';
import { ApplicationModel, ProjectModel, DocumentModel, GrievanceModel, RenewalModel, InspectionModel } from '@/lib/models/index';
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
    if (normRole !== 'applicant' && normRole !== 'administrator') {
      return NextResponse.json({ error: 'Forbidden: Applicant access required' }, { status: 403 });
    }

    await connectToDatabase();

    const userFilter = { applicantUserId: user.id };

    const [
      projects,
      totalApplications,
      approvedCount,
      pendingCount,
      queryCount,
      inspectionCount,
      returnedCount,
      readyForSubmissionCount,
      recentApplications,
    ] = await Promise.all([
      ProjectModel.find({ ownerUserId: user.id })
        .select('projectCode name sector locationType plotNumber investmentAmount stage status')
        .lean(),
      ApplicationModel.countDocuments(userFilter),
      ApplicationModel.countDocuments({ ...userFilter, status: 'APPROVED' }),
      ApplicationModel.countDocuments({ ...userFilter, status: { $nin: ['APPROVED', 'REJECTED'] } }),
      ApplicationModel.countDocuments({ ...userFilter, status: 'QUERY_RAISED' }),
      ApplicationModel.countDocuments({ ...userFilter, status: 'INSPECTION_SCHEDULED' }),
      ApplicationModel.countDocuments({ ...userFilter, status: 'RETURNED_FOR_CORRECTION' }),
      ApplicationModel.countDocuments({ ...userFilter, status: 'READY_FOR_SUBMISSION' }),
      ApplicationModel.find(userFilter)
        .select('applicationNumber approvalName department status riskLevel slaDays submittedAt expectedDecisionDate projectId')
        .populate('projectId', 'name')
        .sort({ submittedAt: -1 })
        .limit(10)
        .lean(),
    ]);

    const durationMs = Date.now() - startTime;
    console.log(`[perf] applicant-summary API: user=${user.email} duration=${durationMs}ms`);

    return NextResponse.json({
      success: true,
      data: {
        projects,
        totalApplications,
        approvedCount,
        pendingCount,
        queryCount,
        inspectionCount,
        returnedCount,
        readyForSubmissionCount,
        recentApplications,
      },
      perfMs: durationMs,
    });
  } catch (error: any) {
    console.error('[perf] applicant-summary error:', error);
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}
