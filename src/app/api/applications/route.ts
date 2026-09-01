import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuthSession } from '@/lib/auth-session';

export async function GET(req: NextRequest) {
  try {
    const authSession = await verifyAuthSession(req);
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('projectId');

    let whereClause: any = {};

    if (authSession) {
      if (authSession.role === 'APPLICANT') {
        whereClause.userId = authSession.userId;
      } else if (authSession.role === 'INSPECTOR') {
        whereClause.assignedInspectorId = authSession.userId;
      }
    }

    if (projectId) {
      whereClause.projectId = projectId;
    }

    const applications = await prisma.application.findMany({
      where: whereClause,
      include: {
        project: true,
        inspections: true,
        history: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, applications });
  } catch (error: any) {
    console.error('[API /api/applications GET Error]:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
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

    const userId = authSession ? authSession.userId : body.userId || 'usr-applicant-1';
    const slaDueDate = new Date(Date.now() + slaDays * 86400000);

    const application = await prisma.application.create({
      data: {
        projectId,
        userId,
        approvalName,
        department,
        status: requiresInspection ? 'INSPECTION_SCHEDULED' : 'SUBMITTED',
        riskLevel,
        slaDueDate,
        requiresInspection,
        submissionDate: new Date(),
      },
    });

    if (requiresInspection) {
      const scheduledDate = new Date(Date.now() + 3 * 86400000);
      await prisma.inspection.create({
        data: {
          applicationId: application.id,
          projectId,
          inspectorId: 'usr-inspector-1',
          scheduledDate,
          status: 'SCHEDULED',
          locationAddress: 'Chakan MIDC Phase II, Pune',
        },
      });
    }

    return NextResponse.json({ success: true, application });
  } catch (error: any) {
    console.error('[API /api/applications POST Error]:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
