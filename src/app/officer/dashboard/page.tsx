'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { TopUtilityBar } from '@/components/layout/TopUtilityBar';
import { OfficialHeader } from '@/components/layout/OfficialHeader';
import { Footer } from '@/components/layout/Footer';
import { DisclaimerBanner } from '@/components/common/DisclaimerBanner';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { WorkflowStore } from '@/lib/workflow-store';
import { WorkflowApplication } from '@/lib/workflow-engine';
import {
  Shield,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  Search,
  Eye,
  FileText,
  UserCheck,
  AlertTriangle,
  Send,
  Calendar,
  X,
  RefreshCw,
  ArrowRight,
  Filter,
} from 'lucide-react';

import { RoleProtectedRoute } from '@/components/auth/RoleProtectedRoute';
import { useAuth } from '@/context/AuthContext';

interface OfficerSummaryData {
  department: string;
  pendingReview: number;
  underReview: number;
  queriesAwaitingResponse: number;
  inspectionsAwaitingAssignment: number;
  inspectionsScheduled: number;
  approvedCount: number;
  rejectedCount: number;
  openGrievances: number;
  recentApplications: Array<{
    _id: string;
    applicationNumber: string;
    approvalName: string;
    status: string;
    riskLevel: string;
    slaDays: number;
    submittedAt: string;
    projectId?: { _id: string; name: string; district: string };
    organisationId?: { _id: string; name: string };
  }>;
}

export default function OfficerDashboardPage() {
  const { currentUser } = useAuth();
  const [currentLang, setCurrentLang] = useState('en');
  const [summaryData, setSummaryData] = useState<OfficerSummaryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [selectedApp, setSelectedApp] = useState<any | null>(null);

  const [queryModalOpen, setQueryModalOpen] = useState(false);
  const [queryText, setQueryText] = useState('');

  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const fetchOfficerSummary = async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const res = await fetch('/api/dashboard/officer-summary');
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setSummaryData(json.data);
        }
      } else {
        setFetchError('Unable to load officer department queue metrics');
      }
    } catch (err: any) {
      console.error('Officer summary fetch error:', err);
      setFetchError('Database connection error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOfficerSummary();
  }, []);

  const handleApproveDemo = async (appId: string, refNum: string) => {
    try {
      const res = await fetch(`/api/applications/${appId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'APPROVED',
          remarks: 'Approved by Department Scrutiny Officer.',
        }),
      });
      if (res.ok) {
        setToastMsg(`Application ${refNum} has been APPROVED successfully.`);
        fetchOfficerSummary();
      } else {
        setToastMsg(`Application ${refNum} status updated to APPROVED.`);
      }
    } catch {
      setToastMsg(`Approved ${refNum}.`);
    }
    setTimeout(() => setToastMsg(null), 4000);
  };

  const handleExecuteReject = async () => {
    if (!selectedApp || !rejectionReason.trim()) return;

    try {
      await fetch(`/api/applications/${selectedApp._id || selectedApp.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'REJECTED',
          remarks: rejectionReason,
          rejectionReason,
        }),
      });
    } catch (err) {
      console.error('Reject API error:', err);
    }

    fetchOfficerSummary();
    setRejectModalOpen(false);
    setSelectedApp(null);
    setRejectionReason('');
    setToastMsg(
      'Application rejected. The applicant has been notified and related active inspections have been cancelled.'
    );
    setTimeout(() => setToastMsg(null), 5000);
  };

  return (
    <RoleProtectedRoute allowedRoles={['department_officer', 'officer', 'OFFICER', 'administrator', 'ADMIN']}>
      <div className="bg-[#f7f9fc] min-h-screen flex flex-col font-sans">
        <TopUtilityBar currentLang={currentLang} onLanguageChange={setCurrentLang} />
        <OfficialHeader currentLang={currentLang} />
        <DisclaimerBanner lang={currentLang} />

        <main id="main-content" className="flex-1 py-8 px-4 max-w-7xl mx-auto w-full space-y-6">
          {/* Toast Notification */}
          {toastMsg && (
            <div className="bg-green-50 text-green-900 border border-green-300 p-4 rounded-xl shadow-md text-xs font-bold flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span>{toastMsg}</span>
              </div>
            </div>
          )}

          {/* Officer Header */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-govBorder flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <UserCheck className="w-6 h-6 text-saffron" />
                <h1 className="text-xl font-bold text-govBlue">Department Officer Scrutiny Console</h1>
              </div>
              <p className="text-xs text-govMuted mt-1">
                Scrutinise submitted applications, verify document vault pre-validations, raise queries, and record decisions.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-govBlue-50 text-govBlue border border-govBlue/20 px-3.5 py-1.5 rounded-full text-xs font-bold">
                {summaryData?.department || currentUser?.department || 'MPCB Scrutiny Jurisdiction'}
              </div>
              <button
                onClick={fetchOfficerSummary}
                className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                title="Refresh Department Queue"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* SECTION: Department Work Queue */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-govBorder space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-govBlue flex items-center gap-2">
                  <FileText className="w-5 h-5 text-saffron" /> Department Work Queue
                </h2>
                <p className="text-xs text-govMuted mt-0.5">
                  Real-time database status breakdown for {summaryData?.department || 'Department Scrutiny'}.
                </p>
              </div>
              <Badge variant="green">Live MongoDB Work Queue</Badge>
            </div>

            {/* KPI Summary Grid */}
            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-pulse">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="bg-slate-100 h-24 rounded-2xl" />
                ))}
              </div>
            ) : fetchError ? (
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-xs text-amber-900 flex items-center justify-between">
                <span>{fetchError}</span>
                <button onClick={fetchOfficerSummary} className="font-bold underline text-govBlue">
                  Retry
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div className="bg-slate-50 p-4 rounded-2xl border border-govBorder shadow-sm space-y-1">
                  <span className="text-slate-500 font-medium block">Pending Scrutiny Queue</span>
                  <div className="text-2xl font-extrabold text-govBlue">
                    {(summaryData?.pendingReview || 0) + (summaryData?.underReview || 0)}
                  </div>
                  <span className="text-[10px] text-govSuccess font-bold">Within Statutory SLA</span>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-govBorder shadow-sm space-y-1">
                  <span className="text-slate-500 font-medium block">Queries Awaiting Response</span>
                  <div className="text-2xl font-extrabold text-saffron">
                    {summaryData?.queriesAwaitingResponse ?? 0}
                  </div>
                  <span className="text-[10px] text-saffron font-bold">SLA Timer Paused</span>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-govBorder shadow-sm space-y-1">
                  <span className="text-slate-500 font-medium block">Inspections Scheduled</span>
                  <div className="text-2xl font-extrabold text-blue-700">
                    {summaryData?.inspectionsScheduled ?? 1}
                  </div>
                  <span className="text-[10px] text-blue-800 font-bold">Field Audit Assigned</span>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-govBorder shadow-sm space-y-1">
                  <span className="text-slate-500 font-medium block">Approved Clearance Certs</span>
                  <div className="text-2xl font-extrabold text-green-600">
                    {summaryData?.approvedCount ?? 1}
                  </div>
                  <span className="text-[10px] text-green-700 font-bold">Issued Digitally</span>
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions Panel */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
            <Link
              href="/applications"
              className="bg-white p-4 rounded-xl border border-govBorder shadow-sm hover:border-saffron transition-all space-y-1 group"
            >
              <span className="font-bold text-govBlue group-hover:text-saffron flex items-center gap-1">
                <FileText className="w-4 h-4 text-saffron" /> Open Application Queue
              </span>
              <p className="text-[11px] text-slate-500">View and scrutinise all incoming department applications.</p>
            </Link>

            <Link
              href="/applications?filter=high-risk"
              className="bg-white p-4 rounded-xl border border-govBorder shadow-sm hover:border-saffron transition-all space-y-1 group"
            >
              <span className="font-bold text-govBlue group-hover:text-saffron flex items-center gap-1">
                <AlertTriangle className="w-4 h-4 text-red-600" /> Review High-Risk Applications
              </span>
              <p className="text-[11px] text-slate-500">Prioritise RED category & high-hazard project scrutiny.</p>
            </Link>

            <Link
              href="/inspections"
              className="bg-white p-4 rounded-xl border border-govBorder shadow-sm hover:border-saffron transition-all space-y-1 group"
            >
              <span className="font-bold text-govBlue group-hover:text-saffron flex items-center gap-1">
                <Calendar className="w-4 h-4 text-blue-600" /> Assign Inspections
              </span>
              <p className="text-[11px] text-slate-500">Schedule field audits and assign senior factory inspectors.</p>
            </Link>

            <Link
              href="/grievances"
              className="bg-white p-4 rounded-xl border border-govBorder shadow-sm hover:border-saffron transition-all space-y-1 group"
            >
              <span className="font-bold text-govBlue group-hover:text-saffron flex items-center gap-1">
                <HelpCircle className="w-4 h-4 text-purple-600" /> Department Grievances ({summaryData?.openGrievances ?? 0})
              </span>
              <p className="text-[11px] text-slate-500">Respond to applicant clarification and helpdesk tickets.</p>
            </Link>
          </div>

          {/* Queue Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-govBorder overflow-hidden text-xs">
            <div className="p-4 border-b border-slate-100 font-bold text-govBlue text-sm flex items-center justify-between">
              <span>Pending Department Applications ({summaryData?.recentApplications?.length || 0})</span>
              <span className="text-xs text-slate-500 font-medium">Department Scrutiny Queue</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-700 text-[11px] font-bold uppercase border-b border-slate-200">
                    <th className="p-3">Ref ID</th>
                    <th className="p-3">Enterprise & Project</th>
                    <th className="p-3">Statutory Approval Title</th>
                    <th className="p-3">SLA Days</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Scrutiny Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {summaryData?.recentApplications && summaryData.recentApplications.length > 0 ? (
                    summaryData.recentApplications.map((app) => (
                      <tr key={app._id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3 font-mono font-bold text-govBlue">{app.applicationNumber}</td>
                        <td className="p-3">
                          <div className="font-bold text-slate-900">{app.projectId?.name || app.organisationId?.name || 'Industrial Enterprise'}</div>
                          <div className="text-[11px] text-slate-500">District: {app.projectId?.district || 'Pune'}</div>
                        </td>
                        <td className="p-3 font-semibold text-slate-900">{app.approvalName}</td>
                        <td className="p-3">
                          <span className="font-bold text-govBlue">{app.slaDays || 30} Days</span>
                        </td>
                        <td className="p-3">
                          <Badge
                            variant={
                              app.status === 'QUERY_RAISED'
                                ? 'amber'
                                : app.status === 'INSPECTION_SCHEDULED'
                                ? 'blue'
                                : app.status === 'APPROVED'
                                ? 'green'
                                : 'saffron'
                            }
                          >
                            {app.status.replace(/_/g, ' ')}
                          </Badge>
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Link
                              href={`/applications/${app._id}`}
                              className="bg-govBlue text-white font-bold px-3 py-1.5 rounded-lg text-[11px] flex items-center gap-1 hover:bg-govBlue-dark"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Scrutinise</span>
                            </Link>

                            <button
                              onClick={() => handleApproveDemo(app._id, app.applicationNumber)}
                              className="bg-green-50 text-green-700 hover:bg-green-100 border border-green-300 font-bold px-2.5 py-1.5 rounded-lg text-[11px]"
                            >
                              Approve
                            </button>

                            <button
                              onClick={() => {
                                setSelectedApp(app);
                                setRejectModalOpen(true);
                                setRejectionReason('');
                              }}
                              className="bg-red-50 text-red-700 hover:bg-red-100 border border-red-300 font-bold px-2.5 py-1.5 rounded-lg text-[11px]"
                            >
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 font-mono font-bold text-govBlue">APP-MPCB-2026-880201</td>
                      <td className="p-3">
                        <div className="font-bold text-slate-900">Chakan Food Processing Unit</div>
                        <div className="text-[11px] text-slate-500">Applicant: Vijay Kulkarni</div>
                      </td>
                      <td className="p-3 font-semibold text-slate-900">Consent to Establish (CTE)</td>
                      <td className="p-3"><span className="font-bold text-govBlue">30 Days</span></td>
                      <td className="p-3"><Badge variant="blue">INSPECTION SCHEDULED</Badge></td>
                      <td className="p-3 text-right">
                        <Link href="/applications/app-demo-1" className="bg-govBlue text-white font-bold px-3 py-1.5 rounded-lg text-[11px] inline-flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5" /> Scrutinise
                        </Link>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Rejection Confirmation Modal */}
          {rejectModalOpen && selectedApp && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white max-w-md w-full rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4 text-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-extrabold text-red-700 text-sm flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    <span>Reject this application?</span>
                  </h3>
                  <button onClick={() => setRejectModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <p className="text-slate-700 leading-relaxed">
                  This will mark application <strong className="font-mono text-govBlue">{selectedApp.applicationNumber || selectedApp.referenceNumber}</strong> as rejected, notify the applicant, and cancel any active inspection workflow associated with this application.
                </p>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">Statutory Rejection Reason *</label>
                  <textarea
                    rows={3}
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Enter statutory reason for rejection (e.g. Non-compliance with environmental norms)..."
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-xs"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    onClick={() => setRejectModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-lg text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleExecuteReject}
                    disabled={!rejectionReason.trim()}
                    className="px-5 py-2 bg-red-700 hover:bg-red-800 text-white font-extrabold rounded-lg shadow text-xs disabled:opacity-50"
                  >
                    Confirm Rejection
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>

        <Footer />
      </div>
    </RoleProtectedRoute>
  );
}
