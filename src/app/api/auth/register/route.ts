import { NextResponse } from 'next/server';
import { registerUser } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name, role, mobile } = body;

    if (!email || !password || !name) {
      return NextResponse.json({ error: 'Name, email, and password are required.' }, { status: 400 });
    }

    const session = await registerUser({
      email,
      passwordPlain: password,
      name,
      role: role || 'APPLICANT',
      mobile,
    });

    const response = NextResponse.json({ success: true, user: session });
    
    response.cookies.set('udyogsathi_session', JSON.stringify(session), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('Registration error:', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Account with this email already exists.' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Registration failed.' }, { status: 500 });
  }
}
