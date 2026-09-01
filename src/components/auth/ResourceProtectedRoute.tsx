'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { ShieldAlert, LayoutDashboard, Home } from 'lucide-react';
import { getRoleDashboardPath } from '@/lib/rbac';

interface ResourceProtectedRouteProps {
  isAllowed: boolean;
  resourceName?: string;
  children: React.ReactNode;
}

export const ResourceProtectedRoute: React.FC<ResourceProtectedRouteProps> = ({
  isAllowed,
  resourceName = 'record',
  children,
}) => {
  const { role } = useAuth();
  const targetDashboard = getRoleDashboardPath(role);

  if (!isAllowed) {
    return (
      <div className="bg-[#f7f9fc] min-h-screen flex flex-col items-center justify-center p-4 font-sans text-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-govBorder max-w-md w-full space-y-5">
          <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
            <ShieldAlert className="w-7 h-7" />
          </div>

          <div className="space-y-1">
            <h2 className="text-xl font-bold text-govBlue">Resource Access Restricted</h2>
            <p className="text-xs text-govMuted leading-relaxed">
              You do not have permission to access this requested {resourceName}.
            </p>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs text-slate-600">
            This record belongs to another enterprise or department queue.
          </div>

          <div className="flex gap-2 pt-2">
            <Link href={targetDashboard} className="w-full">
              <button className="w-full bg-govBlue hover:bg-govBlue-dark text-white text-xs font-bold py-2.5 rounded-lg shadow transition-colors flex items-center justify-center gap-1.5">
                <LayoutDashboard className="w-4 h-4 text-saffron" />
                <span>My Dashboard</span>
              </button>
            </Link>

            <Link href="/" className="w-full">
              <button className="w-full bg-slate-100 hover:bg-slate-200 text-govBlue text-xs font-bold py-2.5 rounded-lg border border-slate-300 transition-colors flex items-center justify-center gap-1.5">
                <Home className="w-4 h-4" />
                <span>Portal Home</span>
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
