import mongoose from 'mongoose';

async function testAtlasConnectivity() {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB_NAME || 'udyogsathi';

  if (!uri) {
    console.log('ERROR: MONGODB_URI environment variable is not defined.');
    process.exit(1);
  }

  console.log('--- STARTING READ-ONLY MONGODB ATLAS CONNECTIVITY TEST ---');
  console.log('Target Database Name:', dbName);

  try {
    const conn = await mongoose.connect(uri, {
      dbName: dbName,
      serverSelectionTimeoutMS: 10000,
    });

    console.log('Connection State:', conn.connection.readyState === 1 ? 'CONNECTED (1)' : conn.connection.readyState);

    const activeDbName = conn.connection.db?.databaseName;
    console.log('Confirmed Active Database Name:', activeDbName);

    // Read-only collection listing
    const collections = await conn.connection.db?.listCollections().toArray();
    const collectionNames = collections?.map((c) => c.name) || [];

    console.log('Existing Collection Count:', collectionNames.length);
    console.log('Existing Collections:', collectionNames.length > 0 ? collectionNames.join(', ') : '(None - Database is clean)');

    console.log('READ-ONLY TEST RESULT: SUCCESS');
  } catch (err: any) {
    console.log('READ-ONLY TEST RESULT: FAILED');
    // Sanitize error message to prevent exposing credentials if present in connection string
    let sanitizedError = err.message || String(err);
    if (sanitizedError.includes('mongodb+srv://')) {
      sanitizedError = sanitizedError.replace(/mongodb\+srv:\/\/[^@]+@/, 'mongodb+srv://***:***@');
    }
    console.log('Sanitized Error:', sanitizedError);
  } finally {
    try {
      await mongoose.disconnect();
      console.log('Cleanly disconnected from database.');
    } catch {}
  }
}

testAtlasConnectivity();
