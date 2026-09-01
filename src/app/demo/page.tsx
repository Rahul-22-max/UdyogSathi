'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { TopUtilityBar } from '@/components/layout/TopUtilityBar';
import { OfficialHeader } from '@/components/layout/OfficialHeader';
import { Footer } from '@/components/layout/Footer';
import { DisclaimerBanner } from '@/components/common/DisclaimerBanner';
import { Badge } from '@/components/ui/Badge';
import { JourneyStepper } from '@/components/journey/JourneyStepper';
import { ROUTES } from '@/lib/routes';
import { Sparkles, Play, CheckCircle2, ArrowRight, Shield, Layers, Camera, UserCheck } from 'lucide-react';

export default function SihGuidedDemoPage() {
  const [currentLang, setCurrentLang] = useState('en');
  const [activeStep, setActiveStep] = useState(1);

  const demoSteps = [
    { step: 1, title: "Vijay Begins Manufacturing Project", desc: "Vijay enters enterprise details (Vijay Foods & Agro, Chakan MIDC, Rs 4.5 Cr investment, Orange Category).", link: ROUTES.approvalWizard },
    { step: 2, title: "UdyogSathi Rule Engine Discovers Approvals", desc: "Explainable rule engine generates 5 statutory approvals (DISH, MPCB, Fire, MIDC Water, Labour).", link: ROUTES.approvalWizard },
    { step: 3, title: "Requirements & Documents Identified", desc: "Checklist specifies statutory acts, SLAs, risk levels, and document requirements.", link: ROUTES.approvalWizard },
    { step: 4, title: "4 Verified Vault Documents Detected", desc: "System checks Vijay's Document Vault and finds PAN, GST v2, COI, and Address Proof verified.", link: ROUTES.vault },
    { step: 5, title: "1-Click 'Reuse All Eligible Documents'", desc: "Vijay clicks 1-Click Vault Reuse. Readiness score jumps to 100% without re-uploading.", link: ROUTES.dashboard },
    { step: 6, title: "Vijay Submits MIDC Water Application", desc: "Pre-filled application submitted into single-window sandbox queue with audit log.", link: "/applications/app-8805" },
    { step: 7, title: "Officer Scrutinises Application Queue", desc: "Department officer opens MPCB queue and reviews AI document pre-validation results.", link: "/applications/app-8802" },
    { step: 8, title: "Officer Raises Wastewater Query", desc: "MPCB officer requests effluent treatment calculations for 450 KLD discharge.", link: "/applications/app-8802" },
    { step: 9, title: "Vijay Receives Notification & Responds", desc: "Vijay views query notification, types calculation clarification, and submits response.", link: "/applications/app-8802" },
    { step: 10, title: "DISH Field Inspection Scheduled", desc: "Inspector Rajendra Deshmukh assigned safety audit for 05 Sep 2026 at Chakan MIDC.", link: ROUTES.inspections },
    { step: 11, title: "Inspector Captures GPS Camera Evidence", desc: "Inspector uses camera portal to log geofenced evidence photo of factory layout.", link: "/inspector/dashboard" },
    { step: 12, title: "Officer Records Demo Department Decision", desc: "Officer approves DISH Building Plan with certificate DISH/PN/2026/FPA-4491.", link: "/applications/app-8801" },
    { step: 13, title: "Decision Outcome: Approved / Returned", desc: "Vijay views approved status report and returned Fire NOC notice (expired cert).", link: "/applications/app-8804" },
    { step: 14, title: "Automatic Compliance & Renewal Calendar", desc: "Approved DISH plan added to compliance calendar; MPCB CTO renewal tracked (25 days).", link: ROUTES.compliance },
    { step: 15, title: "1-Click Licence Renewal", desc: "Vijay clicks 1-Click Renewal, pre-filling verified vault documents for CTO renewal.", link: ROUTES.renewals },
    { step: 16, title: "Grievance Escalation for SLA Delays", desc: "Vijay files ticket GRV-2026-301 regarding MIDC water connection scrutiny delay.", link: ROUTES.grievances },
    { step: 17, title: "Admin Portal SLA Bottleneck Analytics", desc: "State Administrator monitors portal-wide SLA compliance (94.8%) and audit logs.", link: "/admin/dashboard" },
  ];

  return (
    <div className="bg-[#f7f9fc] min-h-screen flex flex-col font-sans">
      <TopUtilityBar currentLang={currentLang} onLanguageChange={setCurrentLang} />
      <OfficialHeader currentLang={currentLang} />
      <DisclaimerBanner lang={currentLang} />

      <main id="main-content" className="flex-1 py-8 px-4 max-w-7xl mx-auto w-full space-y-6">
        <div className="bg-gradient-to-r from-govBlue to-govBlue-dark text-white p-8 rounded-2xl shadow-xl space-y-4">
          <div className="flex items-center gap-2">
            <span className="bg-saffron text-white font-extrabold text-[10px] uppercase tracking-wider px-3 py-1 rounded shadow">
              Guided Platform Feature Tour
            </span>
          </div>

          <h1 className="text-2xl md:text-4xl font-black">
            UdyogSathi Guided Industrial Journey Tour
          </h1>

          <p className="text-xs md:text-sm text-slate-200 leading-relaxed max-w-3xl">
            Experience the complete, connected single-window industrial journey from initial business discovery to approval decision, camera inspection, compliance calendar, renewal, and grievance escalation.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-govBorder shadow-sm">
          <JourneyStepper activeStep={4} lang={currentLang} />
        </div>

        <div className="space-y-3">
          {demoSteps.map((s) => (
            <div
              key={s.step}
              className={`p-4 rounded-xl border transition-all flex items-center justify-between gap-4 text-xs ${
                activeStep === s.step
                  ? 'bg-govBlue text-white border-saffron shadow-md font-bold'
                  : 'bg-white text-slate-800 border-slate-200 hover:border-govBlue/40'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`w-8 h-8 rounded-full flex items-center justify-center font-extrabold ${
                  activeStep === s.step ? 'bg-saffron text-white' : 'bg-slate-100 text-govBlue'
                }`}>
                  {s.step}
                </span>
                <div>
                  <h3 className="font-bold text-sm">{s.title}</h3>
                  <p className={`text-[11px] mt-0.5 ${activeStep === s.step ? 'text-slate-200' : 'text-slate-600'}`}>{s.desc}</p>
                </div>
              </div>

              <Link
                href={s.link}
                onClick={() => setActiveStep(s.step)}
                className={`px-4 py-2 rounded-lg font-bold flex items-center gap-1 shrink-0 ${
                  activeStep === s.step ? 'bg-saffron text-white shadow' : 'bg-govBlue text-white hover:bg-govBlue-dark'
                }`}
              >
                <span>Execute Step {s.step}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
