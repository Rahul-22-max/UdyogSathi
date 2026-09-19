import { NextResponse } from 'next/server';
import { connectToDatabase, getMongoEnvInfo } from '@/lib/db/mongoose';
import { UserModel } from '@/lib/models/user.model';

export const dynamic = 'force-dynamic';

export async function GET() {
  const envInfo = getMongoEnvInfo();

  try {
    const conn = await connectToDatabase();
    const isConnected = conn.connection.readyState === 1;

    if (!isConnected) {
      return NextResponse.json(
        {
          status: 'error',
          database: 'disconnected',
          diagnostics: {
            hasMongodbUriEnv: envInfo.hasUri,
            hasMongodbUrlEnv: envInfo.hasUrl,
            envSource: envInfo.envSource,
            targetHostname: envInfo.hostname,
            databaseName: envInfo.dbName,
            connectionState: conn.connection.readyState,
          },
        },
        { status: 503 }
      );
    }

    const dbName = conn.connection.db?.databaseName || envInfo.dbName;
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
        diagnostics: {
          hasMongodbUriEnv: envInfo.hasUri,
          hasMongodbUrlEnv: envInfo.hasUrl,
          envSource: envInfo.envSource,
          targetHostname: envInfo.hostname,
          databaseName: dbName,
          connectionState: conn.connection.readyState,
          totalUsersInDb: userCount,
          demoUsersPresent: {
            applicant: !!applicant,
            officer: !!officer,
            inspector: !!inspector,
            admin: !!admin,
          },
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    const sanitizedErrName = error?.name || 'Error';
    const sanitizedErrMsg = error?.message || String(error);
    console.error('[API /api/health Error]: Database connection failed:', sanitizedErrMsg);

    return NextResponse.json(
      {
        status: 'error',
        database: 'disconnected',
        diagnostics: {
          hasMongodbUriEnv: envInfo.hasUri,
          hasMongodbUrlEnv: envInfo.hasUrl,
          envSource: envInfo.envSource,
          targetHostname: envInfo.hostname,
          databaseName: envInfo.dbName,
          errorName: sanitizedErrName,
          errorMessage: sanitizedErrMsg,
        },
      },
      { status: 503 }
    );
  }
}
