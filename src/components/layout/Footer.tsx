'use client';

import React from 'react';
import Link from 'next/link';
import { Shield, Mail, Phone, MapPin, ExternalLink, Heart } from 'lucide-react';
import { ROUTES } from '@/lib/routes';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-govBlue-dark text-white pt-12 pb-6 border-t-4 border-saffron">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 text-xs">
        {/* Col 1: Portal Details */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded bg-saffron flex items-center justify-center text-white font-bold">
              <Shield className="w-5 h-5" />
            </div>
            <span className="text-lg font-bold text-white tracking-wide">UdyogSathi</span>
          </div>
          <p className="text-slate-300 leading-relaxed mb-4">
            Unified Intelligent Industrial Approval, Compliance, Inspection & Incentive Management Platform for Maharashtra.
          </p>
          <div className="text-[11px] text-slate-400 bg-govBlue/60 p-2.5 rounded border border-govBlue-light/40">
            <strong className="text-saffron block mb-0.5">Government Department:</strong>
            Maharashtra State Innovation Society, Department of Skills, Employment, Entrepreneurship & Innovation.
          </div>
        </div>

        {/* Col 2: Public Services */}
        <div>
          <h4 className="text-sm font-bold text-saffron uppercase tracking-wider mb-3">Public Services</h4>
          <ul className="space-y-2 text-slate-300">
            <li>
              <Link href={ROUTES.approvalWizard} className="hover:text-saffron transition-colors flex items-center gap-1">
                <span>Personalized Approval Discovery Wizard</span>
              </Link>
            </li>
            <li>
              <Link href={ROUTES.schemes} className="hover:text-saffron transition-colors">
                Government Schemes & Incentives Directory
              </Link>
            </li>
            <li>
              <Link href={ROUTES.sectorGuides} className="hover:text-saffron transition-colors">
                Industrial Sector Guides & Regulatory Norms
              </Link>
            </li>
            <li>
              <Link href={ROUTES.knowledgeBase} className="hover:text-saffron transition-colors">
                Compliance Knowledge Base & Circulars
              </Link>
            </li>
            <li>
              <Link href={ROUTES.faq} className="hover:text-saffron transition-colors">
                Frequently Asked Questions (FAQs)
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 3: Statutory & Legal Policy */}
        <div>
          <h4 className="text-sm font-bold text-saffron uppercase tracking-wider mb-3">Legal & Governance</h4>
          <ul className="space-y-2 text-slate-300">
            <li>
              <Link href={ROUTES.accessibility} className="hover:text-saffron transition-colors">
                Accessibility Statement & WCAG 2.1 AA
              </Link>
            </li>
            <li>
              <Link href={ROUTES.privacy} className="hover:text-saffron transition-colors">
                Privacy & Data Protection Policy
              </Link>
            </li>
            <li>
              <Link href={ROUTES.terms} className="hover:text-saffron transition-colors">
                Terms of Use & Conditions
              </Link>
            </li>
            <li>
              <Link href={ROUTES.disclaimer} className="hover:text-saffron transition-colors">
                Statutory AI & Demo Disclaimer
              </Link>
            </li>
            <li>
              <Link href={ROUTES.sitemap} className="hover:text-saffron transition-colors">
                Portal Sitemap
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 4: Contact Helpdesk */}
        <div>
          <h4 className="text-sm font-bold text-saffron uppercase tracking-wider mb-3">Helpdesk & Support</h4>
          <div className="space-y-2.5 text-slate-300">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-saffron shrink-0 mt-0.5" />
              <span>Mantralaya, Madam Cama Road, Nariman Point, Mumbai - 400032</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-saffron shrink-0" />
              <span>Toll Free: 1800-233-0444 (09:00 AM - 06:00 PM)</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-saffron shrink-0" />
              <span>support@udyogsathi.gov.in</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto px-4 pt-6 border-t border-govBlue-light/40 text-[11px] text-slate-400 flex flex-wrap items-center justify-between gap-4">
        <div>
          © 2026 Government of Maharashtra. Developed for Smart India Hackathon (Problem ID: 26130).
        </div>
        <div className="flex items-center gap-4">
          <span>Last Updated: August 30, 2026</span>
          <span className="text-slate-600">|</span>
          <span className="flex items-center gap-1 text-slate-300">
            Engineered with <Heart className="w-3 h-3 text-red-500 fill-red-500 inline" /> for India
          </span>
        </div>
      </div>
    </footer>
  );
};
