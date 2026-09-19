import mongoose, { Schema, Document, Model } from "mongoose";

export interface IOrganisation extends Document {
  name: string;
  legalEntityType: string;
  panNumber?: string;
  gstNumber?: string;
  address: string;
  district: string;
  taluka: string;
  state: string;
  pinCode: string;
  ownerUserId: mongoose.Types.ObjectId;
  isDemoRecord: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const organisationSchema = new Schema<IOrganisation>(
  {
    name: { type: String, required: true, index: true },
    legalEntityType: { type: String, required: true },
    panNumber: { type: String },
    gstNumber: { type: String },
    address: { type: String, required: true },
    district: { type: String, required: true, index: true },
    taluka: { type: String, required: true },
    state: { type: String, default: "Maharashtra" },
    pinCode: { type: String, required: true },
    ownerUserId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    isDemoRecord: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const OrganisationModel: Model<IOrganisation> =
  mongoose.models.Organisation || mongoose.model<IOrganisation>("Organisation", organisationSchema);
