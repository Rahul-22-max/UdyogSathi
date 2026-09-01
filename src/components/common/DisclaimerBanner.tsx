'use client';

import React from 'react';
import { AlertTriangle, Info } from 'lucide-react';
import { getTranslation } from '@/lib/i18n';

interface DisclaimerBannerProps {
  lang?: string;
  isCompact?: boolean;
}

export const DisclaimerBanner: React.FC<DisclaimerBannerProps> = ({ lang = 'en', isCompact = false }) => {
  const message = getTranslation(lang, 'disclaimer_banner');

  if (isCompact) {
    return (
      <div className="bg-amber-50 border-l-4 border-amber-500 p-3 text-xs text-amber-900 rounded-r flex items-start gap-2">
        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-amber-900">Regulatory Guidance Notice: </span>
          {message}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-govBlue-50 border-b border-govBlue/20 text-govBlue py-2 px-4 text-xs font-medium flex items-center justify-between shadow-inner">
      <div className="max-w-7xl mx-auto flex items-center gap-2">
        <Info className="w-4 h-4 text-saffron shrink-0" />
        <span>
          <strong className="text-govBlue font-bold">Regulatory Guidance: </strong>
          {message}
        </span>
      </div>
      <span className="hidden md:inline-block bg-govBlue/10 text-govBlue font-bold px-2 py-0.5 rounded text-[10px] tracking-wide border border-govBlue/20 uppercase">
        Unified Industrial Workflow
      </span>
    </div>
  );
};
