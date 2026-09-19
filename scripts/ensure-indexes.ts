import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { connectToDatabase } from '../src/lib/db/mongoose';
import {
  UserModel,
  OrganisationModel,
  OrganisationMemberModel,
  DepartmentModel,
  ProjectModel,
  ApprovalRuleModel,
  ApprovalRoadmapModel,
  ApplicationModel,
  ApplicationStatusHistoryModel,
  DocumentModel,
  ApplicationDocumentModel,
  DocumentVerificationModel,
  QueryModel,
  QueryResponseModel,
  InspectionModel,
  InspectionChecklistItemModel,
  SchemeModel,
  SchemeMatchModel,
  ComplianceEventModel,
  RenewalModel,
  GrievanceModel,
  GrievanceMessageModel,
  NotificationModel,
  AuditLogModel,
  KnowledgeBaseArticleModel,
  TranslationKeyModel,
} from '../src/lib/models/index';

async function ensureAllIndexes() {
  console.log('🔍 Starting Mongoose Collection Index Synchronization...');
  await connectToDatabase();

  const models = [
    { name: 'User', model: UserModel },
    { name: 'Organisation', model: OrganisationModel },
    { name: 'OrganisationMember', model: OrganisationMemberModel },
    { name: 'Department', model: DepartmentModel },
    { name: 'Project', model: ProjectModel },
    { name: 'ApprovalRule', model: ApprovalRuleModel },
    { name: 'ApprovalRoadmap', model: ApprovalRoadmapModel },
    { name: 'Application', model: ApplicationModel },
    { name: 'ApplicationStatusHistory', model: ApplicationStatusHistoryModel },
    { name: 'Document', model: DocumentModel },
    { name: 'ApplicationDocument', model: ApplicationDocumentModel },
    { name: 'DocumentVerification', model: DocumentVerificationModel },
    { name: 'Query', model: QueryModel },
    { name: 'QueryResponse', model: QueryResponseModel },
    { name: 'Inspection', model: InspectionModel },
    { name: 'InspectionChecklistItem', model: InspectionChecklistItemModel },
    { name: 'Scheme', model: SchemeModel },
    { name: 'SchemeMatch', model: SchemeMatchModel },
    { name: 'ComplianceEvent', model: ComplianceEventModel },
    { name: 'Renewal', model: RenewalModel },
    { name: 'Grievance', model: GrievanceModel },
    { name: 'GrievanceMessage', model: GrievanceMessageModel },
    { name: 'Notification', model: NotificationModel },
    { name: 'AuditLog', model: AuditLogModel },
    { name: 'KnowledgeBaseArticle', model: KnowledgeBaseArticleModel },
    { name: 'TranslationKey', model: TranslationKeyModel },
  ];

  for (const item of models) {
    try {
      await item.model.ensureIndexes();
      const indexes = await item.model.collection.indexes();
      console.log(`✅ [${item.name}] Indexes synced successfully:`, indexes.map((idx) => idx.name || Object.keys(idx.key).join('_')));
    } catch (err: any) {
      console.warn(`⚠️ [${item.name}] Index sync warning:`, err.message);
    }
  }

  console.log('\n✨ All Mongoose indexes verified and synchronized successfully!');
  await mongoose.disconnect();
}

ensureAllIndexes().catch((err) => {
  console.error('❌ Index synchronization failed:', err);
  process.exit(1);
});
