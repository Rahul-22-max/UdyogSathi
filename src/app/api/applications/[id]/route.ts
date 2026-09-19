import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongoose';
import { ApplicationModel } from '@/lib/models/application.model';
import { InspectionModel } from '@/lib/models/inspection.model';
import { ApplicationStatusHistoryModel } from '@/lib/models/application-status-history.model';
import { verifyAuthSession } from '@/lib/auth-session';
import { assertApplicationAccess } from '@/lib/permissions/access-guards';
import { isValidObjectId } from '@/lib/utils/object-id';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    const { id } = params;

    let query: any = {};
    if (isValidObjectId(id)) {
      query._id = id;
    } else {
      query.applicationNumber = id;
    }

    const application = await ApplicationModel.findOne(query)
      .populate('projectId')
      .lean();

    if (!application) {
      return NextResponse.json({ success: false, error: 'Application not found' }, { status: 404 });
    }

    const authSession = await verifyAuthSession(req);
    if (authSession) {
      try {
        assertApplicationAccess(authSession, application);
      } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: err.statusCode || 403 });
      }
    }

    const inspections = await InspectionModel.find({ applicationId: application._id }).lean();
    const history = await ApplicationStatusHistoryModel.find({ applicationId: application._id }).sort({ createdAt: -1 }).lean();

    return NextResponse.json({
      success: true,
      application: {
        ...application,
        id: application._id.toString(),
        projectId: application.projectId ? (application.projectId as any)._id?.toString() || application.projectId.toString() : application.projectId,
        project: application.projectId,
        inspections: inspections.map((i: any) => ({ ...i, id: i._id.toString() })),
        history: history.map((h: any) => ({ ...h, id: h._id.toString() })),
      },
    });
  } catch (error: any) {
    console.error('[API /api/applications/[id] GET Error]:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
