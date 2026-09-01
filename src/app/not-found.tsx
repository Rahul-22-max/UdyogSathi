'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, Home, ArrowLeft, Search, Factory, BookOpen, Sparkles } from 'lucide-react';
import { ROUTES } from '@/lib/routes';

export default function NotFound() {
  const pathname = usePathname();

  const handleGoBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = ROUTES.home;
    }
  };

  return (
    <div className="bg-[#f7f9fc] min-h-screen flex flex-col items-center justify-center p-4 font-sans text-center">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-govBorder max-w-lg w-full space-y-6">
        {/* Brand & Badge */}
        <div className="flex items-center justify-center gap-2">
          <div className="w-10 h-10 rounded-lg bg-govBlue text-white flex items-center justify-center font-bold">
            <Shield className="w-6 h-6 text-saffron" />
          </div>
          <span className="text-lg font-extrabold text-govBlue">UdyogSathi</span>
        </div>

        {/* 404 Display */}
        <div className="space-y-2">
          <div className="w-16 h-16 rounded-full bg-saffron/10 text-saffron flex items-center justify-center mx-auto font-black text-2xl border border-saffron/30">
            404
          </div>
          <h1 className="text-2xl font-extrabold text-govBlue tracking-tight">Page Not Found</h1>
          <p className="text-xs text-govMuted leading-relaxed max-w-md mx-auto">
            The service route or page you are looking for does not exist or may have been relocated.
          </p>

          {pathname && (
            <div className="bg-slate-100 p-2.5 rounded-lg border border-slate-200 text-[11px] text-slate-700 font-mono inline-block max-w-full truncate px-3">
              Attempted Path: <span className="font-bold text-govBlue">{pathname}</span>
            </div>
          )}
        </div>

        {/* Suggested Quick Recovery Links */}
        <div className="space-y-2 pt-2 border-t border-slate-100 text-left">
          <span className="text-[11px] font-bold text-govMuted uppercase tracking-wider block text-center mb-3">
            Quick Navigation Recovery
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <Link
              href={ROUTES.approvalWizard}
              className="p-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-govBlue hover:text-white transition-all text-xs font-bold text-govBlue flex flex-col items-center gap-1 group text-center"
            >
              <Sparkles className="w-4 h-4 text-saffron group-hover:scale-110 transition-transform" />
              <span>Approval Wizard</span>
            </Link>

            <Link
              href={ROUTES.sectorGuides}
              className="p-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-govBlue hover:text-white transition-all text-xs font-bold text-govBlue flex flex-col items-center gap-1 group text-center"
            >
              <Factory className="w-4 h-4 text-saffron group-hover:scale-110 transition-transform" />
              <span>Sector Guides</span>
            </Link>

            <Link
              href={ROUTES.knowledgeBase}
              className="p-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-govBlue hover:text-white transition-all text-xs font-bold text-govBlue flex flex-col items-center gap-1 group text-center"
            >
              <BookOpen className="w-4 h-4 text-saffron group-hover:scale-110 transition-transform" />
              <span>Knowledge Base</span>
            </Link>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleGoBack}
            className="w-full bg-slate-100 hover:bg-slate-200 text-govBlue text-xs font-bold py-2.5 rounded-lg border border-slate-300 transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go Back</span>
          </button>

          <Link href={ROUTES.home} className="w-full">
            <button className="w-full bg-govBlue hover:bg-govBlue-dark text-white text-xs font-bold py-2.5 rounded-lg shadow transition-colors flex items-center justify-center gap-2">
              <Home className="w-4 h-4 text-saffron" />
              <span>Return Home</span>
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
