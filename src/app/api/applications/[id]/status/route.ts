import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongoose';
import { updateApplicationStatus } from '@/lib/repositories/application.repository';
import { ApplicationModel } from '@/lib/models/application.model';
import { NotificationModel } from '@/lib/models/notification.model';
import { AuditLogModel } from '@/lib/models/audit-log.model';
import { verifyAuthSession } from '@/lib/auth-session';
import { assertApplicationAccess } from '@/lib/permissions/access-guards';
import { isValidObjectId } from '@/lib/utils/object-id';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    const { id } = params;

    if (!isValidObjectId(id)) {
      return NextResponse.json({ success: false, error: 'Invalid Application ID format' }, { status: 400 });
    }

    const authSession = await verifyAuthSession(req);
    if (!authSession) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const app = await ApplicationModel.findById(id);
    if (!app) {
      return NextResponse.json({ success: false, error: 'Application not found' }, { status: 404 });
    }

    assertApplicationAccess(authSession, app);

    const body = await req.json();
    const { status, remarks, rejectionReason } = body;

    if (!status) {
      return NextResponse.json({ success: false, error: 'Missing status field' }, { status: 400 });
    }

    const updatedApp = await updateApplicationStatus(id, status, authSession.userId, remarks || rejectionReason);

    // Create targeted notification for applicant
    await NotificationModel.create({
      recipientUserId: app.applicantUserId,
      type: `application_${status.toLowerCase()}`,
      priority: status === 'REJECTED' || status === 'APPROVED' ? 'high' : 'normal',
      title: `Application Status Updated to ${status}`,
      message: `Your application (${app.applicationNumber}) status was updated to ${status}. ${remarks || ''}`,
      route: `/applications/${app._id}`,
      deliveryStatus: 'delivered_in_app',
      isRead: false,
    });

    // Create Audit Log
    await AuditLogModel.create({
      userId: authSession.userId,
      actorUserId: authSession.userId,
      actorRole: authSession.role,
      action: `APPLICATION_STATUS_${status}`,
      eventType: 'status_transition',
      entityType: 'Application',
      entityId: id,
      details: `Status updated from ${app.status} to ${status}. Remarks: ${remarks || rejectionReason || 'N/A'}`,
    });

    return NextResponse.json({
      success: true,
      application: {
        ...updatedApp,
        id: updatedApp?._id.toString(),
      },
    });
  } catch (error: any) {
    console.error('[API /api/applications/[id]/status PATCH Error]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: error.statusCode || 500 }
    );
  }
}
