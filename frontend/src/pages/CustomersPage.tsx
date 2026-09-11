import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { translateEnglishToArabic } from '../utils/translate';
import {
  Users,
  Plus,
  Search,
  Pencil,
  MessageCircle,
  AlertCircle,
  CheckCircle2,
  X,
  DollarSign,
  TrendingUp,
  CreditCard,
  ShoppingBag,
  Upload,
  BookOpen,
  Eye,
  Trash2,
  MoreVertical,
} from 'lucide-react';
import { CsvImportModal } from '../components/common/CsvImportModal';
import { normalizeSearchText } from '../utils/searchUtils';
import { CustomerLedgerModal } from '../components/customers/CustomerLedgerModal';
import { AdjustOpeningBalanceModal } from '../components/customers/AdjustOpeningBalanceModal';
import { ReceivePaymentModal } from '../components/payments/ReceivePaymentModal';
import { openWhatsAppWithText } from '../services/whatsappService';

/* ───────────────────── Types ───────────────────── */

export interface CustomerItem {
  id: number;
  name: string;
  nameAr?: string;
  phone?: string;
  address?: string;
  totalSales: number;
  totalReceived: number;
  totalOutstanding: number;
  totalSalesKd: number;
  totalReceivedKd: number;
  totalOutstandingKd: number;
  isActive: boolean;
  notes?: string;
  createdAt: string;
}

interface PendingInvoiceItem {
  id: number;
  invoiceNumber: string;
  invoiceDate: string;
  grandTotalAmountKd: number;
  amountReceivedKd: number;
  balanceKd: number;
  paymentStatus: string;
}

export const CustomersPage: React.FC = () => {
  const navigate = useNavigate();

  /* ── State ── */
  const [customers, setCustomers] = useState<CustomerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [balanceFilter, setBalanceFilter] = useState<'ALL' | 'OUTSTANDING' | 'NO_OUTSTANDING'>('ALL');
  const [toast, setToast] = useState('');

  /* ── Horizontal Scroll Synchronization ── */
  const topScrollRef = useRef<HTMLDivElement>(null);
  const tableScrollRef = useRef<HTMLDivElement>(null);
  const tableInnerRef = useRef<HTMLTableElement>(null);
  const isSyncingLeft = useRef(false);
  const isSyncingRight = useRef(false);
  const [tableInnerWidth, setTableInnerWidth] = useState(0);

  useEffect(() => {
    if (!tableInnerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setTableInnerWidth(entry.contentRect.width);
      }
    });
    observer.observe(tableInnerRef.current);
    return () => observer.disconnect();
  }, []);

  const handleTopScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (isSyncingRight.current) {
      isSyncingRight.current = false;
      return;
    }
    if (tableScrollRef.current) {
      isSyncingLeft.current = true;
      tableScrollRef.current.scrollLeft = e.currentTarget.scrollLeft;
    }
  };

  const handleTableScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (isSyncingLeft.current) {
      isSyncingLeft.current = false;
      return;
    }
    if (topScrollRef.current) {
      isSyncingRight.current = true;
      topScrollRef.current.scrollLeft = e.currentTarget.scrollLeft;
    }
  };

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editCustomer, setEditCustomer] = useState<CustomerItem | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerItem | null>(null);
  const [pendingInvoices, setPendingInvoices] = useState<PendingInvoiceItem[]>([]);
  const [invoicesLoading, setInvoicesLoading] = useState(false);

  // Customer Ledger Modal State
  const [ledgerCustomerId, setLedgerCustomerId] = useState<number | null>(null);
  const [ledgerCustomerName, setLedgerCustomerName] = useState<string>('');

  // Adjust Opening Balance Modal
  const [adjustBalanceCustomerId, setAdjustBalanceCustomerId] = useState<number | null>(null);
  const [adjustBalanceCustomerName, setAdjustBalanceCustomerName] = useState<string>('');

  // Receive Payment Modal
  const [receivePaymentCustomerId, setReceivePaymentCustomerId] = useState<number | null>(null);

  // Active More Dropdown
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
  const [dropdownPos, setDropdownPos] = useState<{ top: number; right: number } | null>(null);

  // Form states (Only Name required; all others optional)
  const [name, setName] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [openingOutstandingKd, setOpeningOutstandingKd] = useState('');
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  /* ── Fetch customers ── */
  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/customers');
      setCustomers(res.data);
    } catch (err) {
      console.error('Failed to load customers', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.action-dropdown-container')) {
        setOpenDropdownId(null);
        setDropdownPos(null);
      }
    };
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, []);

  const showSuccessToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 4000);
  };

  /* ── Reset form ── */
  const resetForm = () => {
    setName('');
    setNameAr('');
    setPhone('');
    setAddress('');
    setNotes('');
    setIsActive(true);
    setOpeningOutstandingKd('');
    setFormError('');
    setShowAddModal(false);
    setEditCustomer(null);
  };

  /* ── Open Edit modal ── */
  const openEditModal = (c: CustomerItem) => {
    setEditCustomer(c);
    setName(c.name);
    setNameAr(c.nameAr || '');
    setPhone(c.phone || '');
    setAddress(c.address || '');
    setNotes(c.notes || '');
    setIsActive(c.isActive);
    setFormError('');
    setShowAddModal(true);
    setOpenDropdownId(null);
  };

  /* ── Delete Customer ── */
  const handleDeleteCustomer = async (c: CustomerItem) => {
    setOpenDropdownId(null);
    if (
      !window.confirm(
        `Are you ABSOLUTELY sure you want to permanently delete customer "${c.name}"?\n\nThis will completely remove them from the system.`
      )
    ) {
      return;
    }

    try {
      await api.delete(`/customers/${c.id}`);
      showSuccessToast(`Customer ${c.name} deleted permanently.`);
      fetchCustomers();
    } catch (err: any) {
      showSuccessToast(err.response?.data?.message || 'Failed to delete customer. They may have active invoices.');
    }
  };

  /* ── View Customer Pending Invoices ── */
  const viewPendingInvoices = async (c: CustomerItem) => {
    setSelectedCustomer(c);
    try {
      setInvoicesLoading(true);
      const res = await api.get(`/customers/${c.id}/pending-invoices`);
      setPendingInvoices(res.data);
    } catch (err) {
      console.error('Failed to load pending invoices', err);
      setPendingInvoices([]);
    } finally {
      setInvoicesLoading(false);
    }
  };

  /* ── Open Ledger Modal ── */
  const openLedgerModal = (c: CustomerItem) => {
    setLedgerCustomerId(c.id);
    setLedgerCustomerName(c.name);
    setOpenDropdownId(null);
  };

  /* ── Save Customer (Only Name is mandatory) ── */
  const handleSaveCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Customer name is required.');
      return;
    }

    try {
      setSaving(true);
      setFormError('');

      const payload = {
        name: name.trim(),
        nameAr: nameAr.trim() || undefined,
        phone: phone.trim() || undefined,
        address: address.trim() || undefined,
        notes: notes.trim() || undefined,
        openingOutstandingKd: openingOutstandingKd ? Number(openingOutstandingKd) : undefined,
        isActive,
      };

      if (editCustomer) {
        await api.put(`/customers/${editCustomer.id}`, payload);
        showSuccessToast('Customer updated successfully');
      } else {
        await api.post('/customers', payload);
        showSuccessToast('Customer created successfully');
      }

      resetForm();
      fetchCustomers();
    } catch (err: any) {
      console.error('Failed to save customer', err);
      setFormError(err.response?.data?.message || 'Failed to save customer');
    } finally {
      setSaving(false);
    }
  };

  /* ── WhatsApp Reminder Link ── */
  const sendWhatsAppReminder = (c: CustomerItem) => {
    if (!c.phone) return;
    const totalPaid = Number(c.totalReceivedKd ?? c.totalReceived ?? 0);
    const outstanding = Number(c.totalOutstandingKd ?? c.totalOutstanding ?? 0);
    const totalSales = Number(c.totalSalesKd ?? c.totalSales ?? (totalPaid + outstanding));
    const isPartial = totalPaid > 0.0001;

    openWhatsAppWithText(
      {
        customerName: c.name,
        customerPhone: c.phone,
        invoiceTotal: totalSales,
        totalPaid: totalPaid,
        outstandingAmount: outstanding,
        paymentStatus: isPartial ? 'PARTIAL' : 'PENDING',
      },
      isPartial ? 'PARTIAL_REMINDER' : 'PENDING_REMINDER'
    );
  };

  /* ── Filtering & Metrics ── */
  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      const q = normalizeSearchText(search);
      const matchesSearch =
        !q ||
        normalizeSearchText(c.name).includes(q) ||
        normalizeSearchText(c.nameAr).includes(q) ||
        normalizeSearchText(c.phone).includes(q) ||
        normalizeSearchText(c.address).includes(q);

      if (!matchesSearch) return false;

      // Status Filter
      if (statusFilter === 'ACTIVE' && !c.isActive) return false;
      if (statusFilter === 'INACTIVE' && c.isActive) return false;

      // Balance Filter
      const outstanding = Number(c.totalOutstandingKd ?? c.totalOutstanding ?? 0);
      if (balanceFilter === 'OUTSTANDING' && outstanding <= 0) return false;
      if (balanceFilter === 'NO_OUTSTANDING' && outstanding > 0) return false;

      return true;
    });
  }, [customers, search, statusFilter, balanceFilter]);

  const totalOutstandingSum = useMemo(() => {
    return customers.reduce(
      (sum, c) => sum + Number(c.totalOutstandingKd ?? c.totalOutstanding ?? 0),
      0,
    );
  }, [customers]);

  const totalSalesSum = useMemo(() => {
    return customers.reduce((sum, c) => sum + Number(c.totalSalesKd ?? c.totalSales ?? 0), 0);
  }, [customers]);

  const totalReceivedSum = useMemo(() => {
    return customers.reduce(
      (sum, c) => sum + Number(c.totalReceivedKd ?? c.totalReceived ?? 0),
      0,
    );
  }, [customers]);

  return (
    <div className="w-full space-y-6">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-2 text-sm font-semibold animate-in fade-in slide-in-from-bottom-4">
          <CheckCircle2 className="w-5 h-5" />
          <span>{toast}</span>
        </div>
      )}

      {/* Customer Header - High contrast buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Customers
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Manage customer directory and outstanding balances
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Secondary Action: Import CSV */}
          <button
            type="button"
            onClick={() => setShowImportModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-800 text-sm font-semibold rounded-lg border border-slate-300 shadow-2xs hover:shadow-xs transition-all active:scale-95 cursor-pointer"
          >
            <Upload className="w-4 h-4 text-slate-600" />
            <span>Import CSV / Excel</span>
          </button>

          {/* Primary Action: + Add Customer (High Contrast!) */}
          <button
            type="button"
            onClick={() => {
              resetForm();
              setShowAddModal(true);
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-lg shadow-sm hover:shadow transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-emerald-400 stroke-[3]" />
            <span>Add Customer</span>
          </button>
        </div>
      </div>

      {/* 4 Clean, Compact Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Customers */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Customers
            </span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {customers.length}
          </div>
          <div className="text-xs text-slate-500 mt-1 font-medium">
            Active Accounts
          </div>
        </div>

        {/* Total Sales K.D. */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Sales K.D.
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            KD {totalSalesSum.toFixed(3)}
          </div>
          <div className="text-xs text-slate-500 mt-1 font-medium">
            Lifetime Sales Volume
          </div>
        </div>

        {/* Total Received K.D. */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Received K.D.
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            KD {totalReceivedSum.toFixed(3)}
          </div>
          <div className="text-xs text-slate-500 mt-1 font-medium">
            Collected Payments
          </div>
        </div>

        {/* Outstanding K.D. */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Outstanding K.D.
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-700 mt-2">
            KD {totalOutstandingSum.toFixed(3)}
          </div>
          <div className="text-xs text-slate-500 mt-1 font-medium">
            Pending Receivable
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 sticky top-0 z-10">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by customer name, Arabic name, phone, or address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 focus:border-slate-400 rounded-lg outline-none transition-colors placeholder:text-slate-400"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-slate-400 text-slate-700 cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active Only</option>
            <option value="INACTIVE">Inactive Only</option>
          </select>

          <select
            value={balanceFilter}
            onChange={(e) => setBalanceFilter(e.target.value as any)}
            className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-slate-400 text-slate-700 cursor-pointer"
          >
            <option value="ALL">All Balances</option>
            <option value="OUTSTANDING">Outstanding</option>
            <option value="NO_OUTSTANDING">No Outstanding</option>
          </select>

          <button
            type="button"
            onClick={() => {
              setSearch('');
              setStatusFilter('ALL');
              setBalanceFilter('ALL');
            }}
            className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Top Synchronized Scrollbar */}
      {tableInnerWidth > 0 && (
        <div 
          className="overflow-x-auto overflow-y-hidden h-3 bg-slate-50 rounded-t-xl border border-slate-200 border-b-0 hidden sm:block custom-scrollbar sticky top-16 z-10" 
          ref={topScrollRef} 
          onScroll={handleTopScroll}
        >
          <div style={{ width: tableInnerWidth, height: '1px' }}></div>
        </div>
      )}

      {/* Customer Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden sm:rounded-t-none sm:border-t-0">
        <div className="overflow-x-auto custom-scrollbar" ref={tableScrollRef} onScroll={handleTableScroll}>
          <table className="w-full text-left border-collapse" ref={tableInnerRef}>
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase tracking-wider">
                <th className="px-4 py-3.5 min-w-[240px] max-w-[260px] sticky left-0 z-30 bg-slate-50 border-r border-slate-200 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">Customer</th>
                <th className="px-4 py-3.5">Phone</th>
                <th className="px-4 py-3.5">Address</th>
                <th className="px-4 py-3.5 text-right">Total Sales</th>
                <th className="px-4 py-3.5 text-right">Total Received</th>
                <th className="px-4 py-3.5 text-right">Outstanding</th>
                <th className="px-4 py-3.5 text-center">Status</th>
                <th className="px-4 py-3.5 text-center w-16">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-slate-400 font-medium">
                    Loading customers...
                  </td>
                </tr>
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-slate-400 font-medium">
                    <Users className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    No customers found matching search criteria.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((c) => {
                  const outstanding = Number(c.totalOutstandingKd ?? c.totalOutstanding ?? 0);
                  const hasOutstanding = outstanding > 0;
                  const hasPhone = Boolean(c.phone && c.phone.trim().length > 0);

                  return (
                    <tr
                      key={c.id}
                      className="hover:bg-slate-50/80 transition-colors text-slate-800 group"
                    >
                      {/* Customer Identity (English, Arabic, and Phone) */}
                      <td className="px-4 py-3.5 sticky left-0 z-20 bg-white border-r border-slate-200 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] group-hover:bg-slate-50/80 transition-colors">
                        <div className="font-bold text-slate-900 text-sm truncate" title={c.name}>{c.name}</div>
                        {c.nameAr && (
                          <div className="text-xs text-slate-600 font-semibold mt-0.5 truncate" dir="rtl" title={c.nameAr}>
                            {c.nameAr}
                          </div>
                        )}
                      </td>

                      {/* Phone */}
                      <td className="px-4 py-3.5 text-xs font-mono text-slate-700 whitespace-nowrap">
                        {c.phone ? (
                          <div className="flex items-center gap-1.5">
                            <span>{c.phone}</span>
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                          </div>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      {/* Address */}
                      <td className="px-4 py-3.5 text-xs text-slate-600 max-w-xs truncate">
                        {c.address || <span className="text-slate-400">—</span>}
                      </td>

                      {/* Total Sales */}
                      <td className="px-4 py-3.5 text-right font-mono font-bold text-xs text-slate-900 whitespace-nowrap">
                        KD {Number(c.totalSalesKd ?? c.totalSales ?? 0).toFixed(3)}
                      </td>

                      {/* Total Received */}
                      <td className="px-4 py-3.5 text-right font-mono font-bold text-xs text-slate-900 whitespace-nowrap">
                        KD {Number(c.totalReceivedKd ?? c.totalReceived ?? 0).toFixed(3)}
                      </td>

                      {/* Outstanding Balance */}
                      <td className="px-4 py-3.5 text-right font-mono font-black text-sm whitespace-nowrap">
                        <span className={hasOutstanding ? 'text-rose-700' : 'text-slate-600'}>
                          KD {outstanding.toFixed(3)}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5 text-center whitespace-nowrap">
                        {c.isActive ? (
                          <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Active
                          </span>
                        ) : (
                          <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-500 border border-slate-200">
                            Inactive
                          </span>
                        )}
                      </td>

                      {/* Actions: Consolidated into More dropdown */}
                      <td className="px-4 py-3.5 text-center whitespace-nowrap">
                        <div className="relative action-dropdown-container inline-block">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (openDropdownId === c.id) {
                                setOpenDropdownId(null);
                                setDropdownPos(null);
                              } else {
                                const rect = e.currentTarget.getBoundingClientRect();
                                setDropdownPos({
                                  top: rect.bottom,
                                  right: window.innerWidth - rect.right,
                                });
                                setOpenDropdownId(c.id);
                              }
                            }}
                            className="inline-flex items-center justify-center w-8 h-8 text-slate-500 hover:text-slate-900 bg-slate-50 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                            aria-label="More Options"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {openDropdownId === c.id && dropdownPos && createPortal(
                            <div 
                              className="fixed mt-1 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-[100] text-left animate-in fade-in zoom-in-95"
                              style={{ top: dropdownPos.top, right: dropdownPos.right }}
                            >
                              {/* 1. View Invoices */}
                              <button
                                type="button"
                                onClick={() => {
                                  viewPendingInvoices(c);
                                  setOpenDropdownId(null);
                                }}
                                className="w-full px-3.5 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5 text-slate-500" />
                                <span>View Invoices</span>
                              </button>

                              {/* 2. New Sale */}
                              <button
                                type="button"
                                onClick={() => {
                                  navigate('/sales', { state: { selectedCustomerId: c.id } });
                                  setOpenDropdownId(null);
                                }}
                                className="w-full px-3.5 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                              >
                                <ShoppingBag className="w-3.5 h-3.5 text-sky-600" />
                                <span>New Sale</span>
                              </button>

                              {/* 3. Receive Payment */}
                              <button
                                type="button"
                                onClick={() => {
                                  setReceivePaymentCustomerId(c.id);
                                  setOpenDropdownId(null);
                                }}
                                className="w-full px-3.5 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                              >
                                <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Receive Payment</span>
                              </button>

                              {/* 4. Reminder */}
                              {hasOutstanding && hasPhone && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    sendWhatsAppReminder(c);
                                    setOpenDropdownId(null);
                                  }}
                                  className="w-full px-3.5 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 flex items-center gap-2 cursor-pointer"
                                >
                                  <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>Send Reminder</span>
                                </button>
                              )}

                              <div className="h-px bg-slate-100 my-1"></div>

                              <button
                                type="button"
                                onClick={() => openLedgerModal(c)}
                                className="w-full px-3.5 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                              >
                                <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                                <span>Customer Ledger</span>
                              </button>
                              
                              <button
                                type="button"
                                onClick={() => openEditModal(c)}
                                className="w-full px-3.5 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                              >
                                <Pencil className="w-3.5 h-3.5 text-amber-600" />
                                <span>Edit Details</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setAdjustBalanceCustomerId(c.id);
                                  setAdjustBalanceCustomerName(c.name);
                                  setOpenDropdownId(null);
                                }}
                                className="w-full px-3.5 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                              >
                                <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Adjust Opening Balance</span>
                              </button>

                              <div className="h-px bg-slate-100 my-1"></div>
                              <button
                                type="button"
                                onClick={() => handleDeleteCustomer(c)}
                                className="w-full px-3.5 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                                <span>Delete Customer</span>
                              </button>
                            </div>
                          , document.body)}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold">
                  <Users className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-base text-white">
                  {editCustomer ? 'Edit Customer' : 'Add New Customer'}
                </h3>
              </div>
              <button
                onClick={resetForm}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCustomer} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Customer Name (Only mandatory field) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Customer Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Al-Salmiya Boutique, Tariq Textiles..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onBlur={async () => {
                    if (name && !nameAr) {
                      const translated = await translateEnglishToArabic(name);
                      if (translated) setNameAr(translated);
                    }
                  }}
                  className="w-full px-3 py-2 text-sm font-semibold bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-slate-900 outline-none"
                />
              </div>

              {/* Arabic Name (Optional) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Arabic Name <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  dir="rtl"
                  placeholder="مثال: بوتيك السالمية..."
                  value={nameAr}
                  onChange={(e) => setNameAr(e.target.value)}
                  className="w-full px-3 py-2 text-sm font-semibold bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-slate-900 outline-none font-cairo"
                />
              </div>

              {/* Phone (Optional) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Phone / WhatsApp <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="tel"
                  placeholder="e.g. 96594455667 or 94455667"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 text-sm font-mono bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-slate-900 outline-none"
                />
              </div>

              {/* Address (Optional) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Address / Store Location <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Salem Al Mubarak St, Salmiya..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-slate-900 outline-none"
                />
              </div>

              {/* Notes (Optional) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Internal Notes <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="Credit terms, specific preferences, or contacts..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-slate-900 outline-none resize-none"
                />
              </div>

              {/* Opening Outstanding Balance (Only for new customers) */}
              {!editCustomer && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Previous Outstanding Balance <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.001"
                      min="0"
                      placeholder="0.000"
                      value={openingOutstandingKd}
                      onChange={(e) => setOpeningOutstandingKd(e.target.value)}
                      className="w-full px-3 py-2 text-sm font-mono font-bold bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-slate-900 outline-none"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                      K.D.
                    </span>
                  </div>
                </div>
              )}

              {/* Active Toggle */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="customerActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded text-sky-600 focus:ring-sky-500 cursor-pointer"
                />
                <label htmlFor="customerActive" className="text-xs font-semibold text-slate-700 cursor-pointer">
                  Customer is active in directory
                </label>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {saving ? 'Saving...' : editCustomer ? 'Update Customer' : 'Save Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customer Invoices & Overview Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 flex flex-col max-h-[85vh]">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div>
                <h3 className="font-bold text-base text-white">{selectedCustomer.name}</h3>
                <p className="text-xs text-slate-400">
                  {selectedCustomer.nameAr && `${selectedCustomer.nameAr} • `}
                  Outstanding: KD {Number(selectedCustomer.totalOutstandingKd ?? selectedCustomer.totalOutstanding ?? 0).toFixed(3)}
                </p>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-900 text-sm">Pending & Unpaid Invoices</h4>
                <button
                  type="button"
                  onClick={() => {
                    const c = selectedCustomer;
                    setSelectedCustomer(null);
                    openLedgerModal(c);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5 text-sky-600" />
                  <span>Open Full Customer Ledger</span>
                </button>
              </div>

              {invoicesLoading ? (
                <div className="py-12 text-center text-slate-400 font-medium text-xs">
                  Loading invoices...
                </div>
              ) : pendingInvoices.length === 0 ? (
                <div className="py-12 text-center text-slate-400 font-medium text-xs">
                  <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500 mb-2" />
                  No pending or unpaid invoices. All balances settled!
                </div>
              ) : (
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600 uppercase">
                        <th className="px-3 py-2.5">Invoice #</th>
                        <th className="px-3 py-2.5">Date</th>
                        <th className="px-3 py-2.5 text-right">Total KD</th>
                        <th className="px-3 py-2.5 text-right">Received KD</th>
                        <th className="px-3 py-2.5 text-right">Balance KD</th>
                        <th className="px-3 py-2.5 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {pendingInvoices.map((inv) => (
                        <tr key={inv.id} className="hover:bg-slate-50 font-mono">
                          <td className="px-3 py-2.5 font-bold text-slate-900">
                            {inv.invoiceNumber}
                          </td>
                          <td className="px-3 py-2.5 text-slate-600">{inv.invoiceDate}</td>
                          <td className="px-3 py-2.5 text-right font-bold text-slate-900">
                            {Number(inv.grandTotalAmountKd).toFixed(3)}
                          </td>
                          <td className="px-3 py-2.5 text-right font-bold text-emerald-700">
                            {Number(inv.amountReceivedKd).toFixed(3)}
                          </td>
                          <td className="px-3 py-2.5 text-right font-black text-rose-700">
                            {Number(inv.balanceKd).toFixed(3)}
                          </td>
                          <td className="px-3 py-2.5 text-center">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              {inv.paymentStatus}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
                className="px-4 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-bold cursor-pointer hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSV Import Modal */}
      {showImportModal && (
        <CsvImportModal
          title="Import Customers from CSV / Excel"
          description="Upload customer master list with opening balances and optional Arabic names"
          columns={[
            { key: 'name', label: 'Customer Name', required: true },
            { key: 'nameAr', label: 'Arabic Name' },
            { key: 'phone', label: 'Phone / WhatsApp' },
            { key: 'address', label: 'Address' },
            { key: 'openingOutstandingKd', label: 'Opening Balance (KD)', type: 'number' },
            { key: 'notes', label: 'Notes' },
          ]}
          sampleRows={[
            {
              name: 'Al-Salmiya Boutique',
              nameAr: 'بوتيك السالمية',
              phone: '96594455667',
              address: 'Salem Al Mubarak St, Salmiya',
              openingOutstandingKd: 30.0,
              notes: 'Retailer',
            },
            {
              name: 'Al-Bahar Store',
              nameAr: 'متجر البحر',
              phone: '96598765432',
              address: 'Kuwait City',
              openingOutstandingKd: 0.0,
              notes: 'Wholesale',
            },
          ]}
          endpoint="/customers/bulk-import"
          onSuccess={(count) => {
            setShowImportModal(false);
            fetchCustomers();
            showSuccessToast(`${count} customers successfully imported!`);
          }}
          onClose={() => setShowImportModal(false)}
        />
      )}

      {/* Customer Ledger Modal */}
      {ledgerCustomerId && (
        <CustomerLedgerModal
          customerId={ledgerCustomerId}
          customerName={ledgerCustomerName}
          isOpen={true}
          onClose={() => setLedgerCustomerId(null)}
          onNewSale={(id) => {
            setLedgerCustomerId(null);
            navigate('/sales', { state: { selectedCustomerId: id } });
          }}
        />
      )}

      {/* Adjust Opening Balance Modal */}
      {adjustBalanceCustomerId && (
        <AdjustOpeningBalanceModal
          isOpen={true}
          onClose={() => setAdjustBalanceCustomerId(null)}
          onSuccess={() => {
            setAdjustBalanceCustomerId(null);
            fetchCustomers();
            showSuccessToast('Opening balance adjusted successfully!');
          }}
          customerId={adjustBalanceCustomerId}
          customerName={adjustBalanceCustomerName}
        />
      )}

      {/* Receive Payment Modal */}
      <ReceivePaymentModal
        isOpen={receivePaymentCustomerId !== null}
        onClose={() => setReceivePaymentCustomerId(null)}
        onSuccess={() => {
          setReceivePaymentCustomerId(null);
          fetchCustomers();
          showSuccessToast('Payment received successfully!');
        }}
        preselectedCustomerId={receivePaymentCustomerId}
      />
    </div>
  );
};

export default CustomersPage;
