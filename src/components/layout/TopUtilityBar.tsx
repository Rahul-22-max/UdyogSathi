'use client';

import React, { useState, useEffect } from 'react';
import { Globe, Eye, Volume2, Search } from 'lucide-react';
import { SUPPORTED_LANGUAGES, isRtlLanguage } from '@/lib/i18n';

interface TopUtilityBarProps {
  currentLang: string;
  onLanguageChange: (code: string) => void;
  onHighContrastToggle?: (enabled: boolean) => void;
  onFontSizeChange?: (size: 'sm' | 'normal' | 'lg') => void;
}

export const TopUtilityBar: React.FC<TopUtilityBarProps> = ({
  currentLang,
  onLanguageChange,
  onHighContrastToggle,
  onFontSizeChange,
}) => {
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [fontSize, setFontSize] = useState<'sm' | 'normal' | 'lg'>('normal');
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [searchLang, setSearchLang] = useState('');
  const [showScreenReaderModal, setShowScreenReaderModal] = useState(false);

  // Apply high contrast & font size to <html> element
  useEffect(() => {
    const htmlEl = document.documentElement;
    if (isHighContrast) {
      htmlEl.classList.add('high-contrast');
    } else {
      htmlEl.classList.remove('high-contrast');
    }

    htmlEl.classList.remove('font-sm', 'font-normal', 'font-lg');
    htmlEl.classList.add(`font-${fontSize}`);

    if (isRtlLanguage(currentLang)) {
      htmlEl.setAttribute('dir', 'rtl');
    } else {
      htmlEl.setAttribute('dir', 'ltr');
    }
  }, [isHighContrast, fontSize, currentLang]);

  const toggleContrast = () => {
    const next = !isHighContrast;
    setIsHighContrast(next);
    if (onHighContrastToggle) onHighContrastToggle(next);
  };

  const handleFontSize = (size: 'sm' | 'normal' | 'lg') => {
    setFontSize(size);
    if (onFontSizeChange) onFontSizeChange(size);
  };

  const filteredLanguages = SUPPORTED_LANGUAGES.filter(
    l =>
      l.nameEn.toLowerCase().includes(searchLang.toLowerCase()) ||
      l.nameNative.toLowerCase().includes(searchLang.toLowerCase()) ||
      l.code.toLowerCase().includes(searchLang.toLowerCase())
  );

  const selectedLangObj = SUPPORTED_LANGUAGES.find(l => l.code === currentLang) || SUPPORTED_LANGUAGES[0];

  return (
    <div className="bg-govBlue-dark text-white py-1.5 px-4 text-xs font-sans border-b border-govBlue-light">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        {/* Left Side: Maharashtra Govt Tag & Accessibility Skip Link */}
        <div className="flex items-center gap-4">
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:bg-saffron focus:text-white focus:p-2 focus:z-50 focus:rounded focus:font-bold"
          >
            Skip to main content
          </a>

          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-saffron animate-pulse" />
            <span className="font-semibold text-slate-200 tracking-wide">
              Government of Maharashtra | MSINS Portal
            </span>
          </div>

          <button
            onClick={() => setShowScreenReaderModal(true)}
            className="hidden sm:flex items-center gap-1 text-slate-300 hover:text-white transition-colors underline underline-offset-2"
            title="Screen Reader Accessibility Information"
          >
            <Volume2 className="w-3.5 h-3.5 text-saffron" />
            <span>Screen Reader Access</span>
          </button>
        </div>

        {/* Right Side: Accessibility Controls & Language Selector */}
        <div className="flex items-center gap-3">
          {/* Font Scaling */}
          <div className="flex items-center bg-govBlue/60 rounded border border-govBlue-light/40 overflow-hidden">
            <span className="px-1.5 text-[10px] text-slate-300 font-semibold border-r border-govBlue-light/40">Font:</span>
            <button
              onClick={() => handleFontSize('sm')}
              className={`px-1.5 py-0.5 hover:bg-saffron hover:text-white transition-colors ${
                fontSize === 'sm' ? 'bg-saffron font-bold text-white' : 'text-slate-200'
              }`}
              title="Decrease Font Size"
            >
              A-
            </button>
            <button
              onClick={() => handleFontSize('normal')}
              className={`px-1.5 py-0.5 hover:bg-saffron hover:text-white transition-colors ${
                fontSize === 'normal' ? 'bg-saffron font-bold text-white' : 'text-slate-200'
              }`}
              title="Default Font Size"
            >
              A
            </button>
            <button
              onClick={() => handleFontSize('lg')}
              className={`px-1.5 py-0.5 hover:bg-saffron hover:text-white transition-colors ${
                fontSize === 'lg' ? 'bg-saffron font-bold text-white' : 'text-slate-200'
              }`}
              title="Increase Font Size"
            >
              A+
            </button>
          </div>

          {/* High Contrast Mode Toggle */}
          <button
            onClick={toggleContrast}
            className={`flex items-center gap-1.5 px-2 py-0.5 rounded border transition-colors ${
              isHighContrast
                ? 'bg-yellow-400 text-black border-yellow-300 font-bold'
                : 'bg-govBlue/60 border-govBlue-light/40 text-slate-200 hover:text-white hover:bg-govBlue'
            }`}
            title="Toggle High Contrast Mode"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isHighContrast ? 'Contrast: ON' : 'High Contrast'}</span>
          </button>

          {/* Language Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsLangOpen(!isLangOpen)}
              className="flex items-center gap-1.5 bg-saffron hover:bg-saffron-dark text-white px-2.5 py-1 rounded font-medium shadow-sm transition-colors text-xs"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{selectedLangObj.nameNative} ({selectedLangObj.nameEn})</span>
            </button>

            {isLangOpen && (
              <div className="absolute right-0 mt-1 w-64 bg-white text-slate-900 rounded-lg shadow-2xl border border-slate-200 z-50 overflow-hidden">
                <div className="p-2 border-b border-slate-100 bg-slate-50">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-2 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search 23 Indian Languages..."
                      value={searchLang}
                      onChange={e => setSearchLang(e.target.value)}
                      className="w-full pl-7 pr-2 py-1 text-xs border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-saffron"
                    />
                  </div>
                </div>

                <div className="max-h-60 overflow-y-auto divide-y divide-slate-100">
                  {filteredLanguages.map(lang => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        onLanguageChange(lang.code);
                        setIsLangOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-saffron/10 hover:text-govBlue transition-colors ${
                        lang.code === currentLang ? 'bg-govBlue/10 font-bold text-govBlue border-l-4 border-saffron' : ''
                      }`}
                    >
                      <div>
                        <span className="font-semibold text-slate-900">{lang.nameNative}</span>
                        <span className="text-[11px] text-slate-500 ml-1.5">({lang.nameEn})</span>
                      </div>
                      {lang.hasFullDictionary ? (
                        <span className="text-[9px] bg-green-100 text-green-800 px-1.5 py-0.5 rounded font-bold">Verified</span>
                      ) : (
                        <span className="text-[9px] bg-slate-100 text-slate-600 px-1 py-0.5 rounded">Native</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Screen Reader Modal */}
      {showScreenReaderModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 max-w-md w-full rounded-xl shadow-2xl border border-slate-200 p-6 relative">
            <h3 className="text-lg font-bold text-govBlue mb-2 flex items-center gap-2">
              <Volume2 className="w-5 h-5 text-saffron" /> Screen Reader Access Guidelines
            </h3>
            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              UdyogSathi complies with World Wide Web Consortium (W3C) Web Content Accessibility Guidelines (WCAG) 2.1 Level AA.
            </p>
            <ul className="text-xs text-slate-700 space-y-2 list-disc pl-5 mb-6">
              <li>Compatible with NVDA, JAWS, VoiceOver, and TalkBack screen readers.</li>
              <li>Semantic HTML5 landmark tags (`header`, `nav`, `main`, `footer`).</li>
              <li>Full keyboard accessibility (Tab, Shift+Tab, Enter, Escape, Arrow keys).</li>
              <li>WAI-ARIA labels provided on all interactive controls.</li>
            </ul>
            <button
              onClick={() => setShowScreenReaderModal(false)}
              className="w-full bg-govBlue text-white font-semibold py-2 rounded text-xs hover:bg-govBlue-dark transition-colors"
            >
              Close Guidelines
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
