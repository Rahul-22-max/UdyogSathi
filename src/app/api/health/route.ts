import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongoose';
import { UserModel } from '@/lib/models/user.model';

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

    const dbName = conn.connection.db?.databaseName || 'udyogsathi';
    const userCount = await UserModel.countDocuments();

    const [applicant, officer, inspector, admin] = await Promise.all([
      UserModel.exists({ email: 'applicant@udyogsathi.gov.in' }),
      UserModel.exists({ email: 'officer@udyogsathi.gov.in' }),
      UserModel.exists({ email: 'inspector@udyogsathi.gov.in' }),
      UserModel.exists({ email: 'admin@udyogsathi.gov.in' }),
    ]);

    return NextResponse.json(
      {
        status: 'ok',
        database: 'connected',
        databaseProvider: 'mongodb',
        databaseName: dbName,
        totalUsersInDb: userCount,
        demoUsersPresent: {
          applicant: !!applicant,
          officer: !!officer,
          inspector: !!inspector,
          admin: !!admin,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[API /api/health Error]: Database connection failed:', error?.message);
    return NextResponse.json(
      {
        status: 'error',
        database: 'disconnected',
        error: error?.message || 'Database connection error',
      },
      { status: 503 }
    );
  }
}
