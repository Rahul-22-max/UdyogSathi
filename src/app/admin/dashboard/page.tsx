'use client';

import React, { useState } from 'react';
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
} from 'lucide-react';

import { RoleProtectedRoute } from '@/components/auth/RoleProtectedRoute';
import { useAuth } from '@/context/AuthContext';

export default function AdminDashboardPage() {
  const { currentUser } = useAuth();
  const [currentLang, setCurrentLang] = useState('en');

  const auditLogs = [
    {
      id: 'log-1',
      action: 'APPROVAL_RULE_UPDATED',
      entity: 'RULE_MPCB_CTE',
      user: 'admin@udyogsathi.gov.in',
      details: 'Updated SLA target from 45 days to 30 days per new MPCB circular.',
      time: '10 minutes ago',
    },
    {
      id: 'log-2',
      action: 'INSPECTION_COMPLETED',
      entity: 'INSP-2026-990',
      user: 'inspector@udyogsathi.gov.in',
      details: 'Fire NOC evidence photos logged with GPS tags.',
      time: '2 hours ago',
    },
    {
      id: 'log-3',
      action: 'TRANSLATION_PUBLISHED',
      entity: 'UI_DICTIONARY_MR',
      user: 'admin@udyogsathi.gov.in',
      details: 'Published Marathi language string updates.',
      time: '1 day ago',
    },
  ];

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

          <Badge variant="green">System Health: 100% Operational</Badge>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-govBorder shadow-sm">
            <span className="text-xs text-govMuted font-semibold block">Total Portal Users</span>
            <span className="text-2xl font-extrabold text-govBlue mt-1 block">8,450</span>
            <span className="text-[10px] text-govSuccess font-bold">4 User Roles Configured</span>
          </div>

          <div className="bg-white p-5 rounded-xl border border-govBorder shadow-sm">
            <span className="text-xs text-govMuted font-semibold block">Active Approval Rules</span>
            <span className="text-2xl font-extrabold text-saffron mt-1 block">15 Rules</span>
            <span className="text-[10px] text-saffron font-bold">Database Rule Engine</span>
          </div>

          <div className="bg-white p-5 rounded-xl border border-govBorder shadow-sm">
            <span className="text-xs text-govMuted font-semibold block">Translation Completeness</span>
            <span className="text-2xl font-extrabold text-govSuccess mt-1 block">23 Languages</span>
            <span className="text-[10px] text-govSuccess font-bold">EN, MR, HI, UR Full Dict</span>
          </div>

          <div className="bg-white p-5 rounded-xl border border-govBorder shadow-sm">
            <span className="text-xs text-govMuted font-semibold block">Audit Trail Logs</span>
            <span className="text-2xl font-extrabold text-govBlue mt-1 block">1,240 Entries</span>
            <span className="text-[10px] text-blue-700 font-bold">Immutable Compliance</span>
          </div>
        </div>

        {/* Document Reuse Analytics & Rule Engine Configuration */}
        <div className="bg-white rounded-xl shadow-sm border border-govBorder p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-govBlue flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-saffron" /> Verified Document Reuse System Analytics & Rule Management
              </h3>
              <p className="text-xs text-govMuted mt-0.5">
                Configure document type aliases, verification expiry rules, and track portal-wide document upload reduction.
              </p>
            </div>
            <Badge variant="green">Reuse Engine Active</Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-slate-500 font-semibold block">Total Vault Documents Reused</span>
              <span className="text-xl font-extrabold text-govBlue mt-1 block">1,420 Submissions</span>
              <span className="text-[10px] text-green-700 font-bold">78% Reuse Efficiency</span>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-slate-500 font-semibold block">Redundant Uploads Avoided</span>
              <span className="text-xl font-extrabold text-saffron mt-1 block">2,840 Files</span>
              <span className="text-[10px] text-saffron font-bold">Storage Saved: 4.2 GB</span>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-slate-500 font-semibold block">Estimated Processing Hours Saved</span>
              <span className="text-xl font-extrabold text-green-700 mt-1 block">420 Hours</span>
              <span className="text-[10px] text-green-700 font-bold">Expedited Scrutiny SLA</span>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-slate-500 font-semibold block">Configured Document Aliases</span>
              <span className="text-xl font-extrabold text-govBlue mt-1 block">8 Canonical Types</span>
              <span className="text-[10px] text-blue-700 font-bold">PAN, GST, COI, Land Deed...</span>
            </div>
          </div>
        </div>

        {/* Audit Log Table */}
        <div className="bg-white rounded-xl shadow-sm border border-govBorder overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-sm font-bold text-govBlue flex items-center gap-2">
              <Activity className="w-4 h-4 text-saffron" /> Immutable System Audit Trail Logs
            </h3>
            <span className="text-xs text-slate-500 font-medium">Real-time administrator security events</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-govBlue text-white">
                  <th className="p-3 font-semibold">Action Event</th>
                  <th className="p-3 font-semibold">Target Entity</th>
                  <th className="p-3 font-semibold">User Account</th>
                  <th className="p-3 font-semibold">Event Details</th>
                  <th className="p-3 font-semibold text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {auditLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-govBlue">{log.action}</td>
                    <td className="p-3">
                      <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded font-mono text-[11px]">
                        {log.entity}
                      </span>
                    </td>
                    <td className="p-3 text-slate-600">{log.user}</td>
                    <td className="p-3 text-slate-700">{log.details}</td>
                    <td className="p-3 text-right font-medium text-slate-500">{log.time}</td>
                  </tr>
                ))}
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
