if (typeof window !== 'undefined') {
  throw new Error('MongoDB database modules can only be imported on the server.');
}

import mongoose from 'mongoose';
import { ensureDemoDataSeeded } from '@/lib/db/seed-helper';

export function getSanitizedMongoHostname(uri: string): string {
  if (!uri) return 'NONE';
  try {
    const atMatch = uri.match(/@([^/?#]+)/);
    if (atMatch && atMatch[1]) {
      return atMatch[1].split(':')[0];
    }
    const hostMatch = uri.match(/mongodb(?:\+srv)?:\/\/([^/?#]+)/);
    if (hostMatch && hostMatch[1]) {
      return hostMatch[1].split(':')[0];
    }
    return 'UNKNOWN_FORMAT';
  } catch {
    return 'PARSE_ERROR';
  }
}

export function getMongoEnvInfo() {
  const hasUri = !!process.env.MONGODB_URI;
  const hasUrl = !!process.env.MONGODB_URL;
  const rawUri = process.env.MONGODB_URI || process.env.MONGODB_URL || '';
  const envSource = process.env.MONGODB_URI ? 'MONGODB_URI' : process.env.MONGODB_URL ? 'MONGODB_URL' : 'FALLBACK_LOCAL';
  const hostname = rawUri ? getSanitizedMongoHostname(rawUri) : '127.0.0.1';
  const dbName = process.env.MONGODB_DB_NAME || 'udyogsathi';

  return {
    hasUri,
    hasUrl,
    hasAnyEnv: hasUri || hasUrl,
    envSource,
    hostname,
    dbName,
  };
}

declare global {
  var mongooseCache:
    | {
        conn: typeof mongoose | null;
        promise: Promise<typeof mongoose> | null;
        mongoMemoryServer?: any;
      }
    | undefined;
}

const cached = global.mongooseCache ?? {
  conn: null,
  promise: null,
};

global.mongooseCache = cached;

export async function connectToDatabase(): Promise<typeof mongoose> {
  const envInfo = getMongoEnvInfo();

  if (cached.conn && cached.conn.connection.readyState !== 1) {
    console.warn('[db-diag] Resetting stale or disconnected MongoDB connection cache');
    cached.conn = null;
    cached.promise = null;
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const isProduction = process.env.NODE_ENV === 'production';
    const rawUri = process.env.MONGODB_URI || process.env.MONGODB_URL || 'mongodb://127.0.0.1:27017/udyogsathi';

    console.log(`[db-diag] Initiating MongoDB connection: envExists=${envInfo.hasAnyEnv}, source=${envInfo.envSource}, targetHost='${envInfo.hostname}', dbName='${envInfo.dbName}', isProduction=${isProduction}`);

    const opts = {
      dbName: envInfo.dbName,
      serverSelectionTimeoutMS: 5000,
    };

    cached.promise = (async () => {
      try {
        const conn = await mongoose.connect(rawUri, opts);
        console.log(`[db-diag] MongoDB connection SUCCESS: targetHost='${envInfo.hostname}', dbName='${conn.connection.db?.databaseName || envInfo.dbName}'`);
        try {
          await ensureDemoDataSeeded();
        } catch (seedErr: any) {
          console.warn('[db-diag] Seed helper warning (non-fatal):', seedErr.message);
        }
        return conn;
      } catch (err: any) {
        const sanitizedErrName = err?.name || 'Error';
        const sanitizedErrMsg = err?.message || String(err);
        console.error(`[db-diag] CRITICAL: MongoDB connection FAILED: targetHost='${envInfo.hostname}', dbName='${envInfo.dbName}', errorName='${sanitizedErrName}', errorMessage='${sanitizedErrMsg}'`);

        // Reset promise cache so failed connection attempts are not permanently stored
        cached.promise = null;

        if (isProduction) {
          throw new Error(`Database connection failed to '${envInfo.hostname}' [${sanitizedErrName}: ${sanitizedErrMsg}]`);
        }

        console.warn('[db-diag] Starting local MongoMemoryServer fallback for development environment...');
        try {
          const { MongoMemoryServer } = await import('mongodb-memory-server');
          if (!cached.mongoMemoryServer) {
            cached.mongoMemoryServer = await MongoMemoryServer.create();
          }
          const memoryUri = cached.mongoMemoryServer.getUri();
          console.log('[db-diag] Started in-memory MongoDB server at:', getSanitizedMongoHostname(memoryUri));
          const conn = await mongoose.connect(memoryUri, {
            dbName: envInfo.dbName,
          });
          await ensureDemoDataSeeded();
          return conn;
        } catch (memErr: any) {
          console.error('[db-diag] MongoMemoryServer fallback failed:', memErr.message);
          throw err;
        }
      }
    })();
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

