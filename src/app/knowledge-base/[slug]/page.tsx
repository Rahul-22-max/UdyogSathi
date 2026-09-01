'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { TopUtilityBar } from '@/components/layout/TopUtilityBar';
import { OfficialHeader } from '@/components/layout/OfficialHeader';
import { Footer } from '@/components/layout/Footer';
import { DisclaimerBanner } from '@/components/common/DisclaimerBanner';
import { KB_ARTICLES, KBArticle } from '@/lib/kb-data';
import { ROUTES } from '@/lib/routes';
import {
  BookOpen,
  ArrowLeft,
  Home,
  FileText,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Clock,
} from 'lucide-react';

export default function KBArticleDetailPage() {
  const [currentLang, setCurrentLang] = useState('en');
  const params = useParams();
  const slug = params?.slug as string;

  const article: KBArticle | undefined = KB_ARTICLES.find(a => a.slug === slug || a.id === slug);

  if (!article) {
    return (
      <div className="bg-[#f7f9fc] min-h-screen flex flex-col font-sans">
        <TopUtilityBar currentLang={currentLang} onLanguageChange={setCurrentLang} />
        <OfficialHeader currentLang={currentLang} />
        <DisclaimerBanner lang={currentLang} />

        <main id="main-content" className="flex-1 py-16 px-4 max-w-xl mx-auto w-full text-center space-y-4">
          <div className="bg-white p-8 rounded-2xl shadow-md border border-govBorder space-y-4">
            <AlertTriangle className="w-12 h-12 text-saffron mx-auto" />
            <h1 className="text-xl font-bold text-govBlue">Article Not Found</h1>
            <p className="text-xs text-govMuted leading-relaxed">
              The regulatory article <code className="bg-slate-100 px-1.5 py-0.5 rounded text-govBlue font-bold">{slug || 'unknown'}</code> is unavailable or has been updated.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row gap-2">
              <Link
                href={ROUTES.knowledgeBase}
                className="w-full bg-govBlue text-white text-xs font-bold py-2.5 rounded-lg hover:bg-govBlue-dark transition-colors flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Browse Knowledge Base</span>
              </Link>
              <Link
                href={ROUTES.home}
                className="w-full bg-slate-100 text-govBlue text-xs font-bold py-2.5 rounded-lg border border-slate-300 hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
              >
                <Home className="w-4 h-4" />
                <span>Return to Home</span>
              </Link>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-[#f7f9fc] min-h-screen flex flex-col font-sans">
      <TopUtilityBar currentLang={currentLang} onLanguageChange={setCurrentLang} />
      <OfficialHeader currentLang={currentLang} />
      <DisclaimerBanner lang={currentLang} />

      <main id="main-content" className="flex-1 py-10 px-4 max-w-4xl mx-auto w-full space-y-6">
        {/* Breadcrumb & Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-govBorder pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-govMuted mb-1">
              <Link href={ROUTES.home} className="hover:text-govBlue flex items-center gap-1">
                <Home className="w-3.5 h-3.5" />
                <span>Home</span>
              </Link>
              <span>/</span>
              <Link href={ROUTES.knowledgeBase} className="hover:text-govBlue">
                Knowledge Base
              </Link>
              <span>/</span>
              <span className="font-semibold text-govBlue">{article.category}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-govBlue tracking-tight flex items-center gap-2">
              <BookOpen className="w-7 h-7 text-saffron" />
              <span>{article.title}</span>
            </h1>
            <div className="flex items-center gap-3 text-xs text-govMuted mt-2">
              <span className="bg-saffron text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                {article.category}
              </span>
              <span className="flex items-center gap-1 font-semibold">
                <Clock className="w-3.5 h-3.5 text-saffron" /> SLA: {article.slaDays} Days
              </span>
              <span>•</span>
              <span className="font-semibold text-govBlue">{article.department}</span>
            </div>
          </div>

          <Link
            href={ROUTES.knowledgeBase}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-govBlue hover:bg-govBlue-50 px-3 py-2 rounded-lg border border-govBlue/20 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>All KB Articles</span>
          </Link>
        </div>

        {/* Article Content Container */}
        <div className="bg-white p-6 rounded-2xl border border-govBorder shadow-sm space-y-6">
          <div className="space-y-3 text-xs text-slate-700 leading-relaxed">
            <h2 className="text-sm font-bold text-govBlue border-b border-slate-100 pb-2">Statutory Process & Scrutiny Guidelines</h2>
            {article.content.map((p, idx) => (
              <p key={idx} className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                {p}
              </p>
            ))}
          </div>

          {/* Mandatory Documents */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-govBlue uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-saffron" /> Mandatory Checklist Documents
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {article.requiredDocs.map((doc, idx) => (
                <div key={idx} className="bg-govBlue-50/60 p-3 rounded-lg border border-govBlue/10 text-slate-800 font-medium flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-saffron shrink-0 mt-0.5" />
                  <span>{doc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Official Reference Source */}
          <div className="bg-slate-100 p-3.5 rounded-xl text-xs text-slate-700 border border-slate-200">
            <strong className="text-govBlue">Official Government Source: </strong>
            {article.sourceRef}
          </div>

          {/* Bottom Actions */}
          <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4">
            <Link
              href={ROUTES.approvalWizard}
              className="bg-saffron hover:bg-saffron-dark text-white text-xs font-bold px-5 py-3 rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              <span>Generate Approval Checklist for Your Unit</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href={ROUTES.knowledgeBase}
              className="text-xs font-bold text-govBlue hover:bg-slate-100 px-4 py-2.5 rounded-lg border border-slate-300"
            >
              Back to Knowledge Base Directory
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
