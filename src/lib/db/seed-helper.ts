if (typeof window !== 'undefined') {
  throw new Error('Seed helper can only be executed on the server.');
}

import bcrypt from 'bcryptjs';
import {
  UserModel,
  OrganisationModel,
  ProjectModel,
  ApprovalRuleModel,
  ApplicationModel,
  ApplicationStatusHistoryModel,
  DocumentModel,
  InspectionModel,
  InspectionChecklistItemModel,
  NotificationModel,
  AuditLogModel,
  SchemeModel,
  GrievanceModel,
} from '@/lib/models/index';

export async function reconcileInspectorAssignments() {
  try {
    const inspector = await UserModel.findOne({ email: 'inspector@udyogsathi.gov.in' });
    if (!inspector) return;

    await InspectionModel.updateMany(
      {
        $or: [
          { assignedInspectorId: { $exists: false } },
          { assignedInspectorId: null },
          { assignedInspectorId: 'usr-inspector-1' as any },
          { isDemoRecord: true },
        ],
      },
      {
        $set: {
          assignedInspectorId: inspector._id,
          inspectorId: inspector._id,
        },
      }
    );
  } catch (err: any) {
    console.error('⚠️ Inspector reconciliation error:', err.message);
  }
}

export async function ensureDemoDataSeeded() {
  try {
    const userCount = await UserModel.countDocuments();
    if (userCount > 0) {
      // Database already has user records, run reconciliation on existing records
      await reconcileInspectorAssignments();
      return;
    }

    console.log('🌱 No users found in database. Auto-seeding UdyogSathi demo accounts and statutory rules...');

    const passwordHash = await bcrypt.hash('Password@123', 10);

    // 1. Users
    const vijayApplicant = await UserModel.create({
      email: 'applicant@udyogsathi.gov.in',
      passwordHash,
      name: 'Vijay Kulkarni',
      role: 'APPLICANT',
      mobile: '+91 98220 12345',
      language: 'en',
      accessibilityPreferences: { highContrast: false, fontSize: 'normal', reducedMotion: false },
      isActive: true,
      isDemoUser: true,
    });

    const cherryApplicant = await UserModel.create({
      email: 'applicant2@udyogsathi.gov.in',
      passwordHash,
      name: 'Cherry Deshmukh',
      role: 'APPLICANT',
      mobile: '+91 98220 54321',
      language: 'mr',
      accessibilityPreferences: { highContrast: false, fontSize: 'normal', reducedMotion: false },
      isActive: true,
      isDemoUser: true,
    });

    const officerUser = await UserModel.create({
      email: 'officer@udyogsathi.gov.in',
      passwordHash,
      name: 'Rajesh Patil (Sub-Regional Officer)',
      role: 'DEPARTMENT_OFFICER',
      mobile: '+91 98230 11223',
      department: 'Maharashtra Pollution Control Board (MPCB)',
      designation: 'Sub-Regional Scrutiny Officer',
      isActive: true,
      isDemoUser: true,
    });

    const officer2User = await UserModel.create({
      email: 'officer2@udyogsathi.gov.in',
      passwordHash,
      name: 'Sanjay More (MIDC Executive Engineer)',
      role: 'DEPARTMENT_OFFICER',
      mobile: '+91 98230 44556',
      department: 'Maharashtra Industrial Development Corporation (MIDC)',
      designation: 'Executive Engineer',
      isActive: true,
      isDemoUser: true,
    });

    const inspectorUser = await UserModel.create({
      email: 'inspector@udyogsathi.gov.in',
      passwordHash,
      name: 'Anand Shinde',
      role: 'INSPECTOR',
      mobile: '+91 98240 99887',
      department: 'Directorate of Industrial Safety and Health (DISH)',
      designation: 'Senior Factory Inspector',
      isActive: true,
      isDemoUser: true,
    });

    const inspector2User = await UserModel.create({
      email: 'inspector2@udyogsathi.gov.in',
      passwordHash,
      name: 'Priya Joshi',
      role: 'INSPECTOR',
      mobile: '+91 98240 77665',
      department: 'Maharashtra Fire Services',
      designation: 'Fire Station Inspection Officer',
      isActive: true,
      isDemoUser: true,
    });

    const adminUser = await UserModel.create({
      email: 'admin@udyogsathi.gov.in',
      passwordHash,
      name: 'Dr. Rahul Charan (State Admin)',
      role: 'ADMINISTRATOR',
      mobile: '+91 98110 00001',
      department: 'Department of Industries & Innovation',
      designation: 'State Project Director - SIH Portal',
      isActive: true,
      isDemoUser: true,
    });

    // 2. Organisations
    const orgVijay = await OrganisationModel.create({
      name: 'Vijay Foods and Agro Processing Pvt. Ltd.',
      legalEntityType: 'Private Limited',
      panNumber: 'AAACS1234F',
      gstNumber: '27AAACS1234F1Z5',
      address: 'Plot C-14, Chakan Industrial Area Phase II',
      district: 'Pune',
      taluka: 'Khed',
      state: 'Maharashtra',
      pinCode: '410501',
      ownerUserId: vijayApplicant._id,
      isDemoRecord: true,
    });

    const orgCherry = await OrganisationModel.create({
      name: 'Cherry Bio-Chemicals LLP',
      legalEntityType: 'LLP',
      panNumber: 'BBBCS5678G',
      gstNumber: '27BBBCS5678G1Z9',
      address: 'Plot A-8, Tarapur Industrial Zone',
      district: 'Palghar',
      taluka: 'Palghar',
      state: 'Maharashtra',
      pinCode: '401506',
      ownerUserId: cherryApplicant._id,
      isDemoRecord: true,
    });

    // 3. Projects
    const projectVijay = await ProjectModel.create({
      projectCode: 'PRJ-PUN-2026-001',
      organisationId: orgVijay._id,
      ownerUserId: vijayApplicant._id,
      createdByUserId: vijayApplicant._id,
      name: 'Chakan Food Processing & Cold Chain Unit',
      sector: 'Food Processing',
      subSector: 'Agro & Food Processing',
      district: 'Pune',
      taluka: 'Khed',
      isMIDC: true,
      locationType: 'MIDC',
      landArea: 12500,
      builtUpArea: 6800,
      investmentAmount: 45000000,
      workforce: 85,
      waterReq: 1200,
      powerReq: 250,
      wasteCategory: 'ORANGE',
      hazardousMaterials: false,
      stage: 'SETUP',
      status: 'ACTIVE',
      isDemoRecord: true,
    });

    const projectCherry = await ProjectModel.create({
      projectCode: 'PRJ-PAL-2026-002',
      organisationId: orgCherry._id,
      ownerUserId: cherryApplicant._id,
      createdByUserId: cherryApplicant._id,
      name: 'Tarapur Polymer & Resins Plant',
      sector: 'Chemicals & Specialty Materials',
      subSector: 'Polymers',
      district: 'Palghar',
      taluka: 'Palghar',
      isMIDC: true,
      locationType: 'MIDC',
      landArea: 25000,
      builtUpArea: 14000,
      investmentAmount: 120000000,
      workforce: 150,
      waterReq: 3500,
      powerReq: 800,
      wasteCategory: 'RED',
      hazardousMaterials: true,
      stage: 'CONSTRUCTION',
      status: 'ACTIVE',
      isDemoRecord: true,
    });

    // 4. Approval Rules
    const ruleCTE = await ApprovalRuleModel.create({
      ruleId: 'RULE_MPCB_CTE',
      version: 1,
      title: 'Consent to Establish (CTE) - MPCB',
      sector: 'ALL',
      locationType: 'ALL',
      district: 'ALL',
      projectStage: 'SETUP',
      minInvestment: 0,
      minWorkforce: 0,
      envCategory: 'ORANGE',
      hazardousCondition: false,
      requiredApproval: 'Consent to Establish (CTE)',
      department: 'Maharashtra Pollution Control Board (MPCB)',
      requiredDocs: ['Project Report', 'Site Plan', 'Process Flow Diagram', 'Water & Waste Balance Sheet'],
      dependencies: ['MIDC Land Allotment / Land Lease Proof'],
      canRunInParallel: true,
      slaDays: 30,
      riskLevel: 'HIGH',
      priority: 1,
      requiresInspection: true,
      inspectionStage: 'before_decision',
      explanation: 'Mandatory environmental clearance under Water & Air Acts before civil setup.',
      sourceReference: 'Water Act 1974 & Air Act 1981',
      isActive: true,
      published: true,
    });

    const ruleDISH = await ApprovalRuleModel.create({
      ruleId: 'RULE_DISH_FACTORY',
      version: 1,
      title: 'Factory Building Plan Approval - DISH',
      sector: 'ALL',
      locationType: 'ALL',
      district: 'ALL',
      projectStage: 'CONSTRUCTION',
      minInvestment: 0,
      minWorkforce: 10,
      envCategory: 'ALL',
      hazardousCondition: false,
      requiredApproval: 'Factory Building Plan Approval',
      department: 'Directorate of Industrial Safety and Health (DISH)',
      requiredDocs: ['Architectural Factory Layout', 'Machinery Spacing Diagram', 'Structural Stability Certificate'],
      dependencies: ['Consent to Establish (CTE)'],
      canRunInParallel: false,
      slaDays: 21,
      riskLevel: 'MEDIUM',
      priority: 2,
      requiresInspection: true,
      inspectionStage: 'before_decision',
      explanation: 'Mandatory statutory safety clearance under Factories Act for workforce > 10.',
      sourceReference: 'Factories Act 1948 Section 6',
      isActive: true,
      published: true,
    });

    // 5. Applications
    const appVijay1 = await ApplicationModel.create({
      applicationNumber: 'APP-MPCB-2026-880201',
      projectId: projectVijay._id,
      organisationId: orgVijay._id,
      applicantUserId: vijayApplicant._id,
      approvalRuleId: ruleCTE._id,
      approvalName: 'Consent to Establish (CTE)',
      department: 'Maharashtra Pollution Control Board (MPCB)',
      assignedOfficerId: officerUser._id,
      status: 'INSPECTION_SCHEDULED',
      riskLevel: 'HIGH',
      slaDays: 30,
      submittedAt: new Date(Date.now() - 10 * 86400000),
      slaDueDate: new Date(Date.now() + 20 * 86400000),
      requiresInspection: true,
      assignedInspectorId: inspectorUser._id,
      isDemoRecord: true,
    });

    await ApplicationModel.create({
      applicationNumber: 'APP-DISH-2026-990101',
      projectId: projectCherry._id,
      organisationId: orgCherry._id,
      applicantUserId: cherryApplicant._id,
      approvalRuleId: ruleDISH._id,
      approvalName: 'Factory Building Plan Approval',
      department: 'Directorate of Industrial Safety and Health (DISH)',
      assignedOfficerId: officer2User._id,
      status: 'SUBMITTED',
      riskLevel: 'MEDIUM',
      slaDays: 21,
      submittedAt: new Date(Date.now() - 2 * 86400000),
      slaDueDate: new Date(Date.now() + 19 * 86400000),
      requiresInspection: false,
      isDemoRecord: true,
    });

    // 6. Inspections
    const inspVijay = await InspectionModel.create({
      inspectionReference: 'INSP-2026-901',
      applicationId: appVijay1._id,
      projectId: projectVijay._id,
      organisationId: orgVijay._id,
      applicantUserId: vijayApplicant._id,
      department: 'Maharashtra Pollution Control Board (MPCB)',
      officerId: officerUser._id,
      assignedOfficerId: officerUser._id,
      inspectorId: inspectorUser._id,
      assignedInspectorId: inspectorUser._id,
      assignedByUserId: officerUser._id,
      scheduledDate: new Date(Date.now() + 3 * 86400000),
      slotTime: '11:30 AM',
      locationAddress: 'Plot C-14, Chakan MIDC Phase II, Pune',
      status: 'SCHEDULED',
      instructions: 'Verify ETP flow meter setup, air emission stacks, and safety distances.',
      riskLevel: 'HIGH',
      isDemoRecord: true,
    });

    await InspectionChecklistItemModel.create({
      inspectionId: inspVijay._id,
      category: 'Environmental Safety',
      itemTitle: 'Effluent Treatment Plant (ETP) Primary & Secondary Setup',
      isCompliant: 'NOT_CHECKED',
      notes: 'To be verified during physical site visit.',
    });

    // 7. Vault Documents
    await DocumentModel.create({
      ownerUserId: vijayApplicant._id,
      userId: vijayApplicant._id,
      organisationId: orgVijay._id,
      projectId: projectVijay._id,
      name: 'Business Incorporation Certificate',
      documentName: 'Incorporation_Certificate_VijayFoods.pdf',
      category: 'IDENTITY',
      fileUrl: '/uploads/incorporation_vijay.pdf',
      fileType: 'application/pdf',
      fileSize: 1024000,
      sourceType: 'VAULT',
      isVerified: true,
      verificationStatus: 'VERIFIED',
      isDemoRecord: true,
    });

    // 8. Notifications
    await NotificationModel.create({
      recipientUserId: vijayApplicant._id,
      recipientEmail: 'applicant@udyogsathi.gov.in',
      recipientRole: 'applicant',
      relatedApplicationId: appVijay1._id.toString(),
      type: 'inspection_scheduled',
      priority: 'high',
      title: 'Statutory Site Audit Scheduled for CTE Application',
      message: 'Inspector Anand Shinde has scheduled site inspection for APP-MPCB-2026-880201 at Chakan MIDC.',
      route: '/inspections',
      deliveryStatus: 'delivered_in_app',
      isRead: false,
    });

    // 9. Audit Log
    await AuditLogModel.create({
      userId: vijayApplicant._id,
      actorUserId: vijayApplicant._id.toString(),
      actorRole: 'applicant',
      action: 'PROJECT_CREATED',
      eventType: 'project_creation',
      entityType: 'Project',
      entityId: projectVijay._id.toString(),
      details: 'Created industrial project: Chakan Food Processing & Cold Chain Unit',
      ipAddress: '127.0.0.1',
    });

    console.log('✅ UdyogSathi demo accounts and statutory rules auto-seeded successfully!');
  } catch (err: any) {
    console.error('⚠️ Auto-seed error (non-fatal):', err.message);
  }
}
