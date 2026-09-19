import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAuditLog extends Document {
  userId?: mongoose.Types.ObjectId;
  actorUserId?: string;
  actorRole?: string;
  action: string;
  eventType?: string;
  entityType: string;
  entityId?: string;
  details?: string;
  description?: string;
  ipAddress?: string;
  metadata?: any;
  createdAt: Date;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    actorUserId: { type: String },
    actorRole: { type: String },
    action: { type: String, required: true },
    eventType: { type: String },
    entityType: { type: String, required: true },
    entityId: { type: String },
    details: { type: String },
    description: { type: String },
    ipAddress: { type: String, default: "127.0.0.1" },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

auditLogSchema.index({ entityType: 1, entityId: 1 });
auditLogSchema.index({ createdAt: -1 });

export const AuditLogModel: Model<IAuditLog> =
  mongoose.models.AuditLog || mongoose.model<IAuditLog>("AuditLog", auditLogSchema);
