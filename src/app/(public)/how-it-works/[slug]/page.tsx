'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
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
  ArrowLeft,
  Home,
  Sparkles,
  Info,
  CheckCircle,
  FileText,
  Lock,
  ChevronRight,
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

export default function WorkflowStepGuidePage() {
  const params = useParams();
  const slug = (params?.slug as string) || 'discover';
  const { isAuthenticated } = useAuth();

  const [currentLang, setCurrentLang] = useState('en');

  const guide = WORKFLOW_GUIDES[slug];

  if (!guide) {
    return (
      <div className="bg-[#f7f9fc] min-h-screen flex flex-col font-sans">
        <TopUtilityBar currentLang={currentLang} onLanguageChange={setCurrentLang} />
        <OfficialHeader currentLang={currentLang} />
        <main className="flex-1 flex items-center justify-center p-6 text-center">
          <div className="bg-white p-8 rounded-2xl border border-govBorder shadow-lg max-w-md w-full space-y-4">
            <Info className="w-10 h-10 text-saffron mx-auto" />
            <h2 className="text-lg font-bold text-govBlue">Guide Step Not Found</h2>
            <p className="text-xs text-govMuted">
              The requested workflow step guide does not exist.
            </p>
            <Link
              href="/how-it-works/discover"
              className="inline-flex items-center gap-2 bg-govBlue text-white text-xs font-bold px-4 py-2.5 rounded-xl"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Go to Step 1: Discover Guide</span>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const StepIcon = STEP_ICONS[slug] || Compass;
  const prevGuide = guide.prevStepId ? WORKFLOW_GUIDES[guide.prevStepId] : null;
  const nextGuide = guide.nextStepId ? WORKFLOW_GUIDES[guide.nextStepId] : null;

  return (
    <div className="bg-[#f7f9fc] min-h-screen flex flex-col font-sans">
      <TopUtilityBar currentLang={currentLang} onLanguageChange={setCurrentLang} />
      <OfficialHeader currentLang={currentLang} />
      <DisclaimerBanner lang={currentLang} />

      <main id="main-content" className="flex-1 py-10 px-4 max-w-7xl mx-auto w-full space-y-8">
        {/* Breadcrumb Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-govBorder pb-4 text-xs text-govMuted">
          <div className="flex items-center gap-2">
            <Link href="/" className="hover:text-govBlue flex items-center gap-1">
              <Home className="w-3.5 h-3.5" />
              <span>Home</span>
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <Link href="/how-it-works" className="hover:text-govBlue">
              How It Works
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-bold text-govBlue">{guide.shortTitle}</span>
          </div>

          <div className="flex items-center gap-2 font-bold text-govBlue">
            <span className="bg-saffron/10 text-saffron px-3 py-1 rounded-full border border-saffron/30">
              {guide.badge}
            </span>
          </div>
        </div>

        {/* Hero Guide Header Banner */}
        <div className="bg-gradient-to-r from-govBlue via-govBlue-dark to-slate-900 text-white p-8 rounded-3xl shadow-xl space-y-4 relative overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
            <div className="space-y-2 max-w-3xl">
              <div className="inline-flex items-center gap-2 bg-saffron/20 text-saffron font-bold text-xs px-3 py-1 rounded-full border border-saffron/40">
                <StepIcon className="w-4 h-4" />
                <span>Single-Window Educational Guide</span>
              </div>
              <h1 className="text-2xl md:text-4xl font-black text-white leading-tight">
                {guide.title}
              </h1>
              <p className="text-xs md:text-sm text-slate-200 leading-relaxed">
                {guide.description}
              </p>
            </div>

            {/* Quick CTAs */}
            <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
              {isAuthenticated ? (
                <Link
                  href={guide.authenticatedRoute}
                  className="w-full sm:w-auto bg-saffron hover:bg-saffron-dark text-white text-xs font-extrabold px-5 py-3 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Open {guide.shortTitle} Tool</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <>
                  <Link
                    href="/register"
                    className="w-full sm:w-auto bg-saffron hover:bg-saffron-dark text-white text-xs font-extrabold px-5 py-3 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Create Account to Start</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href="/login"
                    className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-4 py-3 rounded-xl border border-white/30 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Lock className="w-3.5 h-3.5 text-saffron" />
                    <span>Sign In</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        {/* 8-Step Interactive Progress Stepper Bar */}
        <div className="bg-white p-4 rounded-2xl border border-govBorder shadow-sm overflow-x-auto">
          <div className="flex items-center justify-between min-w-max gap-2 text-xs">
            {ALL_GUIDE_KEYS.map((key, idx) => {
              const item = WORKFLOW_GUIDES[key];
              const isActive = key === slug;
              const isPast = item.stepNumber < guide.stepNumber;

              return (
                <Link
                  key={key}
                  href={`/how-it-works/${key}`}
                  className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl border transition-all ${
                    isActive
                      ? 'bg-govBlue text-white font-extrabold border-saffron shadow-md ring-2 ring-saffron/30'
                      : isPast
                      ? 'bg-green-50 text-green-800 border-green-300 font-bold'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-black ${
                    isActive ? 'bg-saffron text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {idx + 1}
                  </span>
                  <span className="truncate">{item.shortTitle}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Main Guide Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-xs">
          {/* Left Column: What Happens & What You Need */}
          <div className="lg:col-span-7 space-y-6">
            {/* What Happens at this stage */}
            <div className="bg-white p-6 rounded-2xl border border-govBorder shadow-sm space-y-4">
              <h3 className="text-base font-extrabold text-govBlue flex items-center gap-2 border-b border-slate-100 pb-3">
                <CheckCircle className="w-5 h-5 text-saffron" />
                <span>What Happens at Stage {guide.stepNumber}?</span>
              </h3>
              <ul className="space-y-3 text-slate-700 leading-relaxed">
                {guide.whatHappens.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-saffron/10 text-saffron font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* What You Need / Preparation Checklist */}
            <div className="bg-white p-6 rounded-2xl border border-govBorder shadow-sm space-y-4">
              <h3 className="text-base font-extrabold text-govBlue flex items-center gap-2 border-b border-slate-100 pb-3">
                <FileText className="w-5 h-5 text-govBlue" />
                <span>What Information or Documents You May Need</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {guide.whatYouNeed.map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-50 p-3 rounded-xl border border-slate-200 font-semibold text-slate-800 flex items-start gap-2"
                  >
                    <span className="w-2 h-2 rounded-full bg-saffron mt-1.5 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Practical Maharashtra Scenario */}
            <div className="bg-amber-50 border-2 border-amber-300 p-6 rounded-2xl text-amber-950 space-y-2">
              <div className="flex items-center gap-2 font-bold text-amber-900 text-sm">
                <Sparkles className="w-4 h-4 text-saffron shrink-0" />
                <span>Practical Enterprise Scenario (Maharashtra)</span>
              </div>
              <p className="text-xs leading-relaxed text-amber-900">
                {guide.exampleScenario}
              </p>
            </div>
          </div>

          {/* Right Column: How UdyogSathi Helps, Outcome, and CTAs */}
          <div className="lg:col-span-5 space-y-6">
            {/* How UdyogSathi Helps */}
            <div className="bg-white p-6 rounded-2xl border border-govBorder shadow-sm space-y-4">
              <h3 className="text-base font-extrabold text-govBlue flex items-center gap-2 border-b border-slate-100 pb-3">
                <Shield className="w-5 h-5 text-saffron" />
                <span>How UdyogSathi Helps You</span>
              </h3>
              <ul className="space-y-2.5 text-slate-700">
                {guide.howUdyogSathiHelps.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 bg-govBlue-50/50 p-2.5 rounded-xl border border-govBlue/10">
                    <CheckCircle className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                    <span className="font-medium text-slate-800">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Expected Outcome */}
            <div className="bg-gradient-to-br from-govBlue-50 to-white p-6 rounded-2xl border border-govBlue/30 space-y-2">
              <span className="text-[10px] font-extrabold text-govBlue uppercase tracking-wider block">
                Stage Outcome
              </span>
              <h4 className="font-bold text-govBlue text-sm">{guide.outcome}</h4>
            </div>

            {/* Statutory Disclaimer */}
            {guide.disclaimer && (
              <div className="bg-slate-100 p-4 rounded-xl border border-slate-200 text-[11px] text-slate-600 flex items-start gap-2">
                <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                <span>{guide.disclaimer}</span>
              </div>
            )}

            {/* Account Creation CTA Box */}
            <div className="bg-white p-6 rounded-2xl border-2 border-saffron shadow-lg text-center space-y-4">
              <h4 className="font-extrabold text-govBlue text-base">
                Ready to Experience {guide.shortTitle}?
              </h4>
              <p className="text-xs text-govMuted leading-relaxed">
                Create a free UdyogSathi account to map your industrial approvals, upload verified documents once, and track department scrutiny.
              </p>

              <div className="space-y-2">
                <Link
                  href="/register"
                  className="w-full bg-saffron hover:bg-saffron-dark text-white font-extrabold text-xs py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Create Your Account to Start</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/login"
                  className="w-full bg-slate-100 hover:bg-slate-200 text-govBlue font-bold text-xs py-2.5 rounded-xl border border-slate-300 transition-colors flex items-center justify-center gap-1.5"
                >
                  <Lock className="w-3.5 h-3.5 text-govBlue" />
                  <span>Sign In to Workspace</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Previous & Next Step Navigation Footer */}
        <div className="pt-6 border-t border-govBorder flex flex-wrap items-center justify-between gap-4 text-xs">
          {prevGuide ? (
            <Link
              href={`/how-it-works/${prevGuide.id}`}
              className="inline-flex items-center gap-2 bg-white hover:bg-slate-100 text-govBlue font-bold px-4 py-2.5 rounded-xl border border-govBorder shadow-sm transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Step {prevGuide.stepNumber}: {prevGuide.shortTitle}</span>
            </Link>
          ) : (
            <div />
          )}

          <Link
            href="/how-it-works"
            className="text-govMuted hover:text-govBlue font-semibold underline"
          >
            Back to How It Works Overview
          </Link>

          {nextGuide ? (
            <Link
              href={`/how-it-works/${nextGuide.id}`}
              className="inline-flex items-center gap-2 bg-govBlue hover:bg-govBlue-dark text-white font-bold px-5 py-2.5 rounded-xl shadow transition-colors"
            >
              <span>Step {nextGuide.stepNumber}: {nextGuide.shortTitle}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <Link
              href="/register"
              className="inline-flex items-center gap-2 bg-saffron hover:bg-saffron-dark text-white font-extrabold px-5 py-2.5 rounded-xl shadow transition-colors"
            >
              <span>Get Started: Create Account</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
