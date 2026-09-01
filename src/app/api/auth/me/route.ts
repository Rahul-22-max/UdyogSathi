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
      const user = JSON.parse(sessionCookie.value);
      return NextResponse.json({ authenticated: true, user }, { status: 200 });
    } catch {
      return NextResponse.json({ authenticated: false, user: null }, { status: 200 });
    }
  } catch (error) {
    console.error('Session retrieval error:', error);
    return NextResponse.json({ authenticated: false, user: null, error: 'Failed to retrieve session' }, { status: 500 });
  }
}
