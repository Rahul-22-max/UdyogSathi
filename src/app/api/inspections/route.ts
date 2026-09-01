import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuthSession } from '@/lib/auth-session';

export async function GET(req: NextRequest) {
  try {
    const authSession = await verifyAuthSession(req);
    let whereClause: any = {};

    if (authSession) {
      if (authSession.role === 'INSPECTOR') {
        whereClause.inspectorId = authSession.userId;
      }
    }

    const inspections = await prisma.inspection.findMany({
      where: whereClause,
      include: {
        application: true,
        project: true,
        items: true,
      },
      orderBy: { scheduledDate: 'asc' },
    });

    return NextResponse.json({ success: true, inspections });
  } catch (error: any) {
    console.error('[API /api/inspections GET Error]:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { inspectionId, recommendation, reportSummary, status = 'COMPLETED' } = body;

    if (!inspectionId) {
      return NextResponse.json({ success: false, error: 'Missing inspectionId' }, { status: 400 });
    }

    const inspection = await prisma.inspection.update({
      where: { id: inspectionId },
      data: {
        status,
        recommendation,
        reportSummary,
        completedAt: new Date(),
      },
    });

    // Update associated application
    let newAppStatus = 'INSPECTION_COMPLETED';
    if (recommendation === 'RECOMMEND_APPROVAL' || recommendation === 'APPROVED') {
      newAppStatus = 'APPROVED';
    } else if (recommendation === 'RECOMMEND_REJECTION' || recommendation === 'REJECTED') {
      newAppStatus = 'REJECTED';
    }

    await prisma.application.update({
      where: { id: inspection.applicationId },
      data: {
        status: newAppStatus,
      },
    });

    return NextResponse.json({ success: true, inspection });
  } catch (error: any) {
    console.error('[API /api/inspections POST Error]:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
