import { VaultDocument } from './document-reuse';

export type ApplicationWorkflowStatus =
  | 'draft'
  | 'documents_pending'
  | 'ready_for_submission'
  | 'submitted'
  | 'under_scrutiny'
  | 'query_raised'
  | 'query_responded'
  | 'inspection_required'
  | 'inspection_scheduled'
  | 'inspection_completed'
  | 'approved'
  | 'rejected'
  | 'returned_for_correction'
  | 'renewal_due'
  | 'closed';

export type SlaState = 'on_track' | 'due_soon' | 'breached' | 'paused';

export interface WorkflowApplication {
  id: string;
  referenceNumber: string;
  projectId: string;
  projectName: string;
  approvalType: string;
  approvalTitle: string;
  department: string;
  statutoryAct: string;
  submittedAt?: string;
  createdAt: string;
  status: ApplicationWorkflowStatus;
  slaDaysTotal: number;
  slaDaysRemaining: number;
  slaState: SlaState;
  readinessScore: number;
  reusedDocumentIds: string[];
  uploadedDocumentIds: string[];
  missingDocumentLabels: string[];
  timelineHistory?: {
    id: string;
    action: string;
    previousStatus?: string;
    newStatus: string;
    performedBy: string;
    timestamp: string;
    remarks?: string;
  }[];
  queryDetails?: {
    queryId: string;
    raisedByOfficer: string;
    raisedAt: string;
    queryText: string;
    responseDeadline: string;
    applicantResponse?: string;
    respondedAt?: string;
  };
  inspectionDetails?: {
    inspectionId: string;
    inspectorName: string;
    scheduledDate: string;
    scheduledTime: string;
    venue: string;
    status: 'scheduled' | 'in_progress' | 'completed';
    evidenceCount?: number;
    reportSummary?: string;
  };
  decisionDetails?: {
    decision: 'approved' | 'rejected' | 'returned_for_correction';
    decidedByOfficer: string;
    decidedAt: string;
    remarks: string;
    certificateNumber?: string;
    validityExpiryDate?: string;
  };
  requiresInspection?: boolean;
  inspectionStage?: string;
  assignedInspectorId?: string;
  assignedInspectorName?: string;
  decisionRemarks?: string;
  rejectionReason?: string;
  approvedByUserId?: string;
  approvedAt?: string;
  rejectedByUserId?: string;
  rejectedAt?: string;
  approvalReferenceNumber?: string;
  isDemoSandboxRecord?: boolean;
}

export interface IndustrialProject {
  id: string;
  name: string;
  promoterName: string;
  sector: string;
  subSector: string;
  district: string;
  taluka: string;
  locationType: 'MIDC' | 'NON_MIDC' | 'COOP_ESTATE';
  plotNumber: string;
  investmentAmountINR: number;
  workforceCount: number;
  environmentalCategory: 'WHITE' | 'GREEN' | 'ORANGE' | 'RED';
  projectStage: 'PROPOSED' | 'LAND_ALLOTTED' | 'CIVIL_SETUP' | 'OPERATIONAL';
  createdAt: string;
  totalApprovalsRequired: number;
  currentStageNumber: number; // 1 to 8
}

export interface NextBestAction {
  id: string;
  title: string;
  description: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  category: 'DOCUMENT' | 'QUERY' | 'APPLICATION' | 'INSPECTION' | 'RENEWAL' | 'SCHEME';
  targetHref: string;
  actionButtonText: string;
}

/**
 * Seeded Demo Project for Vijay Kulkarni (Applicant)
 */
export const DEMO_VIJAY_PROJECT: IndustrialProject = {
  id: 'proj-1',
  name: 'Vijay Foods and Agro Processing Pvt. Ltd.',
  promoterName: 'Vijay Kulkarni',
  sector: 'Food Processing & Manufacturing',
  subSector: 'Agro Processing & Spices Export',
  district: 'Pune',
  taluka: 'Khed',
  locationType: 'MIDC',
  plotNumber: 'Plot C-14, Chakan Phase II MIDC',
  investmentAmountINR: 45000000, // Rs 4.5 Cr
  workforceCount: 85,
  environmentalCategory: 'ORANGE',
  projectStage: 'CIVIL_SETUP',
  createdAt: '2026-01-15T10:00:00Z',
  totalApprovalsRequired: 5,
  currentStageNumber: 4, // Apply Stage
};

/**
 * Seeded Demo Applications for Vijay (Applicant)
 * Demonstrates all major workflow stages: Approved, Query Raised, Inspection Scheduled, Returned for Correction, Ready for Submission.
 */
export const DEMO_VIJAY_APPLICATIONS: WorkflowApplication[] = [
  {
    id: 'app-8801',
    referenceNumber: 'APP-2026-8801',
    projectId: 'proj-1',
    projectName: 'Vijay Foods and Agro Processing Pvt. Ltd.',
    approvalType: 'DISH_BUILDING_PLAN',
    approvalTitle: 'Factory Building Plan Approval & Safety Audit',
    department: 'Directorate of Industrial Safety & Health (DISH)',
    statutoryAct: 'Factories Act 1948 - Section 6',
    createdAt: '2026-02-01T10:00:00Z',
    submittedAt: '2026-02-05T14:30:00Z',
    status: 'approved',
    slaDaysTotal: 30,
    slaDaysRemaining: 18,
    slaState: 'on_track',
    readinessScore: 100,
    reusedDocumentIds: ['doc-pan-1', 'doc-gst-v2', 'doc-coi-1', 'doc-addr-1'],
    uploadedDocumentIds: ['doc-land-1'],
    missingDocumentLabels: [],
    decisionDetails: {
      decision: 'approved',
      decidedByOfficer: 'DISH Deputy Director (Pune Region)',
      decidedAt: '2026-02-18T16:00:00Z',
      remarks: 'Architectural layout meets structural stability, ventilation, and emergency exit standards of Factories Rules 1963.',
      certificateNumber: 'DISH/PN/2026/FPA-4491',
      validityExpiryDate: '2031-02-18',
    },
  },
  {
    id: 'app-8802',
    referenceNumber: 'APP-2026-8802',
    projectId: 'proj-1',
    projectName: 'Vijay Foods and Agro Processing Pvt. Ltd.',
    approvalType: 'MPCB_CTE',
    approvalTitle: 'Consent to Establish (CTE) - Orange Category',
    department: 'Maharashtra Pollution Control Board (MPCB)',
    statutoryAct: 'Water Act 1974 & Air Act 1981',
    createdAt: '2026-02-10T11:00:00Z',
    submittedAt: '2026-02-15T09:30:00Z',
    status: 'query_raised',
    slaDaysTotal: 45,
    slaDaysRemaining: 12,
    slaState: 'paused',
    readinessScore: 90,
    reusedDocumentIds: ['doc-pan-1', 'doc-gst-v2', 'doc-coi-1', 'doc-addr-1'],
    uploadedDocumentIds: ['doc-mpcb-pend'],
    missingDocumentLabels: [],
    queryDetails: {
      queryId: 'QRY-MPCB-991',
      raisedByOfficer: 'S. R. Deshmukh (MPCB Sub-Regional Officer Pune II)',
      raisedAt: '2026-08-27T11:00:00Z',
      queryText: 'Please clarify peak wastewater generation calculations and submit Effluent Treatment Plant (ETP) flow diagram for 450 KLD discharge.',
      responseDeadline: '2026-09-10T17:00:00Z',
    },
  },
  {
    id: 'app-8803',
    referenceNumber: 'APP-2026-8803',
    projectId: 'proj-1',
    projectName: 'Vijay Foods and Agro Processing Pvt. Ltd.',
    approvalType: 'DISH_FACTORY_LICENCE',
    approvalTitle: 'Grant of Factory Licence under Factories Act',
    department: 'Directorate of Industrial Safety & Health (DISH)',
    statutoryAct: 'Factories Act 1948 - Section 6',
    createdAt: '2026-03-01T10:00:00Z',
    submittedAt: '2026-03-05T12:00:00Z',
    status: 'inspection_scheduled',
    slaDaysTotal: 30,
    slaDaysRemaining: 8,
    slaState: 'on_track',
    readinessScore: 95,
    reusedDocumentIds: ['doc-pan-1', 'doc-gst-v2', 'doc-coi-1'],
    uploadedDocumentIds: [],
    missingDocumentLabels: [],
    inspectionDetails: {
      inspectionId: 'INSP-2026-901',
      inspectorName: 'Rajendra Deshmukh (DISH Senior Inspector)',
      scheduledDate: '2026-09-05',
      scheduledTime: '11:30 AM',
      venue: 'Plot C-14, Chakan MIDC Phase II, Pune',
      status: 'scheduled',
      evidenceCount: 0,
    },
  },
  {
    id: 'app-8804',
    referenceNumber: 'APP-2026-8804',
    projectId: 'proj-1',
    projectName: 'Vijay Foods and Agro Processing Pvt. Ltd.',
    approvalType: 'FIRE_PROVISIONAL_NOC',
    approvalTitle: 'Provisional Fire Safety Clearance NOC',
    department: 'Maharashtra Fire Services / MIDC Fire Dept',
    statutoryAct: 'Maharashtra Fire Prevention & Life Safety Act 2006',
    createdAt: '2026-03-10T09:00:00Z',
    submittedAt: '2026-03-12T15:00:00Z',
    status: 'returned_for_correction',
    slaDaysTotal: 21,
    slaDaysRemaining: 4,
    slaState: 'due_soon',
    readinessScore: 60,
    reusedDocumentIds: ['doc-pan-1', 'doc-coi-1'],
    uploadedDocumentIds: ['doc-fire-exp'], // Expired doc
    missingDocumentLabels: ['Valid Fire Safety Certificate'],
    decisionDetails: {
      decision: 'returned_for_correction',
      decidedByOfficer: 'MIDC Fire Officer (Chakan Zone)',
      decidedAt: '2026-08-26T14:00:00Z',
      remarks: 'The submitted Provisional Fire Safety Clearance is expired (Expired 10 Jan 2026). Please upload a current valid Fire NOC.',
    },
  },
  {
    id: 'app-8805',
    referenceNumber: 'APP-2026-8805',
    projectId: 'proj-1',
    projectName: 'Vijay Foods and Agro Processing Pvt. Ltd.',
    approvalType: 'MIDC_WATER_CONNECTION',
    approvalTitle: 'MIDC Industrial Water Supply Connection Allotment',
    department: 'Maharashtra Industrial Development Corporation (MIDC)',
    statutoryAct: 'MIDC Water Supply Regulations 1973',
    createdAt: '2026-08-20T10:00:00Z',
    status: 'ready_for_submission',
    slaDaysTotal: 15,
    slaDaysRemaining: 15,
    slaState: 'on_track',
    readinessScore: 80,
    reusedDocumentIds: ['doc-pan-1', 'doc-gst-v2', 'doc-coi-1', 'doc-addr-1'],
    uploadedDocumentIds: [],
    missingDocumentLabels: ['Plumbing & Water Flow Scheme Diagram'],
  },
];

/**
 * Calculates Next Best Action for the logged-in user
 */
export function getNextBestActions(
  userRole: string,
  project?: IndustrialProject,
  applications: WorkflowApplication[] = DEMO_VIJAY_APPLICATIONS
): NextBestAction[] {
  const actions: NextBestAction[] = [];

  // 1. Check for returned application / expired doc
  const returnedApp = applications.find(a => a.status === 'returned_for_correction');
  if (returnedApp) {
    actions.push({
      id: 'nba-returned-app',
      title: `Action Required: Resolve Returned Application (${returnedApp.referenceNumber})`,
      description: `MIDC Fire Dept returned your Fire NOC application because the uploaded document is expired. Upload an updated Fire NOC to resubmit.`,
      priority: 'CRITICAL',
      category: 'DOCUMENT',
      targetHref: `/applications/${returnedApp.id}`,
      actionButtonText: 'Upload Updated NOC & Resubmit',
    });
  }

  // 2. Check for MPCB query
  const queryApp = applications.find(a => a.status === 'query_raised');
  if (queryApp && queryApp.queryDetails) {
    actions.push({
      id: 'nba-mpcb-query',
      title: `Action Required: Respond to Officer Query (${queryApp.department})`,
      description: `MPCB Sub-Regional Officer requested wastewater calculation details. Deadline: ${queryApp.queryDetails.responseDeadline.split('T')[0]}.`,
      priority: 'HIGH',
      category: 'QUERY',
      targetHref: `/applications/${queryApp.id}`,
      actionButtonText: 'Respond to Officer Query',
    });
  }

  // 3. Check for reusable documents in ready_for_submission application
  const readyApp = applications.find(a => a.status === 'ready_for_submission');
  if (readyApp) {
    actions.push({
      id: 'nba-reuse-docs',
      title: `Speed Up Submission: 4 Verified Documents Ready for Reuse`,
      description: `Your MIDC Water Connection application can reuse 4 verified documents from your Document Vault. Upload 1 missing diagram to reach 100% readiness.`,
      priority: 'HIGH',
      category: 'APPLICATION',
      targetHref: `/applications/${readyApp.id}`,
      actionButtonText: 'Reuse 4 Vault Docs & Submit',
    });
  }

  // 4. Check for scheduled inspection
  const inspApp = applications.find(a => a.status === 'inspection_scheduled');
  if (inspApp && inspApp.inspectionDetails) {
    actions.push({
      id: 'nba-inspection-notice',
      title: `Upcoming Field Inspection: ${inspApp.approvalTitle}`,
      description: `Inspector ${inspApp.inspectionDetails.inspectorName} is scheduled to audit Plot C-14 on ${inspApp.inspectionDetails.scheduledDate} at ${inspApp.inspectionDetails.scheduledTime}.`,
      priority: 'MEDIUM',
      category: 'INSPECTION',
      targetHref: `/inspections`,
      actionButtonText: 'View Inspection Checklist & Venue',
    });
  }

  return actions;
}
