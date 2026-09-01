'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { TopUtilityBar } from '@/components/layout/TopUtilityBar';
import { OfficialHeader } from '@/components/layout/OfficialHeader';
import { Footer } from '@/components/layout/Footer';
import { DisclaimerBanner } from '@/components/common/DisclaimerBanner';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import { WorkflowStore } from '@/lib/workflow-store';
import { IndustrialProject } from '@/lib/workflow-engine';
import { ROUTES } from '@/lib/routes';
import {
  Building2,
  Search,
  Plus,
  ArrowRight,
  MapPin,
  Coins,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

export default function SelectProjectPage() {
  const router = useRouter();
  const { currentUser } = useAuth();
  const [currentLang, setCurrentLang] = useState('en');
  const [searchQuery, setSearchQuery] = useState('');

  const userEmail = currentUser?.email || 'applicant@udyogsathi.gov.in';
  const projects = WorkflowStore.getAccessibleApplicantProjects(userEmail);

  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.sector.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.district.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectProject = (projectId: string) => {
    router.push(`/approval-wizard?projectId=${projectId}&mode=new`);
  };

  return (
    <ProtectedRoute>
      <div className="bg-[#f7f9fc] min-h-screen flex flex-col font-sans">
        <TopUtilityBar currentLang={currentLang} onLanguageChange={setCurrentLang} />
        <OfficialHeader currentLang={currentLang} />
        <DisclaimerBanner lang={currentLang} />

        <main id="main-content" className="flex-1 py-8 px-4 max-w-5xl mx-auto w-full space-y-6 text-xs">
          {/* Header Banner */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-govBorder flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Building2 className="w-6 h-6 text-saffron" />
                <h1 className="text-xl font-bold text-govBlue">Select a Project for Your Approval Journey</h1>
              </div>
              <p className="text-xs text-govMuted mt-1">
                Choose the industrial project for which you want to identify approvals, prepare documents, and begin statutory applications.
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

          {/* Search Control */}
          <div className="bg-white p-4 rounded-xl border border-govBorder shadow-sm flex items-center gap-3">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Search your projects by name, sector, or district..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-xs focus:outline-none"
            />
          </div>

          {/* Projects Cards List */}
          <div className="space-y-4">
            {filteredProjects.length === 0 ? (
              <div className="bg-white p-10 rounded-2xl border border-govBorder text-center space-y-4">
                <Building2 className="w-10 h-10 text-slate-400 mx-auto" />
                <h3 className="font-bold text-govBlue text-sm">No Matching Projects Found</h3>
                <p className="text-govMuted max-w-sm mx-auto">
                  Create your first industrial project to start your statutory approval roadmap.
                </p>
                <Link
                  href="/projects/new"
                  className="bg-saffron hover:bg-saffron-dark text-white font-extrabold px-5 py-2.5 rounded-xl shadow inline-flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create New Industrial Project</span>
                </Link>
              </div>
            ) : (
              filteredProjects.map((proj) => (
                <div
                  key={proj.id}
                  className="bg-white p-5 rounded-2xl border border-govBorder shadow-sm hover:shadow-md transition-all flex flex-wrap items-center justify-between gap-4"
                >
                  <div className="space-y-2 max-w-xl">
                    <div className="flex items-center gap-2">
                      <h2 className="font-extrabold text-govBlue text-base">{proj.name}</h2>
                      <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold px-2 py-0.5 rounded">
                        {proj.environmentalCategory} Category
                      </span>
                    </div>

                    <div className="text-slate-600 font-medium leading-relaxed">
                      {proj.sector} • {proj.district}, {proj.taluka} ({proj.plotNumber})
                    </div>

                    <div className="flex items-center gap-4 text-slate-500 text-[11px]">
                      <span>Investment: <strong>₹{(proj.investmentAmountINR / 10000000).toFixed(1)} Cr</strong></span>
                      <span>Approvals Needed: <strong className="text-saffron">{proj.totalApprovalsRequired} Clearance(s)</strong></span>
                    </div>
                  </div>

                  <Button
                    variant="primary"
                    onClick={() => handleSelectProject(proj.id)}
                    leftIcon={<CheckCircle2 className="w-4 h-4 text-saffron" />}
                  >
                    Select Project & Generate Roadmap
                  </Button>
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
