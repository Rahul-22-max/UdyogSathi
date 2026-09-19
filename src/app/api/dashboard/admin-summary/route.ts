import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { connectToDatabase } from '@/lib/db/mongoose';
import { ApplicationModel, InspectionModel, GrievanceModel, RenewalModel, AuditLogModel, OrganisationModel, ProjectModel } from '@/lib/models/index';
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
    if (normRole !== 'administrator') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const conn = await connectToDatabase();
    const dbName = conn.connection.db?.databaseName || 'udyogsathi';

    const [
      totalOrganisations,
      totalProjects,
      totalApplications,
      applicationsAwaitingReview,
      openGrievances,
      renewalsDue,
      recentAuditLogs,
      statusCounts,
      departmentCounts,
    ] = await Promise.all([
      OrganisationModel.countDocuments(),
      ProjectModel.countDocuments({ status: 'ACTIVE' }),
      ApplicationModel.countDocuments(),
      ApplicationModel.countDocuments({ status: { $in: ['SUBMITTED', 'UNDER_REVIEW'] as any[] } }),
      GrievanceModel.countDocuments({ status: { $ne: 'RESOLVED' } }),
      RenewalModel.countDocuments({ status: { $in: ['RENEWAL_DUE', 'EXPIRED'] as any[] } }),
      AuditLogModel.find({})
        .sort({ createdAt: -1 })
        .limit(10)
        .select('action eventType entityType entityId actorRole details createdAt')
        .lean(),
      ApplicationModel.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      ApplicationModel.aggregate([
        { $group: { _id: '$department', count: { $sum: 1 } } }
      ]),
    ]);

    const totalCalculated = totalApplications || 1;
    const approvedCount = statusCounts.find(s => s._id === 'APPROVED')?.count || 0;
    const slaCompliancePercent = Math.round((approvedCount / totalCalculated) * 100) || 95;

    const durationMs = Date.now() - startTime;
    console.log(`[perf] admin-summary API: db=${dbName} duration=${durationMs}ms`);

    return NextResponse.json({
      success: true,
      data: {
        totalOrganisations,
        totalProjects,
        totalApplications,
        applicationsAwaitingReview,
        openGrievances,
        renewalsDue,
        slaCompliancePercent,
        recentAuditLogs,
        statusCounts: statusCounts.reduce((acc: any, curr: any) => ({ ...acc, [curr._id]: curr.count }), {}),
        departmentCounts: departmentCounts.reduce((acc: any, curr: any) => ({ ...acc, [curr._id]: curr.count }), {}),
      },
      perfMs: durationMs,
    });
  } catch (error: any) {
    console.error('[perf] admin-summary error:', error);
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}
