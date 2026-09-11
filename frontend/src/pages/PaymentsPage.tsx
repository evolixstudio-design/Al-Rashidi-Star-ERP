import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslations } from '../hooks/useTranslations';
import api from '../services/api';
import {
  CreditCard,
  Plus,
  Search,
  CheckCircle2,
  X,
  FileText,
  Printer,
  MessageCircle,
  DollarSign,
  Clock,
  Calendar,
  AlertTriangle,
  AlertCircle,
  Layers,
  History,
} from 'lucide-react';
import { TransactionAuditModal } from '../components/common/TransactionAuditModal';
import { openWhatsAppWithText } from '../services/whatsappService';

import { normalizeSearchText } from '../utils/searchUtils';
import { CustomerCombobox } from '../components/common/CustomerCombobox';

/* ───────────────────── Types ───────────────────── */

interface CustomerOption {
  id: number;
  name: string;
  nameAr?: string;
  phone?: string;
  totalOutstandingKd: number;
}

interface CustomerReceiptItem {
  id: number;
  receiptNumber: string;
  receiptDate: string;
  amountKd: number;
  paymentMethod: string;
  referenceNo?: string;
  notes?: string;
  createdAt: string;
  customer?: {
    id: number;
    name: string;
    nameAr?: string;
    phone?: string;
  };
  invoice?: {
    id: number;
    invoiceNumber: string;
    invoiceDate?: string;
    totalAmountKd?: number;
    grandTotalAmountKd?: number;
    amountReceivedKd?: number;
    outstandingKd?: number;
    balanceKd?: number;
    paymentStatus?: string;
  };
}

export const PaymentsPage: React.FC = () => {
  const { t, lang } = useTranslations();
  const [searchParams] = useSearchParams();

  /* ── State ── */
  const [receipts, setReceipts] = useState<CustomerReceiptItem[]>([]);
  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState('ALL');
  const [toast, setToast] = useState('');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewReceiptModal, setViewReceiptModal] = useState<CustomerReceiptItem | null>(null);
  const [auditReceipt, setAuditReceipt] = useState<CustomerReceiptItem | null>(null);

  // Form states
  const [customerId, setCustomerId] = useState<number | ''>('');
  const [invoiceId, setInvoiceId] = useState<number | ''>('');
  const [amountKd, setAmountKd] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [receiptDate, setReceiptDate] = useState(new Date().toISOString().split('T')[0]);
  const [referenceNo, setReferenceNo] = useState('');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState('');
  const [pendingInvoices, setPendingInvoices] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  /* ── Data Fetching ── */
  const fetchReceipts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/payments');
      setReceipts(res.data);
    } catch (err) {
      console.error('Failed to load receipts', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCustomers = useCallback(async () => {
    try {
      const res = await api.get('/customers');
      setCustomers(res.data);
    } catch (err) {
      console.error('Failed to load customers', err);
    }
  }, []);

  useEffect(() => {
    fetchReceipts();
    fetchCustomers();
  }, [fetchReceipts, fetchCustomers]);

  // Handle ?customerId= query param
  useEffect(() => {
    const cid = searchParams.get('customerId');
    if (cid && customers.length > 0) {
      const found = customers.find((c) => c.id === Number(cid));
      if (found) {
        setCustomerId(found.id);
        setShowAddModal(true);
      }
    }
  }, [searchParams, customers]);

  // When customerId changes, load their pending invoices
  useEffect(() => {
    if (!customerId) {
      setPendingInvoices([]);
      setInvoiceId('');
      return;
    }

    const loadCustomerInvoices = async () => {
      try {
        const res = await api.get(`/customers/${customerId}/pending-invoices`);
        setPendingInvoices(res.data);
      } catch (err) {
        console.error('Failed to fetch pending invoices', err);
        setPendingInvoices([]);
      }
    };

    loadCustomerInvoices();
  }, [customerId]);

  const showSuccessToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 4000);
  };

  const resetForm = () => {
    setCustomerId('');
    setInvoiceId('');
    setAmountKd('');
    setPaymentMethod('CASH');
    setReceiptDate(new Date().toISOString().split('T')[0]);
    setReferenceNo('');
    setNotes('');
    setFormError('');
    setShowAddModal(false);
  };

  /* ── Submit Payment ── */
  const handleSavePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId) {
      setFormError('Please select a customer.');
      return;
    }

    const parsedAmount = Number(amountKd);
    if (!parsedAmount || parsedAmount <= 0) {
      setFormError('Please enter a valid amount greater than zero.');
      return;
    }

    try {
      setSaving(true);
      setFormError('');

      const payload = {
        customerId: Number(customerId),
        invoiceId: invoiceId ? Number(invoiceId) : undefined,
        amountKd: parsedAmount,
        paymentMethod,
        receiptDate,
        notes: notes.trim() ? `${referenceNo ? `Ref: ${referenceNo} | ` : ''}${notes.trim()}` : referenceNo ? `Ref: ${referenceNo}` : undefined,
      };

      const res = await api.post('/payments', payload);
      showSuccessToast(t.payments.paymentSuccess);
      resetForm();
      fetchReceipts();
      fetchCustomers();

      // Open receipt viewer
      setViewReceiptModal(res.data);
    } catch (err: any) {
      setFormError(err.response?.data?.message || t.common.error);
    } finally {
      setSaving(false);
    }
  };

  /* ── WhatsApp Payment Confirmation ── */
  const sendWhatsAppConfirmation = (rcpt: CustomerReceiptItem) => {
    const phone = rcpt.customer?.phone;
    if (!phone) {
      alert(lang === 'hi' ? 'Mobile number add karenge to WhatsApp available hoga.' : 'Please add a customer phone number to send WhatsApp message.');
      return;
    }

    if (rcpt.invoice) {
      const invTotal = Number(rcpt.invoice.totalAmountKd ?? rcpt.invoice.grandTotalAmountKd ?? 0);
      const balance = Number(rcpt.invoice.outstandingKd ?? rcpt.invoice.balanceKd ?? 0);
      const isFullPaid = balance <= 0.0001 && (invTotal > 0 || rcpt.invoice.paymentStatus === 'PAID');
      const totalPaid = isFullPaid
        ? invTotal
        : Number(rcpt.invoice.amountReceivedKd ?? (invTotal > balance ? invTotal - balance : rcpt.amountKd));

      openWhatsAppWithText(
        {
          receiptNumber: rcpt.receiptNumber,
          customerName: rcpt.customer?.name,
          customerPhone: phone,
          date: rcpt.receiptDate,
          amountReceived: rcpt.amountKd,
          paymentMethod: rcpt.paymentMethod,
          invoiceNumber: rcpt.invoice.invoiceNumber,
          invoiceDate: rcpt.invoice.invoiceDate,
          invoiceTotal: invTotal,
          totalPaid: totalPaid,
          outstandingAmount: balance,
          paymentStatus: isFullPaid ? 'PAID' : 'PARTIAL',
        },
        isFullPaid ? 'FULL_PAYMENT_RECEIPT' : 'PARTIAL_PAYMENT_RECEIPT'
      );
    } else {
      // Generic payment confirmation from Payments page
      const custObj = customers.find((c) => c.id === rcpt.customer?.id);
      const customerOutstanding = custObj ? custObj.totalOutstandingKd : 0;

      openWhatsAppWithText(
        {
          receiptNumber: rcpt.receiptNumber,
          customerName: rcpt.customer?.name,
          customerPhone: phone,
          date: rcpt.receiptDate,
          amountReceived: rcpt.amountKd,
          paymentMethod: rcpt.paymentMethod,
          outstandingAmount: customerOutstanding,
        },
        'SIMPLE_CONFIRMATION'
      );
    }
  };

  /* ── Filtering & Totals ── */
  const filteredReceipts = useMemo(() => {
    return receipts.filter((r) => {
      const q = normalizeSearchText(search);
      const matchesSearch =
        normalizeSearchText(r.receiptNumber).includes(q) ||
        normalizeSearchText(r.customer?.name).includes(q) ||
        normalizeSearchText(r.invoice?.invoiceNumber).includes(q);

      if (!matchesSearch) return false;
      if (methodFilter !== 'ALL' && r.paymentMethod !== methodFilter) return false;
      return true;
    });
  }, [receipts, search, methodFilter]);

  const totalCollectedKd = useMemo(() => {
    return receipts.reduce((sum, r) => sum + Number(r.amountKd || 0), 0);
  }, [receipts]);

  const todayStr = new Date().toISOString().split('T')[0];
  const currentMonthPrefix = todayStr.substring(0, 7);

  const thisMonthReceipts = useMemo(() => {
    return receipts.filter((r) => r.receiptDate && r.receiptDate.startsWith(currentMonthPrefix));
  }, [receipts, currentMonthPrefix]);

  const thisMonthCollectedKd = useMemo(() => {
    return thisMonthReceipts.reduce((sum, r) => sum + Number(r.amountKd || 0), 0);
  }, [thisMonthReceipts]);

  const todayReceipts = useMemo(() => {
    return receipts.filter((r) => r.receiptDate === todayStr);
  }, [receipts, todayStr]);

  const todayCollectedKd = useMemo(() => {
    return todayReceipts.reduce((sum, r) => sum + Number(r.amountKd || 0), 0);
  }, [todayReceipts]);

  const avgReceiptKd = useMemo(() => {
    return receipts.length > 0 ? totalCollectedKd / receipts.length : 0;
  }, [receipts, totalCollectedKd]);

  const selectedCustomerObj = customers.find((c) => c.id === customerId);

  return (
    <div className="space-y-6 pb-12 antialiased">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-2 text-sm font-semibold animate-fade-in">
          <CheckCircle2 size={18} />
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <AlertTriangle className="w-5 h-5" />
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
              <CreditCard size={20} className="text-emerald-400" />
            </div>
            <span>{t.payments.title}</span>
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            {t.payments.subtitle}
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            resetForm();
            setShowAddModal(true);
          }}
          className="px-5 py-2.5 bg-slate-900 hover:bg-black text-white font-bold text-sm rounded-xl shadow-md inline-flex items-center gap-2 transition-all cursor-pointer hover:shadow-lg active:scale-98 self-start sm:self-auto"
        >
          <Plus size={16} className="text-emerald-400 stroke-[2.5]" />
          <span>{t.payments.receivePayment}</span>
        </button>
      </div>

      {/* 4 Clean Compact KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Receipts</span>
            <span className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <DollarSign size={16} />
            </span>
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-700">
            KD {totalCollectedKd.toFixed(3)}
          </div>
          <div className="text-xs text-slate-400 mt-1">{receipts.length} total receipts</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">This Month</span>
            <span className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <Calendar size={16} />
            </span>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">
            KD {thisMonthCollectedKd.toFixed(3)}
          </div>
          <div className="text-xs text-slate-400 mt-1">{thisMonthReceipts.length} entries this month</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Today</span>
            <span className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <Clock size={16} />
            </span>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">
            KD {todayCollectedKd.toFixed(3)}
          </div>
          <div className="text-xs text-slate-400 mt-1">{todayReceipts.length} entries today</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Average / Entry</span>
            <span className="p-2 rounded-lg bg-slate-50 text-slate-600">
              <Layers size={16} />
            </span>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">
            KD {avgReceiptKd.toFixed(3)}
          </div>
          <div className="text-xs text-slate-400 mt-1">per payment received</div>
        </div>
      </div>

      {/* Organized Filter Bar */}
      <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search receipt number, customer, invoice..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {[
            { id: 'ALL', label: 'All Methods' },
            { id: 'CASH', label: 'Cash' },
            { id: 'KNET', label: 'K-Net' },
            { id: 'BANK_TRANSFER', label: 'Bank Transfer' },
            { id: 'CHEQUE', label: 'Cheque' },
          ].map((tab) => {
            const active = methodFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setMethodFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  active
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Receipts List - Responsive Table on Desktop, Cards on Mobile */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-500 font-medium text-sm">
            {t.common.loading}
          </div>
        ) : filteredReceipts.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <CreditCard size={44} className="mx-auto mb-3 opacity-30 text-slate-400" />
            <p className="font-semibold text-slate-600">{t.payments.noPayments}</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm min-w-[850px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4 whitespace-nowrap">{t.payments.receiptNo}</th>
                    <th className="py-3 px-4">{t.payments.customer}</th>
                    <th className="py-3 px-4 whitespace-nowrap">{t.payments.date}</th>
                    <th className="py-3 px-4 whitespace-nowrap">{t.payments.allocatedInvoice}</th>
                    <th className="py-3 px-4 whitespace-nowrap">{t.payments.paymentMethod}</th>
                    <th className="py-3 px-4 whitespace-nowrap text-right">{t.payments.amountKd}</th>
                    <th className="py-3 px-4 whitespace-nowrap text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {filteredReceipts.map((rcpt) => (
                    <tr
                      key={rcpt.id}
                      className="hover:bg-slate-50/75 transition-colors"
                    >
                      <td className="py-3 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                        {rcpt.receiptNumber}
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">
                          {rcpt.customer?.name || 'Customer'}
                        </div>
                        {rcpt.customer?.nameAr && (
                          <div className="text-xs text-slate-500 font-arabic">
                            {rcpt.customer.nameAr}
                          </div>
                        )}
                        {rcpt.customer?.phone && (
                          <div className="text-xs text-slate-400 mt-0.5">
                            {rcpt.customer.phone}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                        {rcpt.receiptDate}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        {rcpt.invoice ? (
                          <span className="font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-md text-xs">
                            {rcpt.invoice.invoiceNumber}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs italic">
                            General Account Credit
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                          {rcpt.paymentMethod}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right font-bold text-emerald-700 text-base whitespace-nowrap">
                        KD {Number(rcpt.amountKd).toFixed(3)}
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5 justify-end">
                          <button
                            type="button"
                            onClick={() => setViewReceiptModal(rcpt)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition-colors inline-flex items-center gap-1 cursor-pointer"
                            title="View Receipt Voucher"
                          >
                            <FileText size={13} />
                            <span>View</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setViewReceiptModal(rcpt);
                              setTimeout(() => window.print(), 150);
                            }}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition-colors inline-flex items-center gap-1 cursor-pointer"
                            title="Print Voucher"
                          >
                            <Printer size={13} />
                            <span>Print</span>
                          </button>

                          {rcpt.customer?.phone && (
                            <button
                              type="button"
                              onClick={() => sendWhatsAppConfirmation(rcpt)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg transition-colors inline-flex items-center gap-1 cursor-pointer shadow-xs"
                              title="Send WhatsApp Confirmation"
                            >
                              <MessageCircle size={13} />
                              <span>WhatsApp</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => setAuditReceipt(rcpt)}
                            className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="View Transaction Audit Trail"
                          >
                            <History size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List (< md breakpoint) */}
            <div className="md:hidden divide-y divide-slate-100">
              {filteredReceipts.map((rcpt) => (
                <div key={rcpt.id} className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-slate-900 text-sm">
                      {rcpt.receiptNumber}
                    </span>
                    <span className="font-bold text-emerald-700 text-base">
                      KD {Number(rcpt.amountKd).toFixed(3)}
                    </span>
                  </div>

                  <div>
                    <div className="font-bold text-slate-900">{rcpt.customer?.name || 'Customer'}</div>
                    {rcpt.customer?.nameAr && (
                      <div className="text-xs text-slate-500 font-arabic">{rcpt.customer.nameAr}</div>
                    )}
                    <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                      <span>{rcpt.receiptDate}</span>
                      {rcpt.customer?.phone && <span>• {rcpt.customer.phone}</span>}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    {rcpt.invoice ? (
                      <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-semibold border border-blue-200">
                        Inv: {rcpt.invoice.invoiceNumber}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-semibold">
                        General Credit
                      </span>
                    )}
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold border border-slate-200">
                      {rcpt.paymentMethod}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setAuditReceipt(rcpt)}
                      className="px-2.5 py-1 text-slate-500 hover:text-slate-800 text-xs font-semibold inline-flex items-center gap-1"
                    >
                      <History size={13} /> History
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setViewReceiptModal(rcpt)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg inline-flex items-center gap-1"
                      >
                        <FileText size={13} /> View
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setViewReceiptModal(rcpt);
                          setTimeout(() => window.print(), 150);
                        }}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg inline-flex items-center gap-1"
                      >
                        <Printer size={13} /> Print
                      </button>
                      {rcpt.customer?.phone && (
                        <button
                          type="button"
                          onClick={() => sendWhatsAppConfirmation(rcpt)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg inline-flex items-center gap-1"
                        >
                          <MessageCircle size={13} /> WA
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* ───────────────────── RECEIVE PAYMENT MODAL ───────────────────── */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-200 animate-scale-in">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <CreditCard size={18} className="text-emerald-600" />
                <span>{t.payments.receivePayment}</span>
              </h2>
              <button
                type="button"
                onClick={resetForm}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSavePayment} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2 font-medium">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Customer Select */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  {t.payments.customer} *
                </label>
                <CustomerCombobox
                  customers={customers}
                  value={customerId}
                  onChange={(id) => setCustomerId(id)}
                />
              </div>

              {/* Customer Outstanding Info */}
              {selectedCustomerObj && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-600">Total Outstanding Balance:</span>
                  <span
                    className={`font-bold text-sm ${
                      Number(selectedCustomerObj.totalOutstandingKd) > 0 ? 'text-amber-700' : 'text-emerald-700'
                    }`}
                  >
                    KD {Number(selectedCustomerObj.totalOutstandingKd).toFixed(3)}
                  </span>
                </div>
              )}

              {/* Specific invoice allocation (Optional) */}
              {pendingInvoices.length > 0 && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Allocate to Specific Invoice (Optional)
                  </label>
                  <select
                    value={invoiceId}
                    onChange={(e) => {
                      const val = Number(e.target.value) || '';
                      setInvoiceId(val);
                      if (val) {
                        const inv = pendingInvoices.find((i) => i.id === val);
                        if (inv) {
                          setAmountKd(String(Number(inv.balanceKd).toFixed(3)));
                        }
                      }
                    }}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all"
                  >
                    <option value="">General Account Payment (Unallocated)</option>
                    {pendingInvoices.map((inv) => (
                      <option key={inv.id} value={inv.id}>
                        {inv.invoiceNumber} ({inv.invoiceDate}) — Balance: {Number(inv.balanceKd).toFixed(3)} KD
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Amount & Method */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    {t.payments.amountKd} *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.001"
                      min="0.001"
                      required
                      value={amountKd}
                      onChange={(e) => setAmountKd(e.target.value)}
                      placeholder="0.000"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                      K.D.
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    {t.payments.paymentMethod} *
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all"
                  >
                    <option value="CASH">Cash (نقد)</option>
                    <option value="KNET">K-Net (كي نت)</option>
                    <option value="BANK_TRANSFER">Bank Transfer (تحويل)</option>
                    <option value="CHEQUE">Cheque (شيك)</option>
                  </select>
                </div>
              </div>

              {/* Date & Reference */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    {t.payments.date} *
                  </label>
                  <input
                    type="date"
                    required
                    value={receiptDate}
                    onChange={(e) => setReceiptDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Reference / Cheque No.
                  </label>
                  <input
                    type="text"
                    value={referenceNo}
                    onChange={(e) => setReferenceNo(e.target.value)}
                    placeholder="e.g. CHQ-49204"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  {t.payments.notes}
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Cleared by Ahmed"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all"
                />
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-xl transition-colors cursor-pointer"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-slate-900 hover:bg-black text-white font-bold text-sm rounded-xl shadow-md transition-all cursor-pointer inline-flex items-center gap-2 disabled:opacity-50"
                >
                  {saving ? t.common.loading : t.payments.savePayment}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ───────────────────── VIEW RECEIPT MODAL ───────────────────── */}
      {viewReceiptModal && (
        <div className="fixed inset-0 bg-slate-900/65 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-200 animate-scale-in">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileText size={18} className="text-slate-700" />
                <span>Receipt Voucher {viewReceiptModal.receiptNumber}</span>
              </h2>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Printer size={13} />
                  <span>Print</span>
                </button>

                {viewReceiptModal.customer?.phone && (
                  <button
                    type="button"
                    onClick={() => sendWhatsAppConfirmation(viewReceiptModal)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <MessageCircle size={13} />
                    <span>WhatsApp</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setViewReceiptModal(null)}
                  className="text-slate-400 hover:text-slate-700 p-1 rounded-lg transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Printable Content */}
            <div className="p-6 space-y-4">
              <div className="text-center pb-4 border-b border-slate-200">
                <h3 className="text-lg font-black text-slate-900 tracking-tight">
                  RASHIDI STAR
                </h3>
                <div className="text-xs text-slate-500 font-arabic mt-0.5">
                  شركة الرشيدي ستار للتجارة العامة • سند قبض رسمي
                </div>
              </div>

              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 text-xs">Receipt No:</span>
                  <span className="font-mono font-bold text-slate-900">{viewReceiptModal.receiptNumber}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 text-xs">Date:</span>
                  <span className="font-medium text-slate-700">{viewReceiptModal.receiptDate}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 text-xs">Received From:</span>
                  <span className="font-bold text-slate-900">
                    {viewReceiptModal.customer?.name}
                    {viewReceiptModal.customer?.nameAr && (
                      <span className="text-xs font-arabic text-slate-500 ml-1">
                        ({viewReceiptModal.customer.nameAr})
                      </span>
                    )}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 text-xs">Payment Method:</span>
                  <span className="font-semibold text-slate-800">{viewReceiptModal.paymentMethod}</span>
                </div>
                {viewReceiptModal.invoice && (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 text-xs">Applied to Invoice:</span>
                    <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 text-xs">
                      {viewReceiptModal.invoice.invoiceNumber}
                    </span>
                  </div>
                )}
                {viewReceiptModal.notes && (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 text-xs">Notes / Ref:</span>
                    <span className="text-slate-700 text-xs">{viewReceiptModal.notes}</span>
                  </div>
                )}

                {/* Highlighted Amount */}
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mt-3 flex justify-between items-center">
                  <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                    Amount Received:
                  </span>
                  <span className="text-2xl font-black text-emerald-700">
                    KD {Number(viewReceiptModal.amountKd).toFixed(3)}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t border-slate-200 flex justify-end bg-slate-50">
              <button
                type="button"
                onClick={() => setViewReceiptModal(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-xl transition-colors cursor-pointer"
              >
                {t.common.close}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────── TRANSACTION AUDIT MODAL ───────────────────── */}
      {auditReceipt && (
        <TransactionAuditModal
          isOpen={!!auditReceipt}
          onClose={() => setAuditReceipt(null)}
          reference={auditReceipt.receiptNumber}
          entityType="PAYMENT"
        />
      )}
    </div>
  );
};

export default PaymentsPage;
