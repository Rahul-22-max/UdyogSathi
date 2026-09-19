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
import { WorkflowStore, InspectionItem } from '@/lib/workflow-store';
import { SearchCheck, Calendar, MapPin, Camera, AlertTriangle, Shield, CheckCircle2, ArrowRight, XCircle } from 'lucide-react';

import { useAuth } from '@/context/AuthContext';
import { normalizeRole } from '@/lib/rbac';

export default function InspectionsPage() {
  const { currentUser } = useAuth();
  const [currentLang, setCurrentLang] = useState('en');
  const [activeTab, setActiveTab] = useState<'active' | 'cancelled'>('active');

  const userEmail = currentUser?.email || 'applicant@udyogsathi.gov.in';
  const isVijay = userEmail === 'applicant@udyogsathi.gov.in' || userEmail.includes('officer') || userEmail.includes('inspector') || userEmail.includes('admin');

  const activeInspections = isVijay ? WorkflowStore.getActiveInspectionsForInspector(userEmail) : [];
  const cancelledInspections = isVijay ? WorkflowStore.getCancelledInspections() : [];

  const displayedInspections = activeTab === 'active' ? activeInspections : cancelledInspections;

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
                <SearchCheck className="w-6 h-6 text-saffron" />
                <h1 className="text-xl font-bold text-govBlue">Field Inspections & Safety Audits</h1>
              </div>
              <p className="text-xs text-govMuted mt-1">
                Track scheduled site visits, pre-inspection guidelines, geofenced evidence capture, and audit reports.
              </p>
            </div>

            <Link
              href="/inspector/dashboard"
              className="bg-govBlue hover:bg-govBlue-dark text-white text-xs font-bold px-4 py-2.5 rounded-lg shadow transition-all flex items-center gap-1.5"
            >
              <Camera className="w-4 h-4 text-saffron" />
              <span>Inspector Camera Evidence Portal</span>
            </Link>
          </div>

          {/* Stepper */}
          {normalizeRole(currentUser?.role) === 'applicant' && (
            <div className="bg-white p-5 rounded-2xl border border-govBorder shadow-sm">
              <JourneyStepper activeStep={6} lang={currentLang} />
            </div>
          )}

          {/* Active vs Cancelled Inspection Tabs */}
          <div className="flex items-center gap-3 border-b border-govBorder pb-2 text-xs">
            <button
              onClick={() => setActiveTab('active')}
              className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2 ${
                activeTab === 'active'
                  ? 'bg-govBlue text-white shadow'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-saffron" />
              <span>Active Scheduled Inspections ({activeInspections.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('cancelled')}
              className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2 ${
                activeTab === 'cancelled'
                  ? 'bg-red-700 text-white shadow'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <XCircle className="w-4 h-4" />
              <span>Cancelled Inspection History ({cancelledInspections.length})</span>
            </button>
          </div>

          {/* Inspection Cards List */}
          <div className="space-y-4">
            {displayedInspections.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl border border-govBorder text-center space-y-2 text-xs">
                <SearchCheck className="w-8 h-8 text-slate-400 mx-auto" />
                <h3 className="font-bold text-govBlue">No Inspections Found</h3>
                <p className="text-govMuted">
                  {activeTab === 'active'
                    ? 'No active site inspections are currently scheduled.'
                    : 'No cancelled inspections in historical record.'}
                </p>
              </div>
            ) : (
              displayedInspections.map((insp) => (
                <div
                  key={insp.id}
                  className={`bg-white p-6 rounded-2xl border shadow-sm space-y-4 text-xs ${
                    insp.status === 'cancelled' ? 'border-red-300 bg-red-50/30' : 'border-govBorder'
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-govBlue">{insp.id}</span>
                        <Badge variant="blue">{insp.department}</Badge>
                        {insp.status === 'scheduled' ? (
                          <Badge variant="amber">Scheduled</Badge>
                        ) : insp.status === 'completed' ? (
                          <Badge variant="green">Completed</Badge>
                        ) : (
                          <Badge variant="red">Cancelled (App Rejected)</Badge>
                        )}
                      </div>
                      <h3 className="text-sm font-bold text-slate-900">{insp.title}</h3>
                      <div className="text-slate-600 font-medium">{insp.unitName}</div>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-right space-y-1">
                      <div className="font-bold text-govBlue flex items-center gap-1 justify-end">
                        <Calendar className="w-3.5 h-3.5 text-saffron" />
                        <span>
                          {insp.scheduledDate} at {insp.scheduledTime}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500">{insp.inspectorName}</div>
                    </div>
                  </div>

                  {insp.status === 'cancelled' && (
                    <div className="bg-red-50 border border-red-200 p-3 rounded-xl text-red-900 font-semibold text-xs flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                      <span>
                        Cancellation Reason: {insp.cancellationReason || 'Application rejected by department.'}
                      </span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div>
                      <span className="font-bold text-govBlue block mb-1">Inspection Venue / Geofence:</span>
                      <div className="flex items-start gap-1.5 text-slate-700">
                        <MapPin className="w-4 h-4 text-saffron shrink-0 mt-0.5" />
                        <span>{insp.venue}</span>
                      </div>
                    </div>

                    <div>
                      <span className="font-bold text-govBlue block mb-1">Audit Verification Requirements:</span>
                      <div className="flex flex-wrap gap-1">
                        {insp.requirements.map((req, rIdx) => (
                          <span
                            key={rIdx}
                            className="bg-white text-slate-700 px-2 py-0.5 rounded text-[11px] font-medium border border-slate-200"
                          >
                            {req}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </main>

        <Footer />
      </div>
    </ProtectedRoute>
  );
}
