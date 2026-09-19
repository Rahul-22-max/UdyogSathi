import mongoose, { Schema, Document, Model } from "mongoose";

export interface IOrganisationMember extends Document {
  organisationId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  membershipRole: "OWNER" | "AUTHORISED_REPRESENTATIVE" | "VIEWER";
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const organisationMemberSchema = new Schema<IOrganisationMember>(
  {
    organisationId: { type: Schema.Types.ObjectId, ref: "Organisation", required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    membershipRole: {
      type: String,
      enum: ["OWNER", "AUTHORISED_REPRESENTATIVE", "VIEWER"],
      default: "OWNER",
    },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

organisationMemberSchema.index({ organisationId: 1, userId: 1 }, { unique: true });

export const OrganisationMemberModel: Model<IOrganisationMember> =
  mongoose.models.OrganisationMember ||
  mongoose.model<IOrganisationMember>("OrganisationMember", organisationMemberSchema);
