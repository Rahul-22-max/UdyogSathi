'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
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
  getNextBestActions,
} from '@/lib/workflow-engine';
import { ROUTES } from '@/lib/routes';
import {
  Building2,
  FileCheck,
  Clock,
  AlertTriangle,
  CheckCircle2,
  FileText,
  SearchCheck,
  Plus,
  ArrowRight,
  ShieldCheck,
  Layers,
  Sparkles,
  RefreshCw,
  Eye,
  MessageSquareWarning,
  CalendarDays,
  ExternalLink,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { WorkflowStore } from '@/lib/workflow-store';

interface ApplicantSummaryData {
  projects: Array<{
    _id: string;
    projectCode: string;
    name: string;
    sector: string;
    locationType: string;
    plotNumber?: string;
    investmentAmount?: number;
    stage?: string;
    status: string;
  }>;
  totalApplications: number;
  approvedCount: number;
  pendingCount: number;
  queryCount: number;
  inspectionCount: number;
  returnedCount: number;
  readyForSubmissionCount: number;
  recentApplications: Array<{
    _id: string;
    applicationNumber: string;
    approvalName: string;
    department: string;
    status: string;
    riskLevel: string;
    slaDays: number;
    submittedAt?: string;
    expectedDecisionDate?: string;
    projectId?: { _id: string; name: string };
  }>;
}

export default function ApplicantDashboardPage() {
  const router = useRouter();
  const { currentUser } = useAuth();
  const [currentLang, setCurrentLang] = useState('en');
  const [summaryData, setSummaryData] = useState<ApplicantSummaryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const userEmail = currentUser?.email || 'applicant@udyogsathi.gov.in';

  const fetchApplicantSummary = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/dashboard/applicant-summary');
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setSummaryData(json.data);
        }
      }
    } catch (err) {
      console.error('Applicant summary fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicantSummary();
  }, []);

  const userProjects = WorkflowStore.getProjects(userEmail);
  const activeProject = userProjects[0] || {
    id: `proj-empty-${userEmail}`,
    name: `${currentUser?.name || 'Vijay Kulkarni'} Foods & Agro Processing Unit`,
    promoterName: currentUser?.name || 'Vijay Kulkarni',
    sector: 'Food Processing & Cold Chain Unit',
    locationType: 'MIDC Chakan Phase II',
    plotNumber: 'Plot C-14',
    investmentInrLakhs: 450,
    totalApprovalsRequired: 2,
    environmentalCategory: 'ORANGE',
    currentStageNumber: 4,
  };

  const applications = WorkflowStore.getApplications(userEmail, 'APPLICANT');
  const nextBestActions = getNextBestActions('applicant', activeProject, applications);

  const totalApprovals = summaryData?.totalApplications || activeProject.totalApprovalsRequired || 2;
  const approvedCount = summaryData?.approvedCount ?? 0;
  const pendingCount = summaryData?.pendingCount ?? 2;
  const queryCount = summaryData?.queryCount ?? 0;
  const inspectionCount = summaryData?.inspectionCount ?? 1;
  const returnedCount = summaryData?.returnedCount ?? 0;
  const readyForSubmissionCount = summaryData?.readyForSubmissionCount ?? 1;

  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case 'APPROVED':
        return <Badge variant="green">Approved</Badge>;
      case 'REJECTED':
        return <Badge variant="red">Rejected</Badge>;
      case 'QUERY_RAISED':
        return <Badge variant="saffron">Query Raised</Badge>;
      case 'INSPECTION_SCHEDULED':
        return <Badge variant="blue">Inspection Scheduled</Badge>;
      case 'INSPECTION_COMPLETED':
        return <Badge variant="blue">Awaiting Department Decision</Badge>;
      case 'RETURNED_FOR_CORRECTION':
        return <Badge variant="red">Returned for Correction</Badge>;
      case 'READY_FOR_SUBMISSION':
        return <Badge variant="amber">Ready for Submission</Badge>;
      case 'SUBMITTED':
      case 'UNDER_REVIEW':
      case 'UNDER_SCRUTINY':
        return <Badge variant="blue">Under Department Review</Badge>;
      default:
        return <Badge variant="gray">{status.replace(/_/g, ' ')}</Badge>;
    }
  };

  return (
    <ProtectedRoute>
      <div className="bg-[#f7f9fc] min-h-screen flex flex-col font-sans">
        <TopUtilityBar currentLang={currentLang} onLanguageChange={setCurrentLang} />
        <OfficialHeader currentLang={currentLang} />
        <DisclaimerBanner lang={currentLang} />

        <main id="main-content" className="flex-1 py-8 px-4 max-w-7xl mx-auto w-full space-y-6">
          {/* Active Industrial Project Header */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-govBorder flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Building2 className="w-6 h-6 text-saffron" />
                <h1 className="text-xl font-bold text-govBlue">{summaryData?.projects?.[0]?.name || activeProject.name}</h1>
                <span className="bg-govBlue-50 text-govBlue text-[10px] font-bold px-2.5 py-0.5 rounded border border-govBlue/20">
                  {activeProject.locationType}
                </span>
              </div>
              <p className="text-xs text-govMuted">
                Promoter: <strong className="text-govBlue">{currentUser?.name || 'Vijay Kulkarni'}</strong> | Sector: {activeProject.sector} | Investment: ₹4.5 Cr | Zone: {activeProject.environmentalCategory} Category
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => {
                  const { route } = WorkflowStore.resolveProjectRouteForApproval(userEmail);
                  router.push(route);
                }}
                className="bg-saffron hover:bg-saffron-dark text-white text-xs font-extrabold px-4 py-2.5 rounded-xl shadow transition-all flex items-center gap-1.5"
              >
                <Sparkles className="w-4 h-4 text-white" />
                <span>Start Approval Journey</span>
              </button>

              <Link
                href={`/projects/proj-vijay-1`}
                className="bg-govBlue hover:bg-govBlue-dark text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow transition-all flex items-center gap-1.5"
              >
                <Eye className="w-4 h-4 text-saffron" />
                <span>Project Workspace</span>
              </Link>
            </div>
          </div>

          {/* 8-Step Visual Stepper (Retained strictly for Applicants) */}
          {normalizeRole(currentUser?.role) === 'applicant' && (
            <section aria-label="Approval Journey Stepper" className="bg-white p-5 rounded-2xl border border-govBorder shadow-sm">
              <JourneyStepper activeStep={4} lang={currentLang} />
            </section>
          )}

          {/* NEXT BEST ACTION RECOMMENDATION */}
          {nextBestActions.length > 0 && (
            <section aria-label="Next Best Action Recommendation Engine" className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-govBlue">
                <Sparkles className="w-4 h-4 text-saffron" />
                <span>Next Best Recommended Actions ({nextBestActions.length})</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {nextBestActions.map((action) => (
                  <div
                    key={action.id}
                    className={`p-4 rounded-xl border shadow-sm flex flex-col justify-between space-y-3 ${
                      action.priority === 'CRITICAL'
                        ? 'bg-red-50/80 border-red-300 text-red-950'
                        : action.priority === 'HIGH'
                        ? 'bg-amber-50/80 border-amber-300 text-amber-950'
                        : 'bg-blue-50/80 border-blue-300 text-blue-950'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-[10px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider ${
                            action.priority === 'CRITICAL'
                              ? 'bg-red-600 text-white'
                              : action.priority === 'HIGH'
                              ? 'bg-saffron text-white'
                              : 'bg-govBlue text-white'
                          }`}
                        >
                          {action.priority} PRIORITY
                        </span>
                        <span className="text-[10px] font-bold uppercase text-slate-500">{action.category}</span>
                      </div>
                      <h3 className="font-bold text-xs leading-snug">{action.title}</h3>
                      <p className="text-[11px] leading-relaxed opacity-90">{action.description}</p>
                    </div>

                    <Link
                      href={action.targetHref}
                      className={`inline-flex items-center justify-between text-xs font-extrabold p-2.5 rounded-lg border transition-all ${
                        action.priority === 'CRITICAL'
                          ? 'bg-red-600 hover:bg-red-700 text-white border-red-700 shadow'
                          : action.priority === 'HIGH'
                          ? 'bg-saffron hover:bg-saffron-dark text-white border-saffron-dark shadow'
                          : 'bg-govBlue hover:bg-govBlue-dark text-white border-govBlue-dark'
                      }`}
                    >
                      <span>{action.actionButtonText}</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Metric Overview Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 text-xs">
            <div className="bg-white p-3.5 rounded-xl border border-govBorder shadow-sm">
              <span className="text-slate-500 font-semibold block text-[11px]">Identified</span>
              <span className="text-xl font-extrabold text-govBlue mt-0.5 block">{totalApprovals}</span>
              <span className="text-[10px] text-govMuted">Required</span>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-govBorder shadow-sm">
              <span className="text-slate-500 font-semibold block text-[11px]">Ready to Submit</span>
              <span className="text-xl font-extrabold text-amber-600 mt-0.5 block">{readyForSubmissionCount}</span>
              <span className="text-[10px] text-amber-700 font-bold">Docs Reused</span>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-govBorder shadow-sm">
              <span className="text-slate-500 font-semibold block text-[11px]">Under Review</span>
              <span className="text-xl font-extrabold text-blue-600 mt-0.5 block">{pendingCount}</span>
              <span className="text-[10px] text-blue-700 font-bold">SLA Tracked</span>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-govBorder shadow-sm">
              <span className="text-slate-500 font-semibold block text-[11px]">Queries Raised</span>
              <span className="text-xl font-extrabold text-saffron mt-0.5 block">{queryCount}</span>
              <span className="text-[10px] text-saffron font-bold">Action Needed</span>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-govBorder shadow-sm">
              <span className="text-slate-500 font-semibold block text-[11px]">Inspections</span>
              <span className="text-xl font-extrabold text-purple-600 mt-0.5 block">{inspectionCount}</span>
              <span className="text-[10px] text-purple-700 font-bold">Scheduled</span>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-govBorder shadow-sm">
              <span className="text-slate-500 font-semibold block text-[11px]">Returned</span>
              <span className="text-xl font-extrabold text-red-600 mt-0.5 block">{returnedCount}</span>
              <span className="text-[10px] text-red-700 font-bold">Correction</span>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-govBorder shadow-sm">
              <span className="text-slate-500 font-semibold block text-[11px]">Approved</span>
              <span className="text-xl font-extrabold text-green-700 mt-0.5 block">{approvedCount}</span>
              <span className="text-[10px] text-green-800 font-bold">Clearance Certs</span>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-govBorder shadow-sm">
              <span className="text-slate-500 font-semibold block text-[11px]">Vault Readiness</span>
              <span className="text-xl font-extrabold text-govBlue mt-0.5 block">100%</span>
              <span className="text-[10px] text-green-700 font-bold">Verified Docs</span>
            </div>
          </div>

          {/* APPLICATION WORKFLOW TABLE */}
          <div className="bg-white rounded-2xl shadow-sm border border-govBorder overflow-hidden space-y-4">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-govBlue flex items-center gap-2">
                  <FileText className="w-4 h-4 text-saffron" /> Active Statutory Applications ({summaryData?.recentApplications?.length || applications.length})
                </h3>
                <p className="text-[11px] text-govMuted mt-0.5">
                  Single window department workflow tracking, query responses, and inspection schedules.
                </p>
              </div>

              <Link
                href={ROUTES.applications}
                className="text-xs font-bold text-govBlue hover:text-saffron flex items-center gap-1"
              >
                <span>View All Applications Workspace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-govBlue text-white text-[11px]">
                    <th className="p-3 font-semibold">Application Ref</th>
                    <th className="p-3 font-semibold">Approval Title & Dept</th>
                    <th className="p-3 font-semibold">Status</th>
                    <th className="p-3 font-semibold">SLA Countdown</th>
                    <th className="p-3 font-semibold">Vault Docs</th>
                    <th className="p-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {summaryData?.recentApplications && summaryData.recentApplications.length > 0 ? (
                    summaryData.recentApplications.map((app) => (
                      <tr key={app._id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3 font-mono font-bold text-govBlue">
                          {app.applicationNumber}
                        </td>
                        <td className="p-3">
                          <div className="font-bold text-slate-800">{app.approvalName}</div>
                          <div className="text-[11px] text-slate-500">{app.department}</div>
                        </td>
                        <td className="p-3">{getStatusBadge(app.status)}</td>
                        <td className="p-3">
                          <span className="bg-green-100 text-green-900 border border-green-300 px-2 py-0.5 rounded text-[10px] font-bold">
                            {app.slaDays || 30} Days Remaining
                          </span>
                        </td>
                        <td className="p-3">
                          <span className="bg-green-50 text-green-800 font-bold px-2 py-0.5 rounded text-[11px] border border-green-200">
                            Reused
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <Link
                            href={`/applications/${app._id}`}
                            className="inline-flex items-center gap-1 text-xs font-bold text-govBlue hover:bg-govBlue-50 px-3 py-1.5 rounded-lg border border-govBlue/20 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View Details</span>
                          </Link>
                        </td>
                      </tr>
                    ))
                  ) : (
                    applications.map((app) => (
                      <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3 font-mono font-bold text-govBlue">{app.referenceNumber}</td>
                        <td className="p-3">
                          <div className="font-bold text-slate-800">{app.approvalTitle}</div>
                          <div className="text-[11px] text-slate-500">{app.department}</div>
                        </td>
                        <td className="p-3">{getStatusBadge(app.status)}</td>
                        <td className="p-3">
                          <span className="bg-green-100 text-green-900 border border-green-300 px-2 py-0.5 rounded text-[10px] font-bold">
                            {app.slaDaysRemaining} Days Remaining
                          </span>
                        </td>
                        <td className="p-3">
                          <span className="bg-green-50 text-green-800 font-bold px-2 py-0.5 rounded text-[11px] border border-green-200">
                            Reused
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <Link
                            href={`/applications/${app.id}`}
                            className="inline-flex items-center gap-1 text-xs font-bold text-govBlue hover:bg-govBlue-50 px-3 py-1.5 rounded-lg border border-govBlue/20 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View Details</span>
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </ProtectedRoute>
  );
}
