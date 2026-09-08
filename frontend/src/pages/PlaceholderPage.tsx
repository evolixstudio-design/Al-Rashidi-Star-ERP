import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslations } from '../hooks/useTranslations';
import { ArrowLeft, Clock, Sparkles } from 'lucide-react';

interface ModuleDetail {
  nameEn: string;
  nameHi: string;
  phase: string;
  descEn: string;
  descHi: string;
}

const MODULE_MAP: Record<string, ModuleDetail> = {
  '/sales': {
    nameEn: 'Sales & Invoicing',
    nameHi: 'Sales & Invoices (Bikri)',
    phase: 'Phase 3 / Module 04',
    descEn: 'Direct invoice creation, customer ledger, dozen/pcs stock deduction, and WhatsApp click-to-chat reminders.',
    descHi: 'Direct invoice banayein, customer khata, dozen aur pieces stock katauti, aur WhatsApp reminders.',
  },
  '/purchases': {
    nameEn: 'Purchases & Shipments',
    nameHi: 'Purchases & Shipments (Kharidari)',
    phase: 'Phase 2 / Module 03',
    descEn: 'Receive China shipment workflow, supplier purchase ledger, and automatic stock addition.',
    descHi: 'China shipment receiving workflow, supplier khata, aur automatic stock addition.',
  },
  '/stock': {
    nameEn: 'Stock & Inventory Ledger',
    nameHi: 'Stock & Inventory Ledger (Mal)',
    phase: 'Phase 2 / Module 02',
    descEn: 'Dual display (Dozen + Pieces & Total Pcs), article-number instant search, and stock movement ledger.',
    descHi: 'Dozen + Pieces aur Total Pcs dual display, article number instant search, aur stock movement ledger.',
  },
  '/payments': {
    nameEn: 'Payments & Outstanding Ledger',
    nameHi: 'Payments & Outstanding (Hisaab-Kitab)',
    phase: 'Phase 3 / Module 05',
    descEn: 'Paid, Partial, and Pending payment status management, customer receipts, and balance allocation.',
    descHi: 'Paid, Partial, aur Pending payment status management, customer rasid, aur balance hisaab.',
  },
  '/expenses': {
    nameEn: 'Expenses Management',
    nameHi: 'Expenses Management (Kharcha)',
    phase: 'Phase 4 / Module 07',
    descEn: 'Quick business expense entry without complex accounting terminology.',
    descHi: 'Dukan aur karobar ke kharche darj karein bina kisi mushkil accounting ke.',
  },
  '/customers': {
    nameEn: 'Customer Master Directory',
    nameHi: 'Customers Master (Grahak)',
    phase: 'Phase 3 / Module 04',
    descEn: 'Customer directory, outstanding balances, and purchase history.',
    descHi: 'Grahak directory, baqi hisaab, aur kharidari ki history.',
  },
  '/suppliers': {
    nameEn: 'Supplier Master Directory',
    nameHi: 'Suppliers Master (Sellers)',
    phase: 'Phase 2 / Module 03',
    descEn: 'Supplier directory, payable balances, and shipment history.',
    descHi: 'Suppliers directory, dene baqi hisaab, aur maal aane ki history.',
  },
  '/reports': {
    nameEn: 'Business Reports & Analytics',
    nameHi: 'Business Reports & Analytics',
    phase: 'Phase 4 / Module 08',
    descEn: 'Sales, purchases, inventory valuation, and profit reports.',
    descHi: 'Bikri, kharidari, inventory valuation, aur munafa reports.',
  },
};

export const PlaceholderPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t, lang } = useTranslations();

  const moduleInfo = MODULE_MAP[location.pathname] || {
    nameEn: t.placeholder.upcomingModule,
    nameHi: t.placeholder.upcomingModule,
    phase: t.placeholder.nextPhase,
    descEn: t.placeholder.scheduledDesc,
    descHi: t.placeholder.scheduledDesc,
  };

  const title = lang === 'hi' ? moduleInfo.nameHi : moduleInfo.nameEn;
  const desc = lang === 'hi' ? moduleInfo.descHi : moduleInfo.descEn;

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 text-center antialiased text-sm">
      <div className="bg-white rounded-xl p-6 sm:p-8 shadow-xs border border-slate-300">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-sky-50 text-sky-700 border border-sky-200 mb-4">
          <Clock className="w-6 h-6" />
        </div>

        <div className="block mb-3">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-md bg-sky-100 text-sky-800 text-xs font-bold border border-sky-200">
            <Sparkles className="w-3.5 h-3.5 text-sky-600" />
            {moduleInfo.phase}
          </span>
        </div>

        <h1 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">
          {title}
        </h1>

        <p className="text-xs text-slate-600 max-w-lg mx-auto mb-6 leading-relaxed">
          {desc}
        </p>

        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-xs flex items-center gap-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t.placeholder.backToDashboard}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
