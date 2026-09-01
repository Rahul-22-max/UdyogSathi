'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Shield, RefreshCw } from 'lucide-react';

export function FullPageLoadingScreen({ message }: { message?: string }) {
  return (
    <div className="bg-[#f7f9fc] min-h-screen flex flex-col items-center justify-center p-4 font-sans text-center">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-govBorder max-w-md w-full space-y-4">
        <div className="w-12 h-12 rounded-xl bg-govBlue text-white flex items-center justify-center mx-auto shadow-md">
          <Shield className="w-7 h-7 text-saffron" />
        </div>
        <RefreshCw className="w-8 h-8 text-saffron animate-spin mx-auto" />
        <h2 className="text-base font-bold text-govBlue">UdyogSathi Security Check</h2>
        <p className="text-xs text-govMuted">{message || 'Restoring your secure session...'}</p>
      </div>
    </div>
  );
}

export const ProtectedRoute: React.FC<{ children: React.ReactNode; allowUnonboarded?: boolean }> = ({
  children,
  allowUnonboarded = false,
}) => {
  const { isLoadingAuth, isAuthenticated, currentUser, role } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!isLoadingAuth) {
      if (!isAuthenticated) {
        const returnTo = pathname ? `?returnTo=${encodeURIComponent(pathname)}` : '';
        router.replace(`/login${returnTo}`);
        return;
      }

      const isApplicant = (currentUser?.role === 'APPLICANT' || role === 'APPLICANT');
      const isOnboardingComplete = currentUser?.onboardingCompleted ?? true;

      // Onboarding guard: New applicant must complete onboarding before accessing private workspace
      if (isApplicant && !isOnboardingComplete && pathname !== '/onboarding' && !allowUnonboarded) {
        const returnTo = pathname && pathname !== '/dashboard' ? `?returnTo=${encodeURIComponent(pathname)}` : '';
        router.replace(`/onboarding${returnTo}`);
        return;
      }

      // If onboarded applicant visits /onboarding, redirect to dashboard
      if (isApplicant && isOnboardingComplete && pathname === '/onboarding') {
        router.replace('/dashboard');
        return;
      }
    }
  }, [isLoadingAuth, isAuthenticated, currentUser, role, pathname, router, allowUnonboarded]);

  if (isLoadingAuth) {
    return <FullPageLoadingScreen message="Restoring your secure session..." />;
  }

  if (!isAuthenticated) {
    return <FullPageLoadingScreen message="Redirecting to secure login..." />;
  }

  const isApplicant = (currentUser?.role === 'APPLICANT' || role === 'APPLICANT');
  const isOnboardingComplete = currentUser?.onboardingCompleted ?? true;

  if (isApplicant && !isOnboardingComplete && pathname !== '/onboarding' && !allowUnonboarded) {
    return <FullPageLoadingScreen message="Redirecting to first-time onboarding..." />;
  }

  return <>{children}</>;
};
