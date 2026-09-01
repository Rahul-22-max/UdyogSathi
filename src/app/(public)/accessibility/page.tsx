'use client';

import React, { useState } from 'react';
import { TopUtilityBar } from '@/components/layout/TopUtilityBar';
import { OfficialHeader } from '@/components/layout/OfficialHeader';
import { Footer } from '@/components/layout/Footer';
import { DisclaimerBanner } from '@/components/common/DisclaimerBanner';
import { Eye, ShieldCheck, CheckCircle2, Monitor, Sun, Type } from 'lucide-react';

export default function AccessibilityStatementPage() {
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
              Government Guidelines for Indian Websites (GIGW) & WCAG 2.1 AA
            </span>
            <h1 className="text-2xl font-extrabold text-govBlue mt-1">Accessibility Statement</h1>
            <p className="text-slate-500 mt-1">Last Updated: September 2026</p>
          </div>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-govBlue flex items-center gap-2">
              <Eye className="w-5 h-5 text-saffron" /> Commitment to Digital Inclusion
            </h2>
            <p>
              The Government of Maharashtra and UdyogSathi AI are committed to ensuring that digital services are accessible to all citizens, including individuals with visual, hearing, motor, or cognitive impairments.
            </p>
            <p>
              This website complies with Level AA standards of the Web Content Accessibility Guidelines (WCAG 2.1) and the Guidelines for Indian Government Websites (GIGW 3.0).
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-govBlue flex items-center gap-2">
              <Monitor className="w-5 h-5 text-saffron" /> Key Accessibility Features
            </h2>
            <ul className="space-y-2 list-disc list-inside text-slate-700">
              <li><strong>High Contrast Mode:</strong> Toggle dedicated high-contrast palette for enhanced readability.</li>
              <li><strong>Dynamic Text Resizing:</strong> Adjust font sizing (100% to 150%) without breaking visual layout.</li>
              <li><strong>Keyboard Navigation:</strong> Fully operational keyboard focus states and logical tab order across form controls.</li>
              <li><strong>Screen Reader Compatibility:</strong> Standardized ARIA live regions and semantic HTML5 landmark tags (`nav`, `main`, `header`, `footer`).</li>
              <li><strong>Non-Color-Only Status Indicators:</strong> Every status indicator combines text labels, distinct badges, and visual icons.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-govBlue flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-saffron" /> Reporting Accessibility Barriers
            </h2>
            <p>
              If you encounter accessibility difficulties while navigating UdyogSathi AI, please contact our Accessibility Nodal Officer via email at <strong className="text-govBlue">accessibility@udyogsathi.gov.in</strong> or phone at 1800-22-2613.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
