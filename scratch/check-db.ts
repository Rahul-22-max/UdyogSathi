import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { connectToDatabase } from '../src/lib/db/mongoose';
import { UserModel } from '../src/lib/models/user.model';

async function checkLocalMongo() {
  console.log('--- TESTING MONGODB CONNECTIVITY ---');
  console.log('MONGODB_URI set in env:', process.env.MONGODB_URI ? 'YES (configured)' : 'NO');
  console.log('MONGODB_DB_NAME set in env:', process.env.MONGODB_DB_NAME ? process.env.MONGODB_DB_NAME : 'DEFAULT (udyogsathi)');

  try {
    const conn = await connectToDatabase();
    console.log('MongoDB Connection Status: SUCCESS');
    console.log('Connected DB Name:', conn.connection.db?.databaseName);

    const userCount = await UserModel.countDocuments();
    console.log('User Table / Collection Exists: YES');
    console.log('User count in MongoDB:', userCount);

    if (userCount > 0) {
      const users = await UserModel.find({}, { passwordHash: 0 }).limit(5).lean();
      console.log('Sample Users (safe metadata):');
      users.forEach(u => {
        console.log(` - ID: ${u._id}, Email: ${u.email}, Role: ${u.role}, Name: ${u.name}, Active: ${u.isActive}`);
      });
    }
  } catch (err: any) {
    console.error('MongoDB Connection Status: FAILED');
    console.error('Error message:', err.message);
  } finally {
    await mongoose.disconnect();
  }
}

checkLocalMongo();
