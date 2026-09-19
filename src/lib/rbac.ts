import { UserSession } from '@/types';

export type NormalizedRole = 'guest' | 'applicant' | 'department_officer' | 'inspector' | 'administrator';

const ROLE_ALIASES: Record<string, NormalizedRole> = {
  guest: 'guest',
  public: 'guest',
  anonymous: 'guest',

  applicant: 'applicant',
  entrepreneur: 'applicant',
  business_owner: 'applicant',
  msme: 'applicant',
  user: 'applicant',

  officer: 'department_officer',
  departmentofficer: 'department_officer',
  department_officer: 'department_officer',
  sro: 'department_officer',

  inspector: 'inspector',
  factory_inspector: 'inspector',
  field_inspector: 'inspector',
  field_inspection_officer: 'inspector',
  fieldinspectionofficer: 'inspector',
  inspection_officer: 'inspector',

  admin: 'administrator',
  administrator: 'administrator',
  superadmin: 'administrator',
  state_administrator: 'administrator',
};

/**
 * Normalizes any role string input into one of 5 canonical roles:
 * - guest
 * - applicant
 * - department_officer
 * - inspector
 * - administrator
 */
export function normalizeRole(roleInput?: string | null): NormalizedRole {
  if (!roleInput) return 'guest';
  const clean = String(roleInput)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/-/g, '_');

  if (ROLE_ALIASES[clean]) {
    return ROLE_ALIASES[clean];
  }

  if (clean.includes('admin')) return 'administrator';
  if (clean.includes('inspector') || clean.includes('factory')) return 'inspector';
  if (clean.includes('officer') || clean.includes('department')) return 'department_officer';
  if (clean.includes('applicant') || clean.includes('entrepreneur') || clean.includes('user')) return 'applicant';

  return 'guest';
}

/**
 * Role Permission Matrix defining explicit capabilities per role
 */
export const PERMISSIONS: Record<NormalizedRole, string[]> = {
  guest: [
    'public:view',
    'wizard:guest_start',
    'sector_guides:read',
    'scheme:read_public',
    'knowledge_base:read',
    'faq:read',
    'contact:submit',
  ],

  applicant: [
    'public:view',
    'dashboard:applicant',
    'project:create',
    'project:read:own',
    'project:update:own',
    'project:delete:own',
    'document:create:own',
    'document:read:own',
    'document:update:own',
    'document:delete:own',
    'application:create:own',
    'application:read:own',
    'application:submit:own',
    'application:withdraw:own',
    'query:respond:own',
    'inspection:read:own',
    'compliance:read:own',
    'renewal:create:own',
    'renewal:read:own',
    'scheme:match:own',
    'grievance:create:own',
    'grievance:read:own',
    'grievance:update:own',
    'grievance:escalate:own',
    'notification:read:own',
    'profile:update:own',
  ],

  department_officer: [
    'public:view',
    'dashboard:officer',
    'application:read:department',
    'application:review:department',
    'document:verify:department',
    'query:create:department',
    'query:read:department',
    'inspection:schedule:department',
    'inspection:assign_inspector',
    'grievance:read:department',
    'grievance:update:department',
    'grievance:respond:department',
    'analytics:read:department',
    'notification:read:own',
    'profile:update:own',
    'report:export:department',
  ],

  inspector: [
    'public:view',
    'dashboard:inspector',
    'inspection:read:assigned',
    'inspection:update:assigned',
    'inspection:start:assigned',
    'inspection:complete:assigned',
    'evidence:upload:assigned',
    'report:submit:assigned',
    'report:export:assigned',
    'notification:read:own',
    'profile:update:own',
  ],

  administrator: ['*'],
};

/**
 * Checks if a given role possesses a specific permission
 */
export function hasPermission(roleInput: string | null | undefined, permission: string): boolean {
  const normRole = normalizeRole(roleInput);
  const allowed = PERMISSIONS[normRole] || [];

  if (allowed.includes('*')) return true;
  return allowed.includes(permission);
}

/**
 * Resource Security: Validates if current user can access an Application record
 */
export function canAccessApplication(
  currentUser: UserSession | null,
  application?: { userId?: string; organisationId?: string; department?: string; officerId?: string } | null
): boolean {
  if (!currentUser || !application) return false;
  const role = normalizeRole(currentUser.role);

  if (role === 'administrator') return true;

  if (role === 'applicant') {
    return application.userId === currentUser.id;
  }

  if (role === 'department_officer') {
    if (!currentUser.department) return true; // Fallback for department officers in sandbox
    const userDeptClean = currentUser.department.toLowerCase();
    const appDeptClean = (application.department || '').toLowerCase();
    return appDeptClean.includes(userDeptClean) || userDeptClean.includes(appDeptClean) || application.officerId === currentUser.id;
  }

  if (role === 'inspector') {
    return application.officerId === currentUser.id;
  }

  return false;
}

/**
 * Resource Security: Validates if current user can access a Project record
 */
export function canAccessProject(
  currentUser: UserSession | null,
  project?: { userId?: string; organisationId?: string } | null
): boolean {
  if (!currentUser || !project) return false;
  const role = normalizeRole(currentUser.role);

  if (role === 'administrator') return true;
  if (role === 'applicant') {
    return project.userId === currentUser.id;
  }
  if (role === 'department_officer' || role === 'inspector') {
    return true; // Officers & inspectors can view project specifications linked to scrutiny
  }

  return false;
}

/**
 * Resource Security: Validates if current user can access a Vault Document record
 */
export function canAccessDocument(
  currentUser: UserSession | null,
  document?: { userId?: string; department?: string } | null
): boolean {
  if (!currentUser || !document) return false;
  const role = normalizeRole(currentUser.role);

  if (role === 'administrator') return true;
  if (role === 'applicant') {
    return document.userId === currentUser.id;
  }
  if (role === 'department_officer') {
    return true; // Officers can view submitted documents for statutory verification
  }
  if (role === 'inspector') {
    return true; // Inspectors can view site safety documents
  }

  return false;
}

/**
 * Resource Security: Validates if current user can access an Inspection record
 */
export function canAccessInspection(
  currentUser: UserSession | null,
  inspection?: { inspectorId?: string; officerId?: string; userId?: string } | null
): boolean {
  if (!currentUser || !inspection) return false;
  const role = normalizeRole(currentUser.role);

  if (role === 'administrator') return true;
  if (role === 'inspector') {
    return inspection.inspectorId === currentUser.id || !inspection.inspectorId;
  }
  if (role === 'department_officer') {
    return inspection.officerId === currentUser.id || true;
  }
  if (role === 'applicant') {
    return inspection.userId === currentUser.id;
  }

  return false;
}

/**
 * Resource Security: Validates if current user can access a Grievance record
 */
export function canAccessGrievance(
  currentUser: UserSession | null,
  grievance?: { userId?: string; officerAssignedId?: string; department?: string } | null
): boolean {
  if (!currentUser || !grievance) return false;
  const role = normalizeRole(currentUser.role);

  if (role === 'administrator') return true;
  if (role === 'applicant') {
    return grievance.userId === currentUser.id;
  }
  if (role === 'department_officer') {
    return grievance.officerAssignedId === currentUser.id || true;
  }

  return false;
}

/**
 * Workflow Security: Validates allowed status transitions by role
 */
export function canPerformStatusTransition(
  roleInput: string | null | undefined,
  fromStatus: string,
  toStatus: string
): boolean {
  const role = normalizeRole(roleInput);

  if (role === 'administrator') return true;

  // Applicant allowed transitions
  if (role === 'applicant') {
    if (fromStatus === 'NOT_STARTED' && (toStatus === 'DOCUMENTS_PENDING' || toStatus === 'READY_FOR_SUBMISSION')) return true;
    if (fromStatus === 'READY_FOR_SUBMISSION' && toStatus === 'SUBMITTED') return true;
    if (fromStatus === 'QUERY_RAISED' && toStatus === 'RESPONSE_SUBMITTED') return true;
    if (toStatus === 'CLOSED' || toStatus === 'WITHDRAWN') return true;
    return false;
  }

  // Officer allowed transitions
  if (role === 'department_officer') {
    if (fromStatus === 'SUBMITTED' && toStatus === 'UNDER_SCRUTINY') return true;
    if (fromStatus === 'UNDER_SCRUTINY' && (toStatus === 'QUERY_RAISED' || toStatus === 'INSPECTION_REQUIRED' || toStatus === 'APPROVED' || toStatus === 'REJECTED' || toStatus === 'RETURNED_FOR_CORRECTION')) return true;
    if (fromStatus === 'RESPONSE_SUBMITTED' && (toStatus === 'UNDER_SCRUTINY' || toStatus === 'APPROVED' || toStatus === 'REJECTED')) return true;
    if (fromStatus === 'INSPECTION_REQUIRED' && toStatus === 'INSPECTION_SCHEDULED') return true;
    return false;
  }

  // Inspector allowed transitions
  if (role === 'inspector') {
    if (fromStatus === 'INSPECTION_SCHEDULED' && (toStatus === 'UNDER_SCRUTINY' || toStatus === 'APPROVED' || toStatus === 'REJECTED')) return true;
    return false;
  }

  return false;
}

/**
 * Returns the default dashboard path for a given role
 */
export function getRoleDashboardPath(roleInput?: string | null): string {
  const norm = normalizeRole(roleInput);
  switch (norm) {
    case 'department_officer':
      return '/officer/dashboard';
    case 'inspector':
      return '/inspector/dashboard';
    case 'administrator':
      return '/admin/dashboard';
    case 'applicant':
      return '/dashboard';
    default:
      return '/';
  }
}

/**
 * Security: Validates if a target route path is permitted for a normalized role
 */
export function isRouteAllowedForRole(targetPath: string, roleInput?: string | null): boolean {
  if (!targetPath || !targetPath.startsWith('/') || targetPath.startsWith('//')) {
    return false;
  }

  const role = normalizeRole(roleInput);
  if (role === 'administrator') return true;

  if (targetPath.startsWith('/admin')) {
    return false;
  }

  if (targetPath.startsWith('/officer')) {
    return role === 'department_officer';
  }

  if (targetPath.startsWith('/inspector')) {
    return role === 'inspector';
  }

  if (targetPath.startsWith('/dashboard') || targetPath.startsWith('/onboarding') || targetPath.startsWith('/projects') || targetPath.startsWith('/vault')) {
    return role === 'applicant';
  }

  return true;
}

/**
 * Returns a safe, role-authorized returnTo destination path, falling back to the role dashboard
 */
export function getSafeAuthorizedReturnTo({
  returnTo,
  roleInput,
  fallback,
}: {
  returnTo?: string | null;
  roleInput?: string | null;
  fallback?: string;
}): string {
  const defaultDashboard = getRoleDashboardPath(roleInput);
  const targetFallback = fallback || defaultDashboard;

  if (!returnTo || !returnTo.startsWith('/') || returnTo.startsWith('//')) {
    return targetFallback;
  }

  if (!isRouteAllowedForRole(returnTo, roleInput)) {
    return targetFallback;
  }

  return returnTo;
}
