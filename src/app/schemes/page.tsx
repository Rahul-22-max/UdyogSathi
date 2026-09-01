'use client';

import React, { useState } from 'react';
import { TopUtilityBar } from '@/components/layout/TopUtilityBar';
import { OfficialHeader } from '@/components/layout/OfficialHeader';
import { Footer } from '@/components/layout/Footer';
import { DisclaimerBanner } from '@/components/common/DisclaimerBanner';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Award, Search, CheckCircle2, ExternalLink, Bookmark, Info } from 'lucide-react';

export default function SchemesPage() {
  const [currentLang, setCurrentLang] = useState('en');
  const [searchQuery, setSearchQuery] = useState('');

  const schemes = [
    {
      id: 'sch-1',
      title: 'Package Scheme of Incentives (PSI 2019)',
      department: 'Directorate of Industries, Maharashtra',
      description: 'Capital subsidy, SGST reimbursement, and interest subvention for MSMEs setting up industrial units in C, D, D+ and Naxal-affected districts.',
      matchScore: 92,
      benefits: 'Up to 80% Gross SGST Reimbursement for 7 years + 5% Interest Subvention for 5 years.',
      eligibility: 'MSME registration, valid CTE from MPCB, investment in eligible talukas of Maharashtra.',
      requiredDocs: 'EM Part II / Udyam Certificate, MPCB CTE, Land Purchase Deed',
      officialUrl: 'https://di.maharashtra.gov.in',
    },
    {
      id: 'sch-2',
      title: 'Chief Minister Employment Generation Programme (CMEGP)',
      department: 'Department of Industries & MSINS',
      description: 'Credit-linked capital subsidy for rural and urban entrepreneurs creating local employment opportunities in Maharashtra.',
      matchScore: 85,
      benefits: 'Margin Money Subsidy of 15% to 35% of total project cost.',
      eligibility: 'Age 18-45 years, Minimum 8th Standard pass, Maharashtra Domicile.',
      requiredDocs: 'Domicile Certificate, Aadhaar, Project Report, Educational Certificate',
      officialUrl: 'https://cmegp.maharashtra.gov.in',
    },
    {
      id: 'sch-3',
      title: 'MSME Technology Upgradation & Solar Capital Subsidy',
      department: 'Energy & Industry Department, Maharashtra',
      description: '25% capital grant on investment in rooftop solar PV installations and energy-efficient machinery for industrial units.',
      matchScore: 78,
      benefits: 'Up to ₹25 Lakhs capital grant + power tariff concession of ₹1.00/unit.',
      eligibility: 'Operational MSME unit with connected power load ≥ 50 KW.',
      requiredDocs: 'Energy Audit Report, MSEDCL Electricity Bill, Solar Vendor Invoice',
      officialUrl: 'https://mahadiscom.in',
    },
  ];

  const filteredSchemes = schemes.filter(s =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-[#f7f9fc] min-h-screen flex flex-col font-sans">
      <TopUtilityBar currentLang={currentLang} onLanguageChange={setCurrentLang} />
      <OfficialHeader currentLang={currentLang} />
      <DisclaimerBanner />

      <main id="main-content" className="flex-1 py-8 px-4 max-w-7xl mx-auto w-full space-y-6">
        {/* Title Header */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-govBorder flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Award className="w-6 h-6 text-saffron" />
              <h1 className="text-xl font-bold text-govBlue">Government Schemes & Incentive Matcher</h1>
            </div>
            <p className="text-xs text-govMuted mt-1">
              Statewide directory of Maharashtra capital subsidies, SGST reimbursements, and industrial grants.
            </p>
          </div>

          <div className="relative max-w-xs w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search scheme name or benefit..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-saffron"
            />
          </div>
        </div>

        {/* Schemes List */}
        <div className="space-y-4">
          {filteredSchemes.map(sch => (
            <div
              key={sch.id}
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-saffron transition-all space-y-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-base font-bold text-govBlue">{sch.title}</h3>
                  <span className="text-xs text-govMuted font-semibold">{sch.department}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="green">Match Score: {sch.matchScore}%</Badge>
                  <Button variant="outline" size="sm" leftIcon={<Bookmark className="w-3.5 h-3.5" />}>
                    Save Scheme
                  </Button>
                </div>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed">{sch.description}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <strong className="text-govBlue block mb-1">Financial Benefits:</strong>
                  <span className="text-slate-800 font-semibold">{sch.benefits}</span>
                </div>
                <div>
                  <strong className="text-govBlue block mb-1">Eligibility Criteria:</strong>
                  <span className="text-slate-700">{sch.eligibility}</span>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="text-slate-600">
                  <strong className="text-govBlue">Required Documents: </strong>
                  {sch.requiredDocs}
                </div>

                <a
                  href={sch.officialUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-saffron font-bold flex items-center gap-1 hover:underline shrink-0"
                >
                  <span>Official Govt Portal</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
