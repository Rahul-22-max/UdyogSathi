'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { TopUtilityBar } from '@/components/layout/TopUtilityBar';
import { OfficialHeader } from '@/components/layout/OfficialHeader';
import { Footer } from '@/components/layout/Footer';
import { DisclaimerBanner } from '@/components/common/DisclaimerBanner';
import { getTranslation } from '@/lib/i18n';
import { ROUTES } from '@/lib/routes';
import { KB_ARTICLES, KBArticle } from '@/lib/kb-data';
import {
  BookOpen,
  Search,
  FileText,
  Clock,
  ArrowRight,
  Home,
  X,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react';

export default function KnowledgeBasePage() {
  const [currentLang, setCurrentLang] = useState('en');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedArticle, setSelectedArticle] = useState<KBArticle | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categories = [
    'ALL',
    'Environmental & MPCB',
    'Factory Safety & DISH',
    'MIDC Land & Infrastructure',
    'Fire & Boiler Safety',
    'Power & Utilities',
    'Labour & Compliance',
  ];

  const filteredArticles = KB_ARTICLES.filter(article => {
    const matchesSearch =
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.statutoryAct.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'ALL' || article.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    setTimeout(() => {
      setLoading(false);
    }, 400);
  };

  return (
    <div className="bg-[#f7f9fc] min-h-screen flex flex-col font-sans">
      <TopUtilityBar currentLang={currentLang} onLanguageChange={setCurrentLang} />
      <OfficialHeader currentLang={currentLang} />
      <DisclaimerBanner lang={currentLang} />

      <main id="main-content" className="flex-1 py-10 px-4 max-w-7xl mx-auto w-full space-y-6">
        {/* Breadcrumb & Title */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-govBorder pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-govMuted mb-1">
              <Link href={ROUTES.home} className="hover:text-govBlue flex items-center gap-1">
                <Home className="w-3.5 h-3.5" />
                <span>{getTranslation(currentLang, 'nav_home')}</span>
              </Link>
              <span>/</span>
              <span className="font-semibold text-govBlue">{getTranslation(currentLang, 'nav_kb')}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-govBlue tracking-tight flex items-center gap-2">
              <BookOpen className="w-7 h-7 text-saffron" />
              <span>Compliance Knowledge Base & Statutory Circulars</span>
            </h1>
            <p className="text-xs text-govMuted mt-1 max-w-2xl">
              Search official regulatory procedures, statutory checklists, document guidelines, and departmental SLA mandates for Maharashtra industries.
            </p>
          </div>

          <Link
            href={ROUTES.home}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-govBlue hover:bg-govBlue-50 px-3 py-2 rounded-lg border border-govBlue/20 transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
        </div>

        {/* Search & Category Filter */}
        <div className="bg-white p-4 rounded-xl border border-govBorder shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search knowledge base articles by title, department, act, or keyword..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-saffron focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 text-xs"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <button
              onClick={handleRetry}
              className="inline-flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-govBlue text-xs font-bold px-4 py-2.5 rounded-lg border border-slate-300 transition-colors shrink-0"
              title="Refresh Articles"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
            <span className="text-[11px] text-govMuted font-bold shrink-0 mr-1">Category:</span>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-govBlue text-white shadow-sm font-bold'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white p-12 rounded-xl border border-govBorder text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-saffron animate-spin mx-auto" />
            <p className="text-xs text-govMuted font-semibold">Fetching knowledge base articles...</p>
          </div>
        )}

        {/* Empty Search State */}
        {!loading && !error && filteredArticles.length === 0 && (
          <div className="bg-white p-12 rounded-xl border border-govBorder text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-saffron/10 text-saffron flex items-center justify-center mx-auto">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-govBlue">No Knowledge Base Articles Found</h3>
            <p className="text-xs text-govMuted max-w-md mx-auto">
              No regulatory article matched your search query "{searchQuery}". Try searching for MPCB, DISH, MIDC, or Fire safety.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('ALL');
              }}
              className="bg-govBlue text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-govBlue-dark transition-colors"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Articles List Grid */}
        {!loading && !error && filteredArticles.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredArticles.map(article => (
              <div
                key={article.id}
                onClick={() => setSelectedArticle(article)}
                className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-saffron transition-all p-5 flex flex-col justify-between cursor-pointer group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold bg-govBlue-50 text-govBlue px-2.5 py-1 rounded border border-govBlue/20">
                      {article.category}
                    </span>
                    <span className="text-[11px] text-govMuted font-semibold flex items-center gap-1">
                      <Clock className="w-3 h-3 text-saffron" /> SLA: {article.slaDays} Days
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-govBlue group-hover:text-saffron transition-colors leading-snug">
                    {article.title}
                  </h3>

                  <p className="text-xs text-govMuted leading-relaxed line-clamp-3">{article.summary}</p>

                  <div className="pt-2 border-t border-slate-100 text-[11px] space-y-1 text-slate-600">
                    <div>
                      <strong className="text-govBlue font-bold">Department: </strong>
                      {article.department}
                    </div>
                    <div>
                      <strong className="text-govBlue font-bold">Statutory Act: </strong>
                      {article.statutoryAct}
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-govBlue group-hover:text-saffron">
                  <span>Read Full Regulatory Guide</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Article Detail Modal */}
        {selectedArticle && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white text-slate-900 max-w-3xl w-full rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-6 my-8 relative animate-fadeIn">
              <button
                onClick={() => setSelectedArticle(null)}
                className="absolute right-4 top-4 text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
                aria-label="Close Knowledge Base Article"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-2 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-saffron uppercase tracking-widest">
                    {selectedArticle.category}
                  </span>
                  <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold border border-slate-200">
                    SLA: {selectedArticle.slaDays} Days
                  </span>
                </div>
                <h2 className="text-xl font-extrabold text-govBlue leading-snug">{selectedArticle.title}</h2>
                <div className="text-xs text-slate-500 flex flex-wrap gap-x-4 gap-y-1">
                  <span><strong>Authority:</strong> {selectedArticle.department}</span>
                  <span><strong>Statute:</strong> {selectedArticle.statutoryAct}</span>
                </div>
              </div>

              {/* Article Content Paragraphs */}
              <div className="space-y-3 text-xs text-slate-700 leading-relaxed">
                <h3 className="font-bold text-govBlue text-xs uppercase tracking-wider">Statutory Operating Procedure</h3>
                {selectedArticle.content.map((p, idx) => (
                  <p key={idx} className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                    {p}
                  </p>
                ))}
              </div>

              {/* Required Documents */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-govBlue uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-saffron" /> Mandatory Checklist Documents
                </h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {selectedArticle.requiredDocs.map((doc, idx) => (
                    <li key={idx} className="bg-govBlue-50/60 p-2.5 rounded border border-govBlue/10 text-slate-800 font-medium flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-saffron shrink-0 mt-0.5" />
                      <span>{doc}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Reference & Source */}
              <div className="bg-slate-100 p-3 rounded-lg text-[11px] text-slate-600 border border-slate-200">
                <strong className="text-govBlue">Official Reference: </strong>
                {selectedArticle.sourceRef}
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <Link
                  href={ROUTES.approvalWizard}
                  className="bg-saffron hover:bg-saffron-dark text-white text-xs font-bold px-4 py-2.5 rounded-lg shadow transition-colors flex items-center gap-1.5"
                >
                  <span>Launch Discovery Wizard</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <button
                  onClick={() => setSelectedArticle(null)}
                  className="text-xs font-semibold text-govMuted hover:text-govBlue px-3 py-2 rounded-lg border border-slate-200"
                >
                  Close Article
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
