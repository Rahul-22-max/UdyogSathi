'use client';

import React, { useState } from 'react';
import { TopUtilityBar } from '@/components/layout/TopUtilityBar';
import { OfficialHeader } from '@/components/layout/OfficialHeader';
import { Footer } from '@/components/layout/Footer';
import { DisclaimerBanner } from '@/components/common/DisclaimerBanner';
import { FileText, ShieldCheck, Scale } from 'lucide-react';

export default function TermsOfServicePage() {
  const [currentLang, setCurrentLang] = useState('en');

  return (
    <div className="bg-[#f7f9fc] min-h-screen flex flex-col font-sans text-govText">
      <TopUtilityBar currentLang={currentLang} onLanguageChange={setCurrentLang} />
      <OfficialHeader currentLang={currentLang} />
      <DisclaimerBanner lang={currentLang} />

      <main className="flex-1 py-8 px-4 max-w-4xl mx-auto w-full space-y-6">
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-govBorder shadow-sm space-y-6 text-xs leading-relaxed">
          <div className="border-b pb-4">
            <span className="text-saffron font-bold text-xs uppercase tracking-wider block">
              Government B2G Portal Terms & Conditions
            </span>
            <h1 className="text-2xl font-extrabold text-govBlue mt-1">Terms of Service</h1>
            <p className="text-slate-500 mt-1">Last Updated: September 2026</p>
          </div>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-govBlue flex items-center gap-2">
              <Scale className="w-5 h-5 text-saffron" /> 1. Acceptance of Terms
            </h2>
            <p>
              By accessing or using the UdyogSathi AI portal, users agree to abide by all applicable Maharashtra State industrial regulations, IT Act 2000 guidelines, and single-window clearance provisions.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-govBlue flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-saffron" /> 2. Accuracy of Submitted Documents
            </h2>
            <p>
              Applicants certify that all information, statutory declarations, architectural layouts, and environmental disclosures submitted through the platform are accurate. Submission of forged or fraudulent documents constitutes a punishable offence under statutory laws.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
