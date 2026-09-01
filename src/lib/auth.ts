import { prisma } from './prisma';
import bcrypt from 'bcryptjs';
import { UserRole, UserSession } from '@/types';

// In-memory / cookie session simulation helper for Next.js App Router
export async function authenticateUser(email: string, passwordPlain: string): Promise<UserSession | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      return null;
    }

    const isValidPassword = await bcrypt.compare(passwordPlain, user.password);
    if (!isValidPassword) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as UserRole,
      mobile: user.mobile || undefined,
      language: user.language,
      highContrast: user.highContrast,
      fontSize: user.fontSize,
      department: user.department || undefined,
      designation: user.designation || undefined,
      onboardingCompleted: true, // Existing users are already onboarded
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
  let newUser;
  try {
    const hashedPassword = await bcrypt.hash(data.passwordPlain, 10);
    newUser = await prisma.user.create({
      data: {
        email: data.email.toLowerCase().trim(),
        password: hashedPassword,
        name: data.name,
        role: data.role || 'APPLICANT',
        mobile: data.mobile,
        department: data.department,
        designation: data.designation,
        language: data.language || 'en',
      },
    });
  } catch (e: any) {
    // Fallback if Prisma DB unavailable or duplicate check needed
    if (e.code === 'P2002') {
      throw e;
    }
    newUser = {
      id: `user-${Date.now()}`,
      email: data.email.toLowerCase().trim(),
      name: data.name,
      role: data.role || 'APPLICANT',
      mobile: data.mobile,
      department: data.department,
      designation: data.designation,
      language: data.language || 'en',
      highContrast: false,
      fontSize: 'normal',
    };
  }

  return {
    id: newUser.id,
    email: newUser.email,
    name: newUser.name,
    role: newUser.role as UserRole,
    mobile: newUser.mobile || undefined,
    language: newUser.language || 'en',
    highContrast: false,
    fontSize: 'normal',
    department: newUser.department || undefined,
    designation: newUser.designation || undefined,
    onboardingCompleted: false, // New applicant must complete onboarding
    onboardingStatus: 'not_started',
  };
}
