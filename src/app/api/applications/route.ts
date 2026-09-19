import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthSession } from '@/lib/auth-session';
import { connectToDatabase } from '@/lib/db/mongoose';
import { ApplicationModel } from '@/lib/models/application.model';
import { InspectionModel } from '@/lib/models/inspection.model';
import { ProjectModel } from '@/lib/models/project.model';
import { UserModel } from '@/lib/models/user.model';
import { ApplicationStatusHistoryModel } from '@/lib/models/application-status-history.model';

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const authSession = await verifyAuthSession(req);
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('projectId');

    let query: any = {};

    if (authSession) {
      const roleUpper = (authSession.role || '').toUpperCase();
      if (roleUpper === 'APPLICANT') {
        query.applicantUserId = authSession.userId;
      } else if (roleUpper === 'INSPECTOR') {
        query.assignedInspectorId = authSession.userId;
      } else if (roleUpper === 'OFFICER' || roleUpper === 'DEPARTMENT_OFFICER') {
        if (authSession.department) {
          const deptClean = authSession.department.toLowerCase();
          query.department = { $regex: deptClean, $options: 'i' };
        }
      }
    }

    if (projectId) {
      query.projectId = projectId;
    }

    const rawApplications = await ApplicationModel.find(query)
      .populate('projectId')
      .sort({ createdAt: -1 })
      .lean();

    const applications = rawApplications.map((app: any) => ({
      ...app,
      id: app._id.toString(),
      projectId: app.projectId ? app.projectId._id?.toString() || app.projectId.toString() : app.projectId,
      project: app.projectId,
    }));

    return NextResponse.json({ success: true, applications });
  } catch (error: any) {
    console.error('[API /api/applications GET Error]:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const authSession = await verifyAuthSession(req);
    const body = await req.json();

    const {
      projectId,
      approvalName,
      department,
      riskLevel = 'MEDIUM',
      slaDays = 30,
      requiresInspection = false,
    } = body;

    if (!projectId || !approvalName || !department) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    let userId = authSession ? authSession.userId : body.userId;

    if (!userId) {
      const demoApplicant = await UserModel.findOne({ role: 'APPLICANT' }).exec();
      userId = demoApplicant ? demoApplicant._id.toString() : undefined;
    }

    const applicationNumber = `APP-${department.substring(0, 4).toUpperCase()}-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
    const slaDueDate = new Date(Date.now() + slaDays * 86400000);

    const application = await ApplicationModel.create({
      applicationNumber,
      projectId,
      applicantUserId: userId,
      approvalName,
      department,
      status: requiresInspection ? 'INSPECTION_SCHEDULED' : 'SUBMITTED',
      riskLevel,
      slaDays,
      slaDueDate,
      requiresInspection,
      submissionDate: new Date(),
      submittedAt: new Date(),
      isDemoRecord: true,
    });

    await ApplicationStatusHistoryModel.create({
      applicationId: application._id,
      previousStatus: 'NOT_STARTED',
      newStatus: application.status,
      status: application.status,
      action: 'APPLICATION_SUBMITTED',
      performedByUserId: userId,
    });

    if (requiresInspection) {
      const scheduledDate = new Date(Date.now() + 3 * 86400000);
      const demoInspector = await UserModel.findOne({ role: 'INSPECTOR' }).exec();

      await InspectionModel.create({
        inspectionReference: `INSP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        applicationId: application._id,
        projectId,
        inspectorId: demoInspector ? demoInspector._id : undefined,
        assignedInspectorId: demoInspector ? demoInspector._id : undefined,
        scheduledDate,
        status: 'SCHEDULED',
        locationAddress: 'Chakan MIDC Phase II, Pune',
        department,
        isDemoRecord: true,
      });
    }

    return NextResponse.json({
      success: true,
      application: {
        ...application.toObject(),
        id: application._id.toString(),
      },
    });
  } catch (error: any) {
    console.error('[API /api/applications POST Error]:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
