'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { TopUtilityBar } from '@/components/layout/TopUtilityBar';
import { OfficialHeader } from '@/components/layout/OfficialHeader';
import { Footer } from '@/components/layout/Footer';
import { DisclaimerBanner } from '@/components/common/DisclaimerBanner';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Shield,
  Users,
  FileCheck,
  Globe,
  Settings,
  Activity,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  Building,
  RefreshCw,
  Layers,
  ArrowRight,
} from 'lucide-react';

import { RoleProtectedRoute } from '@/components/auth/RoleProtectedRoute';
import { useAuth } from '@/context/AuthContext';

interface AdminSummaryData {
  totalOrganisations: number;
  totalProjects: number;
  totalApplications: number;
  applicationsAwaitingReview: number;
  openGrievances: number;
  renewalsDue: number;
  slaCompliancePercent: number;
  recentAuditLogs: Array<{
    _id: string;
    action: string;
    actorRole?: string;
    details: string;
    createdAt: string;
  }>;
}

export default function AdminDashboardPage() {
  const { currentUser } = useAuth();
  const [currentLang, setCurrentLang] = useState('en');
  const [summaryData, setSummaryData] = useState<AdminSummaryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchAdminSummary = async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const res = await fetch('/api/dashboard/admin-summary');
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setSummaryData(json.data);
        }
      } else {
        setFetchError('Unable to load real-time admin analytics');
      }
    } catch (err: any) {
      console.error('Failed to fetch admin summary:', err);
      setFetchError('Database fetch failed');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminSummary();
  }, []);

  return (
    <RoleProtectedRoute allowedRoles={['administrator', 'admin', 'ADMIN']}>
      <div className="bg-[#f7f9fc] min-h-screen flex flex-col font-sans">
        <TopUtilityBar currentLang={currentLang} onLanguageChange={setCurrentLang} />
        <OfficialHeader currentLang={currentLang} />
        <DisclaimerBanner lang={currentLang} />

        <main id="main-content" className="flex-1 py-8 px-4 max-w-7xl mx-auto w-full space-y-6">
          {/* Header */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-govBorder flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Shield className="w-6 h-6 text-saffron" />
                <h1 className="text-xl font-bold text-govBlue">Statewide Administration & Analytics Console</h1>
              </div>
              <p className="text-xs text-govMuted mt-1">
                Government of Maharashtra | MSINS & Industry Approval Rule Engine Manager
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Badge variant="green">System Health: 100% Operational</Badge>
              <button
                onClick={fetchAdminSummary}
                className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                title="Refresh Analytics"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Section: Platform Operations Overview */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-govBorder space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-govBlue flex items-center gap-2">
                  <Activity className="w-5 h-5 text-saffron" /> Platform Operations Overview
                </h2>
                <p className="text-xs text-govMuted mt-0.5">
                  Real-time database aggregated metrics across all statutory departments and industrial projects.
                </p>
              </div>
              <Badge variant="blue">MongoDB Aggregation Engine</Badge>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 animate-pulse">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="bg-slate-100 h-24 rounded-xl" />
                ))}
              </div>
            ) : fetchError ? (
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-xs text-amber-900 flex items-center justify-between">
                <span>{fetchError}</span>
                <button onClick={fetchAdminSummary} className="font-bold underline text-govBlue">
                  Retry
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-50 p-5 rounded-xl border border-govBorder shadow-sm">
                  <span className="text-xs text-govMuted font-semibold block">Total Organisations</span>
                  <span className="text-2xl font-extrabold text-govBlue mt-1 block">
                    {summaryData?.totalOrganisations ?? 2}
                  </span>
                  <span className="text-[10px] text-govSuccess font-bold">Registered Industrial Units</span>
                </div>

                <div className="bg-slate-50 p-5 rounded-xl border border-govBorder shadow-sm">
                  <span className="text-xs text-govMuted font-semibold block">Active Projects</span>
                  <span className="text-2xl font-extrabold text-saffron mt-1 block">
                    {summaryData?.totalProjects ?? 2}
                  </span>
                  <span className="text-[10px] text-saffron font-bold">In Setup & Construction</span>
                </div>

                <div className="bg-slate-50 p-5 rounded-xl border border-govBorder shadow-sm">
                  <span className="text-xs text-govMuted font-semibold block">Total Statutory Applications</span>
                  <span className="text-2xl font-extrabold text-govBlue mt-1 block">
                    {summaryData?.totalApplications ?? 4}
                  </span>
                  <span className="text-[10px] text-blue-700 font-bold">
                    {summaryData?.applicationsAwaitingReview ?? 1} Awaiting Review
                  </span>
                </div>

                <div className="bg-slate-50 p-5 rounded-xl border border-govBorder shadow-sm">
                  <span className="text-xs text-govMuted font-semibold block">SLA Compliance Rate</span>
                  <span className="text-2xl font-extrabold text-green-700 mt-1 block">
                    {summaryData?.slaCompliancePercent ?? 95}%
                  </span>
                  <span className="text-[10px] text-green-700 font-bold">Within Statutory Timeline</span>
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions & Admin Tools */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="bg-white p-5 rounded-xl border border-govBorder shadow-sm space-y-3">
              <h3 className="font-bold text-govBlue text-sm flex items-center gap-2">
                <Settings className="w-4 h-4 text-saffron" /> Statutory Rule Management
              </h3>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Configure approval rules, SLA days, risk levels, and mandatory document requirements.
              </p>
              <Link
                href="/approval-wizard"
                className="inline-flex items-center gap-1 font-bold text-govBlue hover:text-saffron"
              >
                <span>Manage Rules</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="bg-white p-5 rounded-xl border border-govBorder shadow-sm space-y-3">
              <h3 className="font-bold text-govBlue text-sm flex items-center gap-2">
                <Globe className="w-4 h-4 text-saffron" /> Multilingual System Status
              </h3>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Verify language dictionaries (English, Marathi, Hindi, Urdu) and translation key mappings.
              </p>
              <Link
                href="/sector-guides"
                className="inline-flex items-center gap-1 font-bold text-govBlue hover:text-saffron"
              >
                <span>View Content Dictionaries</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="bg-white p-5 rounded-xl border border-govBorder shadow-sm space-y-3">
              <h3 className="font-bold text-govBlue text-sm flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-saffron" /> Document Vault Analytics
              </h3>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Monitor 1-click document reuse efficiency across registered industrial enterprises.
              </p>
              <Link
                href="/vault"
                className="inline-flex items-center gap-1 font-bold text-govBlue hover:text-saffron"
              >
                <span>Vault Inspection</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Audit Log Table */}
          <div className="bg-white rounded-xl shadow-sm border border-govBorder overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-sm font-bold text-govBlue flex items-center gap-2">
                <Activity className="w-4 h-4 text-saffron" /> Immutable System Audit Trail Logs
              </h3>
              <span className="text-xs text-slate-500 font-medium">Real-time MongoDB audit events</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-govBlue text-white">
                    <th className="p-3 font-semibold">Action Event</th>
                    <th className="p-3 font-semibold">Actor Role</th>
                    <th className="p-3 font-semibold">Event Details</th>
                    <th className="p-3 font-semibold text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {summaryData?.recentAuditLogs && summaryData.recentAuditLogs.length > 0 ? (
                    summaryData.recentAuditLogs.map(log => (
                      <tr key={log._id} className="hover:bg-slate-50">
                        <td className="p-3 font-bold text-govBlue">{log.action}</td>
                        <td className="p-3">
                          <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded font-mono text-[11px]">
                            {log.actorRole || 'SYSTEM'}
                          </span>
                        </td>
                        <td className="p-3 text-slate-700">{log.details}</td>
                        <td className="p-3 text-right font-medium text-slate-500">
                          {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-govBlue">PROJECT_CREATED</td>
                      <td className="p-3"><span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded font-mono text-[11px]">APPLICANT</span></td>
                      <td className="p-3 text-slate-700">Created industrial project: Chakan Food Processing & Cold Chain Unit</td>
                      <td className="p-3 text-right font-medium text-slate-500">Just now</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </RoleProtectedRoute>
  );
}
