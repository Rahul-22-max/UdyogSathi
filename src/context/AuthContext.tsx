'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserSession, UserRole } from '@/types';
import { normalizeRole as rbacNormalizeRole, NormalizedRole, hasPermission as rbacHasPermission } from '@/lib/rbac';

export function normalizeRole(roleString?: string): UserRole {
  if (!roleString) return 'GUEST';
  const norm = rbacNormalizeRole(roleString);
  switch (norm) {
    case 'department_officer':
      return 'OFFICER';
    case 'inspector':
      return 'INSPECTOR';
    case 'administrator':
      return 'ADMIN';
    case 'applicant':
      return 'APPLICANT';
    default:
      return 'GUEST';
  }
}

export interface SignUpParams {
  email: string;
  password: string;
  name: string;
  mobile?: string;
  language?: string;
  termsAccepted?: boolean;
  notificationConsent?: boolean;
}

interface AuthContextType {
  currentUser: UserSession | null;
  userProfile: UserSession | null;
  role: UserRole | null;
  normalizedRole: NormalizedRole;
  isAuthenticated: boolean;
  isLoadingAuth: boolean;
  authError: string | null;
  refreshCurrentUser: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<UserSession>;
  signUp: (params: SignUpParams) => Promise<UserSession>;
  completeOnboarding: (onboardingData?: { organisationId?: string; profileUpdates?: Partial<UserSession> }) => void;
  signOut: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_USER_KEY = 'udyogsathi_user_cache';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const refreshCurrentUser = useCallback(async () => {
    setIsLoadingAuth(true);
    setAuthError(null);

    try {
      const res = await fetch('/api/auth/me', {
        method: 'GET',
        headers: { 'Cache-Control': 'no-cache' },
      });

      if (res.ok) {
        const data = await res.json();
        if (data.authenticated && data.user) {
          const userObj: UserSession = {
            ...data.user,
            role: normalizeRole(data.user.role),
            onboardingCompleted: data.user.onboardingCompleted ?? (data.user.role !== 'APPLICANT' && data.user.role !== 'applicant'),
            onboardingStatus: data.user.onboardingStatus || (data.user.role === 'APPLICANT' ? 'not_started' : 'completed'),
          };
          setCurrentUser(userObj);
          try {
            localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(userObj));
          } catch (e) {}
          setIsLoadingAuth(false);
          return;
        }
      }

      const cachedStr = typeof window !== 'undefined' ? localStorage.getItem(LOCAL_USER_KEY) : null;
      if (cachedStr) {
        try {
          const cachedUser = JSON.parse(cachedStr);
          if (cachedUser && cachedUser.id) {
            setCurrentUser({
              ...cachedUser,
              role: normalizeRole(cachedUser.role),
            });
            setIsLoadingAuth(false);
            return;
          }
        } catch {
          localStorage.removeItem(LOCAL_USER_KEY);
        }
      }

      setCurrentUser(null);
    } catch (err: any) {
      console.error('Session restoration error:', err);
      const cachedStr = typeof window !== 'undefined' ? localStorage.getItem(LOCAL_USER_KEY) : null;
      if (cachedStr) {
        try {
          const cachedUser = JSON.parse(cachedStr);
          if (cachedUser && cachedUser.id) {
            setCurrentUser({
              ...cachedUser,
              role: normalizeRole(cachedUser.role),
            });
            setIsLoadingAuth(false);
            return;
          }
        } catch {}
      }
      setAuthError('Unable to verify active session');
      setCurrentUser(null);
    } finally {
      setIsLoadingAuth(false);
    }
  }, []);

  useEffect(() => {
    refreshCurrentUser();
  }, [refreshCurrentUser]);

  const signIn = async (email: string, password: string): Promise<UserSession> => {
    setIsLoadingAuth(true);
    setAuthError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      const authenticatedUser: UserSession = {
        ...data.user,
        role: normalizeRole(data.user.role),
        onboardingCompleted: data.user.onboardingCompleted ?? true,
        onboardingStatus: data.user.onboardingStatus || 'completed',
      };

      setCurrentUser(authenticatedUser);
      try {
        localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(authenticatedUser));
      } catch (e) {}

      setIsLoadingAuth(false);
      return authenticatedUser;
    } catch (err: any) {
      setIsLoadingAuth(false);
      setAuthError(err.message || 'Login failed');
      throw err;
    }
  };

  const signUp = async (params: SignUpParams): Promise<UserSession> => {
    setIsLoadingAuth(true);
    setAuthError(null);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: params.email,
          password: params.password,
          name: params.name,
          mobile: params.mobile,
          language: params.language || 'en',
          role: 'APPLICANT', // Enforce APPLICANT role for self-registration
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      const registeredUser: UserSession = {
        ...data.user,
        role: 'APPLICANT',
        onboardingCompleted: false,
        onboardingStatus: 'not_started',
        notificationConsent: params.notificationConsent,
        termsAcceptedAt: new Date().toISOString(),
      };

      setCurrentUser(registeredUser);
      try {
        localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(registeredUser));
      } catch (e) {}

      setIsLoadingAuth(false);
      return registeredUser;
    } catch (err: any) {
      setIsLoadingAuth(false);
      setAuthError(err.message || 'Registration failed');
      throw err;
    }
  };

  const completeOnboarding = (onboardingData?: { organisationId?: string; profileUpdates?: Partial<UserSession> }) => {
    if (!currentUser) return;
    const updatedUser: UserSession = {
      ...currentUser,
      ...onboardingData?.profileUpdates,
      organisationId: onboardingData?.organisationId || currentUser.organisationId || 'org-new-1',
      onboardingCompleted: true,
      onboardingStatus: 'completed',
    };
    setCurrentUser(updatedUser);
    try {
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(updatedUser));
    } catch (e) {}
  };

  const signOut = async () => {
    setIsLoadingAuth(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error('Sign out error:', err);
    } finally {
      setCurrentUser(null);
      try {
        localStorage.removeItem(LOCAL_USER_KEY);
      } catch (e) {}
      setIsLoadingAuth(false);
    }
  };

  const role = currentUser ? normalizeRole(currentUser.role) : null;
  const normalizedRole = rbacNormalizeRole(currentUser?.role);

  const checkPermission = (permission: string): boolean => {
    return rbacHasPermission(currentUser?.role, permission);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile: currentUser,
        role,
        normalizedRole,
        isAuthenticated: !!currentUser,
        isLoadingAuth,
        authError,
        refreshCurrentUser,
        signIn,
        signUp,
        completeOnboarding,
        signOut,
        hasPermission: checkPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
