'use client';

import React, { useState } from 'react';
import { TopUtilityBar } from '@/components/layout/TopUtilityBar';
import { OfficialHeader } from '@/components/layout/OfficialHeader';
import { Footer } from '@/components/layout/Footer';
import { DisclaimerBanner } from '@/components/common/DisclaimerBanner';
import { ShieldCheck, Lock, Eye, FileText } from 'lucide-react';

export default function PrivacyPolicyPage() {
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
              Digital Personal Data Protection Act 2023 Compliance
            </span>
            <h1 className="text-2xl font-extrabold text-govBlue mt-1">Privacy Policy & Data Protection Notice</h1>
            <p className="text-slate-500 mt-1">Effective Date: September 2026</p>
          </div>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-govBlue flex items-center gap-2">
              <Lock className="w-5 h-5 text-saffron" /> 1. Data Collection & Purpose
            </h2>
            <p>
              UdyogSathi AI collects industrial project parameters, business PAN/GST credentials, vault identity proofs, and officer review notes exclusively to facilitate single-window statutory approvals under Maharashtra state Acts.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-govBlue flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-saffron" /> 2. "Verify Once, Reuse Everywhere" Consent Governance
            </h2>
            <p>
              Uploaded vault documents are stored securely in government data centers. Document reuse across multiple department applications requires explicit user consent actions. Applicants retain full authority to revoke document reuse consent for future filings.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-govBlue flex items-center gap-2">
              <Eye className="w-5 h-5 text-saffron" /> 3. Data Security & Encryption
            </h2>
            <p>
              All HTTP communications are encrypted over TLS 1.3. Server sessions are cryptographically signed using HMAC-SHA256 digests. Role-Based Access Control (RBAC) ensures department officers can only inspect applications assigned to their respective jurisdiction.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
