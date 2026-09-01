'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { TopUtilityBar } from '@/components/layout/TopUtilityBar';
import { OfficialHeader } from '@/components/layout/OfficialHeader';
import { Footer } from '@/components/layout/Footer';
import { DisclaimerBanner } from '@/components/common/DisclaimerBanner';
import { Badge } from '@/components/ui/Badge';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { JourneyStepper } from '@/components/journey/JourneyStepper';
import { ROUTES } from '@/lib/routes';
import { Clock, ShieldCheck, CheckCircle2, RefreshCw, Layers, ArrowRight } from 'lucide-react';

export default function RenewalsPage() {
  const [currentLang, setCurrentLang] = useState('en');

  const renewals = [
    {
      id: 'REN-2026-101',
      title: 'MPCB Consent to Operate (CTO) 5-Year Renewal',
      department: 'MPCB',
      expiryDate: '2026-09-25',
      daysRemaining: 25,
      reusableDocsCount: 4,
      status: 'renewal_due',
      unitName: 'Vijay Foods and Agro Processing Pvt. Ltd.',
    },
    {
      id: 'REN-2026-102',
      title: 'DISH Factory Licence 3-Year Renewal',
      department: 'DISH',
      expiryDate: '2026-12-15',
      daysRemaining: 106,
      reusableDocsCount: 4,
      status: 'active',
      unitName: 'Sahyadri Auto Components Pvt Ltd',
    },
  ];

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
                <Clock className="w-6 h-6 text-saffron" />
                <h1 className="text-xl font-bold text-govBlue">Licence & Clearance Renewals Workspace</h1>
              </div>
              <p className="text-xs text-govMuted mt-1">
                Automated 30/60/90 day expiry tracking with 1-click verified vault document pre-filling.
              </p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-govBorder shadow-sm">
            <JourneyStepper activeStep={8} lang={currentLang} />
          </div>

          <div className="space-y-4">
            {renewals.map((ren) => (
              <div key={ren.id} className="bg-white p-6 rounded-2xl border border-govBorder shadow-sm flex flex-wrap items-center justify-between gap-4 text-xs">
                <div className="space-y-1.5 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-govBlue">{ren.id}</span>
                    <Badge variant="blue">{ren.department}</Badge>
                    {ren.daysRemaining <= 30 ? <Badge variant="red">Renewal Due in {ren.daysRemaining} Days</Badge> : <Badge variant="green">Active</Badge>}
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm">{ren.title}</h3>
                  <p className="text-[11px] text-slate-500">{ren.unitName} • Expiry Date: {ren.expiryDate}</p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="bg-green-100 text-green-900 font-bold px-2 py-0.5 rounded text-[10px] border border-green-300">
                      {ren.reusableDocsCount} Verified Vault Docs Reusable
                    </span>
                  </div>

                  <button
                    onClick={() => alert(`Starting 1-Click Renewal Application for ${ren.title}... Pre-filling 4 verified vault documents.`)}
                    className="bg-saffron hover:bg-saffron-dark text-white font-extrabold text-xs px-4 py-2.5 rounded-lg shadow transition-all flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Start 1-Click Renewal</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </main>

        <Footer />
      </div>
    </ProtectedRoute>
  );
}
