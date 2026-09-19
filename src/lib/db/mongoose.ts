if (typeof window !== 'undefined') {
  throw new Error('MongoDB database modules can only be imported on the server.');
}

import mongoose from 'mongoose';

import { ensureDemoDataSeeded } from '@/lib/db/seed-helper';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/udyogsathi';

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
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const isProduction = process.env.NODE_ENV === 'production';
    const opts = {
      dbName: process.env.MONGODB_DB_NAME || 'udyogsathi',
      serverSelectionTimeoutMS: 5000,
    };

    cached.promise = (async () => {
      try {
        const conn = await mongoose.connect(MONGODB_URI, opts);
        console.log('Connected to MongoDB successfully via Mongoose');
        if (!isProduction) {
          await ensureDemoDataSeeded();
        }
        return conn;
      } catch (err: any) {
        // STRICT PRODUCTION SAFETY GUARD: Never use MongoMemoryServer in production
        if (isProduction) {
          console.error('CRITICAL DATABASE ERROR: Failed to connect to production MONGODB_URI.', err.message);
          throw new Error('Database connection failed. In production, a valid MONGODB_URI is required.');
        }

        console.warn('Could not connect to external MONGODB_URI in development. Starting local MongoMemoryServer fallback...', err.message);
        try {
          const { MongoMemoryServer } = await import('mongodb-memory-server');
          if (!cached.mongoMemoryServer) {
            cached.mongoMemoryServer = await MongoMemoryServer.create();
          }
          const memoryUri = cached.mongoMemoryServer.getUri();
          console.log('Started in-memory MongoDB server at:', memoryUri);
          const conn = await mongoose.connect(memoryUri, {
            dbName: process.env.MONGODB_DB_NAME || 'udyogsathi',
          });
          await ensureDemoDataSeeded();
          return conn;
        } catch (memErr: any) {
          console.error('Failed to start MongoMemoryServer:', memErr.message);
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
