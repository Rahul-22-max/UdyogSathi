'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { TopUtilityBar } from '@/components/layout/TopUtilityBar';
import { OfficialHeader } from '@/components/layout/OfficialHeader';
import { Footer } from '@/components/layout/Footer';
import { DisclaimerBanner } from '@/components/common/DisclaimerBanner';
import { MultiStepWizard } from '@/components/wizard/MultiStepWizard';
import { getTranslation } from '@/lib/i18n';
import { ROUTES } from '@/lib/routes';
import { Shield, ArrowLeft, Home, FileText } from 'lucide-react';

export default function ApprovalWizardPage() {
  const [currentLang, setCurrentLang] = useState('en');

  return (
    <div className="bg-[#f7f9fc] min-h-screen flex flex-col font-sans">
      <TopUtilityBar currentLang={currentLang} onLanguageChange={setCurrentLang} />
      <OfficialHeader currentLang={currentLang} />
      <DisclaimerBanner lang={currentLang} />

      <main id="main-content" className="flex-1 py-10 px-4 max-w-7xl mx-auto w-full space-y-6">
        {/* Page Header & Breadcrumbs */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-govBorder pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-govMuted mb-1">
              <Link href={ROUTES.home} className="hover:text-govBlue flex items-center gap-1">
                <Home className="w-3.5 h-3.5" />
                <span>{getTranslation(currentLang, 'nav_home')}</span>
              </Link>
              <span>/</span>
              <span className="font-semibold text-govBlue">{getTranslation(currentLang, 'nav_wizard')}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-govBlue tracking-tight flex items-center gap-2">
              <Shield className="w-7 h-7 text-saffron" />
              <span>{getTranslation(currentLang, 'nav_wizard')}</span>
            </h1>
            <p className="text-xs text-govMuted mt-1 max-w-2xl">
              {getTranslation(currentLang, 'hero_subtext')}
            </p>
          </div>

          <Link
            href={ROUTES.home}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-govBlue hover:bg-govBlue-50 px-3 py-2 rounded-lg border border-govBlue/20 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
        </div>

        {/* Embedded MultiStepWizard Component */}
        <section aria-label="Approval Discovery Engine">
          <React.Suspense fallback={<div className="bg-white p-8 rounded-2xl border border-govBorder text-center text-xs font-bold text-govBlue">Loading Approval Wizard...</div>}>
            <MultiStepWizard />
          </React.Suspense>
        </section>

        {/* Helpful Guidance Footer Card */}
        <div className="bg-white p-6 rounded-xl border border-govBorder shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-govBlue-50 text-govBlue flex items-center justify-center font-bold shrink-0">
              1
            </div>
            <div>
              <h4 className="font-bold text-govBlue mb-1">Database-Driven Rules</h4>
              <p className="text-slate-600 leading-relaxed">
                Evaluates parameters against statutory Maharashtra industrial acts, MPCB pollution categories, and MIDC land regulations.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-govBlue-50 text-govBlue flex items-center justify-center font-bold shrink-0">
              2
            </div>
            <div>
              <h4 className="font-bold text-govBlue mb-1">Pre-Validation Readiness</h4>
              <p className="text-slate-600 leading-relaxed">
                Generated checklists connect seamlessly to the Document Vault assistant for file integrity verification before scrutiny.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-govBlue-50 text-govBlue flex items-center justify-center font-bold shrink-0">
              3
            </div>
            <div>
              <h4 className="font-bold text-govBlue mb-1">Exportable PDF Report</h4>
              <p className="text-slate-600 leading-relaxed">
                Download your official summary report complete with estimated SLA timelines, department fees, and mandatory documents.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
