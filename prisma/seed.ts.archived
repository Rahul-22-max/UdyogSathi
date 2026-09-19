import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting UdyogSathi AI database seed...');

  // Clean existing tables in order
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.grievanceMessage.deleteMany();
  await prisma.grievance.deleteMany();
  await prisma.renewal.deleteMany();
  await prisma.complianceEvent.deleteMany();
  await prisma.schemeMatch.deleteMany();
  await prisma.scheme.deleteMany();
  await prisma.inspectionChecklistItem.deleteMany();
  await prisma.inspection.deleteMany();
  await prisma.queryResponse.deleteMany();
  await prisma.query.deleteMany();
  await prisma.documentVerification.deleteMany();
  await prisma.document.deleteMany();
  await prisma.applicationStatusHistory.deleteMany();
  await prisma.application.deleteMany();
  await prisma.approvalRule.deleteMany();
  await prisma.project.deleteMany();
  await prisma.organisation.deleteMany();
  await prisma.user.deleteMany();
  await prisma.knowledgeBaseArticle.deleteMany();
  await prisma.translationKey.deleteMany();

  const defaultPasswordHash = await bcrypt.hash('Password@123', 10);

  // 1. Seed Users across 4 roles
  console.log('👤 Seeding Users...');
  const applicantUser = await prisma.user.create({
    data: {
      email: 'applicant@udyogsathi.gov.in',
      password: defaultPasswordHash,
      name: 'Rajesh Patil',
      role: 'APPLICANT',
      mobile: '+91 98220 12345',
      language: 'en',
      highContrast: false,
    },
  });

  const applicant2User = await prisma.user.create({
    data: {
      email: 'applicant2@udyogsathi.gov.in',
      password: defaultPasswordHash,
      name: 'Sunita Deshmukh',
      role: 'APPLICANT',
      mobile: '+91 98220 54321',
      language: 'mr',
    },
  });

  const officerUser = await prisma.user.create({
    data: {
      email: 'officer@udyogsathi.gov.in',
      password: defaultPasswordHash,
      name: 'Vijay Kulkarni (Sub-Regional Officer)',
      role: 'OFFICER',
      mobile: '+91 98230 11223',
      department: 'Maharashtra Pollution Control Board (MPCB)',
      designation: 'Sub-Regional Scrutiny Officer',
    },
  });

  const officer2User = await prisma.user.create({
    data: {
      email: 'officer2@udyogsathi.gov.in',
      password: defaultPasswordHash,
      name: 'Sanjay More (MIDC Executive Engineer)',
      role: 'OFFICER',
      mobile: '+91 98230 44556',
      department: 'Maharashtra Industrial Development Corporation (MIDC)',
      designation: 'Executive Engineer',
    },
  });

  const inspectorUser = await prisma.user.create({
    data: {
      email: 'inspector@udyogsathi.gov.in',
      password: defaultPasswordHash,
      name: 'Anand Shinde',
      role: 'INSPECTOR',
      mobile: '+91 98240 99887',
      department: 'Directorate of Industrial Safety and Health (DISH)',
      designation: 'Senior Factory Inspector',
    },
  });

  const inspector2User = await prisma.user.create({
    data: {
      email: 'inspector2@udyogsathi.gov.in',
      password: defaultPasswordHash,
      name: 'Priya Joshi',
      role: 'INSPECTOR',
      mobile: '+91 98240 77665',
      department: 'Maharashtra Fire Services',
      designation: 'Fire Station Inspection Officer',
    },
  });

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@udyogsathi.gov.in',
      password: defaultPasswordHash,
      name: 'Dr. Rahul Charan (State Admin)',
      role: 'ADMIN',
      mobile: '+91 98110 00001',
      department: 'Department of Industries & Innovation',
      designation: 'State Project Director - SIH Portal',
    },
  });

  await prisma.user.create({
    data: {
      email: 'guest_demo@udyogsathi.gov.in',
      password: defaultPasswordHash,
      name: 'Guest Demo Account',
      role: 'GUEST',
      mobile: '+91 90000 00000',
    },
  });

  // 2. Seed Organisations
  console.log('🏢 Seeding Organisations...');
  const org1 = await prisma.organisation.create({
    data: {
      userId: applicantUser.id,
      name: 'Sahyadri Auto Components Pvt Ltd',
      entityType: 'Private Limited',
      panNumber: 'AAACS1234F',
      gstNumber: '27AAACS1234F1Z5',
      address: 'Plot No. C-14, Chakan Industrial Area Phase II',
      district: 'Pune',
      taluka: 'Khed',
      state: 'Maharashtra',
      pinCode: '410501',
    },
  });

  const org2 = await prisma.organisation.create({
    data: {
      userId: applicantUser.id,
      name: 'Shivaji Green Bio-Chemicals LLP',
      entityType: 'LLP',
      panNumber: 'AABFS9876K',
      gstNumber: '27AABFS9876K1Z9',
      address: 'Plot No. M-8, Taloja MIDC Industrial Estate',
      district: 'Raigad',
      taluka: 'Panvel',
      state: 'Maharashtra',
      pinCode: '410208',
    },
  });

  const org3 = await prisma.organisation.create({
    data: {
      userId: applicant2User.id,
      name: 'Konkan Agro Processing Co',
      entityType: 'Partnership',
      panNumber: 'AACFK4321L',
      gstNumber: '27AACFK4321L1Z2',
      address: 'Gat No. 45, Kalmeshwar Road',
      district: 'Nagpur',
      taluka: 'Kalmeshwar',
      state: 'Maharashtra',
      pinCode: '441501',
    },
  });

  // 3. Seed Projects
  console.log('🏭 Seeding Industrial Projects...');
  const project1 = await prisma.project.create({
    data: {
      organisationId: org1.id,
      userId: applicantUser.id,
      name: 'Chakan Auto Ancillary Unit 1',
      sector: 'Automotive & Heavy Engineering',
      subSector: 'Auto Components & Machining',
      district: 'Pune',
      taluka: 'Khed',
      isMIDC: true,
      landType: 'Industrial Allotted',
      landArea: 15000,
      builtupArea: 8500,
      stage: 'SETUP',
      investmentAmount: 45000000,
      workforce: 85,
      wasteCategory: 'ORANGE',
      hazardousMaterials: true,
      waterReq: 1200,
      powerReq: 150,
    },
  });

  const project2 = await prisma.project.create({
    data: {
      organisationId: org2.id,
      userId: applicantUser.id,
      name: 'Taloja Chemical Processing Plant',
      sector: 'Chemicals & Petrochemicals',
      subSector: 'Specialty Chemicals & Bio-Polymers',
      district: 'Raigad',
      taluka: 'Panvel',
      isMIDC: true,
      landType: 'MIDC Industrial Lease',
      landArea: 25000,
      builtupArea: 14000,
      stage: 'CONSTRUCTION',
      investmentAmount: 120000000,
      workforce: 140,
      wasteCategory: 'RED',
      hazardousMaterials: true,
      waterReq: 5000,
      powerReq: 450,
    },
  });

  // 4. Seed Approval Rules
  console.log('📜 Seeding Approval Rules...');
  const rule1 = await prisma.approvalRule.create({
    data: {
      ruleId: 'RULE_MPCB_CTE',
      version: 1,
      title: 'Consent to Establish (CTE) - MPCB',
      sector: 'ALL',
      locationType: 'ALL',
      projectStage: 'SETUP',
      envCategory: 'ORANGE',
      requiredApproval: 'Consent to Establish (CTE)',
      department: 'Maharashtra Pollution Control Board (MPCB)',
      requiredDocs: JSON.stringify(['Project Report', 'Site Plan', 'Process Flow Diagram', 'Water & Waste Balance Sheet']),
      dependencies: JSON.stringify(['Land Ownership / MIDC Allotment Letter']),
      slaDays: 30,
      riskLevel: 'HIGH',
      priority: 1,
      explanation: 'Mandatory under Water (Prevention & Control of Pollution) Act, 1974 for Orange/Red category industries prior to construction.',
      sourceRef: 'MPCB Circular 2023/CTE-Rules',
    },
  });

  const rule2 = await prisma.approvalRule.create({
    data: {
      ruleId: 'RULE_DISH_FACTORY',
      version: 1,
      title: 'Factory Plan Approval & License',
      sector: 'ALL',
      locationType: 'ALL',
      projectStage: 'CONSTRUCTION',
      minWorkforce: 10,
      requiredApproval: 'Factory Building Plan Approval',
      department: 'Directorate of Industrial Safety and Health (DISH)',
      requiredDocs: JSON.stringify(['Architectural Factory Layout', 'Machinery Spacing Diagram', 'Stability Certificate']),
      dependencies: JSON.stringify(['Consent to Establish (CTE)']),
      slaDays: 21,
      riskLevel: 'MEDIUM',
      priority: 2,
      explanation: 'Statutory approval under Factories Act, 1948 for any unit employing 10 or more workers with power.',
      sourceRef: 'DISH Maharashtra Approval Manual Sec 6',
    },
  });

  const rule3 = await prisma.approvalRule.create({
    data: {
      ruleId: 'RULE_FIRE_NOC',
      version: 1,
      title: 'Provisional Fire No-Objection Certificate (NOC)',
      sector: 'ALL',
      locationType: 'ALL',
      projectStage: 'CONSTRUCTION',
      requiredApproval: 'Provisional Fire NOC',
      department: 'Maharashtra Fire Services / MIDC Fire Wing',
      requiredDocs: JSON.stringify(['Fire Layout Plan', 'Hydrant Network Plan']),
      dependencies: JSON.stringify([]),
      slaDays: 15,
      riskLevel: 'HIGH',
      priority: 3,
      explanation: 'Required under Maharashtra Fire Prevention and Life Safety Measures Act, 2006.',
      sourceRef: 'MFPS Act 2006 Section 3(1)',
    },
  });

  // 5. Seed Applications
  console.log('📑 Seeding Applications...');
  const app1 = await prisma.application.create({
    data: {
      projectId: project1.id,
      userId: applicantUser.id,
      approvalRuleId: rule1.id,
      approvalName: 'Consent to Establish (CTE) - MPCB',
      department: 'Maharashtra Pollution Control Board (MPCB)',
      status: 'UNDER_SCRUTINY',
      submissionDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      slaDueDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
      riskLevel: 'HIGH',
      currentStep: 3,
    },
  });

  await prisma.applicationStatusHistory.create({
    data: {
      applicationId: app1.id,
      status: 'SUBMITTED',
      comment: 'Application submitted successfully.',
      changedByUserId: applicantUser.id,
    },
  });

  await prisma.applicationStatusHistory.create({
    data: {
      applicationId: app1.id,
      status: 'UNDER_SCRUTINY',
      comment: 'Assigned to SRO Vijay Kulkarni for scrutiny.',
      changedByUserId: officerUser.id,
    },
  });

  const app2 = await prisma.application.create({
    data: {
      projectId: project1.id,
      userId: applicantUser.id,
      approvalRuleId: rule2.id,
      approvalName: 'Factory Building Plan Approval',
      department: 'Directorate of Industrial Safety and Health (DISH)',
      status: 'QUERY_RAISED',
      submissionDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
      slaDueDate: new Date(Date.now() + 13 * 24 * 60 * 60 * 1000),
      riskLevel: 'MEDIUM',
      currentStep: 2,
    },
  });

  const app3 = await prisma.application.create({
    data: {
      projectId: project1.id,
      userId: applicantUser.id,
      approvalRuleId: rule3.id,
      approvalName: 'Provisional Fire NOC',
      department: 'Maharashtra Fire Services / MIDC Fire Wing',
      status: 'INSPECTION_SCHEDULED',
      submissionDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      slaDueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      riskLevel: 'HIGH',
      currentStep: 4,
    },
  });

  // 6. Seed Inspection
  console.log('🕵️ Seeding Inspections...');
  const insp1 = await prisma.inspection.create({
    data: {
      applicationId: app3.id,
      projectId: project1.id,
      officerId: officerUser.id,
      inspectorId: inspectorUser.id,
      scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      slotTime: '11:00 AM - 01:00 PM',
      status: 'SCHEDULED',
      locationAddress: 'Plot C-14, Chakan MIDC Phase II, Khed, Pune',
      latitude: 18.7602,
      longitude: 73.8643,
      notes: 'Site verification for fire hydrant and secondary emergency access routes.',
    },
  });

  await prisma.inspectionChecklistItem.createMany({
    data: [
      {
        inspectionId: insp1.id,
        category: 'FIRE_SAFETY',
        itemTitle: 'Fire Hydrant Pressure Test (Min 3.5 kg/cm2)',
        isCompliant: 'NOT_CHECKED',
      },
      {
        inspectionId: insp1.id,
        category: 'FIRE_SAFETY',
        itemTitle: 'Emergency Exit Door Signage',
        isCompliant: 'NOT_CHECKED',
      },
    ],
  });

  // 7. Seed Schemes
  console.log('🎁 Seeding Government Schemes...');
  const scheme1 = await prisma.scheme.create({
    data: {
      schemeId: 'SCHEME_PSI_2019',
      title: 'Package Scheme of Incentives (PSI 2019)',
      department: 'Directorate of Industries, Maharashtra',
      description: 'Capital subsidy, SGST reimbursement, and interest subvention for MSMEs.',
      sector: 'ALL',
      minInvestment: 5000000,
      maxInvestment: 500000000,
      district: 'ALL',
      benefits: 'Up to 80% Gross SGST Reimbursement for 7 years.',
      eligibilityCriteria: 'MSME registration, valid CTE from MPCB.',
      requiredDocs: 'Udyam Certificate, MPCB CTE, Land Purchase Deed',
      deadline: new Date('2027-03-31'),
      officialUrl: 'https://di.maharashtra.gov.in',
    },
  });

  await prisma.schemeMatch.create({
    data: {
      projectId: project1.id,
      schemeId: scheme1.id,
      matchScore: 92,
      explanation: 'High match for MSME manufacturing unit in Khed Pune.',
      isSaved: true,
    },
  });

  // 8. Seed Grievance
  console.log('📢 Seeding Grievance...');
  await prisma.grievance.create({
    data: {
      ticketId: 'GRV-2026-8891',
      userId: applicantUser.id,
      projectId: project1.id,
      category: 'SLA Delay',
      subject: 'Delay in MIDC Water Supply Pipeline Tap-In Inspection',
      description: 'Application pending for 22 days against SLA target of 14 days.',
      priority: 'HIGH',
      status: 'IN_PROGRESS',
      officerAssignedId: officer2User.id,
      isEscalated: true,
    },
  });

  console.log('✅ Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
