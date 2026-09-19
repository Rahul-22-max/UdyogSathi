'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { WizardInput, ApprovalChecklistItem } from '@/types';
import { exportApprovalChecklistPDF } from '@/lib/export-utils';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { DisclaimerBanner } from '@/components/common/DisclaimerBanner';
import { useAuth } from '@/context/AuthContext';
import { getRoleDashboardPath, normalizeRole } from '@/lib/rbac';
import { WorkflowStore, generateApplicationReferenceCode } from '@/lib/workflow-store';
import { WorkflowApplication, IndustrialProject } from '@/lib/workflow-engine';
import {
  Building2,
  MapPin,
  Coins,
  Flame,
  CheckCircle2,
  FileText,
  Download,
  Share2,
  ArrowRight,
  ArrowLeft,
  Info,
  ShieldCheck,
  Sparkles,
  RefreshCw,
  Plus,
  Lock,
  Layers,
  RotateCcw,
  Eye,
  AlertTriangle,
} from 'lucide-react';

const SECTORS = [
  'Automotive & Heavy Engineering',
  'Chemicals & Petrochemicals',
  'Food Processing & Agribusiness',
  'Textiles & Apparel',
  'Information Technology & Data Centers',
  'Pharmaceuticals & Medical Devices',
  'Renewable Energy & Electronics',
  'General Manufacturing',
];

const MAHARASHTRA_DISTRICTS = [
  'Pune',
  'Raigad',
  'Thane',
  'Nagpur',
  'Nashik',
  'Aurangabad (Chhatrapati Sambhajinagar)',
  'Kolhapur',
  'Solapur',
  'Amravati',
  'Palghar',
  'Satara',
  'Ratnagiri',
];

export const MultiStepWizard: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlProjectId = searchParams?.get('projectId');

  const { currentUser, isAuthenticated, isLoadingAuth, role } = useAuth();

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checklist, setChecklist] = useState<ApprovalChecklistItem[] | null>(null);
  const [shareLinkCopied, setShareLinkCopied] = useState(false);
  const [hasSavedDraft, setHasSavedDraft] = useState(false);
  const [savedDraftData, setSavedDraftData] = useState<any | null>(null);

  const [isConvertingProject, setIsConvertingProject] = useState(false);
  const [createdProjectId, setCreatedProjectId] = useState<string | null>(urlProjectId || null);
  const [selectedProject, setSelectedProject] = useState<any | null>(null);
  const [isSubmittedSuccess, setIsSubmittedSuccess] = useState(false);
  const [createdApplications, setCreatedApplications] = useState<WorkflowApplication[]>([]);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const normRole = normalizeRole(currentUser?.role || role);

  const userEmail = currentUser?.email || 'applicant@udyogsathi.gov.in';

  // Load target project from URL query parameter
  useEffect(() => {
    if (urlProjectId) {
      const proj = WorkflowStore.getProjectById(urlProjectId, userEmail);
      if (proj) {
        setSelectedProject(proj);
        setCreatedProjectId(proj.id);
        setFormData((prev) => ({
          ...prev,
          organisationName: proj.name,
          applicantName: currentUser?.name || proj.promoterName,
          sector: proj.sector,
          subSector: proj.subSector,
          district: proj.district,
          taluka: proj.taluka,
          locationType: proj.locationType as any,
          investmentAmountINR: proj.investmentAmountINR,
          expectedWorkforce: proj.workforceCount,
          wasteCategory: proj.environmentalCategory as any,
        }));

        // Auto-detect if applications already exist for this project
        const existingApps = WorkflowStore.getApplications(userEmail, normRole).filter(
          (a) => a.projectId === urlProjectId
        );
        if (existingApps.length > 0) {
          console.log('[ApprovalWizard] EXISTING_APPLICATIONS_DETECTED', {
            urlProjectId,
            count: existingApps.length,
          });
          setCreatedApplications(existingApps);
          setIsSubmittedSuccess(true);
          setStep(5);
        }
      }
    }
  }, [urlProjectId, userEmail, currentUser, normRole]);

  // Compute exact wizard mode based on top-level auth & onboarding state
  const wizardMode: 'loading' | 'guest' | 'authenticated_applicant' | 'onboarding_required' | 'non_applicant' =
    isLoadingAuth
      ? 'loading'
      : !isAuthenticated
      ? 'guest'
      : normRole === 'applicant' && (currentUser?.onboardingCompleted ?? true)
      ? 'authenticated_applicant'
      : normRole === 'applicant'
      ? 'onboarding_required'
      : 'non_applicant';

  const [formData, setFormData] = useState<WizardInput>({
    organisationName: 'Vijay Foods and Agro Processing Pvt. Ltd.',
    applicantName: currentUser?.name || 'Vijay Kulkarni',
    legalEntity: 'Private Limited Company',
    applicantType: 'MSME Entrepreneur',
    contactEmail: currentUser?.email || 'applicant@udyogsathi.gov.in',
    contactMobile: currentUser?.mobile || '+91 98220 12345',
    sector: 'Food Processing & Agribusiness',
    subSector: 'Fruit & Vegetable Processing Unit',
    district: 'Pune',
    taluka: 'Khed',
    locationType: 'MIDC',
    landType: 'MIDC Industrial Allotted Plot',
    landAreaSqMtr: 15000,
    builtupAreaSqMtr: 8500,
    projectStage: 'SETUP',
    investmentAmountINR: 45000000, // Rs 4.5 Cr
    expectedWorkforce: 85,
    manufacturingType: 'Manufacturing',
    powerRequirementKW: 150,
    waterRequirementKLD: 1200,
    wastewaterKLD: 450,
    wasteCategory: 'ORANGE',
    hazardousMaterials: true,
    fireSafetyReq: true,
    boilerReq: false,
    labourRegReq: true,
    preferredLanguage: 'en',
  });

  // Inspect draft without forcing auto-jump to Step 5
  useEffect(() => {
    try {
      const savedDraftStr = localStorage.getItem('udyogsathi_wizard_draft');
      if (savedDraftStr) {
        const draft = JSON.parse(savedDraftStr);
        if (draft && (draft.formData || draft.checklist)) {
          setHasSavedDraft(true);
          setSavedDraftData(draft);
        }
      }
    } catch (e) {}
  }, []);

  const handleResumeDraft = () => {
    if (savedDraftData) {
      if (savedDraftData.formData) setFormData((prev) => ({ ...prev, ...savedDraftData.formData }));
      if (savedDraftData.checklist) setChecklist(savedDraftData.checklist);
      setStep(5);
    }
  };

  const handleStartNewWizard = () => {
    try {
      localStorage.removeItem('udyogsathi_wizard_draft');
    } catch (e) {}
    setHasSavedDraft(false);
    setSavedDraftData(null);
    setChecklist(null);
    setStep(1);
  };

  const handleChange = (field: keyof WizardInput, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    setStep((prev) => Math.min(prev + 1, 5));
  };

  const handleBack = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleGenerateChecklist = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/wizard/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      const generated = data.checklist || [];
      setChecklist(generated);
      setStep(5);

      // Save draft checklist locally
      try {
        localStorage.setItem(
          'udyogsathi_wizard_draft',
          JSON.stringify({ formData, checklist: generated })
        );
      } catch (e) {}
    } catch (err) {
      console.error('Checklist generation error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Convert Generated Checklist into Active Project for Authenticated Applicant
  const handleCreateProjectFromChecklist = async (e?: React.MouseEvent) => {
    e?.preventDefault();

    if (isConvertingProject || isSubmittedSuccess) return;

    setIsConvertingProject(true);
    setSubmissionError(null);

    const activeEmail = currentUser?.email || userEmail;
    const targetProjectId = urlProjectId || createdProjectId || `proj-${Date.now()}`;

    console.log('[ApprovalWizard] FINAL_BUTTON_CLICKED', {
      targetProjectId,
      activeEmail,
      currentUserRole: currentUser?.role || role,
      checklistCount: checklist?.length || 0,
      isSubmittingBefore: isConvertingProject,
    });

    try {
      // 1. Resolve or Create Project in WorkflowStore for active user
      let projectToSave = WorkflowStore.getProjectById(targetProjectId, activeEmail);

      if (!projectToSave) {
        projectToSave = {
          id: targetProjectId,
          name: formData.organisationName.trim() || `${currentUser?.name || 'Applicant'} Industrial Unit`,
          promoterName: currentUser?.name || formData.applicantName || 'Applicant',
          sector: formData.sector,
          subSector: formData.subSector || `${formData.sector} Manufacturing Unit`,
          district: formData.district,
          taluka: formData.taluka || 'Khed MIDC',
          locationType: (formData.locationType as any) || 'MIDC',
          plotNumber: 'Plot C-14, Chakan MIDC',
          investmentAmountINR: formData.investmentAmountINR || 45000000,
          workforceCount: Number(formData.expectedWorkforce) || 85,
          environmentalCategory: (formData.wasteCategory as any) || 'ORANGE',
          projectStage: (formData.projectStage as any) || 'SETUP',
          createdAt: new Date().toISOString(),
          totalApprovalsRequired: checklist ? checklist.length : 5,
          currentStageNumber: 4,
        };
        WorkflowStore.saveProject(projectToSave, activeEmail);
      } else {
        if (checklist && checklist.length > 0) {
          projectToSave.totalApprovalsRequired = Math.max(
            projectToSave.totalApprovalsRequired,
            checklist.length
          );
          WorkflowStore.saveProject(projectToSave, activeEmail);
        }
      }

      setCreatedProjectId(targetProjectId);

      // 2. Convert Checklist Items into WorkflowApplication records for targetProjectId
      const newlyCreatedApps: WorkflowApplication[] = [];
      if (checklist && checklist.length > 0) {
        const existingApps = WorkflowStore.getApplications(activeEmail, currentUser?.role);
        const existingTitles = new Set(
          existingApps.filter((a) => a.projectId === targetProjectId).map((a) => a.approvalTitle.toLowerCase())
        );

        checklist.forEach((item, idx) => {
          if (!existingTitles.has(item.approvalTitle.toLowerCase())) {
            const refCode = generateApplicationReferenceCode(item.department, idx);
            const nowIso = new Date().toISOString();
            const requiresInsp =
              item.requiresInspection ||
              item.department.includes('MPCB') ||
              item.department.includes('DISH') ||
              item.department.includes('Safety') ||
              item.department.includes('Fire') ||
              item.approvalTitle.toLowerCase().includes('factory') ||
              item.approvalTitle.toLowerCase().includes('consent') ||
              item.approvalTitle.toLowerCase().includes('fire');

            const appStatus = requiresInsp ? 'inspection_scheduled' : 'submitted';

            const newApp: WorkflowApplication = {
              id: `app-${Date.now()}-${idx}`,
              referenceNumber: refCode,
              projectId: targetProjectId,
              projectName: projectToSave!.name,
              approvalType: item.approvalTitle.toUpperCase().replace(/[^A-Z0-9]/g, '_'),
              approvalTitle: item.approvalTitle,
              department: item.department,
              statutoryAct: 'Maharashtra Industrial Development Act',
              createdAt: nowIso,
              submittedAt: nowIso,
              status: appStatus,
              slaDaysTotal: item.estimatedSlaDays,
              slaDaysRemaining: item.estimatedSlaDays,
              slaState: 'on_track',
              readinessScore: 85,
              reusedDocumentIds: ['doc-pan-1', 'doc-gst-v2'],
              uploadedDocumentIds: [],
              missingDocumentLabels: item.requiredDocuments || [],
              requiresInspection: requiresInsp,
              inspectionStage: requiresInsp ? 'before_decision' : 'not_required',
              assignedInspectorId: requiresInsp ? 'usr-inspector-1' : undefined,
              assignedInspectorName: requiresInsp ? 'Rajendra Deshmukh (DISH Senior Inspector)' : undefined,
              timelineHistory: [
                {
                  id: `tl-1-${Date.now()}-${idx}`,
                  action: 'Application Prepared',
                  previousStatus: 'DRAFT',
                  newStatus: 'READY_FOR_SUBMISSION',
                  performedBy: currentUser?.name || 'Applicant',
                  timestamp: nowIso,
                  remarks: 'Application checklist pre-validated against statutory rules.',
                },
                {
                  id: `tl-2-${Date.now()}-${idx}`,
                  action: 'Submitted to Department Queue',
                  previousStatus: 'READY_FOR_SUBMISSION',
                  newStatus: appStatus,
                  performedBy: currentUser?.name || 'Applicant',
                  timestamp: nowIso,
                  remarks: `Application ${refCode} submitted into UdyogSathi ${item.department} sandbox queue.`,
                },
              ],
            };

            WorkflowStore.saveApplication(newApp, activeEmail);
            newlyCreatedApps.push(newApp);

            // If inspection is required, generate linked InspectionItem record
            if (requiresInsp) {
              const inspDate = new Date(Date.now() + (idx + 3) * 86400000).toISOString().split('T')[0];
              const newInspection = {
                id: `INSP-${Date.now()}-${idx}`,
                applicationId: newApp.id,
                referenceNumber: refCode,
                projectId: targetProjectId,
                projectName: projectToSave!.name,
                applicantUserId: currentUser?.id || activeEmail,
                title: `${item.approvalTitle} Pre-Operational Field Audit`,
                department: item.department,
                unitName: projectToSave!.name,
                inspectorName: 'Rajendra Deshmukh (DISH Senior Inspector)',
                assignedInspectorId: 'usr-inspector-1',
                scheduledDate: inspDate,
                scheduledTime: '11:00 AM - 01:00 PM',
                venue: `${projectToSave!.plotNumber || 'MIDC Plot'}, ${projectToSave!.district}`,
                status: 'scheduled' as const,
                requirements: item.requiredDocuments || ['Factory Architectural Blueprint', 'Safety Audit Certificate'],
                ownerUserEmail: activeEmail,
                isDemoSandboxRecord: true,
              };

              WorkflowStore.saveInspection(newInspection);

              // Notify Assigned Inspector
              WorkflowStore.addNotification({
                id: `notif-inspector-assigned-${Date.now()}-${idx}`,
                recipientUserId: 'usr-inspector-1',
                recipientEmail: 'inspector@udyogsathi.gov.in',
                recipientRole: 'inspector',
                relatedApplicationId: newApp.id,
                type: 'inspection_scheduled',
                title: `New Inspection Assigned: ${item.approvalTitle}`,
                message: `You have been assigned site audit for ${projectToSave!.name} (${refCode}) scheduled for ${inspDate}.`,
                route: `/inspector/dashboard`,
                priority: 'high',
                deliveryStatus: 'delivered_in_app',
                isRead: false,
                createdAt: nowIso,
              });

              // Notify Applicant
              WorkflowStore.addNotification({
                id: `notif-app-insp-${Date.now()}-${idx}`,
                recipientUserId: currentUser?.id || activeEmail,
                recipientEmail: activeEmail,
                recipientRole: 'applicant',
                relatedApplicationId: newApp.id,
                type: 'inspection_scheduled',
                title: `Field Inspection Scheduled for ${item.approvalTitle}`,
                message: `Site audit by Inspector Rajendra Deshmukh scheduled on ${inspDate} for ${projectToSave!.name}.`,
                route: `/inspections`,
                priority: 'normal',
                deliveryStatus: 'delivered_in_app',
                isRead: false,
                createdAt: nowIso,
              });
            }

            // Notify Department Officer Queue
            WorkflowStore.addNotification({
              id: `notif-dept-officer-${Date.now()}-${idx}`,
              recipientUserId: 'usr-officer-1',
              recipientEmail: 'officer@udyogsathi.gov.in',
              recipientRole: 'department_officer',
              relatedApplicationId: newApp.id,
              type: 'welcome',
              title: `New Approval Application Received: ${refCode}`,
              message: `New statutory application for ${item.approvalTitle} submitted by ${projectToSave!.name} into ${item.department} queue.`,
              route: `/applications/${newApp.id}`,
              priority: 'high',
              deliveryStatus: 'delivered_in_app',
              isRead: false,
              createdAt: nowIso,
            });
          } else {
            const match = existingApps.find(
              (a) => a.projectId === targetProjectId && a.approvalTitle.toLowerCase() === item.approvalTitle.toLowerCase()
            );
            if (match) newlyCreatedApps.push(match);
          }
        });
      }

      // 3. Dispatch Notification for Applicant
      WorkflowStore.addNotification({
        id: `notif-app-gen-${Date.now()}`,
        recipientUserId: currentUser?.id || activeEmail,
        recipientEmail: activeEmail,
        recipientRole: 'applicant',
        type: 'welcome',
        title: 'Approval Applications Submitted Successfully',
        message: `Approval applications created for ${projectToSave.name} and submitted to UdyogSathi sandbox department workflow.`,
        route: `/projects/${targetProjectId}`,
        priority: 'high',
        deliveryStatus: 'delivered_in_app',
        isRead: false,
        createdAt: new Date().toISOString(),
      });

      // 4. Create Audit Log
      WorkflowStore.addAuditLog({
        id: `audit-app-gen-${Date.now()}`,
        eventType: 'approval_applications_created',
        description: `Approval applications created for industrial project '${projectToSave.name}' (${targetProjectId}).`,
        actorUserId: currentUser?.id || activeEmail,
        actorRole: 'applicant',
        timestamp: new Date().toISOString(),
        metadata: { projectId: targetProjectId, approvalCount: checklist?.length || 0 },
      });

      // Clear temporary draft
      try {
        localStorage.removeItem('udyogsathi_wizard_draft');
      } catch (e) {}

      const finalApps = newlyCreatedApps.length > 0 
        ? newlyCreatedApps 
        : WorkflowStore.getApplications(activeEmail).filter(a => a.projectId === targetProjectId);

      console.log('[ApprovalWizard] CREATE_APPLICATIONS_RESULT', {
        success: true,
        createdCount: finalApps.length,
        targetProjectId,
      });

      setCreatedApplications(finalApps);
      setIsConvertingProject(false);
      setIsSubmittedSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Automatic redirection to Project Workspace after 2.5s
      setIsRedirecting(true);
      setTimeout(() => {
        router.push(`/projects/${targetProjectId}`);
      }, 2500);
    } catch (err: any) {
      console.error('[ApprovalWizard] FINAL_SUBMISSION_FAILED', err);
      setSubmissionError(err?.message || 'Failed to create approval applications. Please try again.');
      setIsConvertingProject(false);
    }
  };

  const handleGuestSignIn = () => {
    try {
      localStorage.setItem(
        'udyogsathi_wizard_draft',
        JSON.stringify({ formData, checklist })
      );
    } catch (e) {}
    router.push('/login?returnTo=/approval-wizard');
  };

  const handleGuestRegister = () => {
    try {
      localStorage.setItem(
        'udyogsathi_wizard_draft',
        JSON.stringify({ formData, checklist })
      );
    } catch (e) {}
    router.push('/register?returnTo=/approval-wizard');
  };

  const handleContinueOnboarding = () => {
    try {
      localStorage.setItem(
        'udyogsathi_wizard_draft',
        JSON.stringify({ formData, checklist })
      );
    } catch (e) {}
    router.push('/onboarding?returnTo=/approval-wizard');
  };

  const handleExportPDF = () => {
    if (!checklist) return;
    exportApprovalChecklistPDF(formData.organisationName, formData.district, checklist);
  };

  const handleCopyShareLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setShareLinkCopied(true);
      setTimeout(() => setShareLinkCopied(false), 3000);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-govBorder overflow-hidden text-govText">
      {/* Draft Resume Choice Banner */}
      {hasSavedDraft && step === 1 && (
        <div className="bg-amber-50 border-b border-amber-300 p-4 px-6 flex flex-wrap items-center justify-between gap-3 text-xs text-amber-950">
          <div className="flex items-center gap-2 font-bold">
            <RotateCcw className="w-4 h-4 text-saffron" />
            <span>You have a saved approval roadmap draft from your previous session.</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleResumeDraft}
              className="bg-saffron hover:bg-saffron-dark text-white font-extrabold px-3 py-1.5 rounded-lg shadow text-xs transition-colors"
            >
              Resume Saved Roadmap (Step 5)
            </button>
            <button
              onClick={handleStartNewWizard}
              className="bg-white text-slate-700 border border-slate-300 hover:bg-slate-100 font-bold px-3 py-1.5 rounded-lg text-xs transition-colors"
            >
              Start Fresh (Step 1)
            </button>
          </div>
        </div>
      )}

      {/* Wizard Header Stepper Bar */}
      <div className="bg-govBlue text-white p-6 relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
          <div>
            <span className="text-saffron font-bold text-xs uppercase tracking-widest block">
              Statutory Approval Roadmap Generator
            </span>
            <h2 className="text-xl md:text-2xl font-extrabold mt-0.5">
              {step === 1 && 'Step 1 of 5: Enterprise Profile'}
              {step === 2 && 'Step 2 of 5: Project & Operations'}
              {step === 3 && 'Step 3 of 5: Compliance & Risk Details'}
              {step === 4 && 'Step 4 of 5: Documents & Readiness'}
              {step === 5 && 'Step 5 of 5: Review & Generate Roadmap'}
            </h2>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold bg-white/10 px-3.5 py-1.5 rounded-full border border-white/20">
            <span>Step {step} of 5</span>
          </div>
        </div>

        {/* 5-Step Stepper Header */}
        <div className="grid grid-cols-5 gap-2 mt-6 pt-4 border-t border-white/15 text-[11px] font-semibold text-center relative z-10">
          {[
            '1. Enterprise Profile',
            '2. Project & Operations',
            '3. Compliance & Risk',
            '4. Documents & Readiness',
            '5. Review & Generate',
          ].map((title, idx) => {
            const stepNum = idx + 1;
            const isActive = step === stepNum;
            const isCompleted = step > stepNum;
            return (
              <button
                key={title}
                type="button"
                onClick={() => {
                  if (stepNum < step || (step === 5 && isCompleted)) {
                    setStep(stepNum);
                  }
                }}
                className={`py-2 px-1 rounded-lg border transition-all ${
                  isActive
                    ? 'bg-saffron text-white border-saffron shadow font-bold ring-2 ring-saffron/30'
                    : isCompleted
                    ? 'bg-white/20 text-white border-white/30 font-bold hover:bg-white/30'
                    : 'bg-white/5 text-slate-300 border-white/10'
                }`}
              >
                <span className="truncate block">{title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Wizard Form & Result Content */}
      <div className="p-6 md:p-8 space-y-6">
        {/* STEP 1 OF 5: ENTERPRISE PROFILE */}
        {step === 1 && (
          <div className="space-y-6 animate-fadeIn">
            {selectedProject && (
              <div className="bg-amber-50 border border-amber-300 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4 text-amber-950 text-xs">
                <div className="flex items-center gap-2.5">
                  <Building2 className="w-5 h-5 text-saffron shrink-0" />
                  <div>
                    <span className="font-extrabold text-govBlue block text-xs">Creating approval applications for: {selectedProject.name}</span>
                    <span className="text-[11px] text-slate-600 font-medium">{selectedProject.sector} • {selectedProject.district}, {selectedProject.taluka} ({selectedProject.plotNumber})</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => router.push('/select-project')}
                  className="bg-white hover:bg-amber-100 text-govBlue font-bold px-3 py-1.5 rounded-lg border border-amber-300 shadow-sm shrink-0 text-xs"
                >
                  Change Project
                </button>
              </div>
            )}

            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-govBlue flex items-center gap-2">
                <Building2 className="w-5 h-5 text-saffron" /> Enterprise & Promoter Profile
              </h3>
              <p className="text-xs text-govMuted mt-0.5">
                Tell us about your business so UdyogSathi can identify the approvals and documents relevant to your industrial project.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-bold text-govText block mb-1">Proposed Enterprise / Organisation Name *</label>
                <input
                  type="text"
                  value={formData.organisationName}
                  onChange={(e) => handleChange('organisationName', e.target.value)}
                  placeholder="e.g. Vijay Foods and Agro Processing Pvt. Ltd."
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-saffron text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-govText block mb-1">Promoter / Applicant Name *</label>
                <input
                  type="text"
                  value={formData.applicantName}
                  onChange={(e) => handleChange('applicantName', e.target.value)}
                  placeholder="e.g. Vijay Kulkarni"
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-saffron text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-govText block mb-1">Legal Entity Type *</label>
                <select
                  value={formData.legalEntity}
                  onChange={(e) => handleChange('legalEntity', e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-saffron text-xs bg-white"
                >
                  <option value="Proprietorship">Proprietorship</option>
                  <option value="Partnership">Partnership Firm</option>
                  <option value="LLP">Limited Liability Partnership (LLP)</option>
                  <option value="Private Limited Company">Private Limited Company</option>
                  <option value="Public Limited Company">Public Limited Company</option>
                  <option value="Cooperative Society">Cooperative Society</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-govText block mb-1">Applicant Scale Category *</label>
                <select
                  value={formData.applicantType}
                  onChange={(e) => handleChange('applicantType', e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-saffron text-xs bg-white"
                >
                  <option value="Micro Enterprise">Micro Enterprise (Investment &lt; ₹1 Cr)</option>
                  <option value="MSME Entrepreneur">Small Enterprise (Investment &lt; ₹10 Cr)</option>
                  <option value="Medium Enterprise">Medium Enterprise (Investment &lt; ₹50 Cr)</option>
                  <option value="Large Mega Industrial Unit">Large / Mega Industrial Project (₹50 Cr+)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-govText block mb-1">Contact Email Address *</label>
                <input
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => handleChange('contactEmail', e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-saffron text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-govText block mb-1">Contact Mobile Number *</label>
                <input
                  type="tel"
                  value={formData.contactMobile}
                  onChange={(e) => handleChange('contactMobile', e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-saffron text-xs"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2 OF 5: PROJECT & OPERATIONS */}
        {step === 2 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-govBlue flex items-center gap-2">
                <MapPin className="w-5 h-5 text-saffron" /> Project & Operational Parameters
              </h3>
              <p className="text-xs text-govMuted mt-0.5">
                Location zoning determines MIDC planning authority vs Gram Panchayat/Collectorate jurisdiction.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-bold text-govText block mb-1">Industrial Sector *</label>
                <select
                  value={formData.sector}
                  onChange={(e) => handleChange('sector', e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-saffron text-xs bg-white"
                >
                  {SECTORS.map((sec) => (
                    <option key={sec} value={sec}>
                      {sec}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-govText block mb-1">Sub-Sector / Process Details *</label>
                <input
                  type="text"
                  value={formData.subSector}
                  onChange={(e) => handleChange('subSector', e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-saffron text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-govText block mb-1">Maharashtra District *</label>
                <select
                  value={formData.district}
                  onChange={(e) => handleChange('district', e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-saffron text-xs bg-white"
                >
                  {MAHARASHTRA_DISTRICTS.map((dist) => (
                    <option key={dist} value={dist}>
                      {dist}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-govText block mb-1">Location / Industrial Zone *</label>
                <select
                  value={formData.locationType}
                  onChange={(e) => handleChange('locationType', e.target.value as any)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-saffron text-xs bg-white"
                >
                  <option value="MIDC">MIDC Developed Industrial Park</option>
                  <option value="NON_MIDC">Non-MIDC Zone (Private Industrial Land)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-govText block mb-1">Capital Investment Amount (INR ₹) *</label>
                <input
                  type="number"
                  value={formData.investmentAmountINR}
                  onChange={(e) => handleChange('investmentAmountINR', Number(e.target.value))}
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-saffron text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-govText block mb-1">Expected Workforce Size *</label>
                <input
                  type="number"
                  value={formData.expectedWorkforce}
                  onChange={(e) => handleChange('expectedWorkforce', Number(e.target.value))}
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-saffron text-xs"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 3 OF 5: COMPLIANCE & RISK DETAILS */}
        {step === 3 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-govBlue flex items-center gap-2">
                <Flame className="w-5 h-5 text-saffron" /> Environmental & Compliance Risk Parameters
              </h3>
              <p className="text-xs text-govMuted mt-0.5">
                MPCB pollution categorization (White, Green, Orange, Red) dictates CTO/CTE SLAs.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="font-bold text-govText block mb-1">Environmental Pollution Category *</label>
                <select
                  value={formData.wasteCategory}
                  onChange={(e) => handleChange('wasteCategory', e.target.value as any)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-saffron text-xs bg-white font-bold"
                >
                  <option value="WHITE">White Category (Exempted)</option>
                  <option value="GREEN">Green Category (Low Pollution Index 21-40)</option>
                  <option value="ORANGE">Orange Category (Moderate Index 41-59)</option>
                  <option value="RED">Red Category (High Pollution Index 60+)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-govText block mb-1">Power Requirement (KW) *</label>
                <input
                  type="number"
                  value={formData.powerRequirementKW}
                  onChange={(e) => handleChange('powerRequirementKW', Number(e.target.value))}
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-saffron text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-govText block mb-1">Water Requirement (KLD) *</label>
                <input
                  type="number"
                  value={formData.waterRequirementKLD}
                  onChange={(e) => handleChange('waterRequirementKLD', Number(e.target.value))}
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-saffron text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs pt-2">
              <label className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.hazardousMaterials}
                  onChange={(e) => handleChange('hazardousMaterials', e.target.checked)}
                  className="rounded text-saffron focus:ring-saffron"
                />
                <span className="font-semibold text-slate-800">Hazardous Chemical Handling</span>
              </label>

              <label className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.fireSafetyReq}
                  onChange={(e) => handleChange('fireSafetyReq', e.target.checked)}
                  className="rounded text-saffron focus:ring-saffron"
                />
                <span className="font-semibold text-slate-800">Fire Safety NOC Required</span>
              </label>

              <label className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.boilerReq}
                  onChange={(e) => handleChange('boilerReq', e.target.checked)}
                  className="rounded text-saffron focus:ring-saffron"
                />
                <span className="font-semibold text-slate-800">Boiler Registration Required</span>
              </label>

              <label className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.labourRegReq}
                  onChange={(e) => handleChange('labourRegReq', e.target.checked)}
                  className="rounded text-saffron focus:ring-saffron"
                />
                <span className="font-semibold text-slate-800">Labour Act Registration</span>
              </label>
            </div>
          </div>
        )}

        {/* STEP 4 OF 5: DOCUMENTS & READINESS */}
        {step === 4 && (
          <div className="space-y-6 animate-fadeIn text-xs">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-govBlue flex items-center gap-2">
                <FileText className="w-5 h-5 text-saffron" /> Documents & Vault Reuse Readiness
              </h3>
              <p className="text-xs text-govMuted mt-0.5">
                Check available verified documents in your Document Vault for 1-click statutory reuse.
              </p>
            </div>

            {wizardMode === 'authenticated_applicant' ? (
              <div className="bg-green-50 p-4 rounded-xl border border-green-300 space-y-2">
                <div className="flex items-center gap-2 font-bold text-green-900 text-sm">
                  <ShieldCheck className="w-5 h-5 text-green-600" />
                  <span>4 Verified Vault Documents Ready for 1-Click Reuse</span>
                </div>
                <p className="text-slate-700 leading-relaxed">
                  The system detected verified PAN Card, GST Registration, Certificate of Incorporation, and Office Address Proof in your vault.
                </p>
              </div>
            ) : (
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 font-bold text-govBlue text-sm">
                  <Info className="w-5 h-5 text-saffron" />
                  <span>Document Vault Reuse Information</span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  After registration or login, UdyogSathi pre-validates uploaded files so eligible documents can be reused across statutory applications.
                </p>
              </div>
            )}

            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
              <h4 className="font-bold text-govBlue">Parameters Review Summary:</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 block text-[11px]">Enterprise:</span>
                  <strong className="text-govBlue">{formData.organisationName}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Promoter:</span>
                  <strong className="text-govBlue">{formData.applicantName}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Sector:</span>
                  <strong className="text-govBlue">{formData.sector}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Location:</span>
                  <strong className="text-govBlue">
                    {formData.district} ({formData.locationType})
                  </strong>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 5 OF 5: REVIEW & GENERATE ROADMAP */}
        {step === 5 && (
          <div className="space-y-6 animate-fadeIn">
            {/* STATE 1: APPLICANT SUBMISSION SUCCESS SCREEN */}
            {isSubmittedSuccess ? (
              <div className="space-y-6 animate-fadeIn" role="region" aria-live="polite" tabIndex={-1} id="submission-success-heading">
                {/* Hero Banner */}
                <div className="bg-gradient-to-r from-govBlue to-govBlue-dark text-white p-8 rounded-2xl shadow-xl space-y-4 border border-saffron/30">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="bg-govBlue-light text-white font-extrabold text-[10px] uppercase tracking-wider px-3 py-1 rounded shadow">
                          Statutory Submission
                        </span>
                        <span className="bg-green-500 text-white font-bold text-[10px] px-2.5 py-1 rounded flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Submitted for Department Review</span>
                        </span>
                        {isRedirecting && (
                          <span className="bg-blue-600 text-white font-bold text-[10px] px-2.5 py-1 rounded flex items-center gap-1 animate-pulse">
                            <RefreshCw className="w-3 h-3 animate-spin text-saffron" />
                            <span>Redirecting to project workspace...</span>
                          </span>
                        )}
                      </div>
                      <h2 className="text-xl md:text-2xl font-extrabold text-white flex items-center gap-2">
                        <Sparkles className="w-6 h-6 text-saffron" />
                        ✓ Application Submitted Successfully
                      </h2>
                      <p className="text-xs md:text-sm text-slate-200 leading-relaxed max-w-3xl">
                        Your statutory approval applications have been created for <strong className="text-saffron">{selectedProject?.name || formData.organisationName}</strong> and submitted for department review. Final statutory decisions are issued by the competent authority.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Applications Breakdown Grid */}
                <div className="bg-white p-6 rounded-2xl border border-govBorder shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="text-base font-bold text-govBlue flex items-center gap-2">
                      <FileText className="w-5 h-5 text-saffron" /> Submitted Statutory Applications ({createdApplications.length})
                    </h3>
                    <span className="text-xs text-govMuted font-medium">Department Review Queue Active</span>
                  </div>

                  <div className="space-y-3">
                    {createdApplications.map((app, idx) => (
                      <div key={app.id || idx} className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-govBlue text-xs">{app.referenceNumber}</span>
                            <Badge variant="blue">{app.department}</Badge>
                            <Badge variant="amber">Submitted / Under Department Review</Badge>
                          </div>
                          <h4 className="font-bold text-slate-800 text-sm">{app.approvalTitle}</h4>
                          <p className="text-[11px] text-slate-500">{app.statutoryAct || 'Maharashtra Industrial Development Act'}</p>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="text-right space-y-0.5 mr-2">
                            <span className="text-slate-600 font-bold block">SLA: {app.slaDaysRemaining || 30} Days</span>
                            <span className="text-[10px] text-green-700 font-bold">2 Vault Docs Reused</span>
                          </div>
                          <button
                            onClick={() => router.push(`/applications/${app.id}`)}
                            className="bg-saffron hover:bg-saffron-dark text-white font-bold px-3 py-1.5 rounded-lg text-xs transition-colors flex items-center gap-1 shadow-sm"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Track Application</span>
                          </button>
                          <button
                            onClick={() => router.push(`/applications/${app.id}`)}
                            className="bg-govBlue hover:bg-govBlue-dark text-white font-bold px-3 py-1.5 rounded-lg text-xs transition-colors flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View Details</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Next Steps & Route Actions */}
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs">
                  <div className="space-y-0.5">
                    <h4 className="font-bold text-govBlue">Next Best Actions:</h4>
                    <p className="text-slate-600">Open your project workspace or track department scrutiny across modules.</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => router.push(`/projects/${createdProjectId || urlProjectId || 'proj-1'}`)}
                      className="bg-saffron hover:bg-saffron-dark text-white font-extrabold px-5 py-3 rounded-xl shadow transition-all flex items-center gap-2"
                    >
                      <Building2 className="w-4 h-4" />
                      <span>View Project Workspace →</span>
                    </button>

                    <button
                      onClick={() => router.push('/applications')}
                      className="bg-govBlue hover:bg-govBlue-dark text-white font-bold px-4 py-3 rounded-xl shadow transition-all flex items-center gap-1.5"
                    >
                      <FileText className="w-4 h-4" />
                      <span>View All Applications</span>
                    </button>

                    <button
                      onClick={() => router.push('/dashboard')}
                      className="bg-white text-slate-700 border border-slate-300 hover:bg-slate-100 font-bold px-4 py-3 rounded-xl transition-all"
                    >
                      <span>Go to Dashboard</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {submissionError && (
                  <div className="bg-red-50 border-2 border-red-300 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4 text-xs text-red-900 shadow">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
                      <div>
                        <strong className="block font-bold">Submission Error</strong>
                        <span>{submissionError}</span>
                      </div>
                    </div>
                    <button
                      onClick={handleCreateProjectFromChecklist}
                      className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 rounded-xl transition-all"
                    >
                      Retry Submission →
                    </button>
                  </div>
                )}

                {/* AUTHENTICATION & WORKSPACE MODE CONVERSION BANNER */}
            {wizardMode === 'loading' && (
              <div className="bg-slate-100 p-6 rounded-2xl border border-slate-200 flex items-center justify-center gap-3 text-xs text-govBlue font-bold">
                <RefreshCw className="w-5 h-5 text-saffron animate-spin" />
                <span>Restoring your secure session...</span>
              </div>
            )}

            {wizardMode === 'authenticated_applicant' && (
              <div className="bg-gradient-to-r from-govBlue to-govBlue-dark text-white p-6 rounded-2xl shadow-xl space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="bg-saffron text-white font-extrabold text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded shadow">
                        Review & Submit Section
                      </span>
                      <span className="bg-green-500 text-white font-bold text-[10px] px-2 py-0.5 rounded">
                        Ready for Submission
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-saffron" /> Review Statutory Approval Details & Submit
                    </h3>
                    <p className="text-xs text-slate-200">
                      {selectedProject
                        ? `Review parameters for project '${selectedProject.name}' and submit statutory applications for department review.`
                        : `Review parameters and submit statutory applications for department review.`}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={handleCreateProjectFromChecklist}
                      disabled={isConvertingProject}
                      className="bg-saffron hover:bg-saffron-dark text-white text-xs font-extrabold px-5 py-3 rounded-xl shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>
                        {isConvertingProject
                          ? (checklist && checklist.length > 1 ? 'Submitting Applications...' : 'Submitting Application...')
                          : (checklist && checklist.length > 1 ? 'Submit Approval Applications →' : 'Submit Approval Application →')}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {wizardMode === 'onboarding_required' && (
              <div className="bg-amber-50 border-2 border-amber-300 p-6 rounded-2xl text-amber-950 space-y-3 text-xs">
                <div className="flex items-center gap-2 font-bold text-sm text-amber-900">
                  <Info className="w-5 h-5 text-saffron" />
                  <span>Complete Workspace Setup to Create Project</span>
                </div>
                <p className="leading-relaxed">
                  Your approval roadmap has been saved. Complete your first-time workspace setup to create this project and access 1-click document reuse.
                </p>
                <button
                  onClick={handleContinueOnboarding}
                  className="bg-saffron hover:bg-saffron-dark text-white text-xs font-bold px-4 py-2.5 rounded-lg shadow transition-all inline-flex items-center gap-1.5"
                >
                  <span>Continue Setup</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {wizardMode === 'non_applicant' && (
              <div className="bg-govBlue-50 border border-govBlue/30 p-5 rounded-2xl text-govBlue space-y-2 text-xs">
                <div className="font-bold text-sm">Role Notice: Project Creation</div>
                <p className="text-slate-600">
                  Project creation is available in an industrial applicant workspace. You are currently signed in as a <strong className="text-govBlue">{currentUser?.role}</strong>.
                </p>
                <button
                  onClick={() => router.push(getRoleDashboardPath(normRole))}
                  className="bg-govBlue text-white font-bold px-4 py-2 rounded-lg text-xs"
                >
                  Go to My Dashboard
                </button>
              </div>
            )}

            {wizardMode === 'guest' && (
              <div className="bg-slate-100 p-6 rounded-2xl border border-slate-300 text-xs space-y-3">
                <div className="flex items-center gap-2 font-bold text-govBlue text-sm">
                  <Lock className="w-5 h-5 text-saffron" />
                  <span>Create an Account or Sign In to Save Project</span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Sign in or register to save this approval roadmap, attach verified vault documents, track department SLAs, and submit applications.
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <button
                    onClick={handleGuestRegister}
                    className="bg-saffron hover:bg-saffron-dark text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow transition-all flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create Account to Save Project</span>
                  </button>

                  <button
                    onClick={handleGuestSignIn}
                    className="bg-govBlue hover:bg-govBlue-dark text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow transition-all"
                  >
                    <span>Sign In</span>
                  </button>
                </div>
              </div>
            )}

            {/* Checklist Results & Comprehensive Review and Submit Section */}
            {checklist && (
              <div className="space-y-6">
                {/* FINAL PRE-SUBMISSION REVIEW CARD */}
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-300 shadow-sm space-y-4 text-xs">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-saffron" />
                      <h3 className="text-base font-extrabold text-govBlue">Review and Submit Summary</h3>
                    </div>
                    <span className="bg-green-100 text-green-800 font-extrabold px-3 py-1 rounded-full text-[11px] border border-green-300 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                      <span>Readiness: Ready for Submission (85%-100%)</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 bg-white p-4 rounded-xl border border-slate-200">
                    <div>
                      <span className="text-slate-500 text-[11px] font-medium block">Parent Project Context:</span>
                      <strong className="text-govBlue font-bold block">{selectedProject?.name || formData.organisationName}</strong>
                      <span className="text-[10px] text-slate-500 font-mono">ID: {createdProjectId || urlProjectId || 'proj-1'}</span>
                    </div>

                    <div>
                      <span className="text-slate-500 text-[11px] font-medium block">Applicant & Enterprise:</span>
                      <strong className="text-slate-900 font-bold block">{formData.applicantName}</strong>
                      <span className="text-[11px] text-slate-600 font-medium">{formData.organisationName}</span>
                    </div>

                    <div>
                      <span className="text-slate-500 text-[11px] font-medium block">Project Location:</span>
                      <strong className="text-slate-900 font-bold block">{formData.district}, {formData.taluka}</strong>
                      <span className="text-[11px] text-slate-600 font-medium">{formData.locationType} Zone</span>
                    </div>

                    <div>
                      <span className="text-slate-500 text-[11px] font-medium block">Vault Document Reuse:</span>
                      <strong className="text-green-700 font-bold block">4 Verified Docs Available</strong>
                      <span className="text-[10px] text-slate-500">PAN, GST, COI & Address Proof</span>
                    </div>
                  </div>

                  {/* Approvals Review Summary Table */}
                  <div className="space-y-2">
                    <h4 className="font-bold text-govBlue text-xs">Selected Approvals & Competent Departments ({checklist.length}):</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {checklist.map((item, idx) => (
                        <div key={idx} className="bg-white p-3 rounded-xl border border-slate-200 space-y-1.5 text-[11px]">
                          <div className="flex items-center justify-between font-bold text-govBlue">
                            <span>{item.approvalTitle}</span>
                            <Badge variant={item.riskLevel === 'HIGH' || item.riskLevel === 'CRITICAL' ? 'red' : 'saffron'}>
                              {item.riskLevel} RISK
                            </Badge>
                          </div>
                          <div className="text-slate-600 font-medium">Department: <strong className="text-slate-800">{item.department}</strong></div>
                          <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[10px]">
                            <span className="text-slate-500 font-semibold">Expected SLA: {item.estimatedSlaDays} Days</span>
                            <span className="text-blue-800 font-bold">Inspection: Required</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Submission Action Callout */}
                  {wizardMode === 'authenticated_applicant' && (
                    <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200">
                      <div className="text-[11px] text-slate-600">
                        Clicking submit creates statutory application records under project <strong className="text-govBlue">{selectedProject?.name || formData.organisationName}</strong> and routes them into department scrutiny queues.
                      </div>
                      <button
                        onClick={handleCreateProjectFromChecklist}
                        disabled={isConvertingProject}
                        className="bg-saffron hover:bg-saffron-dark text-white font-extrabold px-6 py-3 rounded-xl shadow-lg transition-all text-xs flex items-center gap-2 disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>
                          {isConvertingProject
                            ? (checklist.length > 1 ? 'Submitting Applications...' : 'Submitting Application...')
                            : (checklist.length > 1 ? 'Submit Approval Applications →' : 'Submit Approval Application →')}
                        </span>
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-3 text-xs">
                  <div>
                    <h3 className="text-lg font-bold text-govBlue">
                      Required Statutory Approvals ({checklist.length})
                    </h3>
                    <p className="text-govMuted">
                      Database-driven statutory roadmap based on Maharashtra Industrial Acts.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleExportPDF}
                      leftIcon={<Download className="w-3.5 h-3.5" />}
                    >
                      Export PDF
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopyShareLink}
                      leftIcon={<Share2 className="w-3.5 h-3.5" />}
                    >
                      {shareLinkCopied ? 'Link Copied!' : 'Share'}
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  {checklist.map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3 text-xs"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-govBlue text-white text-xs font-bold flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <h4 className="text-sm font-bold text-govBlue">{item.approvalTitle}</h4>
                        </div>

                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              item.riskLevel === 'HIGH' || item.riskLevel === 'CRITICAL' ? 'red' : 'blue'
                            }
                          >
                            SLA: {item.estimatedSlaDays} Days
                          </Badge>
                          <Badge variant="saffron">{item.riskLevel} RISK</Badge>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 bg-white p-3 rounded-xl border border-slate-200">
                        <strong className="text-govBlue font-semibold">Statutory Rationale: </strong>
                        {item.whyApplicable}
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div>
                          <span className="font-semibold text-govBlue block mb-1">Competent Department:</span>
                          <span className="text-slate-700">{item.department}</span>
                        </div>

                        <div>
                          <span className="font-semibold text-govBlue block mb-1">Required Documents:</span>
                          <div className="flex flex-wrap gap-1">
                            {item.requiredDocuments.map((doc, dIdx) => (
                              <span
                                key={dIdx}
                                className="bg-white text-slate-700 px-2 py-0.5 rounded text-[11px] font-medium border border-slate-200"
                              >
                                {doc}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    )}

        {/* Wizard Arrow Navigation Footer */}
        {!isSubmittedSuccess && (
          <div className="mt-8 pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs">
            {step > 1 && (
              <Button variant="outline" onClick={handleBack} leftIcon={<ArrowLeft className="w-4 h-4" />}>
                {step === 2 && '← Back: Enterprise Profile'}
                {step === 3 && '← Back: Project & Operations'}
                {step === 4 && '← Back: Compliance & Risk Details'}
                {step === 5 && '← Back: Documents & Readiness'}
              </Button>
            )}

            {step === 1 && (
              <Button
                variant="outline"
                onClick={() => (isAuthenticated ? router.push('/dashboard') : router.push('/'))}
                leftIcon={<ArrowLeft className="w-4 h-4" />}
              >
                {isAuthenticated ? 'Back to Dashboard' : 'Back to Home'}
              </Button>
            )}

            {step === 1 && (
              <Button
                variant="primary"
                className="ml-auto"
                onClick={handleNext}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Next: Project & Operations →
              </Button>
            )}

            {step === 2 && (
              <Button
                variant="primary"
                className="ml-auto"
                onClick={handleNext}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Next: Compliance & Risk Details →
              </Button>
            )}

            {step === 3 && (
              <Button
                variant="primary"
                className="ml-auto"
                onClick={handleNext}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Next: Documents & Readiness →
              </Button>
            )}

            {step === 4 && (
              <Button
                variant="primary"
                className="ml-auto"
                onClick={handleNext}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Next: Review & Generate Roadmap →
              </Button>
            )}

            {step === 5 && !checklist && (
              <Button
                variant="secondary"
                className="ml-auto"
                onClick={handleGenerateChecklist}
                isLoading={isSubmitting}
                leftIcon={<CheckCircle2 className="w-4 h-4" />}
              >
                Generate My Approval Roadmap →
              </Button>
            )}

            {step === 5 && checklist && wizardMode === 'authenticated_applicant' && (
              <Button
                variant="primary"
                className="ml-auto bg-saffron hover:bg-saffron-dark text-white font-extrabold shadow-md border-0"
                onClick={handleCreateProjectFromChecklist}
                isLoading={isConvertingProject}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                {isConvertingProject
                  ? (checklist.length > 1 ? 'Submitting Applications...' : 'Submitting Application...')
                  : (checklist.length > 1 ? 'Submit Approval Applications →' : 'Submit Approval Application →')}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
