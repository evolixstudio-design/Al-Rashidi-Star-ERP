import React from 'react';
import { HelpCircle, FileText, ShieldCheck, Cookie } from 'lucide-react';
import { useLegalHelp } from '../../context/LegalHelpContext';

interface AppFooterProps {
  variant?: 'light' | 'dark' | 'embedded';
}

export const AppFooter: React.FC<AppFooterProps> = ({ variant = 'embedded' }) => {
  const { openFaq, openTerms, openPrivacy, openCookieSettings } = useLegalHelp();

  const isDark = variant === 'dark';

  return (
    <footer
      className={`w-full py-4 px-4 sm:px-6 border-t text-xs transition-colors select-none ${
        isDark
          ? 'bg-slate-900 border-slate-800 text-slate-400'
          : 'bg-white/80 border-slate-200/80 text-slate-500 backdrop-blur-xs'
      }`}
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        {/* Company & Copyright */}
        <div className="flex flex-col sm:flex-row items-center gap-1.5 sm:gap-2">
          <span className={`font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            © 2026 Al-Rashidi Star ERP
          </span>
          <span className="hidden sm:inline text-slate-300">•</span>
          <span className="text-[11px] opacity-80 dir-rtl font-arabic">
            شركة الرشيدي ستار للتجارة العامة (الكويت)
          </span>
        </div>

        {/* Legal & Help Links */}
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs">
          <button
            type="button"
            onClick={openFaq}
            className={`hover:text-sky-600 transition-colors flex items-center gap-1 font-medium ${
              isDark ? 'hover:text-sky-400' : ''
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Help & FAQ</span>
          </button>

          <button
            type="button"
            onClick={openTerms}
            className={`hover:text-sky-600 transition-colors flex items-center gap-1 font-medium ${
              isDark ? 'hover:text-sky-400' : ''
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Terms</span>
          </button>

          <button
            type="button"
            onClick={openPrivacy}
            className={`hover:text-sky-600 transition-colors flex items-center gap-1 font-medium ${
              isDark ? 'hover:text-sky-400' : ''
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Privacy</span>
          </button>

          <button
            type="button"
            onClick={openCookieSettings}
            className={`hover:text-sky-600 transition-colors flex items-center gap-1 font-medium ${
              isDark ? 'hover:text-sky-400' : ''
            }`}
          >
            <Cookie className="w-3.5 h-3.5" />
            <span>Cookies</span>
          </button>
        </div>

        {/* System Version & Status Indicator */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-[11px] font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Online • v1.2.0</span>
          </span>
        </div>
      </div>
    </footer>
  );
};
