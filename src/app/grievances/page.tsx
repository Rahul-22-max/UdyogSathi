'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { TopUtilityBar } from '@/components/layout/TopUtilityBar';
import { OfficialHeader } from '@/components/layout/OfficialHeader';
import { Footer } from '@/components/layout/Footer';
import { DisclaimerBanner } from '@/components/common/DisclaimerBanner';
import { Badge } from '@/components/ui/Badge';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import { normalizeRole } from '@/lib/rbac';
import { ROUTES } from '@/lib/routes';
import { MessageSquareWarning, Plus, CheckCircle2, Clock, ShieldCheck, Send } from 'lucide-react';

export default function GrievancesPage() {
  const { currentUser } = useAuth();
  const [currentLang, setCurrentLang] = useState('en');
  const [showFileModal, setShowFileModal] = useState(false);

  const grievances = [
    {
      id: 'GRV-2026-301',
      subject: 'MIDC Water Connection Scrutiny SLA Delay Escalation',
      department: 'MIDC',
      applicationRef: 'APP-2026-8805',
      filedAt: '2026-08-25',
      assignedOfficer: 'S. K. Patil (MIDC Executive Engineer)',
      status: 'in_progress',
      description: 'MIDC water connection scrutiny exceeded 15 day SLA timeline without query or update.',
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
                <MessageSquareWarning className="w-6 h-6 text-saffron" />
                <h1 className="text-xl font-bold text-govBlue">Industrial Grievance & SLA Escalation Portal</h1>
              </div>
              <p className="text-xs text-govMuted mt-1">
                Lodge tickets for SLA delays, technical issues, or scrutiny queries with transparent escalation.
              </p>
            </div>

            <button
              onClick={() => setShowFileModal(true)}
              className="bg-saffron hover:bg-saffron-dark text-white text-xs font-bold px-4 py-2.5 rounded-lg shadow transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>File New Grievance</span>
            </button>
          </div>

          <div className="space-y-4">
            {grievances.map((grv) => (
              <div key={grv.id} className="bg-white p-6 rounded-2xl border border-govBorder shadow-sm space-y-3 text-xs">
                <div className="flex flex-wrap items-start justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-govBlue">{grv.id}</span>
                      <Badge variant="blue">{grv.department}</Badge>
                      <Badge variant="amber">In Progress</Badge>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">{grv.subject}</h3>
                    <div className="text-slate-500">Linked App: {grv.applicationRef} • Filed: {grv.filedAt}</div>
                  </div>

                  <div className="text-right text-[11px] text-slate-500">
                    Assigned: <strong className="text-govBlue">{grv.assignedOfficer}</strong>
                  </div>
                </div>

                <p className="text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200 leading-relaxed">
                  {grv.description}
                </p>
              </div>
            ))}
          </div>

          {showFileModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white max-w-md w-full rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4 text-xs">
                <h3 className="font-bold text-govBlue text-sm border-b border-slate-100 pb-2">Lodge Industrial Grievance</h3>
                <div className="space-y-3">
                  <div>
                    <label className="font-bold text-slate-800 block mb-1">Subject / Category *</label>
                    <input type="text" placeholder="e.g. SLA delay in MPCB CTE scrutiny..." className="w-full p-2.5 border rounded-lg" />
                  </div>
                  <div>
                    <label className="font-bold text-slate-800 block mb-1">Detailed Description *</label>
                    <textarea rows={3} placeholder="Provide details of application reference number and SLA breach..." className="w-full p-2.5 border rounded-lg" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setShowFileModal(false)} className="w-full bg-slate-100 py-2 rounded font-bold">Cancel</button>
                  <button onClick={() => { alert('Grievance ticket lodged successfully!'); setShowFileModal(false); }} className="w-full bg-govBlue text-white py-2 rounded font-bold">Submit Grievance</button>
                </div>
              </div>
            </div>
          )}
        </main>

        <Footer />
      </div>
    </ProtectedRoute>
  );
}
