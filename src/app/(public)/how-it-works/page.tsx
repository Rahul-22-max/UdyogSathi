'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { TopUtilityBar } from '@/components/layout/TopUtilityBar';
import { OfficialHeader } from '@/components/layout/OfficialHeader';
import { Footer } from '@/components/layout/Footer';
import { DisclaimerBanner } from '@/components/common/DisclaimerBanner';
import { WORKFLOW_GUIDES } from '@/lib/workflow-guides';
import { useAuth } from '@/context/AuthContext';
import {
  Shield,
  Compass,
  FileCheck2,
  UploadCloud,
  FileSpreadsheet,
  Activity,
  SearchCheck,
  CheckCircle2,
  CalendarDays,
  ArrowRight,
  Sparkles,
  Lock,
} from 'lucide-react';

const STEP_ICONS: Record<string, React.ElementType> = {
  discover: Compass,
  prepare: FileCheck2,
  'upload-once': UploadCloud,
  apply: FileSpreadsheet,
  track: Activity,
  inspection: SearchCheck,
  decision: CheckCircle2,
  continue: CalendarDays,
};

const ALL_GUIDE_KEYS = [
  'discover',
  'prepare',
  'upload-once',
  'apply',
  'track',
  'inspection',
  'decision',
  'continue',
];

export default function HowItWorksOverviewPage() {
  const { isAuthenticated } = useAuth();
  const [currentLang, setCurrentLang] = useState('en');

  return (
    <div className="bg-[#f7f9fc] min-h-screen flex flex-col font-sans">
      <TopUtilityBar currentLang={currentLang} onLanguageChange={setCurrentLang} />
      <OfficialHeader currentLang={currentLang} />
      <DisclaimerBanner lang={currentLang} />

      <main id="main-content" className="flex-1 py-10 px-4 max-w-7xl mx-auto w-full space-y-10">
        {/* Hero Header */}
        <div className="bg-gradient-to-r from-govBlue to-govBlue-dark text-white p-8 rounded-3xl shadow-xl space-y-4 text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-saffron/20 text-saffron font-bold text-xs px-3.5 py-1 rounded-full border border-saffron/40">
            <Shield className="w-4 h-4" />
            <span>Single Window Workflow Architecture</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black">
            How UdyogSathi Simplifies Industrial Approvals
          </h1>

          <p className="text-xs md:text-sm text-slate-200 leading-relaxed max-w-2xl mx-auto">
            From initial business discovery to approval decision, site inspection, compliance calendar, renewal, and incentive matching—explore our 8 connected steps.
          </p>
        </div>

        {/* 8 Workflow Step Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {ALL_GUIDE_KEYS.map((key, idx) => {
            const guide = WORKFLOW_GUIDES[key];
            const Icon = STEP_ICONS[key] || Compass;

            return (
              <div
                key={key}
                className="bg-white p-6 rounded-2xl border border-govBorder shadow-sm hover:shadow-md hover:border-saffron/50 transition-all flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="w-8 h-8 rounded-xl bg-saffron text-white font-extrabold text-xs flex items-center justify-center shadow-sm">
                      {idx + 1}
                    </span>
                    <span className="text-[10px] font-extrabold text-govBlue uppercase tracking-wider bg-govBlue-50 px-2 py-0.5 rounded border border-govBlue/20">
                      Step {idx + 1} of 8
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Icon className="w-5 h-5 text-saffron group-hover:scale-110 transition-transform shrink-0" />
                    <h3 className="text-base font-extrabold text-govBlue group-hover:text-saffron transition-colors">
                      {guide.shortTitle}
                    </h3>
                  </div>

                  <p className="text-xs text-govMuted leading-relaxed line-clamp-3">
                    {guide.description}
                  </p>
                </div>

                <Link
                  href={`/how-it-works/${key}`}
                  className="w-full bg-slate-50 group-hover:bg-govBlue group-hover:text-white text-govBlue text-xs font-bold py-2.5 rounded-xl border border-slate-200 group-hover:border-govBlue transition-all flex items-center justify-center gap-1.5"
                >
                  <span>Explore Guide</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            );
          })}
        </div>

        {/* Global CTA Banner */}
        <div className="bg-white p-8 rounded-3xl border-2 border-saffron shadow-xl text-center space-y-4 max-w-3xl mx-auto">
          <h2 className="text-2xl font-black text-govBlue">
            Ready to Start Your Single-Window Industrial Journey?
          </h2>
          <p className="text-xs text-govMuted leading-relaxed max-w-xl mx-auto">
            Create your free UdyogSathi account to discover applicable statutory approvals, upload reusable verified documents, and submit applications.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                className="bg-saffron hover:bg-saffron-dark text-white font-extrabold text-xs px-6 py-3 rounded-xl shadow-lg transition-all flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Go to My Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  href="/register"
                  className="bg-saffron hover:bg-saffron-dark text-white font-extrabold text-xs px-6 py-3 rounded-xl shadow-lg transition-all flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Create Account to Start</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/login"
                  className="bg-govBlue hover:bg-govBlue-dark text-white font-bold text-xs px-5 py-3 rounded-xl shadow-md transition-all flex items-center gap-1.5"
                >
                  <Lock className="w-3.5 h-3.5 text-saffron" />
                  <span>Sign In to Workspace</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
