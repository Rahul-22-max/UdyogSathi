'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { TopUtilityBar } from '@/components/layout/TopUtilityBar';
import { OfficialHeader } from '@/components/layout/OfficialHeader';
import { Footer } from '@/components/layout/Footer';
import { DisclaimerBanner } from '@/components/common/DisclaimerBanner';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { WorkflowStore } from '@/lib/workflow-store';
import { useAuth } from '@/context/AuthContext';
import { ROUTES } from '@/lib/routes';
import { Building2, Plus, ArrowRight, MapPin, Coins, Users, Layers, ShieldCheck } from 'lucide-react';

export default function ProjectsListPage() {
  const { currentUser } = useAuth();
  const [currentLang, setCurrentLang] = useState('en');

  const userEmail = currentUser?.email || 'applicant@udyogsathi.gov.in';
  const projects = WorkflowStore.getProjects(userEmail);
  const userApps = WorkflowStore.getApplications(userEmail);

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
                <Building2 className="w-6 h-6 text-saffron" />
                <h1 className="text-xl font-bold text-govBlue">My Industrial Projects</h1>
              </div>
              <p className="text-xs text-govMuted mt-1">
                Central single-window workspaces for your industrial units in Maharashtra.
              </p>
            </div>

            <Link
              href="/projects/new"
              className="bg-saffron hover:bg-saffron-dark text-white text-xs font-extrabold px-4 py-2.5 rounded-xl shadow transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Project</span>
            </Link>
          </div>

          {/* Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {projects.length === 0 ? (
              <div className="md:col-span-2 bg-white p-12 rounded-2xl border border-govBorder text-center space-y-4 shadow-sm">
                <Building2 className="w-12 h-12 text-slate-400 mx-auto" />
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-govBlue">No Industrial Projects Found</h3>
                  <p className="text-xs text-govMuted max-w-md mx-auto">
                    Your industrial portfolio has no registered projects. Run the Approval Wizard to create your first project roadmap.
                  </p>
                </div>
                <Link
                  href="/projects/new"
                  className="inline-flex items-center gap-2 bg-saffron hover:bg-saffron-dark text-white font-extrabold text-xs px-5 py-3 rounded-xl shadow transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create New Industrial Project</span>
                </Link>
              </div>
            ) : (
              projects.map((proj) => {
                const projApps = userApps.filter((a) => a.projectId === proj.id);
                const approvedCount = projApps.filter((a) => a.status === 'approved').length;
                const totalApps = projApps.length;
                const isCompleted = approvedCount === totalApps && totalApps > 0;

                return (
                  <div
                    key={proj.id}
                    className="bg-white p-6 rounded-2xl border border-govBorder shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h2 className="font-bold text-govBlue text-sm">{proj.name}</h2>
                          <div className="text-[11px] text-govMuted font-medium">{proj.sector}</div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span
                            className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded border uppercase ${
                              proj.environmentalCategory === 'RED'
                                ? 'bg-red-100 text-red-900 border-red-300'
                                : 'bg-amber-100 text-amber-900 border-amber-300'
                            }`}
                          >
                            {proj.environmentalCategory} Category
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                              isCompleted
                                ? 'bg-green-100 text-green-900 border-green-300'
                                : totalApps > 0
                                ? 'bg-blue-100 text-blue-900 border-blue-300'
                                : 'bg-slate-100 text-slate-700 border-slate-300'
                            }`}
                          >
                            {totalApps === 0
                              ? 'Roadmap Pending'
                              : isCompleted
                              ? `${approvedCount} of ${totalApps} Approved`
                              : `${totalApps} Applications in Progress`}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
                        <div>
                          <span className="text-slate-500 block text-[11px]">Location:</span>
                          <strong className="text-govBlue">{proj.district}, {proj.taluka}</strong>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[11px]">Plot / Zone:</span>
                          <strong className="text-govBlue">{proj.locationType} ({proj.plotNumber})</strong>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[11px]">Investment:</span>
                          <strong className="text-govBlue">₹{(proj.investmentAmountINR / 10000000).toFixed(1)} Cr</strong>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[11px]">Approvals Created:</span>
                          <strong className="text-saffron">{totalApps} Applications</strong>
                        </div>
                      </div>
                    </div>

                  <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
                    <Link
                      href={`/approval-wizard?projectId=${proj.id}&mode=new`}
                      className="w-full sm:flex-1 bg-saffron hover:bg-saffron-dark text-white font-extrabold text-xs py-2.5 rounded-xl shadow transition-all flex items-center justify-center gap-1.5"
                    >
                      <ShieldCheck className="w-4 h-4 text-white" />
                      <span>Start Approval Roadmap</span>
                    </Link>

                    <Link
                      href={`/projects/${proj.id}`}
                      className="w-full sm:flex-1 bg-govBlue hover:bg-govBlue-dark text-white font-extrabold text-xs py-2.5 rounded-xl shadow transition-all flex items-center justify-center gap-2"
                    >
                      <span>Open Workspace</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              );
            })
          )}
          </div>
        </main>

        <Footer />
      </div>
    </ProtectedRoute>
  );
}
