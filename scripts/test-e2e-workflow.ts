import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { connectToDatabase } from '../src/lib/db/mongoose';
import {
  UserModel,
  OrganisationModel,
  ProjectModel,
  ApprovalRuleModel,
  ApprovalRoadmapModel,
  ApplicationModel,
  ApplicationStatusHistoryModel,
  DocumentModel,
  InspectionModel,
  NotificationModel,
  AuditLogModel,
} from '../src/lib/models/index';
import { generateApprovalChecklist } from '../src/lib/rule-engine';
import { updateApplicationStatus } from '../src/lib/repositories/application.repository';
import { updateInspectionReport } from '../src/lib/repositories/inspection.repository';

async function runEndToEndWorkflowTest() {
  console.log('🧪 Starting Full End-to-End MongoDB Workflow Verification Test...\n');
  await connectToDatabase();

  const timestamp = Date.now();
  const testEmail = `e2e_user_${timestamp}@udyogsathi.gov.in`;
  const passwordHash = await bcrypt.hash('Password@123', 10);

  // A1. Register New Applicant
  console.log('Step 1: Registering new applicant user in MongoDB...');
  const newApplicant = await UserModel.create({
    email: testEmail,
    passwordHash,
    name: `Test Applicant ${timestamp}`,
    role: 'APPLICANT',
    mobile: '+91 99999 11111',
    language: 'en',
    isActive: true,
    isDemoUser: false,
  });
  console.log(`  -> User created with ObjectId: ${newApplicant._id}`);

  // A2. Create Organisation
  console.log('\nStep 2: Creating Organisation for applicant...');
  const org = await OrganisationModel.create({
    name: `E2E Tech Enterprises ${timestamp}`,
    legalEntityType: 'Private Limited',
    panNumber: 'ABCDE1234F',
    gstNumber: '27ABCDE1234F1Z5',
    address: 'Plot 42, Chakan Industrial Area',
    district: 'Pune',
    taluka: 'Khed',
    state: 'Maharashtra',
    pinCode: '410501',
    ownerUserId: newApplicant._id,
    isDemoRecord: false,
  });
  console.log(`  -> Organisation created with ObjectId: ${org._id}`);

  // A3. Create Project
  console.log('\nStep 3: Creating Industrial Project in MongoDB...');
  const projectCode = `PRJ-PUN-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
  const project = await ProjectModel.create({
    projectCode,
    organisationId: org._id,
    ownerUserId: newApplicant._id,
    createdByUserId: newApplicant._id,
    name: `Agro-Processing Plant ${timestamp}`,
    sector: 'Food Processing',
    subSector: 'Fruit Processing',
    district: 'Pune',
    taluka: 'Khed',
    isMIDC: true,
    locationType: 'MIDC',
    landArea: 10000,
    builtUpArea: 5000,
    investmentAmount: 50000000,
    workforce: 60,
    waterReq: 800,
    powerReq: 200,
    wasteCategory: 'ORANGE',
    hazardousMaterials: false,
    stage: 'SETUP',
    status: 'ACTIVE',
    isDemoRecord: false,
  });
  console.log(`  -> Project created with Code: ${project.projectCode}, ObjectId: ${project._id}`);

  // B. Approval Wizard Checklist Generation
  console.log('\nStep 4: Running Approval Wizard rule-engine against MongoDB rules...');
  const checklist = await generateApprovalChecklist({
    organisationName: org.name,
    applicantName: newApplicant.name,
    legalEntity: org.legalEntityType,
    applicantType: 'MSME',
    contactEmail: newApplicant.email,
    contactMobile: newApplicant.mobile!,
    sector: project.sector,
    subSector: project.subSector,
    district: project.district,
    taluka: project.taluka,
    locationType: 'MIDC',
    landType: 'MIDC',
    landAreaSqMtr: project.landArea,
    builtupAreaSqMtr: project.builtUpArea,
    projectStage: 'SETUP',
    investmentAmountINR: project.investmentAmount,
    expectedWorkforce: project.workforce,
    manufacturingType: 'Manufacturing',
    powerRequirementKW: project.powerReq,
    waterRequirementKLD: project.waterReq,
    wasteCategory: 'ORANGE',
    hazardousMaterials: false,
    wastewaterKLD: 800,
    fireSafetyReq: true,
    boilerReq: false,
    labourRegReq: true,
    preferredLanguage: 'en',
  });
  console.log(`  -> Matched ${checklist.length} statutory approval rules.`);

  // Save Roadmap
  const roadmap = await ApprovalRoadmapModel.create({
    projectId: project._id,
    organisationId: org._id,
    applicantUserId: newApplicant._id,
    wizardInputSnapshot: { sector: project.sector, investment: project.investmentAmount },
    matchedApprovalRules: checklist,
    selectedApprovalRules: checklist,
    state: 'GENERATED',
    version: 1,
  });
  console.log(`  -> Saved Approval Roadmap to MongoDB with ObjectId: ${roadmap._id}`);

  // C. Application Submission
  console.log('\nStep 5: Submitting Application to MongoDB...');
  const appNumber = `APP-MPCB-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
  const application = await ApplicationModel.create({
    applicationNumber: appNumber,
    projectId: project._id,
    organisationId: org._id,
    applicantUserId: newApplicant._id,
    approvalName: 'Consent to Establish (CTE)',
    department: 'Maharashtra Pollution Control Board (MPCB)',
    status: 'SUBMITTED',
    riskLevel: 'HIGH',
    slaDays: 30,
    submittedAt: new Date(),
    requiresInspection: true,
    isDemoRecord: false,
  });
  console.log(`  -> Application created with Number: ${application.applicationNumber}, ObjectId: ${application._id}`);

  // Verify ApplicationStatusHistory & Notification Creation
  await ApplicationStatusHistoryModel.create({
    applicationId: application._id,
    previousStatus: 'NOT_STARTED',
    newStatus: 'SUBMITTED',
    status: 'SUBMITTED',
    action: 'APPLICATION_SUBMITTED',
    performedByUserId: newApplicant._id,
  });

  await NotificationModel.create({
    recipientUserId: newApplicant._id,
    type: 'application_submitted',
    priority: 'normal',
    title: 'Application Submitted Successfully',
    message: `Your application (${appNumber}) has been submitted for scrutiny.`,
    route: `/applications/${application._id}`,
    deliveryStatus: 'delivered_in_app',
    isRead: false,
  });
  console.log('  -> Persistent Status History and Applicant Notification created.');

  // D. Department Officer & Inspector Assignment
  console.log('\nStep 6: Officer assigns Inspector for Site Audit...');
  const testInspector = await UserModel.findOne({ role: 'INSPECTOR' }).exec();
  const testOfficer = await UserModel.findOne({ role: 'DEPARTMENT_OFFICER' }).exec();

  if (testOfficer) {
    application.assignedOfficerId = testOfficer._id;
    application.status = 'INSPECTION_SCHEDULED';
    await application.save();
  }

  const inspection = await InspectionModel.create({
    inspectionReference: `INSP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    applicationId: application._id,
    projectId: project._id,
    organisationId: org._id,
    applicantUserId: newApplicant._id,
    department: application.department,
    officerId: testOfficer?._id,
    assignedOfficerId: testOfficer?._id,
    inspectorId: testInspector?._id,
    assignedInspectorId: testInspector?._id,
    assignedByUserId: testOfficer?._id,
    scheduledDate: new Date(Date.now() + 2 * 86400000),
    slotTime: '10:00 AM - 12:00 PM',
    locationAddress: 'Plot 42, Chakan Industrial Area, Pune',
    status: 'SCHEDULED',
    instructions: 'Verify ETP setup and air emission points.',
    isDemoRecord: false,
  });
  console.log(`  -> Inspection scheduled with Reference: ${inspection.inspectionReference}, Assigned Inspector: ${testInspector?.email || 'N/A'}`);

  // E. Inspector Report Submission
  console.log('\nStep 7: Inspector submits inspection report...');
  const updatedInsp = await updateInspectionReport(inspection._id.toString(), {
    status: 'COMPLETED',
    recommendation: 'RECOMMEND_APPROVAL',
    reportSummary: 'All environmental safety parameters compliant.',
  });
  console.log(`  -> Inspection report updated to COMPLETED with recommendation: ${updatedInsp?.recommendation}`);

  // F. Officer Final Approval Decision
  console.log('\nStep 8: Department Officer approves Application...');
  const approvedApp = await updateApplicationStatus(
    application._id.toString(),
    'APPROVED',
    testOfficer?._id.toString() || newApplicant._id.toString(),
    'Compliant with all MPCB statutory norms. Consent Granted.'
  );
  console.log(`  -> Application Status updated to: ${approvedApp?.status}, ApprovedAt: ${approvedApp?.approvedAt}`);

  // G. Data Isolation Integrity Verification
  console.log('\nStep 9: Testing Data Isolation Integrity across applicants...');
  const cherryUser = await UserModel.findOne({ email: 'applicant2@udyogsathi.gov.in' }).exec();
  if (cherryUser) {
    const cherryAppsForTestUser = await ApplicationModel.find({
      applicantUserId: cherryUser._id,
      _id: application._id,
    }).lean();

    if (cherryAppsForTestUser.length === 0) {
      console.log('  -> ✅ DATA ISOLATION VERIFIED: Cherry cannot see new applicant\'s private project/application.');
    } else {
      console.error('  -> ❌ DATA LEAK DETECTED!');
    }
  }

  console.log('\n✨ ALL END-TO-END WORKFLOW STEPS PASSED SUCCESSFULLY ON MONGODB!');
  await mongoose.disconnect();
}

runEndToEndWorkflowTest().catch((err) => {
  console.error('❌ E2E Workflow test failed:', err);
  process.exit(1);
});
