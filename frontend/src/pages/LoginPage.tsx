import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslations } from '../hooks/useTranslations';
import { LanguageSwitcher } from '../components/common/LanguageSwitcher';
import api from '../services/api';
import rashidiLogo from '../assets/rashidi-star-logo.jpg';
import { ShieldCheck, UserCheck, Lock, Eye, EyeOff } from 'lucide-react';
import { useLegalHelp } from '../context/LegalHelpContext';

interface OwnerOption {
  id: number;
  username: string;
  displayName: string;
}

export const LoginPage: React.FC = () => {
  const { login, user } = useAuth();
  const { t } = useTranslations();
  const { openFaq, openTerms, openPrivacy, openCookieSettings } = useLegalHelp();
  const navigate = useNavigate();

  const [owners, setOwners] = useState<OwnerOption[]>([
    { id: 1, username: 'owner1', displayName: 'Yusuf ali jath wala' },
    { id: 2, username: 'owner2', displayName: 'Aliasgar jath wala' },
  ]);
  const [selectedUsername, setSelectedUsername] = useState<string>('owner1');
  const [isManualEntry, setIsManualEntry] = useState<boolean>(false);
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // If already logged in, redirect to home
  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  // Fetch active owners from backend
  useEffect(() => {
    const fetchOwners = async () => {
      try {
        const res = await api.get('/users/public-owners');
        if (res.data && res.data.length > 0) {
          setOwners(res.data);
          setSelectedUsername(res.data[0].username);
        }
      } catch {
        // Fallback default owners are already set
      }
    };
    fetchOwners();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setErrorMsg(t.auth.passwordRequired);
      return;
    }

    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      await login(selectedUsername, password);
      navigate('/', { replace: true });
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        t.auth.invalidCredentials;
      setErrorMsg(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4 antialiased text-sm">
      {/* Top right language switcher */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
        <LanguageSwitcher variant="light" />
      </div>

      {/* Brand Header */}
      <div className="max-w-md w-full text-center mb-5">
        <div className="flex justify-center mb-3">
          <img
            src={rashidiLogo}
            alt="Rashidi Star"
            className="w-24 h-24 sm:w-28 sm:h-28 object-contain rounded-2xl shadow-sm border border-slate-200 bg-white p-1"
          />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-serif">
          Rashidi Star ERP
        </h1>
        <p className="text-sm font-semibold text-slate-700 dir-rtl mb-2 font-arabic">
          شركة الرشيدي ستار للتجارة العامة
        </p>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold shadow-xs">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
          <span>Owner Login</span>
        </div>
      </div>

      {/* Main Login Card - High Contrast & Normal Font Sizing */}
      <div className="max-w-md w-full bg-white rounded-xl shadow-md border border-slate-300 p-5 sm:p-6">
        <div className="mb-4 pb-3 border-b border-slate-200">
          <h2 className="text-base font-bold text-slate-900">
            {t.auth.welcome}
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            {t.auth.selectOwner}
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-300 text-rose-800 text-xs font-medium flex items-start gap-2">
            <span className="text-sm leading-none">⚠️</span>
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Quick Owner Selector Cards */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              {t.auth.username} / {t.auth.selectOwner}
            </label>
            {!isManualEntry ? (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {owners.map((owner) => {
                    const isSelected = selectedUsername === owner.username;
                    return (
                      <button
                        key={owner.username}
                        type="button"
                        onClick={() => {
                          setSelectedUsername(owner.username);
                          setErrorMsg(null);
                        }}
                        className={`p-3 rounded-lg text-left border transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'border-sky-600 bg-sky-50/70 shadow-xs ring-1 ring-sky-500'
                            : 'border-slate-300 bg-white hover:bg-slate-50 hover:border-slate-400 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span
                            className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                              isSelected
                                ? 'bg-sky-600 text-white'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {owner.displayName.charAt(0)}
                          </span>
                          {isSelected && (
                            <UserCheck className="w-4 h-4 text-sky-600" />
                          )}
                        </div>
                        <span className="font-semibold text-slate-900 text-xs leading-tight">
                          {owner.displayName}
                        </span>
                        <span className="text-[11px] text-slate-500 mt-0.5">
                          {t.auth.fullAccess}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsManualEntry(true);
                    setSelectedUsername('');
                  }}
                  className="w-full text-xs font-semibold text-sky-600 hover:text-sky-700 py-1.5"
                >
                  + Login with Email / Admin
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <input
                  id="login-username"
                  type="text"
                  value={selectedUsername}
                  onChange={(e) => setSelectedUsername(e.target.value)}
                  placeholder="Enter email or username (e.g. evolixstudio@gmail.com)"
                  autoComplete="username"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm placeholder-slate-400 focus:border-sky-600 focus:ring-2 focus:ring-sky-200 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => {
                    setIsManualEntry(false);
                    setSelectedUsername(owners.length > 0 ? owners[0].username : 'owner1');
                  }}
                  className="w-full text-xs font-semibold text-slate-500 hover:text-slate-700 py-1.5"
                >
                  ← Back to Quick Login
                </button>
              </div>
            )}
          </div>

          {/* Password Input */}
          <div>
            <label
              htmlFor="login-password"
              className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
            >
              {t.auth.password}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t.auth.passwordPlaceholder}
                autoComplete="current-password"
                className="w-full pl-9 pr-10 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm placeholder-slate-400 focus:border-sky-600 focus:ring-2 focus:ring-sky-200 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-800"
                aria-label="Toggle password visibility"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 px-4 rounded-lg bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white font-semibold text-sm shadow-xs transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>{t.auth.loggingIn}</span>
              </>
            ) : (
              <span>{t.auth.loginButton}</span>
            )}
          </button>
        </form>

        <div className="mt-4 pt-3 border-t border-slate-200 text-center">
          <p className="text-[11px] text-slate-500">
            {t.auth.secureAccess}
          </p>
        </div>
      </div>

      <footer className="mt-6 text-center text-xs text-slate-500 space-y-2 select-none">
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs">
          <button
            type="button"
            onClick={openFaq}
            className="hover:text-slate-900 font-medium transition-colors"
          >
            Help & FAQ
          </button>
          <span>•</span>
          <button
            type="button"
            onClick={openTerms}
            className="hover:text-slate-900 font-medium transition-colors"
          >
            Terms of Service
          </button>
          <span>•</span>
          <button
            type="button"
            onClick={openPrivacy}
            className="hover:text-slate-900 font-medium transition-colors"
          >
            Privacy Policy
          </button>
          <span>•</span>
          <button
            type="button"
            onClick={openCookieSettings}
            className="hover:text-slate-900 font-medium transition-colors"
          >
            Cookie Preferences
          </button>
        </div>
        <div className="text-xs text-slate-500">
          <span>Developed by </span>
          <a
            href="https://evolix-studio.in"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-sky-600 hover:text-sky-700 underline underline-offset-2 transition-colors"
          >
            Evolix Studio
          </a>
        </div>
        <div className="text-[11px] text-slate-400">
          Rashidi Star ERP • State of Kuwait • {t.app.copyright}
        </div>
      </footer>
    </div>
  );
};
