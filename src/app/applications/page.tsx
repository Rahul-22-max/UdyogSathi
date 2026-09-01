'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { TopUtilityBar } from '@/components/layout/TopUtilityBar';
import { OfficialHeader } from '@/components/layout/OfficialHeader';
import { Footer } from '@/components/layout/Footer';
import { DisclaimerBanner } from '@/components/common/DisclaimerBanner';
import { Badge } from '@/components/ui/Badge';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DEMO_VIJAY_APPLICATIONS, WorkflowApplication } from '@/lib/workflow-engine';
import { ROUTES } from '@/lib/routes';
import { FileText, Search, Filter, Eye, Clock, ArrowRight, ShieldCheck, Plus } from 'lucide-react';

import { WorkflowStore } from '@/lib/workflow-store';
import { useAuth } from '@/context/AuthContext';

export default function ApplicationsListPage() {
  const { currentUser } = useAuth();
  const [currentLang, setCurrentLang] = useState('en');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const userEmail = currentUser?.email || 'applicant@udyogsathi.gov.in';
  const userRole = currentUser?.role || 'APPLICANT';
  const applications = WorkflowStore.getApplications(userEmail, userRole);

  const filteredApps = applications.filter((app) => {
    const matchesSearch =
      app.referenceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.approvalTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.department.toLowerCase().includes(searchQuery.toLowerCase());

    if (statusFilter === 'APPROVED') return matchesSearch && app.status === 'approved';
    if (statusFilter === 'QUERY') return matchesSearch && app.status === 'query_raised';
    if (statusFilter === 'INSPECTION') return matchesSearch && app.status === 'inspection_scheduled';
    if (statusFilter === 'RETURNED') return matchesSearch && app.status === 'returned_for_correction';
    if (statusFilter === 'READY') return matchesSearch && app.status === 'ready_for_submission';
    return matchesSearch;
  });

  return (
    <ProtectedRoute>
      <div className="bg-[#f7f9fc] min-h-screen flex flex-col font-sans">
        <TopUtilityBar currentLang={currentLang} onLanguageChange={setCurrentLang} />
        <OfficialHeader currentLang={currentLang} />
        <DisclaimerBanner lang={currentLang} />

        <main id="main-content" className="flex-1 py-8 px-4 max-w-7xl mx-auto w-full space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-govBorder flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <FileText className="w-6 h-6 text-saffron" />
                <h1 className="text-xl font-bold text-govBlue">Statutory Applications Workspace</h1>
              </div>
              <p className="text-xs text-govMuted mt-1">
                Manage, submit, track, and respond to department scrutiny queries from one unified workspace.
              </p>
            </div>

            <Link
              href={ROUTES.approvalWizard}
              className="bg-saffron hover:bg-saffron-dark text-white text-xs font-bold px-4 py-2.5 rounded-lg shadow transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Application</span>
            </Link>
          </div>

          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-xl border border-govBorder shadow-sm flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search by reference number, title, or department..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-saffron text-xs"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {[
                { id: 'ALL', label: 'All Applications' },
                { id: 'APPROVED', label: 'Approved' },
                { id: 'QUERY', label: 'Query Raised' },
                { id: 'INSPECTION', label: 'Inspection Scheduled' },
                { id: 'RETURNED', label: 'Returned for Correction' },
                { id: 'READY', label: 'Ready to Submit' },
              ].map((chip) => (
                <button
                  key={chip.id}
                  onClick={() => setStatusFilter(chip.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    statusFilter === chip.id
                      ? 'bg-govBlue text-white shadow font-bold'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>

          {/* Applications Grid */}
          <div className="space-y-4">
            {filteredApps.length === 0 ? (
              <div className="bg-white p-12 rounded-2xl border border-govBorder text-center space-y-4 shadow-sm">
                <FileText className="w-12 h-12 text-slate-400 mx-auto" />
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-govBlue">No Statutory Applications Found</h3>
                  <p className="text-xs text-govMuted max-w-md mx-auto">
                    Your workspace has no active applications. Generate your statutory approval roadmap to start your first application.
                  </p>
                </div>
                <Link
                  href={ROUTES.approvalWizard}
                  className="inline-flex items-center gap-2 bg-saffron hover:bg-saffron-dark text-white font-extrabold text-xs px-5 py-3 rounded-xl shadow transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Start Approval Journey Wizard</span>
                </Link>
              </div>
            ) : (
              filteredApps.map((app) => (
                <div
                  key={app.id}
                  className="bg-white p-5 rounded-2xl border border-govBorder shadow-sm hover:shadow-md transition-all flex flex-wrap items-center justify-between gap-4 text-xs"
                >
                  <div className="space-y-1.5 max-w-xl">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-govBlue text-xs">{app.referenceNumber}</span>
                      <Badge variant="blue">{app.department}</Badge>
                      {app.status === 'approved' && <Badge variant="green">Approved</Badge>}
                      {app.status === 'rejected' && <Badge variant="red">Rejected</Badge>}
                      {app.status === 'query_raised' && <Badge variant="saffron">Query Raised</Badge>}
                      {app.status === 'inspection_scheduled' && <Badge variant="blue">Inspection Scheduled</Badge>}
                      {app.status === 'returned_for_correction' && <Badge variant="red">Returned for Correction</Badge>}
                      {app.status === 'ready_for_submission' && <Badge variant="amber">Ready for Submission</Badge>}
                      {(app.status === 'submitted' || app.status === 'under_scrutiny') && <Badge variant="blue">Under Department Review</Badge>}
                    </div>

                    <h3 className="font-bold text-slate-900 text-sm">{app.approvalTitle}</h3>
                    <p className="text-[11px] text-slate-500">{app.statutoryAct} • Project: {app.projectName}</p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right space-y-1">
                      <div className="text-slate-600 font-medium">SLA: {app.slaDaysRemaining} Days Remaining</div>
                      <div className="text-[11px] text-green-700 font-bold">
                        {app.reusedDocumentIds.length} Vault Documents Reused
                      </div>
                    </div>

                    <Link
                      href={`/applications/${app.id}`}
                      className="bg-govBlue hover:bg-govBlue-dark text-white font-extrabold text-xs px-4 py-2.5 rounded-lg shadow transition-all flex items-center gap-1.5"
                    >
                      <Eye className="w-4 h-4 text-saffron" />
                      <span>View Application</span>
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </main>

        <Footer />
      </div>
    </ProtectedRoute>
  );
}
