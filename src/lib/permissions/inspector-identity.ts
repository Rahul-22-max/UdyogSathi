import { AuthSessionPayload } from '@/lib/auth-session';
import { normalizeRole } from '@/lib/rbac';
import { UserModel } from '@/lib/models/user.model';
import { connectToDatabase } from '@/lib/db/mongoose';

export async function getInspectorUserObjectId(userIdOrEmail: string): Promise<string | null> {
  try {
    await connectToDatabase();
    if (!userIdOrEmail) return null;
    const isEmail = userIdOrEmail.includes('@');
    const user = isEmail
      ? await UserModel.findOne({ email: userIdOrEmail.toLowerCase().trim() }).lean()
      : await UserModel.findById(userIdOrEmail).lean();
    return user ? user._id.toString() : null;
  } catch {
    return null;
  }
}

export interface InspectorSessionLike {
  userId?: string;
  id?: string;
  email: string;
  name?: string;
  role?: string;
}

export function getInspectorIdentityKeys(authSession: InspectorSessionLike, userDbId?: string): string[] {
  const keys: string[] = [];
  const uId = authSession.userId || authSession.id;
  if (uId) keys.push(uId.toString());
  if (userDbId) keys.push(userDbId.toString());

  // Anand Shinde primary inspector alias resolution
  if (
    authSession.email === 'inspector@udyogsathi.gov.in' ||
    (authSession.name && authSession.name.toLowerCase().includes('anand shinde'))
  ) {
    keys.push('usr-inspector-1');
  }
  return Array.from(new Set(keys));
}

export function isInspectorAssignedToInspection(
  inspection: any,
  authSession: InspectorSessionLike,
  userDbId?: string
): boolean {
  if (!inspection) return false;

  const normRole = normalizeRole(authSession.role);
  if (normRole === 'administrator') return true;
  if (normRole !== 'inspector') return false;

  const validKeys = getInspectorIdentityKeys(authSession, userDbId);

  const assignedInspectorId =
    inspection.assignedInspectorId?._id?.toString() ||
    inspection.assignedInspectorId?.toString() ||
    inspection.inspectorId?._id?.toString() ||
    inspection.inspectorId?.toString();

  // If inspection has explicit assignment, check if assignedInspectorId is in validKeys
  if (assignedInspectorId) {
    const isMatch = validKeys.includes(assignedInspectorId);
    console.log(
      `[inspection-auth] currentUserId=${authSession.userId} email=${authSession.email} assignedInspectorId=${assignedInspectorId} validKeys=${JSON.stringify(validKeys)} comparison=${isMatch}`
    );
    if (isMatch) return true;
  }

  // Fallback for demo records assigned to Anand Shinde default DISH inspector queue
  if (
    (inspection.isDemoRecord || inspection.isDemoSandboxRecord || !assignedInspectorId) &&
    (authSession.email === 'inspector@udyogsathi.gov.in' || (authSession.name && authSession.name.toLowerCase().includes('anand shinde')))
  ) {
    console.log(`[inspection-auth] Demo inspection fallback access granted for Anand Shinde (${authSession.email})`);
    return true;
  }

  return false;
}
