'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { TopUtilityBar } from '@/components/layout/TopUtilityBar';
import { OfficialHeader } from '@/components/layout/OfficialHeader';
import { Footer } from '@/components/layout/Footer';
import { DisclaimerBanner } from '@/components/common/DisclaimerBanner';
import { Button } from '@/components/ui/Button';
import { Shield, Lock, Mail, ArrowRight, CheckCircle2, User, RefreshCw } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getRoleDashboardPath, normalizeRole, getSafeAuthorizedReturnTo } from '@/lib/rbac';

function LoginForm() {
  const [email, setEmail] = useState('applicant@udyogsathi.gov.in');
  const [password, setPassword] = useState('Password@123');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('returnTo');

  const { signIn } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    try {
      const user = await signIn(email, password);
      const normRole = normalizeRole(user.role);

      console.log(`[auth] login success: email=${user.email} rawRole=${user.role} normalizedRole=${normRole}`);

      if (normRole === 'applicant' && !user.onboardingCompleted) {
        const dest = returnTo && returnTo.startsWith('/onboarding') ? returnTo : '/onboarding';
        router.replace(dest);
      } else {
        const dest = getSafeAuthorizedReturnTo({
          returnTo,
          roleInput: user.role,
        });
        console.log(`[auth] post-login destination: ${dest}`);
        router.replace(dest);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoSelect = (roleEmail: string) => {
    setEmail(roleEmail);
    setPassword('Password@123');
  };

  return (
    <main id="main-content" className="flex-1 py-12 px-4 flex items-center justify-center">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-12 bg-white rounded-2xl shadow-2xl border border-govBorder overflow-hidden">
        {/* Left Column: Role Demo Selector */}
        <div className="md:col-span-5 bg-govBlue text-white p-8 flex flex-col justify-between">
          <div>
            <div className="inline-flex items-center gap-2 bg-saffron/20 text-saffron font-bold text-[10px] px-2.5 py-1 rounded-full mb-4 border border-saffron/40">
              <Shield className="w-3.5 h-3.5" />
              <span>Test Role Credentials</span>
            </div>
            <h2 className="text-xl font-bold mb-2">Select User Role Credentials</h2>
            <p className="text-xs text-slate-300 mb-6 leading-relaxed">
              Click any role card below to populate authentic demo credentials and test server-enforced access controls.
            </p>

            <div className="space-y-2.5">
              {[
                {
                  role: 'Applicant / Entrepreneur',
                  email: 'applicant@udyogsathi.gov.in',
                  desc: 'Discover approvals, manage documents, submit applications, track status, and renew licences.',
                  color: 'bg-saffron',
                },
                {
                  role: 'Department Officer (MPCB)',
                  email: 'officer@udyogsathi.gov.in',
                  desc: 'Review assigned applications, verify documents, raise queries, and record department decisions.',
                  color: 'bg-blue-600',
                },
                {
                  role: 'Field Inspector (DISH)',
                  email: 'inspector@udyogsathi.gov.in',
                  desc: 'View assigned inspections, complete field checklists, upload evidence, and submit inspection reports.',
                  color: 'bg-green-600',
                },
              ].map(item => (
                <button
                  key={item.email}
                  type="button"
                  onClick={() => handleDemoSelect(item.email)}
                  className={`w-full text-left p-3 rounded-xl border border-white/20 hover:border-saffron transition-all ${
                    email === item.email ? 'bg-white/20 ring-2 ring-saffron font-bold' : 'bg-white/5'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-white font-bold">{item.role}</span>
                    <span className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                  </div>
                  <p className="text-[11px] text-slate-300 mt-1 leading-snug">{item.desc}</p>
                  <div className="text-[11px] text-saffron font-mono font-bold mt-1">{item.email}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-6 border-t border-white/10 text-[11px] text-slate-400">
            Password for all demo accounts: <strong className="text-saffron">Password@123</strong>
          </div>
        </div>

        {/* Right Column: Login Form */}
        <div className="md:col-span-7 p-8">
          <h2 className="text-xl font-extrabold text-govBlue mb-1">Sign In to UdyogSathi</h2>
          <p className="text-xs text-govMuted mb-6">
            Access your industrial projects, document vault, inspection schedule, and incentive matches.
          </p>

          {returnTo && (
            <div className="bg-amber-50 text-amber-900 text-xs p-3 rounded-lg border border-amber-300 mb-4 font-semibold">
              Please sign in to access requested page: <span className="font-mono text-govBlue">{returnTo}</span>
            </div>
          )}

          {errorMsg && (
            <div className="bg-red-50 text-red-700 text-xs p-3 rounded-lg border border-red-200 mb-4 font-semibold">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-govText block mb-1">Official Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-saffron text-xs"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-govText block mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-saffron text-xs"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <Button variant="primary" type="submit" className="w-full" isLoading={isLoading} rightIcon={<ArrowRight className="w-4 h-4" />}>
              Authenticate & Access Dashboard
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-200 text-center text-xs text-govMuted">
            Don't have a registered business profile?{' '}
            <Link href="/register" className="text-saffron font-bold hover:underline">
              Register New Enterprise
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <div className="bg-[#f7f9fc] min-h-screen flex flex-col font-sans">
      <TopUtilityBar currentLang="en" onLanguageChange={() => {}} />
      <OfficialHeader currentLang="en" />
      <DisclaimerBanner />

      <Suspense
        fallback={
          <main className="flex-1 py-12 px-4 flex items-center justify-center">
            <div className="bg-white p-8 rounded-2xl shadow-md border border-govBorder text-center space-y-3">
              <RefreshCw className="w-6 h-6 text-saffron animate-spin mx-auto" />
              <p className="text-xs text-govMuted">Loading security authentication portal...</p>
            </div>
          </main>
        }
      >
        <LoginForm />
      </Suspense>

      <Footer />
    </div>
  );
}
