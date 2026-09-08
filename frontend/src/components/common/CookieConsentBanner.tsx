import React, { useState, useEffect } from 'react';
import { Cookie, ShieldCheck, X } from 'lucide-react';
import { useLegalHelp } from '../../context/LegalHelpContext';

export const CookieConsentBanner: React.FC = () => {
  const { openPrivacy, cookieOpen, closeCookieSettings } = useLegalHelp();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('rashidi_cookie_consent');
    if (!consent) {
      // Delay slightly for smooth page entry
      const timer = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    if (cookieOpen) {
      setVisible(true);
    }
  }, [cookieOpen]);

  const handleAcceptAll = () => {
    localStorage.setItem('rashidi_cookie_consent', 'accepted');
    setVisible(false);
    closeCookieSettings();
  };

  const handleEssentialOnly = () => {
    localStorage.setItem('rashidi_cookie_consent', 'essential');
    setVisible(false);
    closeCookieSettings();
  };

  if (!visible) return null;

  return (
    <div
      role="region"
      aria-label="Cookie consent banner"
      className="fixed bottom-3 left-3 right-3 sm:left-6 sm:right-auto sm:max-w-xl z-50 bg-slate-900/95 text-white backdrop-blur-md p-4 sm:p-5 rounded-2xl shadow-2xl border border-slate-700/80 transition-all duration-300 animate-in fade-in slide-in-from-bottom-5"
    >
      <div className="flex items-start gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center flex-shrink-0 text-amber-400">
          <Cookie className="w-5 h-5" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>Cookie & Privacy Preferences</span>
              <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 font-semibold border border-sky-500/30">
                ERP Essential
              </span>
            </h3>
            <button
              type="button"
              onClick={handleEssentialOnly}
              className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition-colors"
              aria-label="Close cookie banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed mb-3.5">
            Al-Rashidi Star ERP uses essential local storage and security tokens strictly for user authentication, session persistence, and bilingual language preferences. We do not track or sell your business data.
          </p>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                openPrivacy();
              }}
              className="text-xs text-sky-400 hover:text-sky-300 font-medium underline underline-offset-2 flex items-center gap-1"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Read Privacy Policy</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleEssentialOnly}
                className="px-3 py-1.5 rounded-lg border border-slate-600 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors"
              >
                Essential Only
              </button>
              <button
                type="button"
                onClick={handleAcceptAll}
                className="px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-xs font-semibold text-white shadow-sm transition-colors"
              >
                Accept All
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
