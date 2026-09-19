import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthSession } from '@/lib/auth-session';
import { connectToDatabase } from '@/lib/db/mongoose';
import { NotificationModel } from '@/lib/models/notification.model';
import { UserModel } from '@/lib/models/user.model';

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const authSession = await verifyAuthSession(req);

    let userId = authSession ? authSession.userId : null;
    if (!userId) {
      const demoUser = await UserModel.findOne({ role: 'APPLICANT' }).exec();
      userId = demoUser ? demoUser._id.toString() : null;
    }

    if (!userId) {
      return NextResponse.json({ success: true, notifications: [] });
    }

    const rawNotifs = await NotificationModel.find({ recipientUserId: userId })
      .sort({ createdAt: -1 })
      .lean();

    const notifications = rawNotifs.map((n: any) => ({
      ...n,
      id: n._id.toString(),
      recipientUserId: n.recipientUserId?.toString(),
    }));

    return NextResponse.json({ success: true, notifications });
  } catch (error: any) {
    console.error('[API /api/notifications GET Error]:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await connectToDatabase();
    const authSession = await verifyAuthSession(req);
    const body = await req.json();
    const { notificationId } = body;

    if (!notificationId) {
      return NextResponse.json({ success: false, error: 'Missing notificationId' }, { status: 400 });
    }

    let userId = authSession ? authSession.userId : null;

    const notif = await NotificationModel.findOneAndUpdate(
      { _id: notificationId, ...(userId ? { recipientUserId: userId } : {}) },
      { $set: { isRead: true, deliveryStatus: 'read', readAt: new Date() } },
      { new: true }
    );

    return NextResponse.json({ success: true, notification: notif });
  } catch (error: any) {
    console.error('[API /api/notifications PATCH Error]:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
