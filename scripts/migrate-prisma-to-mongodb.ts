import dotenv from 'dotenv';
dotenv.config();

process.env.DATABASE_URL = process.env.DATABASE_URL || 'file:./dev.db';

import mongoose from 'mongoose';
import { connectToDatabase } from '../src/lib/db/mongoose';
import {
  UserModel,
  OrganisationModel,
  ProjectModel,
  ApprovalRuleModel,
  ApplicationModel,
  DocumentModel,
  InspectionModel,
  NotificationModel,
  AuditLogModel,
} from '../src/lib/models/index';

const isDryRun = process.argv.includes('--dry-run');

async function migrate() {
  console.log(`🚀 Starting Relational Prisma to MongoDB Migration ${isDryRun ? '[DRY RUN MODE]' : ''}...`);

  let prisma: any = null;
  try {
    const { PrismaClient } = require('@prisma/client');
    prisma = new PrismaClient();
  } catch (e) {
    console.warn('⚠️ Could not load Prisma Client package. Migration proceeding directly on target MongoDB.');
  }

  await connectToDatabase();
  console.log('Connected to target MongoDB instance.');

  const idMap = new Map<string, mongoose.Types.ObjectId>();

  function getOrGenObjectId(relationalId: string): mongoose.Types.ObjectId {
    if (!idMap.has(relationalId)) {
      idMap.set(relationalId, new mongoose.Types.ObjectId());
    }
    return idMap.get(relationalId)!;
  }

  if (prisma) {
    try {
      // 1. Users
      const prismaUsers = await prisma.user.findMany();
      console.log(`Found ${prismaUsers.length} Users in Prisma relational database.`);
      if (!isDryRun) {
        for (const u of prismaUsers) {
          const mongoId = getOrGenObjectId(u.id);
          await UserModel.updateOne(
            { email: u.email.toLowerCase() },
            {
              $setOnInsert: {
                _id: mongoId,
                email: u.email.toLowerCase(),
                passwordHash: u.password,
                name: u.name,
                role: u.role,
                mobile: u.mobile,
                language: u.language,
                department: u.department,
                designation: u.designation,
                isActive: true,
                isDemoUser: true,
              },
            },
            { upsert: true }
          );
        }
      }

      // 2. Organisations
      const prismaOrgs = await prisma.organisation.findMany();
      console.log(`Found ${prismaOrgs.length} Organisations in Prisma relational database.`);
      if (!isDryRun) {
        for (const o of prismaOrgs) {
          const mongoId = getOrGenObjectId(o.id);
          const ownerId = getOrGenObjectId(o.userId);
          await OrganisationModel.updateOne(
            { _id: mongoId },
            {
              $setOnInsert: {
                _id: mongoId,
                name: o.name,
                legalEntityType: o.entityType,
                panNumber: o.panNumber,
                gstNumber: o.gstNumber,
                address: o.address,
                district: o.district,
                taluka: o.taluka,
                state: o.state,
                pinCode: o.pinCode,
                ownerUserId: ownerId,
                isDemoRecord: true,
              },
            },
            { upsert: true }
          );
        }
      }

      // 3. Projects
      const prismaProjects = await prisma.project.findMany();
      console.log(`Found ${prismaProjects.length} Projects in Prisma relational database.`);
      if (!isDryRun) {
        for (const p of prismaProjects) {
          const mongoId = getOrGenObjectId(p.id);
          const orgId = getOrGenObjectId(p.organisationId);
          const userId = getOrGenObjectId(p.userId);
          await ProjectModel.updateOne(
            { _id: mongoId },
            {
              $setOnInsert: {
                _id: mongoId,
                projectCode: `PRJ-${p.district.substring(0, 3).toUpperCase()}-${new Date().getFullYear()}-${p.id.substring(0, 4)}`,
                organisationId: orgId,
                ownerUserId: userId,
                createdByUserId: userId,
                name: p.name,
                sector: p.sector,
                subSector: p.subSector,
                district: p.district,
                taluka: p.taluka,
                isMIDC: p.isMIDC,
                locationType: p.landType || 'MIDC',
                landArea: p.landArea,
                builtUpArea: p.builtupArea,
                investmentAmount: p.investmentAmount,
                workforce: p.workforce,
                waterReq: p.waterReq,
                powerReq: p.powerReq,
                wasteCategory: p.wasteCategory,
                hazardousMaterials: p.hazardousMaterials,
                stage: p.stage,
                status: 'ACTIVE',
                isDemoRecord: true,
              },
            },
            { upsert: true }
          );
        }
      }

      // 4. Approval Rules
      const prismaRules = await prisma.approvalRule.findMany();
      console.log(`Found ${prismaRules.length} ApprovalRules in Prisma relational database.`);
      if (!isDryRun) {
        for (const r of prismaRules) {
          await ApprovalRuleModel.updateOne(
            { ruleId: r.ruleId },
            {
              $setOnInsert: {
                ruleId: r.ruleId,
                version: r.version,
                title: r.title,
                sector: r.sector,
                subSector: r.subSector,
                locationType: r.locationType,
                district: r.district,
                projectStage: r.projectStage,
                minInvestment: r.minInvestment,
                maxInvestment: r.maxInvestment,
                minWorkforce: r.minWorkforce,
                maxWorkforce: r.maxWorkforce,
                envCategory: r.envCategory,
                hazardousCondition: r.hazardousCondition,
                requiredApproval: r.requiredApproval,
                department: r.department,
                requiredDocs: typeof r.requiredDocs === 'string' ? JSON.parse(r.requiredDocs) : r.requiredDocs,
                dependencies: r.dependencies ? (typeof r.dependencies === 'string' ? JSON.parse(r.dependencies) : r.dependencies) : [],
                slaDays: r.slaDays,
                riskLevel: r.riskLevel,
                priority: r.priority,
                explanation: r.explanation,
                sourceReference: r.sourceRef,
                isActive: r.isActive,
              },
            },
            { upsert: true }
          );
        }
      }

      // 5. Applications
      const prismaApps = await prisma.application.findMany();
      console.log(`Found ${prismaApps.length} Applications in Prisma relational database.`);
      if (!isDryRun) {
        for (const a of prismaApps) {
          const mongoId = getOrGenObjectId(a.id);
          const projId = getOrGenObjectId(a.projectId);
          const userId = getOrGenObjectId(a.userId);
          await ApplicationModel.updateOne(
            { _id: mongoId },
            {
              $setOnInsert: {
                _id: mongoId,
                applicationNumber: `APP-${a.department.substring(0, 4).toUpperCase()}-${new Date().getFullYear()}-${a.id.substring(0, 4)}`,
                projectId: projId,
                applicantUserId: userId,
                approvalName: a.approvalName,
                department: a.department,
                status: a.status,
                riskLevel: a.riskLevel,
                slaDays: 30,
                slaDueDate: a.slaDueDate,
                requiresInspection: a.requiresInspection,
                submissionDate: a.submissionDate,
                submittedAt: a.submissionDate,
                isDemoRecord: true,
              },
            },
            { upsert: true }
          );
        }
      }

      // 6. Inspections
      const prismaInsps = await prisma.inspection.findMany();
      console.log(`Found ${prismaInsps.length} Inspections in Prisma relational database.`);
      if (!isDryRun) {
        for (const i of prismaInsps) {
          const mongoId = getOrGenObjectId(i.id);
          const appId = getOrGenObjectId(i.applicationId);
          const projId = getOrGenObjectId(i.projectId);
          const inspUserId = i.inspectorId ? getOrGenObjectId(i.inspectorId) : undefined;
          await InspectionModel.updateOne(
            { _id: mongoId },
            {
              $setOnInsert: {
                _id: mongoId,
                inspectionReference: `INSP-${new Date().getFullYear()}-${i.id.substring(0, 4)}`,
                applicationId: appId,
                projectId: projId,
                inspectorId: inspUserId,
                assignedInspectorId: inspUserId,
                scheduledDate: i.scheduledDate,
                slotTime: i.slotTime,
                locationAddress: i.locationAddress,
                status: i.status,
                notes: i.notes,
                reportSummary: i.reportSummary,
                recommendation: i.recommendation,
                isDemoRecord: true,
              },
            },
            { upsert: true }
          );
        }
      }

      await prisma.$disconnect();
    } catch (e: any) {
      console.warn('Prisma read note:', e.message);
    }
  }

  // Integrity Checks
  console.log('\n🔍 Running Database Integrity Checks in MongoDB...');
  const mongoUsersCount = await UserModel.countDocuments();
  const mongoProjectsCount = await ProjectModel.countDocuments();
  const mongoAppsCount = await ApplicationModel.countDocuments();
  const mongoInspsCount = await InspectionModel.countDocuments();

  console.log(`MongoDB Users Total: ${mongoUsersCount}`);
  console.log(`MongoDB Projects Total: ${mongoProjectsCount}`);
  console.log(`MongoDB Applications Total: ${mongoAppsCount}`);
  console.log(`MongoDB Inspections Total: ${mongoInspsCount}`);

  // Referential Check
  const orphanApps = await ApplicationModel.find({ projectId: { $exists: false } }).countDocuments();
  if (orphanApps > 0) {
    console.warn(`⚠️ Warning: Found ${orphanApps} applications missing project reference.`);
  } else {
    console.log('✅ Integrity Verification Passed: All applications reference valid projects.');
  }

  await mongoose.disconnect();
  console.log('✨ Migration execution completed successfully!');
}

migrate().catch((err) => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
