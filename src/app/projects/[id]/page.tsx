'use client';

import React, { useState } from 'react';
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
import {
  DEMO_VIJAY_PROJECT,
  DEMO_VIJAY_APPLICATIONS,
  IndustrialProject,
  WorkflowApplication,
} from '@/lib/workflow-engine';
import { DEMO_VIJAY_VAULT_DOCUMENTS } from '@/lib/document-reuse';
import { ROUTES } from '@/lib/routes';
import {
  Building2,
  MapPin,
  Coins,
  Users,
  Flame,
  FileCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Layers,
  ArrowRight,
  ShieldCheck,
  Activity,
  CalendarDays,
  Plus,
  Eye,
  FileText,
  Upload,
  MessageSquareWarning,
  ArrowLeft,
  X,
  Sparkles,
} from 'lucide-react';
import { getTranslation } from '@/lib/i18n';

import { WorkflowStore } from '@/lib/workflow-store';
import { useAuth } from '@/context/AuthContext';

export default function ProjectWorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const projectId = (params?.id as string) || 'proj-1';

  const { currentUser } = useAuth();
  const userEmail = currentUser?.email || 'applicant@udyogsathi.gov.in';
  const userRole = currentUser?.role || 'APPLICANT';

  const isAuthorized = WorkflowStore.checkResourceOwnership(userEmail, userRole, 'project', projectId);

  const [currentLang, setCurrentLang] = useState('en');
  const [project] = useState<IndustrialProject>(() => {
    const userProjects = WorkflowStore.getProjects(userEmail);
    return userProjects.find((p) => p.id === projectId) || DEMO_VIJAY_PROJECT;
  });

  const [applications, setApplications] = useState<WorkflowApplication[]>(() => {
    const allApps = WorkflowStore.getApplications(userEmail, userRole);
    const matchingApps = allApps.filter((a) => a.projectId === projectId);
    return matchingApps.length > 0 ? matchingApps : allApps;
  });

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const handleFastDemoScrutiny = () => {
    const updatedApps = applications.map((app) => {
      const updatedApp: WorkflowApplication = {
        ...app,
        status: 'approved',
        decisionDetails: {
          decision: 'approved',
          decidedByOfficer: 'Department Scrutiny Officer',
          decidedAt: new Date().toISOString().split('T')[0],
          remarks: 'Accelerated workflow review executed. All statutory requirements validated.',
          certificateNumber: `GOV/MH/2026/${Math.floor(1000 + Math.random() * 9000)}`,
          validityExpiryDate: '2031-12-31',
        },
      };
      WorkflowStore.saveApplication(updatedApp, userEmail);
      return updatedApp;
    });

    setApplications(updatedApps);
    setToastMsg('Accelerated Review Executed: All statutory applications for this project are now Approved.');
    setTimeout(() => setToastMsg(null), 5000);
  };

  const totalRequired = project.totalApprovalsRequired;
  const approvedCount = applications.filter((a) => a.status === 'approved').length;
  const underScrutinyCount = applications.filter((a) => a.status === 'submitted' || a.status === 'under_scrutiny').length;
  const queryCount = applications.filter((a) => a.status === 'query_raised').length;
  const inspectionCount = applications.filter((a) => a.status === 'inspection_scheduled').length;
  const returnedCount = applications.filter((a) => a.status === 'returned_for_correction').length;
  const readyToApplyCount = applications.filter((a) => a.status === 'ready_for_submission').length;

  const projectTimeline = [
    { date: '2026-01-15', event: 'Industrial Project Created in UdyogSathi', type: 'SYSTEM' },
    { date: '2026-01-16', event: 'Approval Checklist Generated (5 Statutory Approvals Required)', type: 'WIZARD' },
    { date: '2026-01-20', event: 'MIDC Plot Lease Deed Uploaded to Document Vault', type: 'VAULT' },
    { date: '2026-01-22', event: 'MIDC Plot Lease Deed Verified by Officer', type: 'VERIFICATION' },
    { date: '2026-02-05', event: 'Submitted Factory Building Plan Approval (DISH)', type: 'SUBMISSION' },
    { date: '2026-02-15', event: 'Submitted Consent to Establish CTE (MPCB)', type: 'SUBMISSION' },
    { date: '2026-02-18', event: 'Factory Building Plan Approved by DISH (Certificate DISH/PN/2026/FPA-4491)', type: 'DECISION' },
    { date: '2026-08-26', event: 'Fire Safety Clearance Application Returned for Correction (Fire NOC Expired)', type: 'DECISION' },
    { date: '2026-08-27', event: 'Query Raised by MPCB Sub-Regional Officer on Wastewater Balance Sheet', type: 'QUERY' },
    { date: '2026-08-28', event: 'DISH Factory Safety Inspection Scheduled for 05 Sep 2026', type: 'INSPECTION' },
  ];

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
              <h2 className="text-xl font-bold text-govBlue">Project Access Restricted</h2>
              <p className="text-xs text-govMuted leading-relaxed">
                You do not have permission to view or manage industrial project workspace <strong className="font-mono text-slate-800">{projectId}</strong>. This project belongs to another industrial entity workspace.
              </p>
              <div className="pt-2">
                <Link
                  href="/projects"
                  className="bg-govBlue text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow hover:bg-govBlue-dark inline-flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" /> Return to My Industrial Projects
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
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-2 text-xs text-govMuted">
            <Link href={ROUTES.dashboard} className="hover:text-govBlue">Workspace</Link>
            <span>/</span>
            <Link href={ROUTES.projects} className="hover:text-govBlue">Projects</Link>
            <span>/</span>
            <span className="font-semibold text-govBlue">{project.name}</span>
          </div>

          {/* Project Profile Header Card */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-govBorder space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Building2 className="w-6 h-6 text-saffron" />
                  <h1 className="text-xl font-bold text-govBlue">{project.name}</h1>
                  <Badge variant={project.environmentalCategory === 'ORANGE' ? 'amber' : 'red'}>
                    {project.environmentalCategory} Category
                  </Badge>
                </div>
                <p className="text-xs text-govMuted">
                  Promoter: <strong className="text-govBlue">{project.promoterName}</strong> | Created on {project.createdAt.split('T')[0]}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/approval-wizard?projectId=${project.id}&mode=new`}
                  className="bg-saffron hover:bg-saffron-dark text-white text-xs font-bold px-4 py-2 rounded-lg shadow transition-all flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Approval Requirement</span>
                </Link>
              </div>
            </div>

            {/* Project Attributes Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-slate-500 block text-[11px]">Industrial Sector:</span>
                <strong className="text-govBlue block mt-0.5">{project.sector}</strong>
                <span className="text-[10px] text-slate-500">{project.subSector}</span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-slate-500 block text-[11px]">Location & Zoning:</span>
                <strong className="text-govBlue block mt-0.5">{project.district}, {project.taluka}</strong>
                <span className="text-[10px] text-slate-500">{project.plotNumber}</span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-slate-500 block text-[11px]">Investment & Scale:</span>
                <strong className="text-govBlue block mt-0.5">₹{(project.investmentAmountINR / 10000000).toFixed(1)} Cr</strong>
                <span className="text-[10px] text-slate-500">{project.workforceCount} Workers</span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-slate-500 block text-[11px]">Project Stage:</span>
                <strong className="text-govBlue block mt-0.5">{project.projectStage.replace('_', ' ')}</strong>
                <span className="text-[10px] text-saffron font-bold">Stage 4 of 8 (Apply)</span>
              </div>
            </div>
          </div>

          {/* 8-Step Visual Stepper */}
          <div className="bg-white p-5 rounded-2xl border border-govBorder shadow-sm">
            <JourneyStepper activeStep={project.currentStageNumber} lang={currentLang} />
          </div>

          {/* Toast Notification Banner */}
          {toastMsg && (
            <div className="bg-green-600 text-white p-4 rounded-xl shadow-lg font-bold text-xs flex items-center justify-between animate-fadeIn">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-saffron shrink-0" />
                <span>{toastMsg}</span>
              </div>
              <button onClick={() => setToastMsg(null)} className="text-white hover:text-slate-200">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Approval Summary & Status Matrix */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-govBorder space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="space-y-0.5">
                <h2 className="text-base font-bold text-govBlue flex items-center gap-2">
                  <Layers className="w-5 h-5 text-saffron" /> Statutory Approval Matrix ({applications.length} / {totalRequired})
                </h2>
                <span className="text-xs text-govMuted block">
                  {approvedCount === applications.length && applications.length > 0
                    ? 'Approval Process Completed'
                    : 'Applications in Progress'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleFastDemoScrutiny}
                  className="bg-govBlue hover:bg-govBlue-dark text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow transition-all flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-saffron" />
                  <span>Accelerate Review Process</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                <span className="text-slate-500 block text-[11px]">Approved</span>
                <span className="text-xl font-extrabold text-green-700 mt-1 block">{approvedCount}</span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                <span className="text-slate-500 block text-[11px]">Under Scrutiny</span>
                <span className="text-xl font-extrabold text-blue-700 mt-1 block">{underScrutinyCount}</span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                <span className="text-slate-500 block text-[11px]">Query Raised</span>
                <span className="text-xl font-extrabold text-saffron mt-1 block">{queryCount}</span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                <span className="text-slate-500 block text-[11px]">Inspections</span>
                <span className="text-xl font-extrabold text-purple-700 mt-1 block">{inspectionCount}</span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                <span className="text-slate-500 block text-[11px]">Returned</span>
                <span className="text-xl font-extrabold text-red-600 mt-1 block">{returnedCount}</span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                <span className="text-slate-500 block text-[11px]">Ready to Submit</span>
                <span className="text-xl font-extrabold text-amber-600 mt-1 block">{readyToApplyCount}</span>
              </div>
            </div>
          </div>

          {/* Connected Applications List */}
          <div className="bg-white rounded-2xl shadow-sm border border-govBorder overflow-hidden space-y-4">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-sm font-bold text-govBlue flex items-center gap-2">
                <FileText className="w-4 h-4 text-saffron" /> Project Statutory Applications
              </h3>
              <Link href={ROUTES.applications} className="text-xs font-bold text-govBlue hover:text-saffron">
                Open Applications Workspace →
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              {applications.map((app) => (
                <div key={app.id} className="p-4 flex flex-wrap items-center justify-between gap-4 text-xs hover:bg-slate-50 transition-colors">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-govBlue text-xs">{app.referenceNumber}</span>
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-semibold text-[10px]">
                        {app.department}
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-800">{app.approvalTitle}</h4>
                    <p className="text-[11px] text-slate-500">{app.statutoryAct}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="block font-bold text-slate-700">SLA: {app.slaDaysRemaining} days remaining</span>
                      <span className="text-[10px] text-green-700 font-bold">{app.reusedDocumentIds.length} Verified Docs Reused</span>
                    </div>

                    <Link
                      href={`/applications/${app.id}`}
                      className="bg-govBlue hover:bg-govBlue-dark text-white font-bold px-3 py-1.5 rounded-lg text-xs transition-colors"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Timeline Audit Logs */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-govBorder space-y-4">
            <h3 className="text-base font-bold text-govBlue flex items-center gap-2 border-b border-slate-100 pb-3">
              <Activity className="w-5 h-5 text-saffron" /> Complete Project Journey & Audit Timeline
            </h3>

            <div className="space-y-3">
              {projectTimeline.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 text-xs border-l-2 border-govBlue pl-3 py-1">
                  <div className="font-mono font-bold text-govBlue shrink-0 w-24">{item.date}</div>
                  <div className="text-slate-700 flex-1">{item.event}</div>
                  <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                    {item.type}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </ProtectedRoute>
  );
}
