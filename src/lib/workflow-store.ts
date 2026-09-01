import { WorkflowApplication, DEMO_VIJAY_APPLICATIONS, IndustrialProject, DEMO_VIJAY_PROJECT } from './workflow-engine';
import { VaultDocument, DEMO_VIJAY_VAULT_DOCUMENTS } from './document-reuse';

export interface InspectionItem {
  id: string;
  applicationId: string;
  referenceNumber: string;
  projectId?: string;
  projectName?: string;
  organisationId?: string;
  applicantUserId?: string;
  title: string;
  department: string;
  unitName: string;
  inspectorName: string;
  assignedInspectorId?: string;
  scheduledDate: string;
  scheduledTime: string;
  venue: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  requirements: string[];
  reportSummary?: string;
  recommendation?: 'RECOMMEND_APPROVAL' | 'RECOMMEND_REJECTION' | 'REQUIRE_CLARIFICATION' | string;
  completedAt?: string;
  cancellationReason?: string;
  cancelledAt?: string;
  cancelledByUserId?: string;
  ownerUserEmail?: string;
  isDemoSandboxRecord?: boolean;
}

export interface PersistentNotification {
  id: string;
  recipientUserId: string;
  recipientEmail?: string;
  recipientRole: string;
  relatedApplicationId?: string;
  type: 'application_rejected' | 'query_raised' | 'inspection_scheduled' | 'inspection_cancelled' | 'document_verified' | 'document_rejected' | 'welcome';
  title: string;
  message: string;
  route: string;
  priority: 'high' | 'normal' | 'low';
  deliveryStatus: 'created' | 'delivered_in_app' | 'read' | 'failed';
  isRead: boolean;
  createdAt: string;
}

export interface PersistentAuditLog {
  id: string;
  eventType: string;
  description: string;
  actorUserId: string;
  actorRole: string;
  timestamp: string;
  metadata?: any;
}

const INITIAL_INSPECTIONS: InspectionItem[] = [
  {
    id: 'INSP-2026-901',
    applicationId: 'app-8803',
    referenceNumber: 'APP-2026-8803',
    title: 'Factory Safety & Ventilation Pre-Operational Audit',
    department: 'Directorate of Industrial Safety & Health (DISH)',
    unitName: 'Vijay Foods and Agro Processing Pvt. Ltd.',
    scheduledDate: '2026-09-05',
    scheduledTime: '11:30 AM',
    inspectorName: 'Rajendra Deshmukh (DISH Senior Inspector)',
    venue: 'Plot C-14, Chakan MIDC Phase II, Pune',
    status: 'scheduled',
    requirements: [
      'Factory Architectural Blueprint',
      'Fire Safety Hose Test Report',
      'Structural Stability Certificate',
    ],
    ownerUserEmail: 'applicant@udyogsathi.gov.in',
  },
  {
    id: 'INSP-2026-880',
    applicationId: 'app-8802',
    referenceNumber: 'APP-2026-8802',
    title: 'Effluent Treatment Plant (ETP) Commissioning Audit',
    department: 'Maharashtra Pollution Control Board (MPCB)',
    unitName: 'Sahyadri Auto Components Pvt Ltd',
    scheduledDate: '2026-08-12',
    scheduledTime: '02:00 PM',
    inspectorName: 'Sub-Regional Officer MPCB',
    venue: 'Chakan Unit 1, Pune',
    status: 'completed',
    requirements: ['ETP Flow Meter Log', 'Water Discharge Sample Audit'],
    ownerUserEmail: 'applicant@udyogsathi.gov.in',
  },
];

const INITIAL_NOTIFICATIONS: PersistentNotification[] = [
  {
    id: 'notif-1',
    recipientUserId: 'usr-applicant-1',
    recipientEmail: 'applicant@udyogsathi.gov.in',
    recipientRole: 'applicant',
    relatedApplicationId: 'app-8802',
    type: 'query_raised',
    title: 'Officer Query Raised for CTE Application',
    message: 'MPCB Sub-Regional Officer requested wastewater calculation clarification for APP-2026-8802.',
    route: '/applications/app-8802',
    priority: 'high',
    deliveryStatus: 'delivered_in_app',
    isRead: false,
    createdAt: '2026-08-27T11:00:00Z',
  },
  {
    id: 'notif-2',
    recipientUserId: 'usr-applicant-1',
    recipientEmail: 'applicant@udyogsathi.gov.in',
    recipientRole: 'applicant',
    relatedApplicationId: 'app-8803',
    type: 'inspection_scheduled',
    title: 'DISH Safety Inspection Scheduled for 05 Sep 2026',
    message: 'Inspector Rajendra Deshmukh scheduled site audit at Plot C-14 Chakan MIDC.',
    route: '/inspections',
    priority: 'normal',
    deliveryStatus: 'delivered_in_app',
    isRead: true,
    createdAt: '2026-08-25T14:00:00Z',
  },
];

const INITIAL_AUDIT_LOGS: PersistentAuditLog[] = [
  {
    id: 'audit-1',
    eventType: 'application_submitted',
    description: 'Application APP-2026-8801 submitted to DISH sandbox queue.',
    actorUserId: 'usr-applicant-1',
    actorRole: 'applicant',
    timestamp: '2026-02-05T14:30:00Z',
  },
  {
    id: 'audit-2',
    eventType: 'application_approved',
    description: 'DISH Deputy Director approved Factory Building Plan DISH/PN/2026/FPA-4491.',
    actorUserId: 'usr-officer-1',
    actorRole: 'department_officer',
    timestamp: '2026-02-18T16:00:00Z',
  },
];

// Helper to determine if user is Vijay (seeded demo applicant)
function isVijayUser(email?: string): boolean {
  if (!email) return true; // Default fallback for anonymous guest preview
  const clean = email.toLowerCase().trim();
  return clean === 'applicant@udyogsathi.gov.in' || clean === 'vijay' || clean === 'vijay.kulkarni@example.com';
}

function getScopedStorageKey(baseKey: string, userEmail?: string): string {
  if (!userEmail || isVijayUser(userEmail)) {
    return `${baseKey}_vijay`;
  }
  const safeId = userEmail.toLowerCase().replace(/[^a-z0-9]/g, '_');
  return `${baseKey}_${safeId}`;
}

// Safe LocalStorage Load Helpers
function loadFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw);
  } catch (e) {
    return defaultValue;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {}
}

export function resolveDepartmentCode(department: string): string {
  const dep = (department || '').toUpperCase();
  if (dep.includes('POLLUTION') || dep.includes('MPCB')) return 'MPCB';
  if (dep.includes('SAFETY') || dep.includes('DISH') || dep.includes('HEALTH')) return 'DISH';
  if (dep.includes('FIRE')) return 'FIRE';
  if (dep.includes('DEVELOPMENT') || dep.includes('MIDC')) return 'MIDC';
  if (dep.includes('LABOUR') || dep.includes('LABOR')) return 'LAB';
  if (dep.includes('ELECTRIC') || dep.includes('POWER') || dep.includes('MSEDCL')) return 'MSEDCL';
  if (dep.includes('REVENUE') || dep.includes('COLLECTOR')) return 'REV';
  return 'DEPT';
}

export function generateApplicationReferenceCode(departmentName: string, indexSeed: number = 0): string {
  const deptCode = resolveDepartmentCode(departmentName);
  const year = new Date().getFullYear();
  const seqNumber = Math.floor(1000 + Math.random() * 9000) + indexSeed;
  return `APP-${deptCode}-${year}-${String(seqNumber).padStart(6, '0')}`;
}

export const WorkflowStore = {
  // PROJECTS API
  getProjects(userEmail?: string): IndustrialProject[] {
    const key = getScopedStorageKey('udyogsathi_projects', userEmail);
    if (isVijayUser(userEmail)) {
      return loadFromStorage<IndustrialProject[]>(key, [DEMO_VIJAY_PROJECT]);
    }
    return loadFromStorage<IndustrialProject[]>(key, []);
  },

  getProjectById(id: string, userEmail?: string): IndustrialProject | undefined {
    const projects = this.getProjects(userEmail);
    return projects.find((p) => p.id === id);
  },

  getAccessibleApplicantProjects(userEmail?: string): IndustrialProject[] {
    const projects = this.getProjects(userEmail);
    return projects.filter((p) => (p as any).status !== 'archived' && (p as any).status !== 'deleted');
  },

  isProjectAvailableForApproval(project: IndustrialProject): boolean {
    if (!project) return false;
    const status = (project as any).status || 'active';
    return status !== 'archived' && status !== 'deleted';
  },

  resolveProjectRouteForApproval(userEmail?: string): {
    route: string;
    projectCount: number;
    selectedProject?: IndustrialProject;
  } {
    const projects = this.getAccessibleApplicantProjects(userEmail);
    if (projects.length === 0) {
      return { route: '/projects/new', projectCount: 0 };
    }
    if (projects.length === 1) {
      return {
        route: `/approval-wizard?projectId=${projects[0].id}&mode=new`,
        projectCount: 1,
        selectedProject: projects[0],
      };
    }
    return {
      route: '/select-project?returnTo=/approval-wizard',
      projectCount: projects.length,
    };
  },

  saveProject(project: IndustrialProject, userEmail?: string): void {
    const key = getScopedStorageKey('udyogsathi_projects', userEmail);
    const projects = this.getProjects(userEmail);
    const idx = projects.findIndex((p) => p.id === project.id);
    if (idx >= 0) {
      projects[idx] = project;
    } else {
      projects.unshift(project);
    }
    saveToStorage(key, projects);
  },

  // APPLICATIONS API
  getApplications(userEmail?: string, userRole?: string): WorkflowApplication[] {
    // Officers, Inspectors, and Admins view global queue records for scrutiny
    const normRole = (userRole || '').toLowerCase();
    if (normRole === 'officer' || normRole === 'department_officer' || normRole === 'inspector' || normRole === 'administrator' || normRole === 'admin') {
      const vijayKey = getScopedStorageKey('udyogsathi_applications', 'applicant@udyogsathi.gov.in');
      return loadFromStorage<WorkflowApplication[]>(vijayKey, DEMO_VIJAY_APPLICATIONS);
    }

    const key = getScopedStorageKey('udyogsathi_applications', userEmail);
    if (isVijayUser(userEmail)) {
      return loadFromStorage<WorkflowApplication[]>(key, DEMO_VIJAY_APPLICATIONS);
    }
    // Newly registered users or non-Vijay applicants start with their own empty list
    return loadFromStorage<WorkflowApplication[]>(key, []);
  },

  getApplicationById(id: string, userEmail?: string, userRole?: string): WorkflowApplication | undefined {
    const apps = this.getApplications(userEmail, userRole);
    const app = apps.find((a) => a.id === id || a.referenceNumber === id);
    if (app) return app;

    // Fallback search across Vijay's demo records if user is authorised officer/admin
    const vijayApps = loadFromStorage<WorkflowApplication[]>(
      getScopedStorageKey('udyogsathi_applications', 'applicant@udyogsathi.gov.in'),
      DEMO_VIJAY_APPLICATIONS
    );
    return vijayApps.find((a) => a.id === id || a.referenceNumber === id);
  },

  saveApplication(updatedApp: WorkflowApplication, userEmail?: string): void {
    const key = getScopedStorageKey('udyogsathi_applications', userEmail);
    const apps = loadFromStorage<WorkflowApplication[]>(key, isVijayUser(userEmail) ? DEMO_VIJAY_APPLICATIONS : []);
    const idx = apps.findIndex((a) => a.id === updatedApp.id);
    if (idx >= 0) {
      apps[idx] = updatedApp;
    } else {
      apps.unshift(updatedApp);
    }
    saveToStorage(key, apps);

    // Also sync to Vijay's global queue if officer modified it
    if (userEmail && !isVijayUser(userEmail)) {
      const vijayKey = getScopedStorageKey('udyogsathi_applications', 'applicant@udyogsathi.gov.in');
      const vApps = loadFromStorage<WorkflowApplication[]>(vijayKey, DEMO_VIJAY_APPLICATIONS);
      const vIdx = vApps.findIndex((a) => a.id === updatedApp.id);
      if (vIdx >= 0) {
        vApps[vIdx] = updatedApp;
        saveToStorage(vijayKey, vApps);
      }
    }
  },

  // REJECT APPLICATION ATOMIC WORKFLOW
  rejectApplication(
    appId: string,
    rejectionReason: string,
    officerName: string = 'Department Officer'
  ): { success: boolean; app: WorkflowApplication | null } {
    const app = this.getApplicationById(appId);
    if (!app) return { success: false, app: null };

    const nowIso = new Date().toISOString();
    const nowShort = nowIso.split('T')[0];

    // 1. Update Application Entity
    const updatedApp: WorkflowApplication = {
      ...app,
      status: 'rejected',
      decisionDetails: {
        decision: 'rejected',
        decidedByOfficer: officerName,
        decidedAt: nowShort,
        remarks: rejectionReason,
      },
    };
    this.saveApplication(updatedApp, 'applicant@udyogsathi.gov.in');

    // 2. Inspection Cleanup: Cancel all linked active/scheduled inspections
    const inspections = this.getInspections();
    let inspectionCancelled = false;

    const updatedInspections = inspections.map((insp) => {
      if (
        (insp.applicationId === app.id || insp.referenceNumber === app.referenceNumber) &&
        (insp.status === 'scheduled' || insp.status === 'in_progress')
      ) {
        inspectionCancelled = true;
        return {
          ...insp,
          status: 'cancelled' as const,
          cancellationReason: 'Application rejected by department.',
          cancelledAt: nowIso,
          cancelledByUserId: 'usr-officer-1',
        };
      }
      return insp;
    });
    saveToStorage('udyogsathi_inspections_v2', updatedInspections);

    // 3. Create Persistent Notification for Applicant ONLY
    this.addNotification({
      id: `notif-rej-${Date.now()}`,
      recipientUserId: 'usr-applicant-1',
      recipientEmail: 'applicant@udyogsathi.gov.in',
      recipientRole: 'applicant',
      relatedApplicationId: app.id,
      type: 'application_rejected',
      title: 'Application Rejected',
      message: `Your ${app.approvalTitle} application (${app.referenceNumber}) was rejected by ${app.department}. Reason: ${rejectionReason}`,
      route: `/applications/${app.id}`,
      priority: 'high',
      deliveryStatus: 'delivered_in_app',
      isRead: false,
      createdAt: nowIso,
    });

    // 4. Create Persistent Notification for Inspector (if inspection was cancelled)
    if (inspectionCancelled) {
      this.addNotification({
        id: `notif-insp-cancel-${Date.now()}`,
        recipientUserId: 'usr-inspector-1',
        recipientEmail: 'inspector@udyogsathi.gov.in',
        recipientRole: 'inspector',
        relatedApplicationId: app.id,
        type: 'inspection_cancelled',
        title: 'Inspection Cancelled',
        message: `The inspection for application ${app.referenceNumber} has been cancelled because the application was rejected.`,
        route: `/inspections`,
        priority: 'normal',
        deliveryStatus: 'delivered_in_app',
        isRead: false,
        createdAt: nowIso,
      });
    }

    // 5. Create Audit Log
    this.addAuditLog({
      id: `audit-rej-${Date.now()}`,
      eventType: 'application_rejected',
      description: `Application ${app.referenceNumber} rejected by ${officerName}. Reason: ${rejectionReason}`,
      actorUserId: 'usr-officer-1',
      actorRole: 'department_officer',
      timestamp: nowIso,
      metadata: { applicationId: app.id, rejectionReason, inspectionCancelled },
    });

    return { success: true, app: updatedApp };
  },

  // INSPECTIONS API
  getInspections(): InspectionItem[] {
    return loadFromStorage<InspectionItem[]>('udyogsathi_inspections_v2', INITIAL_INSPECTIONS);
  },

  saveInspection(inspection: InspectionItem): void {
    const list = this.getInspections();
    const idx = list.findIndex((i) => i.id === inspection.id || i.applicationId === inspection.applicationId);
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...inspection };
    } else {
      list.unshift(inspection);
    }
    saveToStorage('udyogsathi_inspections_v2', list);
  },

  getActiveInspectionsForInspector(inspectorEmail?: string, inspectorUserId?: string): InspectionItem[] {
    const inspections = this.getInspections();
    const apps = this.getApplications('applicant@udyogsathi.gov.in');

    const appStatusMap = new Map(apps.map((a) => [a.id, a.status]));
    const appRefStatusMap = new Map(apps.map((a) => [a.referenceNumber, a.status]));

    return inspections.filter((insp) => {
      if (insp.status === 'cancelled') return false;

      const appStatus = appStatusMap.get(insp.applicationId) || appRefStatusMap.get(insp.referenceNumber);
      if (appStatus === 'rejected' || appStatus === 'closed') {
        return false;
      }

      // If inspector ID or Email is passed, scope to assigned inspector
      if (inspectorUserId || inspectorEmail) {
        const matchesId = insp.assignedInspectorId && (insp.assignedInspectorId === inspectorUserId || inspectorUserId === 'usr-inspector-1');
        const matchesEmail = inspectorEmail && (inspectorEmail === 'inspector@udyogsathi.gov.in' || insp.ownerUserEmail === inspectorEmail);
        return matchesId || matchesEmail || insp.isDemoSandboxRecord;
      }

      return true;
    });
  },

  getCancelledInspections(): InspectionItem[] {
    const inspections = this.getInspections();
    const apps = this.getApplications('applicant@udyogsathi.gov.in');

    const appStatusMap = new Map(apps.map((a) => [a.id, a.status]));
    const appRefStatusMap = new Map(apps.map((a) => [a.referenceNumber, a.status]));

    return inspections.filter((insp) => {
      if (insp.status === 'cancelled') return true;
      const appStatus = appStatusMap.get(insp.applicationId) || appRefStatusMap.get(insp.referenceNumber);
      return appStatus === 'rejected';
    });
  },

  submitInspectionReport({
    inspectionId,
    recommendation,
    reportSummary,
    inspectorName = 'Rajendra Deshmukh (Inspector)',
    isFastDemoSandbox = false,
  }: {
    inspectionId: string;
    recommendation: 'RECOMMEND_APPROVAL' | 'RECOMMEND_REJECTION' | 'REQUIRE_CLARIFICATION' | string;
    reportSummary: string;
    inspectorName?: string;
    isFastDemoSandbox?: boolean;
  }): { success: boolean; app: WorkflowApplication | null } {
    const inspections = this.getInspections();
    const insp = inspections.find((i) => i.id === inspectionId || i.applicationId === inspectionId);
    if (!insp) return { success: false, app: null };

    const nowIso = new Date().toISOString();

    // 1. Update Inspection Entity
    insp.status = 'completed';
    insp.completedAt = nowIso;
    insp.recommendation = recommendation;
    insp.reportSummary = reportSummary;
    this.saveInspection(insp);

    // 2. Fetch linked Application
    const app = this.getApplicationById(insp.applicationId) || this.getApplicationById(insp.referenceNumber);
    if (!app) return { success: true, app: null };

    // 3. Determine new application status & decision details based on Fast Demo Sandbox vs Normal Workflow
    let newAppStatus: any = 'inspection_completed';
    let decisionObj: any = undefined;

    if (isFastDemoSandbox) {
      if (recommendation === 'RECOMMEND_APPROVAL' || recommendation === 'APPROVED') {
        newAppStatus = 'approved';
        decisionObj = {
          decision: 'approved' as const,
          decidedByOfficer: `${inspectorName} (Fast Demo Sandbox Inspector Decision)`,
          decidedAt: nowIso.split('T')[0],
          remarks: reportSummary || 'Approved — Demo Inspector Recommendation',
          certificateNumber: `CERT-${app.department.slice(0, 4).toUpperCase()}-${Date.now().toString().slice(-6)}`,
          validityExpiryDate: new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0],
        };
      } else if (recommendation === 'RECOMMEND_REJECTION' || recommendation === 'REJECTED') {
        newAppStatus = 'rejected';
        decisionObj = {
          decision: 'rejected' as const,
          decidedByOfficer: `${inspectorName} (Fast Demo Sandbox Inspector Decision)`,
          decidedAt: nowIso.split('T')[0],
          remarks: reportSummary || 'Rejected — Demo Inspector Recommendation',
        };
      } else {
        newAppStatus = 'query_raised';
      }
    } else {
      newAppStatus = 'under_scrutiny';
    }

    const updatedApp: WorkflowApplication = {
      ...app,
      status: newAppStatus,
      decisionDetails: decisionObj || app.decisionDetails,
      inspectionDetails: {
        inspectionId: insp.id,
        inspectorName,
        scheduledDate: insp.scheduledDate,
        scheduledTime: insp.scheduledTime,
        venue: insp.venue,
        status: 'completed',
        reportSummary,
      },
      timelineHistory: [
        ...(app.timelineHistory || []),
        {
          id: `tl-insp-${Date.now()}`,
          action: 'Field Inspection Completed & Report Submitted',
          previousStatus: app.status,
          newStatus: newAppStatus,
          performedBy: inspectorName,
          timestamp: nowIso,
          remarks: `Recommendation: ${recommendation}. ${reportSummary}`,
        },
      ],
    };

    this.saveApplication(updatedApp, 'applicant@udyogsathi.gov.in');

    // 4. Create Targeted Notification for Applicant
    this.addNotification({
      id: `notif-app-report-${Date.now()}`,
      recipientUserId: app.projectId ? app.projectId : 'usr-applicant-1',
      recipientEmail: 'applicant@udyogsathi.gov.in',
      recipientRole: 'applicant',
      relatedApplicationId: app.id,
      type: 'inspection_scheduled',
      title: isFastDemoSandbox
        ? `Application ${newAppStatus === 'approved' ? 'Approved' : newAppStatus === 'rejected' ? 'Rejected' : 'Reviewed'} — Demo Inspector Recommendation`
        : `Inspection Completed for ${app.approvalTitle}`,
      message: `Field inspection report submitted by ${inspectorName}. Status updated to ${newAppStatus.replace(/_/g, ' ')}.`,
      route: `/applications/${app.id}`,
      priority: 'high',
      deliveryStatus: 'delivered_in_app',
      isRead: false,
      createdAt: nowIso,
    });

    // 5. Create Notification for Department Officer Queue
    this.addNotification({
      id: `notif-off-report-${Date.now()}`,
      recipientUserId: 'usr-officer-1',
      recipientEmail: 'officer@udyogsathi.gov.in',
      recipientRole: 'department_officer',
      relatedApplicationId: app.id,
      type: 'inspection_scheduled',
      title: `Inspection Report Ready for Review: ${app.referenceNumber}`,
      message: `Inspector ${inspectorName} submitted report for ${app.approvalTitle}. Recommendation: ${recommendation}.`,
      route: `/applications/${app.id}`,
      priority: 'normal',
      deliveryStatus: 'delivered_in_app',
      isRead: false,
      createdAt: nowIso,
    });

    // 6. Audit Log
    this.addAuditLog({
      id: `audit-insp-report-${Date.now()}`,
      eventType: 'inspection_report_submitted',
      description: `Inspection report submitted for ${app.referenceNumber}. Recommendation: ${recommendation}.`,
      actorUserId: 'usr-inspector-1',
      actorRole: 'inspector',
      timestamp: nowIso,
      metadata: { inspectionId, recommendation, isFastDemoSandbox },
    });

    return { success: true, app: updatedApp };
  },

  makeOfficerDecision({
    applicationId,
    decision,
    officerName = 'Department Officer',
    remarks,
    rejectionReason,
  }: {
    applicationId: string;
    decision: 'approved' | 'rejected' | 'returned_for_correction' | 'query_raised';
    officerName?: string;
    remarks: string;
    rejectionReason?: string;
  }): { success: boolean; app: WorkflowApplication | null } {
    const app = this.getApplicationById(applicationId);
    if (!app) return { success: false, app: null };

    const nowIso = new Date().toISOString();
    const nowShort = nowIso.split('T')[0];

    let newStatus: any = decision;
    if (decision === 'approved') newStatus = 'approved';
    if (decision === 'rejected') newStatus = 'rejected';
    if (decision === 'returned_for_correction') newStatus = 'returned_for_correction';

    const updatedApp: WorkflowApplication = {
      ...app,
      status: newStatus,
      decisionDetails: {
        decision: decision as any,
        decidedByOfficer: officerName,
        decidedAt: nowShort,
        remarks: remarks || rejectionReason || 'Department sandbox decision recorded.',
        certificateNumber: decision === 'approved' ? `CERT-${app.department.slice(0, 4).toUpperCase()}-${Date.now().toString().slice(-6)}` : undefined,
        validityExpiryDate: decision === 'approved' ? new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0] : undefined,
      },
      timelineHistory: [
        ...(app.timelineHistory || []),
        {
          id: `tl-off-dec-${Date.now()}`,
          action: `Department Officer Decision: ${decision.toUpperCase()}`,
          previousStatus: app.status,
          newStatus,
          performedBy: officerName,
          timestamp: nowIso,
          remarks: remarks || rejectionReason,
        },
      ],
    };

    this.saveApplication(updatedApp, 'applicant@udyogsathi.gov.in');

    // Handle rejection cleanup
    if (decision === 'rejected') {
      const inspections = this.getInspections();
      const updatedInspections = inspections.map((insp) => {
        if (
          (insp.applicationId === app.id || insp.referenceNumber === app.referenceNumber) &&
          (insp.status === 'scheduled' || insp.status === 'in_progress')
        ) {
          return {
            ...insp,
            status: 'cancelled' as const,
            cancellationReason: rejectionReason || 'Application rejected by department officer.',
            cancelledAt: nowIso,
          };
        }
        return insp;
      });
      saveToStorage('udyogsathi_inspections_v2', updatedInspections);
    }

    // Targeted notification to Applicant
    this.addNotification({
      id: `notif-app-dec-${Date.now()}`,
      recipientUserId: 'usr-applicant-1',
      recipientEmail: 'applicant@udyogsathi.gov.in',
      recipientRole: 'applicant',
      relatedApplicationId: app.id,
      type: decision === 'rejected' ? 'application_rejected' : 'welcome',
      title: `Application ${decision.toUpperCase().replace(/_/g, ' ')} — Demo Sandbox`,
      message: `Your ${app.approvalTitle} (${app.referenceNumber}) decision recorded: ${decision.toUpperCase()}. Remarks: ${remarks || rejectionReason || 'None'}`,
      route: `/applications/${app.id}`,
      priority: 'high',
      deliveryStatus: 'delivered_in_app',
      isRead: false,
      createdAt: nowIso,
    });

    // Audit Log
    this.addAuditLog({
      id: `audit-off-dec-${Date.now()}`,
      eventType: `application_${decision}`,
      description: `Application ${app.referenceNumber} ${decision} by ${officerName}.`,
      actorUserId: 'usr-officer-1',
      actorRole: 'department_officer',
      timestamp: nowIso,
      metadata: { applicationId: app.id, decision, remarks },
    });

    return { success: true, app: updatedApp };
  },

  // NOTIFICATIONS API — STRICTCITY SCOPED BY RECIPIENT EMAIL / ROLE
  getNotifications(userEmail?: string, userRole?: string): PersistentNotification[] {
    const allNotifs = loadFromStorage<PersistentNotification[]>('udyogsathi_notifications_v2', INITIAL_NOTIFICATIONS);

    if (isVijayUser(userEmail)) {
      return allNotifs.filter(
        (n) => n.recipientEmail === 'applicant@udyogsathi.gov.in' || n.recipientUserId === 'usr-applicant-1'
      );
    }

    if (userEmail === 'officer@udyogsathi.gov.in' || userRole === 'department_officer' || userRole === 'OFFICER') {
      return allNotifs.filter((n) => n.recipientRole === 'department_officer' || n.recipientRole === 'officer');
    }

    if (userEmail === 'inspector@udyogsathi.gov.in' || userRole === 'inspector' || userRole === 'INSPECTOR') {
      return allNotifs.filter((n) => n.recipientRole === 'inspector');
    }

    if (userEmail === 'admin@udyogsathi.gov.in' || userRole === 'administrator' || userRole === 'ADMIN') {
      return allNotifs;
    }

    // Newly registered users or non-Vijay applicants see ONLY their own notifications (or welcome message)
    const userNotifs = allNotifs.filter((n) => n.recipientEmail === userEmail);
    if (userNotifs.length === 0) {
      return [
        {
          id: `welcome-${userEmail}`,
          recipientUserId: userEmail || 'new-user',
          recipientEmail: userEmail,
          recipientRole: 'applicant',
          type: 'welcome',
          title: 'Welcome to UdyogSathi Workspace',
          message: 'Your isolated applicant workspace is ready. Start your approval roadmap or upload documents to your vault.',
          route: '/approval-wizard',
          priority: 'normal',
          deliveryStatus: 'delivered_in_app',
          isRead: false,
          createdAt: new Date().toISOString(),
        },
      ];
    }
    return userNotifs;
  },

  addNotification(notif: PersistentNotification): void {
    const list = loadFromStorage<PersistentNotification[]>('udyogsathi_notifications_v2', INITIAL_NOTIFICATIONS);
    list.unshift(notif);
    saveToStorage('udyogsathi_notifications_v2', list);
  },

  markNotificationRead(id: string): void {
    const list = loadFromStorage<PersistentNotification[]>('udyogsathi_notifications_v2', INITIAL_NOTIFICATIONS);
    const item = list.find((n) => n.id === id);
    if (item) {
      item.isRead = true;
      item.deliveryStatus = 'read';
      saveToStorage('udyogsathi_notifications_v2', list);
    }
  },

  // AUDIT LOGS API
  getAuditLogs(): PersistentAuditLog[] {
    return loadFromStorage<PersistentAuditLog[]>('udyogsathi_audit_logs_v2', INITIAL_AUDIT_LOGS);
  },

  addAuditLog(log: PersistentAuditLog): void {
    const logs = this.getAuditLogs();
    logs.unshift(log);
    saveToStorage('udyogsathi_audit_logs_v2', logs);
  },

  // DOCUMENTS API — STRICTCITY SCOPED BY OWNER USER
  getVaultDocuments(userEmail?: string): VaultDocument[] {
    const key = getScopedStorageKey('udyogsathi_vault_documents', userEmail);
    if (isVijayUser(userEmail)) {
      return loadFromStorage<VaultDocument[]>(key, DEMO_VIJAY_VAULT_DOCUMENTS);
    }
    // Newly registered users or non-Vijay applicants start with empty vault
    return loadFromStorage<VaultDocument[]>(key, []);
  },

  saveVaultDocument(doc: VaultDocument, userEmail?: string): void {
    const key = getScopedStorageKey('udyogsathi_vault_documents', userEmail);
    const docs = this.getVaultDocuments(userEmail);
    const idx = docs.findIndex((d) => d.id === doc.id);
    if (idx >= 0) {
      docs[idx] = doc;
    } else {
      docs.unshift(doc);
    }
    saveToStorage(key, docs);
  },

  replaceVaultDocument(
    oldDocId: string,
    newFileName: string,
    newFileUrl: string,
    newFileSize: number,
    userEmail?: string
  ): VaultDocument | null {
    const docs = this.getVaultDocuments(userEmail);
    const oldDoc = docs.find((d) => d.id === oldDocId);
    if (!oldDoc) return null;

    // Mark old document as superseded
    oldDoc.status = 'superseded';
    oldDoc.verificationStatus = 'superseded';
    oldDoc.isLatestVersion = false;
    oldDoc.supersededByDocumentId = `doc-v${oldDoc.documentVersion + 1}-${Date.now()}`;
    this.saveVaultDocument(oldDoc, userEmail);

    // Create new document version
    const newDoc: VaultDocument = {
      ...oldDoc,
      id: oldDoc.supersededByDocumentId,
      fileName: newFileName,
      fileUrl: newFileUrl,
      fileSize: newFileSize,
      uploadedAt: new Date().toISOString(),
      documentVersion: oldDoc.documentVersion + 1,
      parentDocumentId: oldDoc.id,
      isLatestVersion: true,
      status: 'uploaded',
      verificationStatus: 'verification_pending',
      preValidationStatus: 'pre_validation_passed',
      preValidationResult: {
        readinessScore: 95,
        summary: 'Newly replaced document pre-validated successfully with 95% readiness score.',
      },
    };

    this.saveVaultDocument(newDoc, userEmail);

    this.addAuditLog({
      id: `audit-doc-rep-${Date.now()}`,
      eventType: 'document_replaced',
      description: `Document '${oldDoc.documentName}' replaced with version ${newDoc.documentVersion}.`,
      actorUserId: userEmail || oldDoc.ownerUserId,
      actorRole: 'applicant',
      timestamp: new Date().toISOString(),
    });

    return newDoc;
  },

  // RESOURCE OWNERSHIP CHECKING HELPER
  checkResourceOwnership(
    userEmail: string | undefined,
    userRole: string | undefined,
    resourceType: 'application' | 'project' | 'document' | 'inspection',
    resourceId: string
  ): boolean {
    const normRole = (userRole || '').toLowerCase();
    // Administrators can inspect all records in admin context
    if (normRole === 'administrator' || normRole === 'admin') return true;

    // Officers can inspect department applications
    if ((normRole === 'department_officer' || normRole === 'officer') && resourceType === 'application') return true;

    // Inspectors can inspect assigned inspections
    if ((normRole === 'inspector') && resourceType === 'inspection') return true;

    // Non-Vijay applicants cannot access Vijay's demo records (e.g. app-8801, proj-1) unless they own them!
    if (!isVijayUser(userEmail)) {
      const userApps = this.getApplications(userEmail, userRole);
      const userProjs = this.getProjects(userEmail);
      const userDocs = this.getVaultDocuments(userEmail);

      if (resourceType === 'application') return userApps.some((a) => a.id === resourceId || a.referenceNumber === resourceId);
      if (resourceType === 'project') return userProjs.some((p) => p.id === resourceId);
      if (resourceType === 'document') return userDocs.some((d) => d.id === resourceId);
      return false;
    }

    return true;
  },
};
