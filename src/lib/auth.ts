if (typeof window !== 'undefined') {
  throw new Error('Server-only module');
}
import bcrypt from 'bcryptjs';
import { UserRole, UserSession } from '@/types';
import { connectToDatabase } from '@/lib/db/mongoose';
import { UserModel } from '@/lib/models/user.model';

export async function authenticateUser(email: string, passwordPlain: string): Promise<UserSession | null> {
  try {
    const conn = await connectToDatabase();
    console.log('[auth] MongoDB connected');
    console.log('[auth] Database name:', conn.connection.db?.databaseName || 'udyogsathi');

    const normalizedEmail = email.toLowerCase().trim();
    console.log('[auth] User lookup attempted for normalized email:', normalizedEmail);

    const user = await UserModel.findOne({ email: normalizedEmail }).exec();

    console.log('[auth] User found:', !!user);
    if (!user) {
      return null;
    }

    console.log('[auth] User active:', user.isActive ?? true);
    if (user.isActive === false) {
      return null;
    }

    const isValidPassword = await bcrypt.compare(passwordPlain, user.passwordHash);
    console.log('[auth] Password comparison result:', isValidPassword);

    if (!isValidPassword) {
      return null;
    }

    console.log('[auth] Session creation: success');

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
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
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
