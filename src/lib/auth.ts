if (typeof window !== 'undefined') {
  throw new Error('Server-only module');
}
import bcrypt from 'bcryptjs';
import { UserRole, UserSession } from '@/types';
import { connectToDatabase } from '@/lib/db/mongoose';
import { UserModel } from '@/lib/models/user.model';

export async function authenticateUser(email: string, passwordPlain: string): Promise<UserSession | null> {
  const normalizedEmail = email.toLowerCase().trim();
  console.log(`[auth-diag] User lookup attempted for normalized email: '${normalizedEmail}'`);

  const conn = await connectToDatabase();
  const dbName = conn.connection.db?.databaseName || process.env.MONGODB_DB_NAME || 'udyogsathi';
  console.log(`[auth-diag] Connected to MongoDB database: '${dbName}'`);

  const user = await UserModel.findOne({ email: normalizedEmail }).exec();

  if (!user) {
    console.warn(`[auth-diag] User NOT found in collection 'users' for email: '${normalizedEmail}'`);
    return null;
  }

  console.log(`[auth-diag] User found: id=${user._id}, email=${user.email}, role=${user.role}, isActive=${user.isActive}`);
  if (user.isActive === false) {
    console.warn(`[auth-diag] User account is deactivated for email: '${normalizedEmail}'`);
    return null;
  }

  const isValidPassword = await bcrypt.compare(passwordPlain, user.passwordHash);
  console.log(`[auth-diag] Password comparison result for '${normalizedEmail}': ${isValidPassword}`);

  if (!isValidPassword) {
    return null;
  }

  console.log(`[auth-diag] Session authentication SUCCESS for '${normalizedEmail}' (role=${user.role})`);

  return {
    id: user._id.toString(),
    email: user.email,
    name: user.name,
    role: user.role as UserRole,
    mobile: user.mobile || undefined,
    language: user.language || 'en',
    highContrast: user.accessibilityPreferences?.highContrast || false,
    fontSize: user.accessibilityPreferences?.fontSize || 'normal',
    department: user.department || undefined,
    designation: user.designation || undefined,
    onboardingCompleted: true,
    onboardingStatus: 'completed',
  };
}

export async function registerUser(data: {
  email: string;
  passwordPlain: string;
  name: string;
  role?: UserRole;
  mobile?: string;
  department?: string;
  designation?: string;
  language?: string;
}): Promise<UserSession> {
  await connectToDatabase();
  const existing = await UserModel.findOne({ email: data.email.toLowerCase().trim() }).exec();
  if (existing) {
    const error: any = new Error('User already exists');
    error.code = 11000;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(data.passwordPlain, 10);
  const newUser = await UserModel.create({
    email: data.email.toLowerCase().trim(),
    passwordHash: hashedPassword,
    name: data.name,
    role: data.role || 'APPLICANT',
    mobile: data.mobile,
    department: data.department,
    designation: data.designation,
    language: data.language || 'en',
    accessibilityPreferences: {
      highContrast: false,
      fontSize: 'normal',
      reducedMotion: false,
    },
    isActive: true,
    isDemoUser: false,
  });

  return {
    id: newUser._id.toString(),
    email: newUser.email,
    name: newUser.name,
    role: newUser.role as UserRole,
    mobile: newUser.mobile || undefined,
    language: newUser.language || 'en',
    highContrast: false,
    fontSize: 'normal',
    department: newUser.department || undefined,
    designation: newUser.designation || undefined,
    onboardingCompleted: false,
    onboardingStatus: 'not_started',
  };
}
