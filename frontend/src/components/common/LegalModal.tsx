import React from 'react';
import {
  FileText,
  ShieldCheck,
  X,
  Printer,
  Building2,
  Calendar,
  Lock,
} from 'lucide-react';
import { useLegalHelp } from '../../context/LegalHelpContext';

export const LegalModal: React.FC = () => {
  const { legalOpen, closeLegal, legalTab, setLegalTab } = useLegalHelp();

  if (!legalOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Terms of Service and Privacy Policy"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-xs animate-in fade-in"
    >
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-6 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-600/20 border border-sky-500/30 flex items-center justify-center text-sky-400">
              {legalTab === 'terms' ? (
                <FileText className="w-6 h-6" />
              ) : (
                <ShieldCheck className="w-6 h-6" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white">
                  {legalTab === 'terms'
                    ? 'Terms of Service'
                    : 'Privacy & Data Protection Policy'}
                </h2>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-medium">
                  v1.2.0 • Kuwait
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Al-Rashidi Star General Trading Co. W.L.L. (شركة الرشيدي ستار للتجارة العامة)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors hidden sm:inline-flex"
              title="Print document"
            >
              <Printer className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={closeLegal}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Close legal modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-slate-200 bg-slate-100 px-4 sm:px-6 pt-2">
          <button
            type="button"
            onClick={() => setLegalTab('terms')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all ${
              legalTab === 'terms'
                ? 'border-sky-600 text-sky-700 bg-white rounded-t-lg shadow-xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Terms of Service (شروط الخدمة)</span>
          </button>
          <button
            type="button"
            onClick={() => setLegalTab('privacy')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all ${
              legalTab === 'privacy'
                ? 'border-sky-600 text-sky-700 bg-white rounded-t-lg shadow-xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Privacy Policy (سياسة الخصوصية)</span>
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-5 sm:p-7 overflow-y-auto flex-1 space-y-6 text-slate-700 text-xs sm:text-sm leading-relaxed">
          {legalTab === 'terms' ? (
            /* TERMS OF SERVICE CONTENT */
            <div className="space-y-6">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <Building2 className="w-4 h-4 text-sky-600" />
                  <span>Licensed Enterprise ERP • Commercial Deployment</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Calendar className="w-4 h-4 text-sky-600" />
                  <span>Effective Date: September 2026</span>
                </div>
              </div>

              <section className="space-y-2">
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  1. Acceptance & Authorized Usage
                </h3>
                <p>
                  This enterprise software suite is proprietary software commissioned for <strong>Al-Rashidi Star General Trading Co. W.L.L.</strong> (&ldquo;Company&rdquo;), registered under the commercial regulations of the State of Kuwait. By accessing or using this Enterprise Resource Planning (ERP) application, authorized operators agree to be bound by these Terms of Service.
                </p>
                <p>
                  Access is strictly limited to verified commercial operators, owners, and administrative staff designated by the executive management of Al-Rashidi Star.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  2. User Accounts, Authentication & Security Responsibility
                </h3>
                <p>
                  Each authorized user is issued unique credentials. Users are strictly obligated to maintain password confidentiality and not share operational accounts. Any financial invoice creation, inventory write-off, customer debt reconciliation, or system configuration adjustment is logged in an immutable audit ledger tied to the active user session.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  3. Commercial Invoicing & Transaction Integrity
                </h3>
                <p>
                  All sales invoices generated through this system represent legally binding commercial wholesale transactions. The system operates on standard commercial conventions in the State of Kuwait:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-slate-600">
                  <li>Currencies are recorded in Kuwaiti Dinar (KWD) with three decimal positions (fils).</li>
                  <li>Quantities adhere to wholesale standard dozens (1 Dozen = 12 Pieces) with automated piece-level arithmetic.</li>
                  <li>Cancelled or amended transactions preserve full audit traces and cannot be expunged without executive authorization.</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  4. Third-Party Integrations & WhatsApp Messaging
                </h3>
                <p>
                  The ERP facilitates direct customer communication via WhatsApp protocol integrations. The company remains solely responsible for the content of commercial messages, quotes, payment reminders, and customer agreements transmitted via third-party messaging services.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  5. Intellectual Property & Custom Engineering
                </h3>
                <p>
                  The custom software architecture, visual interface, bilingual typography system, and workflow algorithms were developed by <strong>Evolix Studio</strong> for Al-Rashidi Star. Unauthorized reverse engineering, distribution, or duplication of source code is strictly prohibited.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  6. Governing Law & Kuwait Jurisdiction
                </h3>
                <p>
                  These Terms of Service are governed by and construed in accordance with the commercial and civil laws of the <strong>State of Kuwait</strong>. Any dispute arising out of or in connection with the usage of this software shall be subject to the exclusive jurisdiction of the Courts of Kuwait.
                </p>
              </section>
            </div>
          ) : (
            /* PRIVACY POLICY CONTENT */
            <div className="space-y-6">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <Lock className="w-4 h-4 text-emerald-600" />
                  <span>Enterprise Data Privacy & Security Guarantee</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Calendar className="w-4 h-4 text-emerald-600" />
                  <span>Last Updated: September 2026</span>
                </div>
              </div>

              <section className="space-y-2">
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  1. Scope & Commitment to Business Confidentiality
                </h3>
                <p>
                  Al-Rashidi Star General Trading Co. W.L.L. and its development partners are committed to safeguarding the confidentiality, privacy, and integrity of all operational data, supplier records, wholesale customer profiles, and financial ledgers.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  2. Categories of Information Processed
                </h3>
                <p>
                  The ERP processes the following categories of commercial information solely to conduct daily business:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-slate-600">
                  <li><strong>Wholesale Customer Information:</strong> Trading name, bilingual Arabic/English title, Kuwait mobile/WhatsApp contact numbers, delivery addresses, and credit balance records.</li>
                  <li><strong>Supplier & Procurement Data:</strong> International supplier trade names (China, Kuwait, GCC), contact persons, invoices, and shipment receipts.</li>
                  <li><strong>Product Catalogues & Inventory:</strong> Article numbers, wholesale dozen/piece prices, cost prices, warehouse reorder thresholds, and catalogue photography.</li>
                  <li><strong>User Audit Logs:</strong> Login timestamps, IP/user agent traces, and operational transaction timestamps for security auditing.</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  3. Storage, Encryption & Local Hosting
                </h3>
                <p>
                  All database records are housed in an enterprise PostgreSQL instance utilizing bcrypt password cryptographic hashing and signed JSON Web Tokens (JWT) for session management. Automated daily backups and periodic snapshots ensure high durability and disaster recovery without unauthorized external exposure.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  4. Zero Third-Party Monetization or Sale of Data
                </h3>
                <p>
                  <strong>We do not sell, license, rent, or trade</strong> customer lists, supplier catalogues, pricing matrices, or transaction history to any third-party advertisers, data brokers, or external entities. Data is utilized strictly within the operational scope of Al-Rashidi Star.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  5. Cookie & Local Storage Usage
                </h3>
                <p>
                  The ERP interface employs essential browser local storage strictly for:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-slate-600">
                  <li>Storing the active encrypted session authentication token.</li>
                  <li>Remembering your preferred interface language (English or Hinglish).</li>
                  <li>Caching user interface drawer preferences and invoice layout toggles.</li>
                </ul>
                <p>
                  No third-party tracking or behavioral ad pixels are integrated into this ERP.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  6. Contact for Privacy & Compliance
                </h3>
                <p>
                  For any privacy inquiries, data export requests, or security reports, please reach out to our administration:
                </p>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs space-y-1 text-slate-700">
                  <p className="font-bold text-slate-900">Al-Rashidi Star General Trading Co. W.L.L.</p>
                  <p>Salem Al Mubarak St, Al-Salmiya, Kuwait</p>
                  <p>Email: evolixstudio@gmail.com | Tel: +965 9959 8297</p>
                </div>
              </section>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-4 sm:px-6 py-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div>
            <span>Official Legal Documentation • State of Kuwait</span>
          </div>
          <button
            type="button"
            onClick={closeLegal}
            className="px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors"
          >
            Understood & Close
          </button>
        </div>
      </div>
    </div>
  );
};
