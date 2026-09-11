import React, { useState, useMemo } from 'react';
import {
  HelpCircle,
  X,
  Search,
  ChevronDown,
  ChevronUp,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  BookOpen,
  FileText,
  ShieldCheck,
} from 'lucide-react';
import { useLegalHelp } from '../../context/LegalHelpContext';
import { normalizeSearchText } from '../../utils/searchUtils';

interface FaqItem {
  id: string;
  category: string;
  question: string;
  questionAr?: string;
  answer: string;
}

const FAQ_DATA: FaqItem[] = [
  {
    id: 'dozens-calc',
    category: 'Sales & Invoicing',
    question: 'How do Dozen and Pieces calculations work in the ERP?',
    answer:
      'In Kuwait wholesale trading, items are handled in Dozens (1 Dozen = 12 Pieces). When creating invoices or recording purchases, you can enter quantities in both Dozen and individual Pieces. The system automatically computes Total Pieces = (Dozens × 12) + Pieces, and calculates the unit price per piece as (Dozen Price / 12).',
  },
  {
    id: 'whatsapp-sharing',
    category: 'WhatsApp Sharing',
    question: 'How can I send invoices directly to customers on WhatsApp?',
    answer:
      'Open any sales invoice and click the green "WhatsApp" button. You can choose between sending a bilingual formatted text summary with an itemized breakdown or generating and sharing a high-resolution invoice image directly to the customer’s phone number (+965 Kuwait or international).',
  },
  {
    id: 'print-invoice',
    category: 'Sales & Invoicing',
    question: 'How do I print or export invoices for customers?',
    answer:
      'Click "Print Voucher" or "Export PDF" from the Sales Invoice screen. The ERP generates a Kuwait-standard bilingual layout (English & Arabic) complete with company logo, customer phone/address, payment terms, and total amounts formatted in Kuwaiti Dinar (KWD with 3 decimal places).',
  },
  {
    id: 'customer-credit',
    category: 'Payments & Ledger',
    question: 'How are customer credit accounts and pending balances tracked?',
    answer:
      'Every customer has a live balance ledger. When you sell goods on Credit (Amanat / Ajel), the customer balance increases. Go to the "Payments" module to record incoming cash or K-Net payments. The system updates their balance in real-time and logs an immutable audit trail.',
  },
  {
    id: 'stock-reorder',
    category: 'Inventory & Stock',
    question: 'How do low-stock alerts and reorder levels work?',
    answer:
      'Each product has a configurable reorder level in pieces (e.g. 24 pcs / 2 Dozens). When warehouse stock reaches or falls below this number, the product is highlighted with an amber/red warning badge on both the Stock and Sales screens to prevent stockouts.',
  },
  {
    id: 'roles-permissions',
    category: 'Security & Access',
    question: 'What are the user roles and permission differences?',
    answer:
      'The ERP provides two primary security tiers: Owners (Yusuf ali jath wala, Aliasgar jath wala) who have full control over sensitive financial reports, P&L, expense approvals, and company settings; and Admins (Evolix Admin) who manage daily operations, inventory, and system maintenance.',
  },
  {
    id: 'backup-recovery',
    category: 'Security & Access',
    question: 'How is business data protected and backed up?',
    answer:
      'The database uses PostgreSQL with automated transaction logging. You can also generate one-click manual database backups (SQL dump and JSON snapshot) at any time under Settings → Data Backup to archive onto an external drive or cloud storage.',
  },
  {
    id: 'catalogue-builder',
    category: 'Sales & Invoicing',
    question: 'How do I generate a wholesale product catalogue for buyers?',
    answer:
      'Navigate to the "Catalogue Builder" page from the left sidebar. You can select products, customize wholesale prices, and download a multi-page PDF brochure featuring product photos, Kuwait skyline branding, and company contact details to share with retail shop owners.',
  },
];

const CATEGORIES = [
  'All',
  'Sales & Invoicing',
  'WhatsApp Sharing',
  'Inventory & Stock',
  'Payments & Ledger',
  'Security & Access',
];

export const HelpFaqModal: React.FC = () => {
  const { faqOpen, closeFaq, openTerms, openPrivacy } = useLegalHelp();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>('dozens-calc');

  const filteredFaqs = useMemo(() => {
    return FAQ_DATA.filter((item) => {
      const matchesCategory =
        selectedCategory === 'All' || item.category === selectedCategory;
      const q = normalizeSearchText(searchQuery);
      const matchesSearch =
        !q ||
        normalizeSearchText(item.question).includes(q) ||
        normalizeSearchText(item.answer).includes(q) ||
        normalizeSearchText(item.category).includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  if (!faqOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Frequently Asked Questions & Support"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-xs animate-in fade-in"
    >
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-6 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-600/20 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white">
                  Help Center & FAQs
                </h2>
                <span className="text-xs px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-medium">
                  Al-Rashidi Star ERP
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Quick answers, operational guides, and technical support
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeFaq}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close help modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Category Pills */}
        <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200 space-y-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search help topics (e.g. invoice, whatsapp, dozen, backup, payments)..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Accordion FAQ Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-2.5">
          {filteredFaqs.length === 0 ? (
            <div className="text-center py-10">
              <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">
                No matching topics found
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Try searching with different terms or contact support below.
              </p>
            </div>
          ) : (
            filteredFaqs.map((faq) => {
              const isExpanded = expandedId === faq.id;
              return (
                <div
                  key={faq.id}
                  className={`rounded-xl border transition-all ${
                    isExpanded
                      ? 'border-sky-300 bg-sky-50/40 shadow-xs'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setExpandedId(isExpanded ? null : faq.id)}
                    className="w-full text-left p-3.5 sm:p-4 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-[11px] font-semibold text-sky-600 uppercase tracking-wide bg-sky-100 px-2 py-0.5 rounded-md hidden sm:inline-block">
                        {faq.category}
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-slate-900">
                        {faq.question}
                      </span>
                    </div>
                    <div className="text-slate-400 flex-shrink-0">
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-sky-600" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-4 pt-1 text-xs text-slate-700 leading-relaxed border-t border-sky-100/80">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })
          )}

          {/* Technical Support Box */}
          <div className="mt-6 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white p-4 sm:p-5 border border-slate-700">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Direct Technical Support & Inquiries</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                </h4>
                <p className="text-xs text-slate-300 mt-1">
                  Operated for Al-Rashidi Star General Trading Co. W.L.L. (Kuwait)
                </p>
                <div className="mt-3 flex flex-wrap gap-y-2 gap-x-4 text-xs text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-sky-400" />
                    <span>+965 9959 8297</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-sky-400" />
                    <span>evolixstudio@gmail.com</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <ExternalLink className="w-3.5 h-3.5 text-sky-400" />
                    <a
                      href="https://evolix-studio.in"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sky-400 hover:text-sky-300 underline font-semibold"
                    >
                      evolix-studio.in
                    </a>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-sky-400" />
                    <span>Salem Al Mubarak St, Al-Salmiya, Kuwait</span>
                  </div>
                </div>
              </div>

              <a
                href="https://wa.me/96599598297?text=Hello%20Rashidi%20Star%20ERP%20Support"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition-colors flex-shrink-0"
              >
                <span>Chat on WhatsApp</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-4 sm:px-6 py-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                closeFaq();
                openTerms();
              }}
              className="hover:text-slate-800 underline underline-offset-2 flex items-center gap-1"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Terms of Service</span>
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => {
                closeFaq();
                openPrivacy();
              }}
              className="hover:text-slate-800 underline underline-offset-2 flex items-center gap-1"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Privacy Policy</span>
            </button>
          </div>
          <button
            type="button"
            onClick={closeFaq}
            className="px-4 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
