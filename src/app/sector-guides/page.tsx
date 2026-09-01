'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { TopUtilityBar } from '@/components/layout/TopUtilityBar';
import { OfficialHeader } from '@/components/layout/OfficialHeader';
import { Footer } from '@/components/layout/Footer';
import { DisclaimerBanner } from '@/components/common/DisclaimerBanner';
import { getTranslation } from '@/lib/i18n';
import { ROUTES } from '@/lib/routes';
import { SECTOR_GUIDES, SectorGuide } from '@/lib/sector-data';
import {
  Factory,
  Search,
  ArrowRight,
  Home,
  CheckCircle2,
  FileText,
  AlertTriangle,
  X,
  RefreshCw,
  Shield,
} from 'lucide-react';

export default function SectorGuidesPage() {
  const [currentLang, setCurrentLang] = useState('en');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedSector, setSelectedSector] = useState<SectorGuide | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categories = ['ALL', 'Heavy Industry', 'Engineering', 'Process Industry', 'Healthcare & Life Sciences', 'Technology', 'Agro-Business', 'Consumer Goods', 'Energy', 'Small & Medium Business', 'Supply Chain'];

  const filteredSectors = SECTOR_GUIDES.filter(sector => {
    const matchesSearch =
      sector.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sector.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sector.keyApprovals.some(a => a.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === 'ALL' || sector.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    setTimeout(() => {
      setLoading(false);
    }, 500);
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
              <span className="font-semibold text-govBlue">{getTranslation(currentLang, 'nav_sectors')}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-govBlue tracking-tight flex items-center gap-2">
              <Factory className="w-7 h-7 text-saffron" />
              <span>Industrial Sector Guides & Regulatory Norms</span>
            </h1>
            <p className="text-xs text-govMuted mt-1 max-w-2xl">
              Explore sector-specific statutory clearance roadmaps, competent government departments, MPCB environmental pollution classifications, and incentive schemes.
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

        {/* Search & Category Filter Bar */}
        <div className="bg-white p-4 rounded-xl border border-govBorder shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search sector guides by name, approval type, or statutory requirement..."
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
              title="Refresh Sector Data"
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
            <p className="text-xs text-govMuted font-semibold">Loading sector regulatory guides...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 p-6 rounded-xl border border-red-200 text-center space-y-3">
            <AlertTriangle className="w-8 h-8 text-red-600 mx-auto" />
            <h3 className="text-sm font-bold text-red-800">Failed to Load Sector Information</h3>
            <p className="text-xs text-red-600 max-w-md mx-auto">{error}</p>
            <button
              onClick={handleRetry}
              className="bg-red-600 text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Retry Loading
            </button>
          </div>
        )}

        {/* Empty Search State */}
        {!loading && !error && filteredSectors.length === 0 && (
          <div className="bg-white p-12 rounded-xl border border-govBorder text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-saffron/10 text-saffron flex items-center justify-center mx-auto">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-govBlue">No Matching Industrial Sectors Found</h3>
            <p className="text-xs text-govMuted max-w-md mx-auto">
              We couldn't find any sector guide matching "{searchQuery}". Try adjusting your search query or selecting a different category filter.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('ALL');
              }}
              className="bg-govBlue text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-govBlue-dark transition-colors"
            >
              Clear Filters & Show All Sectors
            </button>
          </div>
        )}

        {/* Sector Cards Grid */}
        {!loading && !error && filteredSectors.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSectors.map(sector => {
              const Icon = sector.icon;

              const badgeColors = {
                RED: 'bg-red-100 text-red-800 border-red-200',
                ORANGE: 'bg-orange-100 text-orange-800 border-orange-200',
                GREEN: 'bg-green-100 text-green-800 border-green-200',
                WHITE: 'bg-slate-100 text-slate-800 border-slate-200',
              };

              return (
                <div
                  key={sector.id}
                  onClick={() => setSelectedSector(sector)}
                  className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-saffron transition-all p-5 flex flex-col justify-between cursor-pointer group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-lg bg-govBlue-50 text-govBlue flex items-center justify-center group-hover:bg-saffron group-hover:text-white transition-colors">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded border ${
                          badgeColors[sector.pollutionCategory]
                        }`}
                      >
                        MPCB: {sector.pollutionCategory}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-saffron uppercase tracking-wider">
                        {sector.category}
                      </span>
                      <h3 className="text-sm font-bold text-govBlue group-hover:text-saffron transition-colors mt-0.5">
                        {sector.name}
                      </h3>
                    </div>

                    <p className="text-xs text-govMuted leading-relaxed line-clamp-3">{sector.description}</p>

                    <div className="pt-2 border-t border-slate-100 space-y-1 text-[11px]">
                      <span className="font-bold text-govBlue block">Key Approvals:</span>
                      <ul className="space-y-1 text-slate-600">
                        {sector.keyApprovals.slice(0, 2).map((app, idx) => (
                          <li key={idx} className="flex items-start gap-1">
                            <CheckCircle2 className="w-3 h-3 text-saffron shrink-0 mt-0.5" />
                            <span className="truncate">{app}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-govBlue group-hover:text-saffron">
                    <span>Explore Regulatory Guide</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Sector Detail Modal Drawer */}
        {selectedSector && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white text-slate-900 max-w-2xl w-full rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-6 my-8 relative animate-fadeIn">
              <button
                onClick={() => setSelectedSector(null)}
                className="absolute right-4 top-4 text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
                aria-label="Close Sector Guide Detail"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-start gap-4 border-b border-slate-100 pb-4">
                <div className="w-12 h-12 rounded-xl bg-saffron text-white flex items-center justify-center font-bold shrink-0">
                  <selectedSector.icon className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-saffron uppercase tracking-wide">
                      {selectedSector.category}
                    </span>
                    <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded border border-slate-200">
                      MPCB {selectedSector.pollutionCategory} Category
                    </span>
                  </div>
                  <h2 className="text-xl font-extrabold text-govBlue">{selectedSector.name}</h2>
                  <p className="text-xs text-govMuted mt-1">{selectedSector.description}</p>
                </div>
              </div>

              {/* Key Approvals Section */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-govBlue uppercase tracking-wider flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-saffron" /> Mandatory Statutory Approvals & Clearances
                </h3>
                <div className="space-y-2">
                  {selectedSector.keyApprovals.map((app, idx) => (
                    <div key={idx} className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-saffron shrink-0" />
                      <span className="font-semibold text-slate-800">{app}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Applicable Acts & Regulations */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-govBlue uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-saffron" /> Primary Governing Acts & Regulations
                </h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {selectedSector.acts.map((act, idx) => (
                    <li key={idx} className="bg-govBlue-50/50 p-2.5 rounded border border-govBlue/10 text-slate-700 font-medium">
                      • {act}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Incentive Schemes */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-govBlue uppercase tracking-wider">
                  Eligible Financial Incentives & Subsidies
                </h3>
                <div className="flex flex-wrap gap-2 text-xs">
                  {selectedSector.schemes.map((sch, idx) => (
                    <span key={idx} className="bg-green-50 text-green-800 font-semibold px-2.5 py-1 rounded-md border border-green-200">
                      ✓ {sch}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <Link
                  href={ROUTES.approvalWizard}
                  className="bg-saffron hover:bg-saffron-dark text-white text-xs font-bold px-4 py-2.5 rounded-lg shadow transition-colors flex items-center gap-1.5"
                >
                  <span>Start Approval Discovery Wizard</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <button
                  onClick={() => setSelectedSector(null)}
                  className="text-xs font-semibold text-govMuted hover:text-govBlue px-3 py-2 rounded-lg border border-slate-200"
                >
                  Close Guide
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
