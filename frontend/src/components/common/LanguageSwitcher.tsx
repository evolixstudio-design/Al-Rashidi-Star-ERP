import React from 'react';
import { useTranslations } from '../../hooks/useTranslations';
import { Globe } from 'lucide-react';

interface LanguageSwitcherProps {
  variant?: 'navbar' | 'light' | 'compact';
  className?: string;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  variant = 'navbar',
  className = '',
}) => {
  const { lang, setLang, t } = useTranslations();

  if (variant === 'navbar') {
    return (
      <div
        className={`inline-flex items-center bg-slate-800/90 border border-slate-700 rounded-lg p-0.5 text-xs ${className}`}
        title={t.common.switchLanguage}
      >
        <button
          type="button"
          onClick={() => setLang('en')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-semibold transition-all ${
            lang === 'en'
              ? 'bg-sky-600 text-white shadow-xs'
              : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
          }`}
          aria-pressed={lang === 'en'}
        >
          <span>EN</span>
          <span className="hidden sm:inline">English</span>
        </button>
        <button
          type="button"
          onClick={() => setLang('hi')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-semibold transition-all ${
            lang === 'hi'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
          }`}
          aria-pressed={lang === 'hi'}
        >
          <span>HI</span>
          <span className="hidden sm:inline">Hinglish</span>
        </button>
      </div>
    );
  }

  if (variant === 'light') {
    return (
      <div
        className={`inline-flex items-center bg-slate-100 border border-slate-300 rounded-lg p-0.5 text-xs ${className}`}
        title={t.common.switchLanguage}
      >
        <button
          type="button"
          onClick={() => setLang('en')}
          className={`px-3 py-1 rounded-md font-semibold transition-all ${
            lang === 'en'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200'
          }`}
          aria-pressed={lang === 'en'}
        >
          🇬🇧 English
        </button>
        <button
          type="button"
          onClick={() => setLang('hi')}
          className={`px-3 py-1 rounded-md font-semibold transition-all ${
            lang === 'hi'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200'
          }`}
          aria-pressed={lang === 'hi'}
        >
          🇮🇳 Hinglish
        </button>
      </div>
    );
  }

  // Compact variant
  return (
    <button
      type="button"
      onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold transition-colors ${
        lang === 'en'
          ? 'bg-sky-50 text-sky-800 border-sky-300 hover:bg-sky-100'
          : 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
      } ${className}`}
      title={t.common.switchLanguage}
    >
      <Globe className="w-3.5 h-3.5" />
      <span>{lang === 'en' ? 'English' : 'Hinglish'}</span>
    </button>
  );
};
