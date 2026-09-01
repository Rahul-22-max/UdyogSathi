'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { TopUtilityBar } from '@/components/layout/TopUtilityBar';
import { OfficialHeader } from '@/components/layout/OfficialHeader';
import { Footer } from '@/components/layout/Footer';
import { DisclaimerBanner } from '@/components/common/DisclaimerBanner';
import { SECTOR_GUIDES, SectorGuide } from '@/lib/sector-data';
import { ROUTES } from '@/lib/routes';
import {
  ArrowLeft,
  Home,
  CheckCircle2,
  FileText,
  Shield,
  ArrowRight,
  AlertTriangle,
} from 'lucide-react';

export default function SectorGuideDetailPage() {
  const [currentLang, setCurrentLang] = useState('en');
  const params = useParams();
  const slug = params?.slug as string;

  const sector: SectorGuide | undefined = SECTOR_GUIDES.find(s => s.slug === slug || s.id === slug);

  if (!sector) {
    return (
      <div className="bg-[#f7f9fc] min-h-screen flex flex-col font-sans">
        <TopUtilityBar currentLang={currentLang} onLanguageChange={setCurrentLang} />
        <OfficialHeader currentLang={currentLang} />
        <DisclaimerBanner lang={currentLang} />

        <main id="main-content" className="flex-1 py-16 px-4 max-w-xl mx-auto w-full text-center space-y-4">
          <div className="bg-white p-8 rounded-2xl shadow-md border border-govBorder space-y-4">
            <AlertTriangle className="w-12 h-12 text-saffron mx-auto" />
            <h1 className="text-xl font-bold text-govBlue">Sector Guide Not Found</h1>
            <p className="text-xs text-govMuted leading-relaxed">
              The requested sector guide <code className="bg-slate-100 px-1.5 py-0.5 rounded text-govBlue font-bold">{slug || 'unknown'}</code> is not available or has been relocated.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row gap-2">
              <Link
                href={ROUTES.sectorGuides}
                className="w-full bg-govBlue text-white text-xs font-bold py-2.5 rounded-lg hover:bg-govBlue-dark transition-colors flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>View All Sector Guides</span>
              </Link>
              <Link
                href={ROUTES.home}
                className="w-full bg-slate-100 text-govBlue text-xs font-bold py-2.5 rounded-lg border border-slate-300 hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
              >
                <Home className="w-4 h-4" />
                <span>Return to Home</span>
              </Link>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  const Icon = sector.icon;

  return (
    <div className="bg-[#f7f9fc] min-h-screen flex flex-col font-sans">
      <TopUtilityBar currentLang={currentLang} onLanguageChange={setCurrentLang} />
      <OfficialHeader currentLang={currentLang} />
      <DisclaimerBanner lang={currentLang} />

      <main id="main-content" className="flex-1 py-10 px-4 max-w-5xl mx-auto w-full space-y-6">
        {/* Breadcrumb & Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-govBorder pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-govMuted mb-1">
              <Link href={ROUTES.home} className="hover:text-govBlue flex items-center gap-1">
                <Home className="w-3.5 h-3.5" />
                <span>Home</span>
              </Link>
              <span>/</span>
              <Link href={ROUTES.sectorGuides} className="hover:text-govBlue">
                Sector Guides
              </Link>
              <span>/</span>
              <span className="font-semibold text-govBlue">{sector.name}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-govBlue tracking-tight flex items-center gap-2">
              <Icon className="w-7 h-7 text-saffron" />
              <span>{sector.name}</span>
            </h1>
            <p className="text-xs text-govMuted mt-1 max-w-2xl">{sector.description}</p>
          </div>

          <Link
            href={ROUTES.sectorGuides}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-govBlue hover:bg-govBlue-50 px-3 py-2 rounded-lg border border-govBlue/20 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>All Sector Guides</span>
          </Link>
        </div>

        {/* Detail Cards Container */}
        <div className="bg-white p-6 rounded-2xl border border-govBorder shadow-sm space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 bg-govBg p-4 rounded-xl border border-slate-200">
            <div>
              <span className="text-xs font-bold text-saffron uppercase tracking-widest">{sector.category}</span>
              <div className="text-sm font-bold text-govBlue mt-0.5">Average SLA Processing Window: ~{sector.avgSlaDays} Days</div>
            </div>
            <span className="bg-saffron text-white text-xs font-extrabold px-3 py-1 rounded-full shadow">
              MPCB Pollution Classification: {sector.pollutionCategory}
            </span>
          </div>

          {/* Key Approvals */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-govBlue flex items-center gap-2 border-b border-slate-100 pb-2">
              <Shield className="w-4 h-4 text-saffron" /> Key Statutory Approvals & Clearances
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {sector.keyApprovals.map((app, idx) => (
                <div key={idx} className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-saffron shrink-0 mt-0.5" />
                  <span className="font-semibold text-slate-800 leading-normal">{app}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Applicable Acts */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-govBlue flex items-center gap-2 border-b border-slate-100 pb-2">
              <FileText className="w-4 h-4 text-saffron" /> Statutory Acts & Governing Policy Framework
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              {sector.acts.map((act, idx) => (
                <div key={idx} className="bg-govBlue-50/60 p-3 rounded-lg border border-govBlue/10 text-slate-800 font-medium">
                  • {act}
                </div>
              ))}
            </div>
          </div>

          {/* Eligible Schemes */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-govBlue border-b border-slate-100 pb-2">
              Eligible Government Schemes & Incentives
            </h3>
            <div className="flex flex-wrap gap-2 text-xs">
              {sector.schemes.map((sch, idx) => (
                <span key={idx} className="bg-green-100 text-green-900 font-bold px-3 py-1 rounded-lg border border-green-200">
                  ✓ {sch}
                </span>
              ))}
            </div>
          </div>

          {/* Action CTAs */}
          <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4">
            <Link
              href={ROUTES.approvalWizard}
              className="bg-saffron hover:bg-saffron-dark text-white text-xs font-bold px-5 py-3 rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              <span>Start Discovery Wizard for {sector.name}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href={ROUTES.sectorGuides}
              className="text-xs font-bold text-govBlue hover:bg-slate-100 px-4 py-2.5 rounded-lg border border-slate-300"
            >
              Back to Sector Guides Directory
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
