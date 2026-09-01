'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { TopUtilityBar } from '@/components/layout/TopUtilityBar';
import { OfficialHeader } from '@/components/layout/OfficialHeader';
import { Footer } from '@/components/layout/Footer';
import { DisclaimerBanner } from '@/components/common/DisclaimerBanner';
import { Map, ArrowRight } from 'lucide-react';

import { ROUTES } from '@/lib/routes';

export default function SitemapPage() {
  const [currentLang, setCurrentLang] = useState('en');

  const siteLinks = [
    { title: 'Home Landing Page', href: ROUTES.home },
    { title: 'About UdyogSathi', href: ROUTES.about },
    { title: 'How It Works', href: ROUTES.howItWorks },
    { title: 'Personalized Approval Discovery Wizard', href: ROUTES.approvalWizard },
    { title: 'Industrial Sector Guides & Regulatory Norms', href: ROUTES.sectorGuides },
    { title: 'Compliance Knowledge Base & Circulars', href: ROUTES.knowledgeBase },
    { title: 'Government Schemes & Incentives Directory', href: ROUTES.schemes },
    { title: 'Applicant Portal Dashboard', href: ROUTES.dashboard },
    { title: 'Reusable Document Vault', href: ROUTES.vault },
    { title: 'Frequently Asked Questions (FAQs)', href: ROUTES.faq },
    { title: 'Department Officer Portal', href: '/officer/dashboard' },
    { title: 'Field Inspector Portal & Camera Capture', href: '/inspector/dashboard' },
    { title: 'Statewide Admin Console', href: '/admin/dashboard' },
    { title: 'Sign In', href: ROUTES.login },
    { title: 'Helpdesk & Support Contact', href: ROUTES.contact },
    { title: 'Accessibility Statement', href: ROUTES.accessibility },
    { title: 'Privacy Policy', href: ROUTES.privacy },
    { title: 'Terms of Use', href: ROUTES.terms },
    { title: 'Statutory AI Disclaimer', href: ROUTES.disclaimer },
  ];

  return (
    <div className="bg-[#f7f9fc] min-h-screen flex flex-col font-sans">
      <TopUtilityBar currentLang={currentLang} onLanguageChange={setCurrentLang} />
      <OfficialHeader currentLang={currentLang} />
      <DisclaimerBanner />

      <main id="main-content" className="flex-1 py-12 px-4 max-w-4xl mx-auto w-full space-y-6">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-govBorder space-y-4">
          <div className="flex items-center gap-2 text-govBlue font-bold">
            <Map className="w-5 h-5 text-saffron" />
            <h1 className="text-xl font-extrabold">UdyogSathi Portal Sitemap</h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            {siteLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="p-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-govBlue hover:text-white transition-all text-xs font-bold text-govBlue flex items-center justify-between group"
              >
                <span>{link.title}</span>
                <ArrowRight className="w-3.5 h-3.5 text-saffron group-hover:translate-x-1 transition-transform" />
              </Link>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
