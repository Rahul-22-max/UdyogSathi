'use client';

import React, { useState } from 'react';
import { TopUtilityBar } from '@/components/layout/TopUtilityBar';
import { OfficialHeader } from '@/components/layout/OfficialHeader';
import { Footer } from '@/components/layout/Footer';
import { DisclaimerBanner } from '@/components/common/DisclaimerBanner';
import { Shield, Target, Award, Users, CheckCircle2 } from 'lucide-react';

export default function AboutPage() {
  const [currentLang, setCurrentLang] = useState('en');

  return (
    <div className="bg-[#f7f9fc] min-h-screen flex flex-col font-sans">
      <TopUtilityBar currentLang={currentLang} onLanguageChange={setCurrentLang} />
      <OfficialHeader currentLang={currentLang} />
      <DisclaimerBanner />

      <main id="main-content" className="flex-1 py-12 px-4 max-w-5xl mx-auto w-full space-y-8">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-govBorder space-y-4">
          <div className="inline-flex items-center gap-2 bg-saffron/10 text-saffron font-bold text-xs px-3 py-1 rounded-full border border-saffron/30">
            <Shield className="w-3.5 h-3.5" />
            <span>Smart India Hackathon 2026 Innovation (Problem ID: 26130)</span>
          </div>

          <h1 className="text-2xl md:text-3xl font-extrabold text-govBlue">About UdyogSathi</h1>
          <p className="text-xs md:text-sm text-govMuted mt-1">
            UdyogSathi is an intelligent, single-window industrial approval and compliance management platform engineered for the Government of Maharashtra.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100 text-xs">
            <div className="space-y-2">
              <h3 className="font-bold text-govBlue text-sm flex items-center gap-2">
                <Target className="w-4 h-4 text-saffron" /> Problem Solved
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Entrepreneurs face complex regulatory friction navigating multiple department portals for factory licenses, fire NOCs, environmental consents, and utility connections. Departments deal with incomplete filings, duplicate document scrutiny, and SLA delays.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-bold text-govBlue text-sm flex items-center gap-2">
                <Award className="w-4 h-4 text-saffron" /> Core Solution Vision
              </h3>
              <p className="text-slate-600 leading-relaxed">
                UdyogSathi generates explainable approval checklists, pre-validates uploaded document vault files, automates field inspection camera evidence logging, tracks statutory SLA countdowns, and matches industries with government incentive schemes.
              </p>
            </div>
          </div>
        </div>

        {/* Organisation Context */}
        <div className="bg-govBlue text-white p-8 rounded-2xl shadow-md space-y-4">
          <h2 className="text-lg font-bold text-white">Government Context & Partner Departments</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
            <div className="bg-white/10 p-4 rounded-xl border border-white/20">
              <strong className="text-saffron block mb-1">Nodal Agency</strong>
              <span>Maharashtra State Innovation Society (MSINS), Department of Skills, Employment, Entrepreneurship & Innovation.</span>
            </div>
            <div className="bg-white/10 p-4 rounded-xl border border-white/20">
              <strong className="text-saffron block mb-1">Participating Departments</strong>
              <span>MPCB, DISH Factories Inspectorate, MIDC, Maharashtra Fire Services, MSEDCL Power.</span>
            </div>
            <div className="bg-white/10 p-4 rounded-xl border border-white/20">
              <strong className="text-saffron block mb-1">Inclusivity & Accessibility</strong>
              <span>23 Indian Languages supported, RTL layout for Urdu, WCAG 2.1 AA screen reader compliance.</span>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
