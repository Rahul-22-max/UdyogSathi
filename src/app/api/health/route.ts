import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongoose';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const conn = await connectToDatabase();
    const isConnected = conn.connection.readyState === 1;

    if (!isConnected) {
      return NextResponse.json(
        { status: 'error', database: 'disconnected' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        status: 'ok',
        database: 'connected',
        databaseProvider: 'mongodb',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[API /api/health Error]: Database connection failed.');
    return NextResponse.json(
      { status: 'error', database: 'disconnected' },
      { status: 503 }
    );
  }
}
