'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { TopUtilityBar } from '@/components/layout/TopUtilityBar';
import { OfficialHeader } from '@/components/layout/OfficialHeader';
import { Footer } from '@/components/layout/Footer';
import { DisclaimerBanner } from '@/components/common/DisclaimerBanner';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { JourneyStepper } from '@/components/journey/JourneyStepper';
import { useAuth } from '@/context/AuthContext';
import { normalizeRole } from '@/lib/rbac';
import {
  DEMO_VIJAY_APPLICATIONS,
  DEMO_VIJAY_PROJECT,
  WorkflowApplication,
} from '@/lib/workflow-engine';
import { DEMO_VIJAY_VAULT_DOCUMENTS, VaultDocument } from '@/lib/document-reuse';
import { ROUTES } from '@/lib/routes';
import {
  FileText,
  Clock,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  MessageSquareWarning,
  SearchCheck,
  Download,
  Layers,
  ArrowLeft,
  ArrowRight,
  Send,
  Upload,
  UserCheck,
  Sparkles,
  FileCheck,
  X,
} from 'lucide-react';
import { WorkflowStore } from '@/lib/workflow-store';

export default function ApplicationScrutinyWorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const appId = (params?.id as string) || 'app-8802';

  const { currentUser } = useAuth();
  const userEmail = currentUser?.email || 'applicant@udyogsathi.gov.in';
  const userRole = currentUser?.role || 'APPLICANT';

  const isAuthorized = WorkflowStore.checkResourceOwnership(userEmail, userRole, 'application', appId);

  const [currentLang, setCurrentLang] = useState('en');
  const [userRoleMode, setUserRoleMode] = useState<'APPLICANT' | 'OFFICER' | 'INSPECTOR'>('APPLICANT');

  // Find target application from WorkflowStore or seed database
  const [appState, setAppState] = useState<WorkflowApplication>(() => {
    return WorkflowStore.getApplicationById(appId as string, userEmail, userRole) || DEMO_VIJAY_APPLICATIONS[1];
  });
  const [vaultDocs] = useState<VaultDocument[]>(DEMO_VIJAY_VAULT_DOCUMENTS);

  const [dbInspection, setDbInspection] = useState<{
    _id?: string;
    inspectionReference?: string;
    status?: string;
    inspectionResult?: string;
    recommendation?: string;
    reportSummary?: string;
    submittedAt?: string;
    scheduledDate?: string;
    inspectorName?: string;
  } | null>(null);

  useEffect(() => {
    async function fetchAppData() {
      try {
        const res = await fetch(`/api/applications/${appId}`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.application) {
            const app = json.application;
            if (app.inspections && app.inspections.length > 0) {
              const insp = app.inspections[0];
              setDbInspection({
                _id: insp._id || insp.id,
                inspectionReference: insp.inspectionReference,
                status: insp.status,
                inspectionResult: insp.inspectionResult,
                recommendation: insp.recommendation,
                reportSummary: insp.reportSummary,
                submittedAt: insp.submittedAt || insp.completedAt,
                scheduledDate: insp.scheduledDate,
                inspectorName: insp.inspectorName,
              });
            }
          }
        }
      } catch (err) {
        console.error('Error fetching application/inspection details:', err);
      }
    }
    if (appId) {
      fetchAppData();
    }
  }, [appId]);

  // Success toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Applicant query response state
  const [responseText, setResponseText] = useState('');
  const [isSubmittingResponse, setIsSubmittingResponse] = useState(false);
  const [responseSuccessMsg, setResponseSuccessMsg] = useState(false);

  // 1-Click Vault Reuse state
  const [isReusingDocs, setIsReusingDocs] = useState(false);
  const [reusedSuccessMsg, setReusedSuccessMsg] = useState(false);

  // Officer action modal states
  const [showRaiseQueryModal, setShowRaiseQueryModal] = useState(false);
  const [showDecisionModal, setShowDecisionModal] = useState(false);
  const [showScheduleInspectionModal, setShowScheduleInspectionModal] = useState(false);
  const [newQueryText, setNewQueryText] = useState('');
  const [decisionChoice, setDecisionChoice] = useState<'approved' | 'rejected' | 'returned_for_correction'>('approved');
  const [decisionRemarks, setDecisionRemarks] = useState('');

  // Schedule Inspection Form State
  const [inspDate, setInspDate] = useState('2026-09-05');
  const [inspTime, setInspTime] = useState('11:30 AM');
  const [inspInspector, setInspInspector] = useState('Rajendra Deshmukh (DISH Senior Inspector)');
  const [inspInstructions, setInspInstructions] = useState('Conduct factory safety audit and fire sprinkler pressure test.');

  const handleReuseAllDocs = () => {
    setIsReusingDocs(true);
    setTimeout(() => {
      const updated = {
        ...appState,
        reusedDocumentIds: ['doc-pan-1', 'doc-gst-v2', 'doc-coi-1', 'doc-addr-1'],
        readinessScore: 100,
        status: 'ready_for_submission' as const,
      };
      setAppState(updated);
      WorkflowStore.saveApplication(updated);
      setIsReusingDocs(false);
      setReusedSuccessMsg(true);
      setTimeout(() => setReusedSuccessMsg(false), 4000);
    }, 800);
  };

  const handleSubmitDemoApplication = () => {
    const updated = {
      ...appState,
      status: 'submitted' as const,
      submittedAt: new Date().toISOString().split('T')[0],
      slaState: 'on_track' as const,
    };
    setAppState(updated);
    WorkflowStore.saveApplication(updated);
    setToastMessage('Application submitted successfully to sandbox department queue.');
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleSubmitQueryResponse = () => {
    if (!responseText.trim()) return;
    setIsSubmittingResponse(true);
    setTimeout(() => {
      const updated = {
        ...appState,
        status: 'under_scrutiny' as const,
        slaState: 'on_track' as const,
        queryDetails: appState.queryDetails
          ? {
              ...appState.queryDetails,
              applicantResponse: responseText,
              respondedAt: new Date().toISOString().split('T')[0],
            }
          : undefined,
      };
      setAppState(updated);
      WorkflowStore.saveApplication(updated);

      // Create notification for Officer
      WorkflowStore.addNotification({
        id: `notif-resp-${Date.now()}`,
        recipientUserId: 'usr-officer-1',
        recipientRole: 'department_officer',
        relatedApplicationId: appState.id,
        type: 'query_raised',
        title: 'Applicant Responded to Query',
        message: `Vijay Kulkarni responded to query on ${appState.referenceNumber}.`,
        route: `/applications/${appState.id}`,
        priority: 'normal',
        deliveryStatus: 'delivered_in_app',
        isRead: false,
        createdAt: new Date().toISOString(),
      });

      setIsSubmittingResponse(false);
      setResponseSuccessMsg(true);
      setTimeout(() => setResponseSuccessMsg(false), 4000);
    }, 800);
  };

  const handleOfficerRecordDecision = () => {
    if (!decisionRemarks.trim()) return;

    if (decisionChoice === 'rejected') {
      // Execute Atomic Persistent Rejection Workflow
      const res = WorkflowStore.rejectApplication(
        appState.id,
        decisionRemarks,
        'MPCB Senior Regional Officer (Pune Zone)'
      );
      if (res.app) {
        setAppState(res.app);
      }
      setToastMessage(
        'Application rejected. The applicant has been notified and related active inspections have been cancelled.'
      );
      setTimeout(() => setToastMessage(null), 5000);
    } else {
      const updated: WorkflowApplication = {
        ...appState,
        status: decisionChoice,
        decisionDetails: {
          decision: decisionChoice,
          decidedByOfficer: 'MPCB Senior Regional Officer (Pune Zone)',
          decidedAt: new Date().toISOString().split('T')[0],
          remarks: decisionRemarks,
          certificateNumber:
            decisionChoice === 'approved'
              ? `MPCB/CTE/PN/2026/${Math.floor(1000 + Math.random() * 9000)}`
              : undefined,
          validityExpiryDate: decisionChoice === 'approved' ? '2031-08-31' : undefined,
        },
      };
      setAppState(updated);
      WorkflowStore.saveApplication(updated);

      WorkflowStore.addNotification({
        id: `notif-dec-${Date.now()}`,
        recipientUserId: 'usr-applicant-1',
        recipientRole: 'applicant',
        relatedApplicationId: appState.id,
        type: decisionChoice === 'approved' ? 'document_verified' : 'query_raised',
        title: decisionChoice === 'approved' ? 'Application Approved!' : 'Application Returned for Correction',
        message: `Your ${appState.approvalTitle} application (${appState.referenceNumber}) decision: ${decisionChoice.toUpperCase()}.`,
        route: `/applications/${appState.id}`,
        priority: 'high',
        deliveryStatus: 'delivered_in_app',
        isRead: false,
        createdAt: new Date().toISOString(),
      });

      setToastMessage(`Decision recorded successfully as ${decisionChoice.toUpperCase()}.`);
      setTimeout(() => setToastMessage(null), 4000);
    }

    setShowDecisionModal(false);
  };

  const handleExecuteScheduleInspection = () => {
    if (!inspDate.trim()) return;

    const nowIso = new Date().toISOString();
    const newInspId = `INSP-2026-${Math.floor(100 + Math.random() * 900)}`;

    const newInsp = {
      id: newInspId,
      applicationId: appState.id,
      referenceNumber: appState.referenceNumber,
      title: `${appState.approvalTitle} Site Audit`,
      department: appState.department,
      unitName: appState.projectName,
      inspectorName: inspInspector,
      scheduledDate: inspDate,
      scheduledTime: inspTime,
      venue: 'Plot C-14, Chakan MIDC Phase II, Pune',
      status: 'scheduled' as const,
      requirements: ['Architectural Blueprint', 'Fire Safety Test Report', 'Structural Stability Certificate'],
      ownerUserEmail: 'applicant@udyogsathi.gov.in',
    };

    // Save inspection in store
    const existingInspections = WorkflowStore.getInspections();
    existingInspections.unshift(newInsp);
    if (typeof window !== 'undefined') {
      localStorage.setItem('udyogsathi_inspections_v2', JSON.stringify(existingInspections));
    }

    // Update Application Record
    const updatedApp: WorkflowApplication = {
      ...appState,
      status: 'inspection_scheduled',
      inspectionDetails: {
        inspectionId: newInspId,
        inspectorName: inspInspector,
        scheduledDate: inspDate,
        scheduledTime: inspTime,
        venue: newInsp.venue,
        status: 'scheduled',
        evidenceCount: 0,
      },
    };
    setAppState(updatedApp);
    WorkflowStore.saveApplication(updatedApp);

    // 1. Notify Applicant ONLY
    WorkflowStore.addNotification({
      id: `notif-insp-app-${Date.now()}`,
      recipientUserId: 'usr-applicant-1',
      recipientEmail: 'applicant@udyogsathi.gov.in',
      recipientRole: 'applicant',
      relatedApplicationId: appState.id,
      type: 'inspection_scheduled',
      title: `Field Inspection Scheduled for ${inspDate}`,
      message: `Inspector ${inspInspector} has scheduled site audit for ${appState.referenceNumber} on ${inspDate} at ${inspTime}.`,
      route: `/inspections`,
      priority: 'high',
      deliveryStatus: 'delivered_in_app',
      isRead: false,
      createdAt: nowIso,
    });

    // 2. Notify Assigned Inspector ONLY
    WorkflowStore.addNotification({
      id: `notif-insp-inspector-${Date.now()}`,
      recipientUserId: 'usr-inspector-1',
      recipientEmail: 'inspector@udyogsathi.gov.in',
      recipientRole: 'inspector',
      relatedApplicationId: appState.id,
      type: 'inspection_scheduled',
      title: `New Field Audit Assigned: ${appState.referenceNumber}`,
      message: `You have been assigned to conduct field inspection for ${appState.projectName} on ${inspDate} at ${inspTime}.`,
      route: `/inspector/dashboard`,
      priority: 'high',
      deliveryStatus: 'delivered_in_app',
      isRead: false,
      createdAt: nowIso,
    });

    // 3. Create Audit Log
    WorkflowStore.addAuditLog({
      id: `audit-insp-${Date.now()}`,
      eventType: 'inspection_scheduled',
      description: `Field inspection scheduled for application ${appState.referenceNumber} assigned to ${inspInspector}.`,
      actorUserId: 'usr-officer-1',
      actorRole: 'department_officer',
      timestamp: nowIso,
    });

    setShowScheduleInspectionModal(false);
    setToastMessage(`Inspection scheduled for ${inspDate} and assigned to ${inspInspector}.`);
    setTimeout(() => setToastMessage(null), 5000);
  };

  if (!isAuthorized) {
    return (
      <ProtectedRoute>
        <div className="bg-[#f7f9fc] min-h-screen flex flex-col font-sans">
          <TopUtilityBar currentLang={currentLang} onLanguageChange={setCurrentLang} />
          <OfficialHeader currentLang={currentLang} />
          <DisclaimerBanner lang={currentLang} />
          <main className="flex-1 py-12 px-4 max-w-2xl mx-auto w-full text-center space-y-6">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-red-200 space-y-4">
              <AlertTriangle className="w-12 h-12 text-red-600 mx-auto" />
              <h2 className="text-xl font-bold text-govBlue">Record Access Restricted</h2>
              <p className="text-xs text-govMuted leading-relaxed">
                You do not have permission to view or manage statutory application record <strong className="font-mono text-slate-800">{appId}</strong>. This record belongs to another industrial entity workspace.
              </p>
              <div className="pt-2">
                <Link
                  href="/applications"
                  className="bg-govBlue text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow hover:bg-govBlue-dark inline-flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" /> Return to My Applications Workspace
                </Link>
              </div>
            </div>
          </main>
          <Footer />
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="bg-[#f7f9fc] min-h-screen flex flex-col font-sans">
        <TopUtilityBar currentLang={currentLang} onLanguageChange={setCurrentLang} />
        <OfficialHeader currentLang={currentLang} />
        <DisclaimerBanner lang={currentLang} />

        <main id="main-content" className="flex-1 py-8 px-4 max-w-7xl mx-auto w-full space-y-6">
          {/* Top Breadcrumb & Role Switcher Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-govBorder pb-4">
            <div className="flex items-center gap-2 text-xs text-govMuted">
              <Link href={ROUTES.dashboard} className="hover:text-govBlue">Workspace</Link>
              <span>/</span>
              <Link href={ROUTES.applications} className="hover:text-govBlue">Applications</Link>
              <span>/</span>
              <span className="font-mono font-bold text-govBlue">{appState.referenceNumber}</span>
            </div>

            {/* Role View Switcher */}
            <div className="bg-slate-200/80 p-1 rounded-xl flex items-center gap-1 text-xs">
              <span className="text-[11px] font-bold text-slate-600 px-2">View As Role:</span>
              <button
                onClick={() => setUserRoleMode('APPLICANT')}
                className={`px-3 py-1 rounded-lg font-bold text-xs transition-all ${
                  userRoleMode === 'APPLICANT'
                    ? 'bg-govBlue text-white shadow'
                    : 'text-slate-700 hover:bg-slate-300/60'
                }`}
              >
                Applicant
              </button>
              <button
                onClick={() => setUserRoleMode('OFFICER')}
                className={`px-3 py-1 rounded-lg font-bold text-xs transition-all ${
                  userRoleMode === 'OFFICER'
                    ? 'bg-saffron text-white shadow'
                    : 'text-slate-700 hover:bg-slate-300/60'
                }`}
              >
                Department Officer
              </button>
              <button
                onClick={() => setUserRoleMode('INSPECTOR')}
                className={`px-3 py-1 rounded-lg font-bold text-xs transition-all ${
                  userRoleMode === 'INSPECTOR'
                    ? 'bg-purple-700 text-white shadow'
                    : 'text-slate-700 hover:bg-slate-300/60'
                }`}
              >
                Field Inspector
              </button>
            </div>
          </div>

          {/* Application Header Card */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-govBorder space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-govBlue bg-govBlue-50 px-2.5 py-0.5 rounded border border-govBlue/20">
                    {appState.referenceNumber}
                  </span>
                  <Badge variant="blue">{appState.department}</Badge>
                  <span className="bg-saffron/10 text-saffron font-bold text-[10px] px-2 py-0.5 rounded border border-saffron/30">
                    Demo Department Workflow Layer
                  </span>
                </div>
                <h1 className="text-xl font-bold text-slate-900">{appState.approvalTitle}</h1>
                <p className="text-xs text-govMuted">
                  Project: <strong className="text-govBlue">{appState.projectName}</strong> | Statutory Act: {appState.statutoryAct}
                </p>
              </div>

              <div className="space-y-2 text-right">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                  <div className="text-slate-500 text-[11px]">Statutory SLA Target</div>
                  <div className="text-base font-extrabold text-govBlue">{appState.slaDaysRemaining} Days Remaining</div>
                  <div className="text-[10px] text-green-700 font-bold">Total SLA: {appState.slaDaysTotal} Days</div>
                </div>
              </div>
            </div>

            {/* Application Progress Stepper */}
            {normalizeRole(currentUser?.role) === 'applicant' && (
              <JourneyStepper activeStep={5} lang={currentLang} compact />
            )}
          </div>

          {/* 1-CLICK VERIFIED DOCUMENT REUSE BANNER (For Applicants on Ready / Draft apps) */}
          {userRoleMode === 'APPLICANT' && (appState.status === 'ready_for_submission' || appState.status === 'draft') && (
            <div className="bg-gradient-to-r from-govBlue to-govBlue-dark text-white p-6 rounded-2xl shadow-md space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="bg-saffron text-white font-extrabold text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded shadow">
                      Verified Document Reuse Available
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-saffron" /> 4 Verified Vault Documents Matched
                  </h3>
                  <p className="text-xs text-slate-200">
                    Your PAN Card, GST Certificate, Incorporation Certificate, and Address Proof are verified in your vault.
                  </p>
                </div>

                <button
                  onClick={handleReuseAllDocs}
                  disabled={isReusingDocs || appState.reusedDocumentIds.length === 4}
                  className="bg-saffron hover:bg-saffron-dark text-white text-xs font-extrabold px-5 py-3 rounded-xl shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isReusingDocs ? 'Reusing Vault Docs...' : 'Reuse All 4 Verified Documents'}</span>
                </button>
              </div>

              {reusedSuccessMsg && (
                <div className="bg-green-500/20 text-green-200 p-3 rounded-lg text-xs font-bold border border-green-400/40 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-300" />
                  <span>4 verified documents attached! Application readiness score increased to 100%.</span>
                </div>
              )}
            </div>
          )}

          {/* QUERY RAISED PANEL (If query is active) */}
          {appState.status === 'query_raised' && appState.queryDetails && (
            <div className="bg-amber-50 border-2 border-amber-400 p-6 rounded-2xl shadow-md space-y-4 text-xs text-amber-950">
              <div className="flex items-center justify-between border-b border-amber-300 pb-3">
                <div className="flex items-center gap-2">
                  <MessageSquareWarning className="w-6 h-6 text-amber-600" />
                  <div>
                    <h3 className="text-base font-bold text-amber-950">Official Officer Query Raised</h3>
                    <div className="text-[11px] text-amber-800">
                      Raised by: {appState.queryDetails.raisedByOfficer} on {appState.queryDetails.raisedAt.split('T')[0]}
                    </div>
                  </div>
                </div>

                <span className="bg-red-600 text-white font-extrabold text-[10px] px-2.5 py-1 rounded shadow">
                  Deadline: {appState.queryDetails.responseDeadline.split('T')[0]}
                </span>
              </div>

              <div className="bg-white p-4 rounded-xl border border-amber-300 font-medium text-slate-800">
                <strong className="block text-amber-900 mb-1 font-bold text-xs">Query Text:</strong>
                {appState.queryDetails.queryText}
              </div>

              {/* Applicant Response Form */}
              {userRoleMode === 'APPLICANT' && (
                <div className="space-y-3 pt-2">
                  <label className="font-bold text-amber-950 block text-xs">Your Clarification & Response *</label>
                  <textarea
                    rows={3}
                    value={responseText}
                    onChange={e => setResponseText(e.target.value)}
                    placeholder="Type your official clarification, calculations, or details for the scrutinising officer..."
                    className="w-full p-3 border border-amber-300 rounded-xl focus:ring-2 focus:ring-amber-500 text-xs bg-white"
                  />

                  <div className="flex items-center justify-between">
                    <button
                      onClick={handleReuseAllDocs}
                      className="text-xs text-amber-900 hover:underline font-bold flex items-center gap-1"
                    >
                      <Layers className="w-3.5 h-3.5 text-saffron" />
                      <span>Attach Verified Document from Vault</span>
                    </button>

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleSubmitQueryResponse}
                      isLoading={isSubmittingResponse}
                      leftIcon={<Send className="w-3.5 h-3.5" />}
                    >
                      Submit Official Response
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* DECISION OUTCOME PANEL (If decision is recorded) */}
          {appState.decisionDetails && (
            <div className={`p-6 rounded-2xl shadow-md border-2 space-y-4 text-xs ${
              appState.decisionDetails.decision === 'approved'
                ? 'bg-green-50 border-green-400 text-green-950'
                : appState.decisionDetails.decision === 'returned_for_correction'
                ? 'bg-amber-50 border-amber-400 text-amber-950'
                : 'bg-red-50 border-red-400 text-red-950'
            }`}>
              <div className="flex items-center justify-between border-b border-current/20 pb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                  <div>
                    <h3 className="text-base font-bold uppercase">
                      Demo Department Decision: {appState.decisionDetails.decision.replace(/_/g, ' ')}
                    </h3>
                    <div className="text-[11px] opacity-80">
                      Decided by {appState.decisionDetails.decidedByOfficer} on {appState.decisionDetails.decidedAt}
                    </div>
                  </div>
                </div>

                {appState.decisionDetails.certificateNumber && (
                  <Button variant="outline" size="sm" leftIcon={<Download className="w-3.5 h-3.5" />}>
                    Download Demo Certificate
                  </Button>
                )}
              </div>

              <div className="bg-white p-4 rounded-xl border border-current/20 font-medium text-slate-800">
                <strong className="block text-slate-900 mb-1 font-bold text-xs">Official Scrutiny Remarks:</strong>
                {appState.decisionDetails.remarks}
              </div>
            </div>
          )}

          {/* INSPECTION & APPROVAL UPDATES PANEL */}
          {(dbInspection || appState.inspectionDetails) && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-govBorder space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-saffron" />
                  <div>
                    <h3 className="font-bold text-govBlue text-sm">Inspection & Approval Updates</h3>
                    <p className="text-slate-500 text-[11px]">
                      Official site audit results, statutory inspector recommendation, and workflow status.
                    </p>
                  </div>
                </div>
                <Badge
                  variant={
                    (dbInspection?.inspectionResult || appState.inspectionDetails?.status) === 'PASSED' ||
                    (dbInspection?.status === 'COMPLETED' && dbInspection?.inspectionResult === 'PASSED')
                      ? 'green'
                      : (dbInspection?.inspectionResult || appState.inspectionDetails?.status) === 'FAILED'
                      ? 'red'
                      : 'amber'
                  }
                >
                  {dbInspection?.status === 'COMPLETED'
                    ? 'Inspection Completed'
                    : appState.inspectionDetails?.status
                    ? appState.inspectionDetails.status.toUpperCase()
                    : 'Inspection Scheduled'}
                </Badge>
              </div>

              {dbInspection?.status === 'COMPLETED' || dbInspection?.inspectionResult ? (
                /* Completed Inspection Outcomes */
                <div className="space-y-4">
                  <div
                    className={`p-4 rounded-xl border flex items-center justify-between gap-3 font-semibold ${
                      dbInspection.inspectionResult === 'PASSED'
                        ? 'bg-green-50 border-green-300 text-green-950'
                        : dbInspection.inspectionResult === 'FAILED'
                        ? 'bg-red-50 border-red-300 text-red-950'
                        : 'bg-amber-50 border-amber-300 text-amber-950'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {dbInspection.inspectionResult === 'PASSED' ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                      ) : dbInspection.inspectionResult === 'FAILED' ? (
                        <XCircle className="w-5 h-5 text-red-600 shrink-0" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                      )}
                      <div>
                        <span className="font-extrabold text-sm block">
                          {dbInspection.inspectionResult === 'PASSED'
                            ? '✓ Inspection Passed'
                            : dbInspection.inspectionResult === 'FAILED'
                            ? '✕ Inspection Failed'
                            : '! Correction Required'}
                        </span>
                        <span className="text-[11px] opacity-90">
                          Inspector Recommendation:{' '}
                          {dbInspection.recommendation === 'RECOMMEND_APPROVAL'
                            ? 'Recommend Approval'
                            : dbInspection.recommendation === 'RECOMMEND_REJECTION'
                            ? 'Recommend Rejection'
                            : 'Require Clarification'}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-bold uppercase block text-slate-500">Workflow Status</span>
                      <span className="font-extrabold text-xs text-govBlue">Awaiting Department Decision</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div>
                      <span className="text-[11px] text-slate-500 font-medium block">Inspection Reference:</span>
                      <span className="font-mono font-bold text-govBlue">{dbInspection.inspectionReference || 'INSP-2026-901'}</span>
                    </div>

                    <div>
                      <span className="text-[11px] text-slate-500 font-medium block">Submitted Timestamp:</span>
                      <span className="font-bold text-slate-800">
                        {dbInspection.submittedAt
                          ? new Date(dbInspection.submittedAt).toLocaleString()
                          : 'Recently Submitted'}
                      </span>
                    </div>

                    <div>
                      <span className="text-[11px] text-slate-500 font-medium block">Current Application Status:</span>
                      <span className="font-bold text-blue-700">Awaiting Department Decision</span>
                    </div>
                  </div>

                  {dbInspection.reportSummary && (
                    <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-1">
                      <strong className="text-govBlue font-bold text-xs block">Inspector Remarks & Findings:</strong>
                      <p className="text-slate-800 leading-relaxed text-xs">{dbInspection.reportSummary}</p>
                    </div>
                  )}
                </div>
              ) : (
                /* Pending / Scheduled Inspection Details */
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="font-bold text-slate-900">
                      {appState.inspectionDetails?.inspectorName || dbInspection?.inspectorName || 'Senior DISH Inspector'}
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-saffron" />
                      <span>
                        Scheduled for {appState.inspectionDetails?.scheduledDate || dbInspection?.scheduledDate || '11 Sep 2026'} at{' '}
                        {appState.inspectionDetails?.scheduledTime || '11:30 AM'}
                      </span>
                    </div>
                  </div>
                  <Badge variant="blue">Scheduled Site Audit</Badge>
                </div>
              )}
            </div>
          )}

          {/* Main Scrutiny Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Col: Documents & Data */}
            <div className="lg:col-span-8 space-y-6">
              {/* Documents Checklist & Vault Links */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-govBorder space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-bold text-govBlue flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-saffron" /> Statutory Required Documents & Vault Verification
                  </h3>
                  <span className="text-xs font-bold text-green-700">Readiness: {appState.readinessScore}%</span>
                </div>

                <div className="space-y-3">
                  {vaultDocs.slice(0, 5).map((doc) => (
                    <div key={doc.id} className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between text-xs gap-3">
                      <div className="space-y-0.5">
                        <div className="font-bold text-govBlue">{doc.documentName}</div>
                        <div className="text-[11px] text-slate-500 font-mono">v{doc.documentVersion} • {doc.fileName}</div>
                      </div>

                      <div className="flex items-center gap-2">
                        {doc.verificationStatus === 'verified' ? (
                          <Badge variant="green">Verified Vault File</Badge>
                        ) : doc.status === 'expired' ? (
                          <Badge variant="red">Expired ({doc.expiryDate})</Badge>
                        ) : (
                          <Badge variant="amber">Pending Officer Check</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Col: Officer Controls & Actions */}
            <div className="lg:col-span-4 space-y-6">
              {/* Officer Control Panel (When viewing in Officer mode) */}
              {userRoleMode === 'OFFICER' && (
                <div className="bg-govBlue text-white p-6 rounded-2xl shadow-md space-y-4 text-xs">
                  <div className="flex items-center gap-2 border-b border-white/20 pb-3">
                    <UserCheck className="w-5 h-5 text-saffron" />
                    <h3 className="font-bold text-sm text-white">Department Officer Scrutiny Controls</h3>
                  </div>

                  <p className="text-slate-200 leading-relaxed">
                    Perform demo officer actions for Smart India Hackathon solution verification.
                  </p>

                  <div className="space-y-2">
                    <button
                      onClick={() => setShowScheduleInspectionModal(true)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <Clock className="w-4 h-4" />
                      <span>Schedule Field Inspection</span>
                    </button>

                    <button
                      onClick={() => setShowRaiseQueryModal(true)}
                      className="w-full bg-saffron hover:bg-saffron-dark text-white font-bold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <MessageSquareWarning className="w-4 h-4" />
                      <span>Raise Scrutiny Query</span>
                    </button>

                    <button
                      onClick={() => setShowDecisionModal(true)}
                      className="w-full bg-white text-govBlue hover:bg-slate-100 font-bold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      <span>Record Demo Department Decision</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Application Summary Card */}
              <div className="bg-white p-5 rounded-2xl border border-govBorder shadow-sm space-y-3 text-xs">
                <h3 className="font-bold text-govBlue border-b border-slate-100 pb-2">Workflow Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between border-b border-slate-100 pb-1">
                    <span className="text-slate-500">Applicant:</span>
                    <span className="font-bold text-slate-800">Vijay Kulkarni</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1">
                    <span className="text-slate-500">Submitted Date:</span>
                    <span className="font-bold text-slate-800">{appState.submittedAt || 'Draft'}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1">
                    <span className="text-slate-500">Department Queue:</span>
                    <span className="font-bold text-govBlue">{appState.department}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Schedule Inspection Modal */}
          {showScheduleInspectionModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white max-w-md w-full rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4 text-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-bold text-govBlue text-sm flex items-center gap-2">
                    <Clock className="w-5 h-5 text-saffron" />
                    <span>Schedule Field Inspection Audit</span>
                  </h3>
                  <button onClick={() => setShowScheduleInspectionModal(false)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="font-bold text-slate-800 block mb-1">Inspection Date *</label>
                    <input
                      type="date"
                      value={inspDate}
                      onChange={(e) => setInspDate(e.target.value)}
                      className="w-full p-2.5 border border-slate-300 rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-800 block mb-1">Inspection Time Slot *</label>
                    <input
                      type="text"
                      value={inspTime}
                      onChange={(e) => setInspTime(e.target.value)}
                      placeholder="e.g. 11:30 AM"
                      className="w-full p-2.5 border border-slate-300 rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-800 block mb-1">Assigned Inspector *</label>
                    <input
                      type="text"
                      value={inspInspector}
                      onChange={(e) => setInspInspector(e.target.value)}
                      placeholder="Enter assigned inspector name & designation..."
                      className="w-full p-2.5 border border-slate-300 rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-800 block mb-1">Audit Instructions & Remarks *</label>
                    <textarea
                      rows={2}
                      value={inspInstructions}
                      onChange={(e) => setInspInstructions(e.target.value)}
                      placeholder="Instructions for inspector and applicant..."
                      className="w-full p-2.5 border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    onClick={() => setShowScheduleInspectionModal(false)}
                    className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-lg text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleExecuteScheduleInspection}
                    className="px-5 py-2 bg-govBlue hover:bg-govBlue-dark text-white font-extrabold rounded-lg shadow text-xs"
                  >
                    Schedule & Assign Inspector
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Raise Query Modal */}
          {showRaiseQueryModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white max-w-md w-full rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4 text-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-bold text-govBlue text-sm flex items-center gap-2">
                    <MessageSquareWarning className="w-5 h-5 text-saffron" />
                    <span>Raise Official Scrutiny Query</span>
                  </h3>
                  <button onClick={() => setShowRaiseQueryModal(false)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">Scrutiny Query Text *</label>
                  <textarea
                    rows={4}
                    value={newQueryText}
                    onChange={(e) => setNewQueryText(e.target.value)}
                    placeholder="Specify exact calculations, documents, or details required from the applicant..."
                    className="w-full p-3 border border-slate-300 rounded-lg text-xs"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    onClick={() => setShowRaiseQueryModal(false)}
                    className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-lg text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (!newQueryText.trim()) return;
                      const updated: WorkflowApplication = {
                        ...appState,
                        status: 'query_raised',
                        queryDetails: {
                          queryId: `QRY-${Date.now()}`,
                          raisedByOfficer: currentUser?.name || 'Department Officer',
                          raisedAt: new Date().toISOString(),
                          queryText: newQueryText,
                          responseDeadline: '2026-09-15',
                        },
                      };
                      setAppState(updated);
                      WorkflowStore.saveApplication(updated);

                      WorkflowStore.addNotification({
                        id: `notif-qry-${Date.now()}`,
                        recipientUserId: 'usr-applicant-1',
                        recipientEmail: 'applicant@udyogsathi.gov.in',
                        recipientRole: 'applicant',
                        relatedApplicationId: appState.id,
                        type: 'query_raised',
                        title: 'Officer Query Raised',
                        message: `Officer requested clarification on ${appState.referenceNumber}: "${newQueryText}"`,
                        route: `/applications/${appState.id}`,
                        priority: 'high',
                        deliveryStatus: 'delivered_in_app',
                        isRead: false,
                        createdAt: new Date().toISOString(),
                      });

                      setShowRaiseQueryModal(false);
                      setNewQueryText('');
                      setToastMessage(`Scrutiny query sent to applicant for ${appState.referenceNumber}.`);
                      setTimeout(() => setToastMessage(null), 4000);
                    }}
                    disabled={!newQueryText.trim()}
                    className="px-5 py-2 bg-saffron hover:bg-saffron-dark text-white font-extrabold rounded-lg shadow text-xs disabled:opacity-50"
                  >
                    Send Query to Applicant
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Record Decision Modal */}
          {showDecisionModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white max-w-md w-full rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4 text-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-bold text-govBlue text-sm">Record Demo Department Decision</h3>
                  <button onClick={() => setShowDecisionModal(false)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="font-bold text-slate-800 block mb-1">Decision Outcome *</label>
                    <select
                      value={decisionChoice}
                      onChange={e => setDecisionChoice(e.target.value as any)}
                      className="w-full p-2.5 border border-slate-300 rounded-lg text-xs"
                    >
                      <option value="approved">Approved</option>
                      <option value="returned_for_correction">Returned for Correction</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-800 block mb-1">Official Remarks / Statutory Reason *</label>
                    <textarea
                      rows={3}
                      value={decisionRemarks}
                      onChange={e => setDecisionRemarks(e.target.value)}
                      placeholder="Type officer scrutiny remarks or statutory condition details..."
                      className="w-full p-2.5 border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                </div>

                <button
                  onClick={handleOfficerRecordDecision}
                  className="w-full bg-govBlue text-white font-bold py-2.5 rounded-lg"
                >
                  Record Official Decision
                </button>
              </div>
            </div>
          )}
        </main>

        <Footer />
      </div>
    </ProtectedRoute>
  );
}
