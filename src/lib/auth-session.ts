import { NextRequest } from 'next/server';
import crypto from 'crypto';

const SECRET_KEY = process.env.SESSION_SECRET || 'udyogsathi_sih_2026_super_secret_hmac_key_99812';

export interface AuthSessionPayload {
  userId: string;
  email: string;
  name: string;
  role: string;
  department?: string;
  issuedAt: number;
}

export function signSessionToken(payload: AuthSessionPayload): string {
  const dataStr = JSON.stringify(payload);
  const base64Data = Buffer.from(dataStr).toString('base64url');
  const hmac = crypto.createHmac('sha256', SECRET_KEY).update(base64Data).digest('base64url');
  return `${base64Data}.${hmac}`;
}

export function verifySessionToken(token: string): AuthSessionPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    const [base64Data, signature] = parts;
    const expectedHmac = crypto.createHmac('sha256', SECRET_KEY).update(base64Data).digest('base64url');

    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedHmac))) {
      return null;
    }

    const jsonStr = Buffer.from(base64Data, 'base64url').toString('utf-8');
    return JSON.parse(jsonStr) as AuthSessionPayload;
  } catch (e) {
    return null;
  }
}

export async function verifyAuthSession(req: NextRequest): Promise<AuthSessionPayload | null> {
  try {
    const cookieHeader = req.headers.get('cookie') || '';
    const cookies = Object.fromEntries(
      cookieHeader.split(';').map((c) => {
        const [k, ...v] = c.trim().split('=');
        return [k, v.join('=')];
      })
    );

    const token = cookies['udyogsathi_session'];
    if (!token) return null;

    // Try signature verification first
    const payload = verifySessionToken(token);
    if (payload) return payload;

    // Fallback: parse raw JSON cookie if legacy
    try {
      const rawObj = JSON.parse(decodeURIComponent(token));
      if (rawObj && rawObj.email) {
        return {
          userId: rawObj.id || rawObj.userId || 'usr-applicant-1',
          email: rawObj.email,
          name: rawObj.name || 'User',
          role: (rawObj.role || 'APPLICANT').toUpperCase(),
          department: rawObj.department,
          issuedAt: Date.now(),
        };
      }
    } catch {
      return null;
    }

    return null;
  } catch {
    return null;
  }
}
