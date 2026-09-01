'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { TopUtilityBar } from '@/components/layout/TopUtilityBar';
import { OfficialHeader } from '@/components/layout/OfficialHeader';
import { Footer } from '@/components/layout/Footer';
import { DisclaimerBanner } from '@/components/common/DisclaimerBanner';
import { useAuth } from '@/context/AuthContext';
import {
  UserPlus,
  Mail,
  Lock,
  Phone,
  User,
  Eye,
  EyeOff,
  AlertTriangle,
  ArrowRight,
  Globe,
  RefreshCw,
} from 'lucide-react';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('returnTo') || '/onboarding';
  const { signUp, isAuthenticated, isLoadingAuth } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [preferredLang, setPreferredLang] = useState('en');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [notificationConsent, setNotificationConsent] = useState(true);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already logged in, redirect
  React.useEffect(() => {
    if (!isLoadingAuth && isAuthenticated) {
      router.replace('/onboarding');
    }
  }, [isLoadingAuth, isAuthenticated, router]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!fullName.trim()) {
      newErrors.fullName = 'Full Name is required.';
    }

    if (!email.trim()) {
      newErrors.email = 'Valid Email Address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Please enter a valid email address (e.g. name@domain.com).';
    }

    if (!mobile.trim()) {
      newErrors.mobile = 'Mobile number is required.';
    } else if (!/^[6-9]\d{9}$/.test(mobile.trim().replace(/\D/g, ''))) {
      newErrors.mobile = 'Enter a valid 10-digit Indian mobile number starting with 6-9.';
    }

    if (!password) {
      newErrors.password = 'Password is required.';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long.';
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    if (!termsAccepted) {
      newErrors.terms = 'You must accept the Terms of Use and Privacy Policy to register.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await signUp({
        email: email.trim(),
        password,
        name: fullName.trim(),
        mobile: mobile.trim(),
        language: preferredLang,
        termsAccepted,
        notificationConsent,
      });

      // Successful registration -> Navigate to onboarding
      const safeTarget = returnTo.startsWith('/onboarding') ? returnTo : `/onboarding?returnTo=${encodeURIComponent(returnTo)}`;
      router.replace(safeTarget);
    } catch (err: any) {
      console.error('Registration failed:', err);
      const errMsg = err.message || '';

      if (errMsg.includes('already exists') || errMsg.includes('P2002')) {
        setFormError('An account with this email already exists. Sign in instead or reset your password.');
      } else {
        setFormError(errMsg || 'Registration failed. Please check your details and try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl w-full bg-white p-8 rounded-3xl shadow-xl border border-govBorder space-y-6">
      {/* Form Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-saffron/10 text-saffron flex items-center justify-center mx-auto border border-saffron/30 shadow-sm">
          <UserPlus className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-black text-govBlue">Create Your UdyogSathi Account</h1>
        <p className="text-xs text-govMuted leading-relaxed max-w-sm mx-auto">
          Register as an industrial applicant to access single-window approvals, 1-click document reuse, and compliance tracking in Maharashtra.
        </p>
      </div>

      {/* Form-level Error Box */}
      {formError && (
        <div className="bg-red-50 border-2 border-red-300 p-4 rounded-xl text-xs text-red-950 space-y-2">
          <div className="flex items-center gap-2 font-bold text-red-700">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Registration Notice</span>
          </div>
          <p className="leading-relaxed">{formError}</p>
          {formError.includes('already exists') && (
            <div className="pt-1">
              <Link href="/login" className="font-extrabold text-govBlue hover:underline flex items-center gap-1">
                <span>Click here to Sign In</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 text-xs" noValidate>
        {/* Account Role Note */}
        <div className="bg-govBlue-50 p-3 rounded-xl border border-govBlue/20 flex items-center justify-between text-govBlue">
          <span className="font-semibold">Account Type:</span>
          <span className="bg-govBlue text-white font-extrabold px-2.5 py-0.5 rounded text-[10px] uppercase tracking-wider">
            Industrial Applicant
          </span>
        </div>

        {/* Full Name */}
        <div>
          <label className="font-bold text-slate-800 block mb-1">Full Name (Promoter / Director) *</label>
          <div className="relative">
            <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Vijay Kulkarni"
              className={`w-full pl-9 pr-3 py-2.5 border rounded-xl focus:ring-2 focus:ring-saffron text-xs ${
                errors.fullName ? 'border-red-500 bg-red-50/50' : 'border-slate-300'
              }`}
            />
          </div>
          {errors.fullName && <p className="text-[11px] text-red-600 font-medium mt-1">{errors.fullName}</p>}
        </div>

        {/* Email Address */}
        <div>
          <label className="font-bold text-slate-800 block mb-1">Official Email Address *</label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. vijay@vijayfoods.com"
              className={`w-full pl-9 pr-3 py-2.5 border rounded-xl focus:ring-2 focus:ring-saffron text-xs ${
                errors.email ? 'border-red-500 bg-red-50/50' : 'border-slate-300'
              }`}
            />
          </div>
          {errors.email && <p className="text-[11px] text-red-600 font-medium mt-1">{errors.email}</p>}
        </div>

        {/* Mobile Number */}
        <div>
          <label className="font-bold text-slate-800 block mb-1">Mobile Number (10-Digit Indian Format) *</label>
          <div className="relative">
            <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="tel"
              maxLength={10}
              value={mobile}
              onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
              placeholder="e.g. 9822012345"
              className={`w-full pl-9 pr-3 py-2.5 border rounded-xl focus:ring-2 focus:ring-saffron text-xs ${
                errors.mobile ? 'border-red-500 bg-red-50/50' : 'border-slate-300'
              }`}
            />
          </div>
          {errors.mobile && <p className="text-[11px] text-red-600 font-medium mt-1">{errors.mobile}</p>}
        </div>

        {/* Password */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="font-bold text-slate-800 block mb-1">Password *</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 8 characters"
                className={`w-full pl-9 pr-8 py-2.5 border rounded-xl focus:ring-2 focus:ring-saffron text-xs ${
                  errors.password ? 'border-red-500 bg-red-50/50' : 'border-slate-300'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-3 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && <p className="text-[11px] text-red-600 font-medium mt-1">{errors.password}</p>}
          </div>

          <div>
            <label className="font-bold text-slate-800 block mb-1">Confirm Password *</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className={`w-full pl-9 pr-8 py-2.5 border rounded-xl focus:ring-2 focus:ring-saffron text-xs ${
                  errors.confirmPassword ? 'border-red-500 bg-red-50/50' : 'border-slate-300'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-2.5 top-3 text-slate-400 hover:text-slate-600"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-[11px] text-red-600 font-medium mt-1">{errors.confirmPassword}</p>
            )}
          </div>
        </div>

        {/* Preferred Language */}
        <div>
          <label className="font-bold text-slate-800 block mb-1">Preferred Portal Language</label>
          <div className="relative">
            <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <select
              value={preferredLang}
              onChange={(e) => setPreferredLang(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-saffron text-xs bg-white"
            >
              <option value="en">English (English)</option>
              <option value="mr">मराठी (Marathi)</option>
              <option value="hi">हिंदी (Hindi)</option>
              <option value="ur">اردو (Urdu)</option>
            </select>
          </div>
        </div>

        {/* Checkboxes */}
        <div className="space-y-2 pt-2">
          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="mt-0.5 rounded text-saffron focus:ring-saffron"
            />
            <span className="text-slate-700 leading-snug">
              I agree to the <Link href="/terms" className="text-govBlue font-bold hover:underline">Terms of Use</Link> and{' '}
              <Link href="/privacy" className="text-govBlue font-bold hover:underline">Privacy Policy</Link> *
            </span>
          </label>
          {errors.terms && <p className="text-[11px] text-red-600 font-medium">{errors.terms}</p>}

          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={notificationConsent}
              onChange={(e) => setNotificationConsent(e.target.checked)}
              className="mt-0.5 rounded text-saffron focus:ring-saffron"
            />
            <span className="text-slate-600 leading-snug">
              I agree to receive official application SLA alerts, inspection notifications, and compliance reminders.
            </span>
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-saffron hover:bg-saffron-dark text-white font-extrabold text-sm py-3.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-4"
        >
          {isSubmitting ? (
            <span>Creating your UdyogSathi account…</span>
          ) : (
            <>
              <span>Create Account & Continue to Onboarding</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Sign In Footer Link */}
      <div className="text-center pt-2 border-t border-slate-100 text-xs text-govMuted">
        Already have a registered UdyogSathi account?{' '}
        <Link href="/login" className="text-govBlue font-bold hover:underline">
          Sign In to Your Workspace
        </Link>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  const [currentLang, setCurrentLang] = useState('en');

  return (
    <div className="bg-[#f7f9fc] min-h-screen flex flex-col font-sans">
      <TopUtilityBar currentLang={currentLang} onLanguageChange={setCurrentLang} />
      <OfficialHeader currentLang={currentLang} />
      <DisclaimerBanner lang={currentLang} />

      <main id="main-content" className="flex-1 py-12 px-4 flex items-center justify-center">
        <Suspense
          fallback={
            <div className="bg-white p-8 rounded-2xl shadow-md border border-govBorder text-center space-y-3">
              <RefreshCw className="w-6 h-6 text-saffron animate-spin mx-auto" />
              <p className="text-xs text-govMuted">Loading registration portal...</p>
            </div>
          }
        >
          <RegisterForm />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
