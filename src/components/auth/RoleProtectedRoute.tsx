'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { FullPageLoadingScreen } from './ProtectedRoute';
import { AccessDeniedPage } from './AccessDeniedPage';
import { normalizeRole } from '@/lib/rbac';

interface RoleProtectedRouteProps {
  allowedRoles: string[];
  children: React.ReactNode;
}

export const RoleProtectedRoute: React.FC<RoleProtectedRouteProps> = ({ allowedRoles, children }) => {
  const { isLoadingAuth, isAuthenticated, currentUser, role } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!isLoadingAuth && !isAuthenticated) {
      const returnTo = pathname ? `?returnTo=${encodeURIComponent(pathname)}` : '';
      router.replace(`/login${returnTo}`);
    }
  }, [isLoadingAuth, isAuthenticated, pathname, router]);

  if (isLoadingAuth) {
    return <FullPageLoadingScreen message="Checking account permissions..." />;
  }

  if (!isAuthenticated) {
    return <FullPageLoadingScreen message="Redirecting to secure login..." />;
  }

  const normUserRole = normalizeRole(currentUser?.role || role);
  const normAllowedRoles = allowedRoles.map(normalizeRole);

  if (normUserRole !== 'administrator' && !normAllowedRoles.includes(normUserRole)) {
    return <AccessDeniedPage allowedRoles={allowedRoles} />;
  }

  return <>{children}</>;
};
