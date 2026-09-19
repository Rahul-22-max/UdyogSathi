import mongoose, { Schema, Document, Model } from "mongoose";

export interface INotification extends Document {
  recipientUserId: mongoose.Types.ObjectId;
  recipientEmail?: string;
  recipientRole?: string;
  recipientOrganisationId?: mongoose.Types.ObjectId;
  type: string;
  priority: "high" | "normal" | "low";
  title: string;
  message: string;
  category?: string;
  link?: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
  relatedApplicationId?: string;
  route: string;
  deliveryStatus: "created" | "delivered_in_app" | "read" | "failed";
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    recipientUserId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    recipientEmail: { type: String },
    recipientRole: { type: String },
    recipientOrganisationId: { type: Schema.Types.ObjectId, ref: "Organisation" },
    type: { type: String, default: "welcome" },
    priority: { type: String, enum: ["high", "normal", "low"], default: "normal" },
    title: { type: String, required: true },
    message: { type: String, required: true },
    category: { type: String, default: "GENERAL" },
    link: { type: String },
    relatedEntityType: { type: String },
    relatedEntityId: { type: String },
    relatedApplicationId: { type: String },
    route: { type: String, default: "/" },
    deliveryStatus: {
      type: String,
      enum: ["created", "delivered_in_app", "read", "failed"],
      default: "delivered_in_app",
    },
    isRead: { type: Boolean, default: false, index: true },
    readAt: { type: Date },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

notificationSchema.index({ recipientUserId: 1, isRead: 1 });
notificationSchema.index({ recipientUserId: 1, createdAt: -1 });

export const NotificationModel: Model<INotification> =
  mongoose.models.Notification || mongoose.model<INotification>("Notification", notificationSchema);
