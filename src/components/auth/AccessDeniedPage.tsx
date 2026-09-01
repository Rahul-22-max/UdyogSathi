'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Shield, ShieldAlert, Home, UserCheck, LayoutDashboard } from 'lucide-react';
import { ROUTES } from '@/lib/routes';
import { getRoleDashboardPath, normalizeRole, NormalizedRole } from '@/lib/rbac';

export function getRoleDisplayName(roleInput?: string | null): string {
  const norm = normalizeRole(roleInput);
  switch (norm) {
    case 'department_officer':
      return 'Department Scrutiny Officer';
    case 'inspector':
      return 'Field Inspection Officer';
    case 'administrator':
      return 'Statewide Portal Administrator';
    case 'applicant':
      return 'Industrial Entrepreneur / Applicant';
    default:
      return 'Guest User';
  }
}

export const AccessDeniedPage: React.FC<{ allowedRoles?: string[] }> = ({ allowedRoles = [] }) => {
  const { currentUser, role } = useAuth();
  const targetDashboard = getRoleDashboardPath(role);

  return (
    <div className="bg-[#f7f9fc] min-h-screen flex flex-col items-center justify-center p-4 font-sans text-center">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-govBorder max-w-lg w-full space-y-6">
        {/* Brand Header */}
        <div className="flex items-center justify-center gap-2">
          <div className="w-10 h-10 rounded-lg bg-govBlue text-white flex items-center justify-center font-bold">
            <Shield className="w-6 h-6 text-saffron" />
          </div>
          <span className="text-lg font-extrabold text-govBlue">UdyogSathi Security</span>
        </div>

        {/* Warning Icon & Title */}
        <div className="space-y-2">
          <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto border border-red-200">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-extrabold text-govBlue tracking-tight">Access Denied (403 Unauthorised)</h1>
          <p className="text-xs text-govMuted leading-relaxed max-w-md mx-auto">
            You do not have the required statutory role permissions to access this administrative portal route.
          </p>
        </div>

        {/* User Role Card */}
        {currentUser && (
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-left space-y-2 text-xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="font-bold text-govBlue flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-saffron" /> Active Account:
              </span>
              <span className="font-bold text-slate-800">{currentUser.name}</span>
            </div>

            <div className="flex items-center justify-between text-slate-600">
              <span>Your Current Role:</span>
              <span className="bg-govBlue text-white font-bold px-2 py-0.5 rounded text-[10px]">
                {getRoleDisplayName(role)}
              </span>
            </div>

            {allowedRoles.length > 0 && (
              <div className="flex items-center justify-between text-slate-600">
                <span>Required Permission:</span>
                <span className="bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded text-[10px] border border-amber-300">
                  {allowedRoles.map(getRoleDisplayName).join(' / ')}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-2 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link href={targetDashboard} className="w-full">
              <button className="w-full bg-govBlue hover:bg-govBlue-dark text-white text-xs font-bold py-2.5 rounded-lg shadow transition-colors flex items-center justify-center gap-2">
                <LayoutDashboard className="w-4 h-4 text-saffron" />
                <span>Go to My Dashboard</span>
              </button>
            </Link>

            <Link href={ROUTES.home} className="w-full">
              <button className="w-full bg-slate-100 hover:bg-slate-200 text-govBlue text-xs font-bold py-2.5 rounded-lg border border-slate-300 transition-colors flex items-center justify-center gap-2">
                <Home className="w-4 h-4" />
                <span>Return Home</span>
              </button>
            </Link>
          </div>

          <div className="pt-2 text-[11px] text-slate-500">
            Need role permission escalation?{' '}
            <Link href={ROUTES.contact} className="text-govBlue font-bold underline hover:text-saffron">
              Contact Portal Helpdesk
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
