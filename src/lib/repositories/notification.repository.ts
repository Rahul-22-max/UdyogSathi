if (typeof window !== 'undefined') {
  throw new Error('Server-only module');
}
import { connectToDatabase } from "@/lib/db/mongoose";
import { NotificationModel, INotification } from "@/lib/models/notification.model";

export async function findUserNotifications(recipientUserId: string): Promise<INotification[]> {
  await connectToDatabase();
  return NotificationModel.find({ recipientUserId })
    .sort({ createdAt: -1 })
    .lean<INotification[]>();
}

export async function createNotification(data: Partial<INotification>): Promise<INotification> {
  await connectToDatabase();
  const notif = new NotificationModel(data);
  const saved = await notif.save();
  return saved.toObject();
}

export async function markNotificationAsRead(id: string, recipientUserId: string): Promise<boolean> {
  await connectToDatabase();
  const res = await NotificationModel.updateOne(
    { _id: id, recipientUserId },
    { $set: { isRead: true, deliveryStatus: "read", readAt: new Date() } }
  );
  return res.modifiedCount > 0;
}
