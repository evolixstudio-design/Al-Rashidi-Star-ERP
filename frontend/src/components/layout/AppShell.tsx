import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTranslations } from '../../hooks/useTranslations';
import { LanguageSwitcher } from '../common/LanguageSwitcher';
import rashidiLogo from '../../assets/rashidi-star-logo.jpg';
import {
  Home,
  ShoppingCart,
  PackagePlus,
  Boxes,
  CircleDollarSign,
  Receipt,
  Users,
  Truck,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  AlertTriangle,
  History,
  BookOpen,
  HelpCircle,
} from 'lucide-react';
import { useLegalHelp } from '../../context/LegalHelpContext';
import { AppFooter } from '../common/AppFooter';

export const AppShell: React.FC = () => {
  const { user, logout } = useAuth();
  const { t } = useTranslations();
  const { openFaq, openTerms, openPrivacy, openCookieSettings } = useLegalHelp();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const navItems = [
    { to: '/', label: t.nav.home, icon: Home },
    { to: '/sales', label: t.nav.sales, icon: ShoppingCart },
    { to: '/purchases', label: t.nav.purchases, icon: PackagePlus },
    { to: '/stock', label: t.nav.stock, icon: Boxes },
    { to: '/payments', label: t.nav.payments, icon: CircleDollarSign },
    { to: '/expenses', label: t.nav.expenses, icon: Receipt },
    { to: '/customers', label: t.nav.customers, icon: Users },
    { to: '/suppliers', label: t.nav.suppliers, icon: Truck },
    { to: '/reports', label: t.nav.reports, icon: BarChart3 },
    { to: '/audit', label: 'Audit Trail', icon: History },
    { to: '/catalogue-builder', label: 'Catalogue Builder', icon: BookOpen },
    { to: '/settings', label: t.nav.settings, icon: Settings },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-900 antialiased text-sm">
      {/* Top Header - High contrast professional ERP bar */}
      <header className="bg-slate-900 text-white shadow-sm z-30 sticky top-0 border-b border-slate-700/80">
        <div className="px-3 sm:px-5 h-14 flex items-center justify-between">
          {/* Brand & Mobile Hamburger */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 focus:ring-2 focus:ring-sky-500"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div className="flex items-center gap-2.5">
              <img
                src={rashidiLogo}
                alt="Rashidi Star"
                className="w-9 h-9 rounded-lg object-contain bg-white p-0.5 border border-slate-700 shadow-xs"
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-base text-white tracking-tight">
                    {t.app.title}
                  </span>
                  <span className="text-sky-400 text-xs font-medium hidden sm:inline dir-rtl">
                    {t.app.arabicTitle}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 font-medium hidden sm:block leading-none">
                  Kuwait Wholesale & Retail ERP
                </div>
              </div>
            </div>
          </div>

          {/* Right Header Controls: Language Switcher, Help & FAQ, User Badge & Logout */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language Switcher */}
            <LanguageSwitcher variant="navbar" />

            {/* Help & FAQ Button */}
            <button
              type="button"
              onClick={openFaq}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold transition-all"
              title="Help Center & FAQs"
              aria-label="Open Help & FAQ"
            >
              <HelpCircle className="w-4 h-4 text-sky-400" />
              <span className="hidden md:inline">Help</span>
            </button>

            {/* Active User Badge */}
            {user && (
              <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 px-2.5 py-1 rounded-lg">
                <div className="relative">
                  <span className="w-6 h-6 rounded-full bg-sky-600 text-white flex items-center justify-center font-bold text-xs">
                    {user.displayName.charAt(0)}
                  </span>
                  <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-slate-900"></span>
                </div>
                <div className="text-left hidden md:block leading-tight">
                  <div className="text-xs font-semibold text-white">
                    {user.displayName}
                  </div>
                  <div className="text-[10px] text-emerald-400 font-medium">
                    {t.common.activeOwner}
                  </div>
                </div>
              </div>
            )}

            {/* Logout Button */}
            <button
              type="button"
              onClick={() => setShowLogoutConfirm(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-rose-900/30 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/40 text-xs font-semibold transition-all"
              title={t.auth.logout}
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">{t.auth.logout}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Layout Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Fixed Left Sidebar (Desktop) - High contrast & professional density */}
        <aside className="hidden lg:flex lg:flex-col w-60 bg-slate-900 text-slate-200 border-r border-slate-700/80 select-none">
          <div className="p-3 flex-1 overflow-y-auto space-y-1">
            <div className="px-2.5 pb-2 pt-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {t.nav.mainMenu}
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-sky-600 text-white font-semibold shadow-xs'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{item.label}</span>
                </NavLink>
              );
            })}
          </div>

          {/* Quick Footer inside sidebar */}
          <div className="p-3 bg-slate-950/80 border-t border-slate-800 text-[11px] text-slate-400 space-y-1.5 text-center">
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={openFaq}
                className="hover:text-sky-400 transition-colors"
              >
                Help & FAQ
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={openTerms}
                className="hover:text-sky-400 transition-colors"
              >
                Terms
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={openPrivacy}
                className="hover:text-sky-400 transition-colors"
              >
                Privacy
              </button>
            </div>
            <div className="text-[10px] text-slate-400">
              Developed by{' '}
              <a
                href="https://evolix-studio.in"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sky-400 hover:text-sky-300 font-semibold underline underline-offset-2"
              >
                Evolix Studio
              </a>
            </div>
            <div className="text-[10px] text-slate-500">
              {t.common.version} • Kuwait ERP
            </div>
          </div>
        </aside>

        {/* Mobile Slide-over Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-40 flex">
            <div
              className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs"
              onClick={() => setMobileMenuOpen(false)}
            ></div>
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-slate-900 text-white p-4 z-50 shadow-2xl border-r border-slate-700">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="font-bold text-sm text-white">{t.nav.menu}</span>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="mt-3 space-y-1 overflow-y-auto flex-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.to === '/'}
                      onClick={() => setMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium ${
                          isActive
                            ? 'bg-sky-600 text-white shadow-xs'
                            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                        }`
                      }
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span>{item.label}</span>
                    </NavLink>
                  );
                })}
              </div>

              {/* Mobile Drawer Legal & Help Footer */}
              <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex flex-col items-center justify-center gap-2">
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      openFaq();
                    }}
                    className="hover:text-sky-400 transition-colors"
                  >
                    Help & FAQ
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      openTerms();
                    }}
                    className="hover:text-sky-400 transition-colors"
                  >
                    Terms
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      openPrivacy();
                    }}
                    className="hover:text-sky-400 transition-colors"
                  >
                    Privacy
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      openCookieSettings();
                    }}
                    className="hover:text-sky-400 transition-colors"
                  >
                    Cookies
                  </button>
                </div>
                <div className="text-[10px] text-slate-400">
                  Developed by{' '}
                  <a
                    href="https://evolix-studio.in"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sky-400 hover:text-sky-300 font-semibold underline underline-offset-2"
                  >
                    Evolix Studio
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto flex flex-col justify-between bg-slate-100">
          <div className="p-4 sm:p-5 lg:p-6 flex-1">
            <Outlet />
          </div>
          <AppFooter variant="embedded" />
        </main>
      </div>

      {/* Logout Confirmation Dialog (Spec 05: Sensitive action confirmation) */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-sm w-full p-5 shadow-xl border border-slate-300">
            <div className="flex items-center gap-3 mb-3 text-amber-600">
              <div className="w-9 h-9 rounded-lg bg-amber-100 border border-amber-200 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-amber-700" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {t.auth.logout}
                </h3>
                <p className="text-xs text-slate-500">
                  {t.auth.confirm}
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-700 mb-5 leading-relaxed">
              {t.auth.confirmLogout}
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="px-3.5 py-1.5 rounded-lg border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-100 transition-colors"
              >
                {t.common.cancel}
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-xs transition-colors"
              >
                {t.auth.yesLogout}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
