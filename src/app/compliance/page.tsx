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
import { useAuth } from '@/context/AuthContext';
import { normalizeRole } from '@/lib/rbac';
import { generateICSCalendarFile } from '@/lib/export-utils';
import { ROUTES } from '@/lib/routes';
import { CalendarDays, Download, Clock, AlertTriangle, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';

export default function ComplianceCalendarPage() {
  const { currentUser } = useAuth();
  const [currentLang, setCurrentLang] = useState('en');

  const complianceItems = [
    {
      id: 'comp-1',
      title: 'Quarterly Hazardous Waste Return Filing (Form 4)',
      department: 'MPCB',
      dueDate: '2026-09-15',
      daysLeft: 15,
      risk: 'HIGH',
      status: 'upcoming',
      description: 'Mandatory quarterly filing under Hazardous Waste Rules 2016 for Orange/Red category industries.',
    },
    {
      id: 'comp-2',
      title: 'Annual DISH Factory Safety Audit & Return (Form 27)',
      department: 'DISH',
      dueDate: '2026-09-30',
      daysLeft: 30,
      risk: 'MEDIUM',
      status: 'upcoming',
      description: 'Annual safety report detailing accident prevention, medical examinations, and safety officer logs.',
    },
    {
      id: 'comp-3',
      title: 'MPCB Consent to Operate (CTO) Renewal Submission',
      department: 'MPCB',
      dueDate: '2026-09-25',
      daysLeft: 25,
      risk: 'CRITICAL',
      status: 'renewal_due',
      description: 'Consent to Operate expires in 30 days. Submit renewal application with 1-click vault document reuse.',
    },
  ];

  const handleExportCalendar = (item: typeof complianceItems[0]) => {
    generateICSCalendarFile(item.title, item.description, item.dueDate);
  };

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
                <CalendarDays className="w-6 h-6 text-saffron" />
                <h1 className="text-xl font-bold text-govBlue">Statutory Compliance & Return Calendar</h1>
              </div>
              <p className="text-xs text-govMuted mt-1">
                Automated statutory filing reminders, return schedules, and calendar sync (ICS).
              </p>
            </div>

            <Link
              href={ROUTES.renewals}
              className="bg-saffron hover:bg-saffron-dark text-white text-xs font-bold px-4 py-2.5 rounded-lg shadow transition-all flex items-center gap-1.5"
            >
              <Clock className="w-4 h-4 text-white" />
              <span>Licence Renewals Workspace</span>
            </Link>
          </div>

          {normalizeRole(currentUser?.role) === 'applicant' && (
            <div className="bg-white p-5 rounded-2xl border border-govBorder shadow-sm">
              <JourneyStepper activeStep={8} lang={currentLang} />
            </div>
          )}

          <div className="space-y-4">
            {complianceItems.map((item) => (
              <div key={item.id} className="bg-white p-5 rounded-2xl border border-govBorder shadow-sm flex flex-wrap items-center justify-between gap-4 text-xs">
                <div className="space-y-1.5 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-govBlue">{item.id}</span>
                    <Badge variant="blue">{item.department}</Badge>
                    <Badge variant={item.risk === 'CRITICAL' ? 'red' : 'amber'}>{item.risk} RISK</Badge>
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm">{item.title}</h3>
                  <p className="text-[11px] text-slate-600 leading-relaxed">{item.description}</p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="block font-bold text-red-600 text-sm">Due: {item.dueDate}</span>
                    <span className="text-[10px] text-slate-500 font-medium">In {item.daysLeft} Days</span>
                  </div>

                  <button
                    onClick={() => handleExportCalendar(item)}
                    className="bg-govBlue-50 hover:bg-govBlue hover:text-white text-govBlue font-bold text-xs px-3 py-2 rounded-lg border border-govBlue/20 transition-all flex items-center gap-1"
                  >
                    <Download className="w-3.5 h-3.5 text-saffron" />
                    <span>Sync Calendar (.ICS)</span>
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
