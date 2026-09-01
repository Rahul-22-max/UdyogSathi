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
} from 'lucide-react';

import { RoleProtectedRoute } from '@/components/auth/RoleProtectedRoute';
import { useAuth } from '@/context/AuthContext';

export default function OfficerDashboardPage() {
  const { currentUser } = useAuth();
  const [currentLang, setCurrentLang] = useState('en');
  const [applications, setApplications] = useState<WorkflowApplication[]>([]);
  const [selectedApp, setSelectedApp] = useState<WorkflowApplication | null>(null);

  const [queryModalOpen, setQueryModalOpen] = useState(false);
  const [queryText, setQueryText] = useState('');

  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    setApplications(WorkflowStore.getApplications());
  }, []);

  const refreshApps = () => {
    setApplications(WorkflowStore.getApplications());
  };

  const pendingQueue = applications.filter((a) => a.status !== 'approved' && a.status !== 'rejected');

  const handleApproveDemo = (app: WorkflowApplication) => {
    WorkflowStore.makeOfficerDecision({
      applicationId: app.id,
      decision: 'approved',
      officerName: currentUser?.name || 'MPCB Officer',
      remarks: 'Approved in department sandbox scrutiny workflow.',
    });
    refreshApps();
    setSelectedApp(null);
    setToastMsg(`Application ${app.referenceNumber} has been APPROVED — Demo Sandbox.`);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const handleExecuteReject = () => {
    if (!selectedApp || !rejectionReason.trim()) return;

    WorkflowStore.makeOfficerDecision({
      applicationId: selectedApp.id,
      decision: 'rejected',
      officerName: currentUser?.name || 'MPCB Regional Officer',
      remarks: rejectionReason,
      rejectionReason,
    });

    refreshApps();
    setRejectModalOpen(false);
    setSelectedApp(null);
    setRejectionReason('');
    setToastMsg(
      'Application rejected. The applicant has been notified and related active inspections have been cancelled.'
    );
    setTimeout(() => setToastMsg(null), 5000);
  };

  const handleSendQuery = () => {
    if (queryText && selectedApp) {
      const updated: WorkflowApplication = {
        ...selectedApp,
        status: 'query_raised',
        queryDetails: {
          queryId: `QRY-${Date.now()}`,
          raisedByOfficer: currentUser?.name || 'MPCB Officer',
          raisedAt: new Date().toISOString(),
          queryText: queryText,
          responseDeadline: '2026-09-15',
        },
      };
      WorkflowStore.saveApplication(updated);

      WorkflowStore.addNotification({
        id: `notif-qry-${Date.now()}`,
        recipientUserId: 'usr-applicant-1',
        recipientRole: 'applicant',
        relatedApplicationId: selectedApp.id,
        type: 'query_raised',
        title: 'Query Raised by Officer',
        message: `Officer requested clarification on ${selectedApp.referenceNumber}: "${queryText}"`,
        route: `/applications/${selectedApp.id}`,
        priority: 'high',
        deliveryStatus: 'delivered_in_app',
        isRead: false,
        createdAt: new Date().toISOString(),
      });

      refreshApps();
      setQueryModalOpen(false);
      setQueryText('');
      setSelectedApp(null);
      setToastMsg(`Scrutiny query sent to applicant for ${selectedApp.referenceNumber}.`);
      setTimeout(() => setToastMsg(null), 4000);
    }
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
                <h1 className="text-xl font-bold text-govBlue">Department Officer Application Queue</h1>
              </div>
              <p className="text-xs text-govMuted mt-1">
                Scrutinise submitted applications, verify document vault pre-validations, raise queries, and record decisions.
              </p>
            </div>

            <div className="bg-govBlue-50 text-govBlue border border-govBlue/20 px-3.5 py-1.5 rounded-full text-xs font-bold">
              MPCB Scrutiny Jurisdiction
            </div>
          </div>

          {/* KPI Summary Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div className="bg-white p-4 rounded-2xl border border-govBorder shadow-sm space-y-1">
              <span className="text-slate-500 font-medium block">Active Scrutiny Queue</span>
              <div className="text-2xl font-extrabold text-govBlue">{pendingQueue.length}</div>
              <span className="text-[10px] text-govSuccess font-bold">Within Statutory SLA</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-govBorder shadow-sm space-y-1">
              <span className="text-slate-500 font-medium block">Queries Pending Response</span>
              <div className="text-2xl font-extrabold text-saffron">
                {applications.filter((a) => a.status === 'query_raised').length}
              </div>
              <span className="text-[10px] text-saffron font-bold">SLA Timer Paused</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-govBorder shadow-sm space-y-1">
              <span className="text-slate-500 font-medium block">Inspections Coordinated</span>
              <div className="text-2xl font-extrabold text-blue-700">
                {applications.filter((a) => a.status === 'inspection_scheduled').length}
              </div>
              <span className="text-[10px] text-blue-800 font-bold">Field Audit Assigned</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-govBorder shadow-sm space-y-1">
              <span className="text-slate-500 font-medium block">Approved Clearance Certs</span>
              <div className="text-2xl font-extrabold text-green-600">
                {applications.filter((a) => a.status === 'approved').length}
              </div>
              <span className="text-[10px] text-green-700 font-bold">Issued Digitally</span>
            </div>
          </div>

          {/* Queue Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-govBorder overflow-hidden text-xs">
            <div className="p-4 border-b border-slate-100 font-bold text-govBlue text-sm flex items-center justify-between">
              <span>Pending Department Applications ({pendingQueue.length})</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-700 text-[11px] font-bold uppercase border-b border-slate-200">
                    <th className="p-3">Ref ID</th>
                    <th className="p-3">Enterprise & Applicant</th>
                    <th className="p-3">Statutory Approval Title</th>
                    <th className="p-3">SLA Days</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Scrutiny Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {pendingQueue.map((app) => (
                    <tr key={app.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 font-mono font-bold text-govBlue">{app.referenceNumber}</td>
                      <td className="p-3">
                        <div className="font-bold text-slate-900">{app.projectName}</div>
                        <div className="text-[11px] text-slate-500">Applicant: Vijay Kulkarni</div>
                      </td>
                      <td className="p-3 font-semibold text-slate-900">{app.approvalTitle}</td>
                      <td className="p-3">
                        <span className="font-bold text-govBlue">{app.slaDaysRemaining} Days</span>
                      </td>
                      <td className="p-3">
                        <Badge
                          variant={
                            app.status === 'query_raised'
                              ? 'amber'
                              : app.status === 'inspection_scheduled'
                              ? 'blue'
                              : 'saffron'
                          }
                        >
                          {app.status.replace(/_/g, ' ')}
                        </Badge>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/applications/${app.id}`}
                            className="bg-govBlue text-white font-bold px-3 py-1.5 rounded-lg text-[11px] flex items-center gap-1 hover:bg-govBlue-dark"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Scrutinise</span>
                          </Link>

                          <button
                            onClick={() => handleApproveDemo(app)}
                            className="bg-green-50 text-green-700 hover:bg-green-100 border border-green-300 font-bold px-2.5 py-1.5 rounded-lg text-[11px]"
                          >
                            Approve Demo
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
                  ))}
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
                  This will mark application <strong className="font-mono text-govBlue">{selectedApp.referenceNumber}</strong> as rejected, notify the applicant, and cancel any active inspection workflow associated with this application.
                </p>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1 text-[11px]">
                  <div><strong className="text-govBlue">Enterprise:</strong> {selectedApp.projectName}</div>
                  <div><strong className="text-govBlue">Approval:</strong> {selectedApp.approvalTitle}</div>
                  <div><strong className="text-govBlue">Department:</strong> {selectedApp.department}</div>
                </div>

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
