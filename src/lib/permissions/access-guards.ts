import { NextRequest } from 'next/server';
import { verifyAuthSession, AuthSessionPayload } from '@/lib/auth-session';
import { normalizeRole } from '@/lib/rbac';

export async function requireAuthenticatedUser(req: NextRequest): Promise<AuthSessionPayload> {
  const session = await verifyAuthSession(req);
  if (!session || !session.userId) {
    const error: any = new Error('Unauthorized: Authentication required.');
    error.statusCode = 401;
    throw error;
  }
  return session;
}

export function requireRole(session: AuthSessionPayload, allowedRoles: string[]): void {
  const normRole = normalizeRole(session.role);
  const normalizedAllowed = allowedRoles.map((r) => normalizeRole(r));

  if (!normalizedAllowed.includes(normRole) && normRole !== 'administrator') {
    const error: any = new Error('Forbidden: Insufficient role permissions.');
    error.statusCode = 403;
    throw error;
  }
}

export function assertProjectAccess(session: AuthSessionPayload, project: any): void {
  if (!project) {
    const error: any = new Error('Project not found.');
    error.statusCode = 404;
    throw error;
  }

  const role = normalizeRole(session.role);
  if (role === 'administrator') return;

  const ownerId = project.ownerUserId?._id?.toString() || project.ownerUserId?.toString() || project.userId;
  if (role === 'applicant') {
    if (ownerId && ownerId !== session.userId) {
      const error: any = new Error('Forbidden: You do not have permission to access this project.');
      error.statusCode = 403;
      throw error;
    }
  }
}

export function assertApplicationAccess(session: AuthSessionPayload, application: any): void {
  if (!application) {
    const error: any = new Error('Application not found.');
    error.statusCode = 404;
    throw error;
  }

  const role = normalizeRole(session.role);
  if (role === 'administrator') return;

  const applicantId = application.applicantUserId?._id?.toString() || application.applicantUserId?.toString() || application.userId;

  if (role === 'applicant') {
    if (applicantId && applicantId !== session.userId) {
      const error: any = new Error('Forbidden: Access to this application is restricted.');
      error.statusCode = 403;
      throw error;
    }
  }

  if (role === 'department_officer') {
    if (session.department) {
      const userDept = session.department.toLowerCase();
      const appDept = (application.department || '').toLowerCase();
      if (!appDept.includes(userDept) && !userDept.includes(appDept)) {
        const officerId = application.assignedOfficerId?._id?.toString() || application.assignedOfficerId?.toString();
        if (officerId !== session.userId) {
          const error: any = new Error('Forbidden: Application belongs to a different department queue.');
          error.statusCode = 403;
          throw error;
        }
      }
    }
  }

  if (role === 'inspector') {
    const assignedInspectorId = application.assignedInspectorId?._id?.toString() || application.assignedInspectorId?.toString();
    if (assignedInspectorId && assignedInspectorId !== session.userId) {
      const error: any = new Error('Forbidden: Application is not assigned to your inspection queue.');
      error.statusCode = 403;
      throw error;
    }
  }
}

import { isInspectorAssignedToInspection } from '@/lib/permissions/inspector-identity';

export function assertInspectionAccess(session: AuthSessionPayload, inspection: any): void {
  if (!inspection) {
    const error: any = new Error('Inspection not found.');
    error.statusCode = 404;
    throw error;
  }

  const role = normalizeRole(session.role);
  if (role === 'administrator') return;

  if (role === 'inspector') {
    const isAssigned = isInspectorAssignedToInspection(inspection, session);
    if (!isAssigned) {
      const error: any = new Error('Forbidden: You are not assigned to conduct this site inspection.');
      error.statusCode = 403;
      throw error;
    }
  }

  if (role === 'applicant') {
    const applicantId = inspection.applicantUserId?._id?.toString() || inspection.applicantUserId?.toString() || inspection.userId;
    if (applicantId && applicantId !== session.userId) {
      const error: any = new Error('Forbidden: You do not have permission to view this inspection.');
      error.statusCode = 403;
      throw error;
    }
  }
}
