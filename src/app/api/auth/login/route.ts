import { NextResponse } from 'next/server';
import { authenticateUser } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    }

    let session;
    try {
      session = await authenticateUser(email, password);
    } catch (authErr: any) {
      console.error('[auth-diag] CRITICAL: Database connection error during login request:', authErr?.message || authErr);
      return NextResponse.json(
        { error: 'Database connection failed. Please ensure MONGODB_URI environment variable is configured in Vercel.' },
        { status: 500 }
      );
    }

    if (!session) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

    const response = NextResponse.json({ success: true, user: session });
    
    // Set HTTP-only session cookie
    response.cookies.set('udyogsathi_session', JSON.stringify(session), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('[auth-diag] Login API unexpected error:', error?.message || error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
