import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get('udyogsathi_session');

    if (!sessionCookie || !sessionCookie.value) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 200 });
    }

    try {
      const raw = sessionCookie.value;
      const decoded = raw.startsWith('%7B') || raw.startsWith('%7b') ? decodeURIComponent(raw) : raw;
      const user = JSON.parse(decoded);
      return NextResponse.json({ authenticated: true, user }, { status: 200 });
    } catch {
      return NextResponse.json({ authenticated: false, user: null }, { status: 200 });
    }
  } catch (error) {
    console.error('Session retrieval error:', error);
    return NextResponse.json({ authenticated: false, user: null, error: 'Failed to retrieve session' }, { status: 500 });
  }
}
