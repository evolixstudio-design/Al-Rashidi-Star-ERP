import React, { useEffect, useState, useCallback, useMemo } from 'react';
import api from '../services/api';
import {
  Receipt,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  X,
  Edit2,
  Ban,
  Eye,
  History,
  TrendingDown,
  Calendar,
  Layers,
  Filter,
  DollarSign,
  AlertTriangle,
  Trash2,
} from 'lucide-react';
import { TransactionAuditModal } from '../components/common/TransactionAuditModal';

/* ───────────────────── Types ───────────────────── */

export interface ExpenseItem {
  id: number;
  expenseNumber: string;
  category: string;
  description: string;
  amountKd: number;
  expenseDate: string;
  paymentMethod: string;
  paidTo: string | null;
  receiptRef: string | null;
  notes: string | null;
  status: 'POSTED' | 'CANCELLED' | 'DRAFT';
  cancellationReason?: string | null;
  cancelledAt?: string | null;
  cancelledBy?: string | null;
  recordedBy: string;
  createdAt: string;
}

const DEFAULT_CATEGORIES = [
  'Rent',
  'Salaries',
  'Transport/Shipping',
  'Utilities',
  'Office Supplies',
  'Visa/Iqama',
  'Packaging',
  'Miscellaneous',
];

const PAYMENT_METHODS = ['Cash', 'K-Net', 'Bank Transfer', 'Cheque'];

export const ExpensesPage: React.FC = () => {
  /* ── State ── */
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [dateFilterPreset, setDateFilterPreset] = useState<'today' | 'thisMonth' | 'all'>('all');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Modals
  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<ExpenseItem | null>(null);
  const [viewingExpense, setViewingExpense] = useState<ExpenseItem | null>(null);
  const [cancellingExpense, setCancellingExpense] = useState<ExpenseItem | null>(null);
  const [cancelReason, setCancelReason] = useState('Duplicate or erroneous entry');
  const [cancelling, setCancelling] = useState(false);
  const [auditModalRef, setAuditModalRef] = useState<string | null>(null);

  // Form states
  const [formCategory, setFormCategory] = useState('Miscellaneous');
  const [customCategory, setCustomCategory] = useState('');
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [formDescription, setFormDescription] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formPaymentMethod, setFormPaymentMethod] = useState('Cash');
  const [formPaidTo, setFormPaidTo] = useState('');
  const [formReceiptRef, setFormReceiptRef] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  /* ── Toast Helper ── */
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  /* ── Data Fetching ── */
  const fetchExpenses = useCallback(async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (selectedCategory && selectedCategory !== 'ALL') params.category = selectedCategory;
      if (fromDate) params.from = fromDate;
      if (toDate) params.to = toDate;
      if (search.trim()) params.search = search.trim();

      const res = await api.get('/expenses', { params });
      setExpenses(res.data);
    } catch (err) {
      console.error('Failed to load expenses', err);
      showToast('Failed to load expenses', 'error');
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, fromDate, toDate, search]);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await api.get('/expenses/categories');
      if (Array.isArray(res.data) && res.data.length > 0) {
        setCategories(res.data);
      }
    } catch (err) {
      console.error('Failed to load categories', err);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchExpenses();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchExpenses]);

  /* ── Modal Opening Handlers ── */
  const openCreateModal = () => {
    setEditingExpense(null);
    setFormCategory(categories[0] || 'Miscellaneous');
    setIsCustomCategory(false);
    setCustomCategory('');
    setFormDescription('');
    setFormAmount('');
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormPaymentMethod('Cash');
    setFormPaidTo('');
    setFormReceiptRef('');
    setFormNotes('');
    setFormError('');
    setShowModal(true);
  };

  const openEditModal = (expense: ExpenseItem) => {
    if (expense.status === 'CANCELLED') {
      showToast('Cancelled expenses cannot be edited.', 'error');
      return;
    }
    setEditingExpense(expense);
    if (categories.includes(expense.category)) {
      setFormCategory(expense.category);
      setIsCustomCategory(false);
      setCustomCategory('');
    } else {
      setFormCategory('OTHER');
      setIsCustomCategory(true);
      setCustomCategory(expense.category);
    }
    setFormDescription(expense.description);
    setFormAmount(String(expense.amountKd));
    setFormDate(expense.expenseDate);
    setFormPaymentMethod(expense.paymentMethod);
    setFormPaidTo(expense.paidTo || '');
    setFormReceiptRef(expense.receiptRef || '');
    setFormNotes(expense.notes || '');
    setFormError('');
    setShowModal(true);
  };

  /* ── Save / Update ── */
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const finalCategory = isCustomCategory ? customCategory.trim() : formCategory;
    if (!finalCategory) {
      setFormError('Please select or specify an expense category.');
      return;
    }

    const amt = parseFloat(formAmount);
    if (isNaN(amt) || amt <= 0) {
      setFormError('Please enter a valid expense amount greater than zero.');
      return;
    }

    if (!formDate) {
      setFormError('Please select an expense date.');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        category: finalCategory,
        description: formDescription.trim() || finalCategory,
        amountKd: Number(amt.toFixed(3)),
        expenseDate: formDate,
        paymentMethod: formPaymentMethod,
        paidTo: formPaidTo.trim() || undefined,
        receiptRef: formReceiptRef.trim() || undefined,
        notes: formNotes.trim() || undefined,
      };

      if (editingExpense) {
        await api.put(`/expenses/${editingExpense.id}`, payload);
        showToast('Expense updated successfully');
      } else {
        await api.post('/expenses', payload);
        showToast('Expense recorded successfully');
      }

      setShowModal(false);
      fetchExpenses();
      fetchCategories();
    } catch (err: any) {
      console.error('Failed to save expense', err);
      setFormError(err.response?.data?.message || 'Failed to save expense');
    } finally {
      setSaving(false);
    }
  };

  /* ── Cancel Expense (Reverses financial impact, preserves audit record) ── */
  const handleCancelExpense = async () => {
    if (!cancellingExpense) return;
    try {
      setCancelling(true);
      await api.post(`/expenses/${cancellingExpense.id}/cancel`, {
        reason: cancelReason.trim() || 'Cancelled by owner',
      });
      showToast(`Expense ${cancellingExpense.expenseNumber} cancelled. Financial impact reversed.`);
      setCancellingExpense(null);
      fetchExpenses();
    } catch (err: any) {
      console.error('Failed to cancel expense', err);
      showToast(err.response?.data?.message || 'Failed to cancel expense', 'error');
    } finally {
      setCancelling(false);
    }
  };

  /* ── Delete Expense ── */
  const handleDeleteExpense = async (expense: ExpenseItem) => {
    if (
      !window.confirm(
        `Are you ABSOLUTELY sure you want to permanently delete expense ${expense.expenseNumber}?\n\nThis will completely remove the record from the system.`
      )
    ) {
      return;
    }

    try {
      await api.delete(`/expenses/${expense.id}`);
      showToast(`Expense ${expense.expenseNumber} deleted permanently.`);
      fetchExpenses();
      fetchCategories();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to delete expense.', 'error');
    }
  };

  /* ── Computed Metrics (Active posted expenses only for financial totals) ── */
  const metrics = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const currentMonth = today.substring(0, 7);

    let total = 0;
    let thisMonth = 0;
    let todayTotal = 0;
    let activeCount = 0;

    expenses.forEach((e) => {
      if (e.status === 'CANCELLED') return; // Cancelled expenses excluded from financial totals
      const amt = Number(e.amountKd) || 0;
      total += amt;
      activeCount += 1;
      if (e.expenseDate.startsWith(currentMonth)) {
        thisMonth += amt;
      }
      if (e.expenseDate === today) {
        todayTotal += amt;
      }
    });

    const avg = activeCount > 0 ? total / activeCount : 0;

    return {
      total: total.toFixed(3),
      thisMonth: thisMonth.toFixed(3),
      today: todayTotal.toFixed(3),
      average: avg.toFixed(3),
      count: activeCount,
      totalEntries: expenses.length,
    };
  }, [expenses]);

  /* ── Date Presets ── */
  const setPreset = (type: 'today' | 'thisMonth' | 'all') => {
    setDateFilterPreset(type);
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    if (type === 'today') {
      setFromDate(todayStr);
      setToDate(todayStr);
    } else if (type === 'thisMonth') {
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      setFromDate(`${year}-${month}-01`);
      setToDate(todayStr);
    } else {
      setFromDate('');
      setToDate('');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-lg shadow-lg text-white text-sm font-semibold animate-in fade-in slide-in-from-top-4 ${
            toast.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'
          }`}
        >
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header Banner - High contrast & clean structure */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Expenses
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Track operational and administrative expenses
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-lg shadow-sm hover:shadow transition-all active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4 text-emerald-400 stroke-[3]" />
          <span>Add Expense</span>
        </button>
      </div>

      {/* 4 Clean Compact KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Total Expenses */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Expenses
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            KD {metrics.total}
          </div>
          <div className="text-xs text-slate-500 mt-1 font-medium">
            {metrics.count} Active Entries {metrics.totalEntries > metrics.count && `(${metrics.totalEntries - metrics.count} cancelled)`}
          </div>
        </div>

        {/* This Month */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              This Month
            </span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            KD {metrics.thisMonth}
          </div>
          <div className="text-xs text-slate-500 mt-1 font-medium">
            {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
          </div>
        </div>

        {/* Today */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Today
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            KD {metrics.today}
          </div>
          <div className="text-xs text-slate-500 mt-1 font-medium">
            {new Date().toISOString().split('T')[0]}
          </div>
        </div>

        {/* Average / Entry */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Average / Entry
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            KD {metrics.average}
          </div>
          <div className="text-xs text-slate-500 mt-1 font-medium">
            per posted transaction
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs mb-6">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search expenses by number, description, recipient, ref..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 focus:border-slate-400 rounded-lg outline-none transition-colors placeholder:text-slate-400"
            />
          </div>

          {/* Category Dropdown */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500 shrink-0" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-800 text-sm font-medium rounded-lg px-3 py-2 outline-none focus:border-slate-400 cursor-pointer"
            >
              <option value="ALL">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Date Pickers */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <div className="flex items-center gap-1 text-xs font-semibold text-slate-600">
              <span>From:</span>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => {
                  setFromDate(e.target.value);
                  setDateFilterPreset('all');
                }}
                className="bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-lg px-2.5 py-1.5 outline-none focus:border-slate-400"
              />
            </div>
            <div className="flex items-center gap-1 text-xs font-semibold text-slate-600">
              <span>To:</span>
              <input
                type="date"
                value={toDate}
                onChange={(e) => {
                  setToDate(e.target.value);
                  setDateFilterPreset('all');
                }}
                className="bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-lg px-2.5 py-1.5 outline-none focus:border-slate-400"
              />
            </div>
          </div>

          {/* Quick Date Presets */}
          <div className="flex items-center gap-1.5 self-start lg:self-center">
            <button
              type="button"
              onClick={() => setPreset('today')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                dateFilterPreset === 'today'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => setPreset('thisMonth')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                dateFilterPreset === 'thisMonth'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              This Month
            </button>
            <button
              type="button"
              onClick={() => setPreset('all')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                dateFilterPreset === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              All Time
            </button>
          </div>
        </div>
      </div>

      {/* Expense Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase tracking-wider">
                <th className="px-4 py-3.5">Expense #</th>
                <th className="px-4 py-3.5">Date</th>
                <th className="px-4 py-3.5">Category</th>
                <th className="px-4 py-3.5">Description</th>
                <th className="px-4 py-3.5">Paid To / Reference</th>
                <th className="px-4 py-3.5">Payment Method</th>
                <th className="px-4 py-3.5 text-right">Amount</th>
                <th className="px-4 py-3.5 text-center">Status</th>
                <th className="px-4 py-3.5 text-center min-w-[190px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-slate-400 font-medium">
                    Loading expenses...
                  </td>
                </tr>
              ) : expenses.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-slate-400 font-medium">
                    <Receipt className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    No expenses found.
                  </td>
                </tr>
              ) : (
                expenses.map((expense) => {
                  const isCancelled = expense.status === 'CANCELLED';
                  return (
                    <tr
                      key={expense.id}
                      className={`transition-colors ${
                        isCancelled
                          ? 'bg-slate-50/70 text-slate-400'
                          : 'hover:bg-slate-50/80 text-slate-800'
                      }`}
                    >
                      {/* Expense # */}
                      <td className="px-4 py-3.5 font-bold font-mono text-xs text-slate-900">
                        {expense.expenseNumber}
                      </td>

                      {/* Date */}
                      <td className="px-4 py-3.5 text-slate-600 text-xs font-medium whitespace-nowrap">
                        {expense.expenseDate}
                      </td>

                      {/* Category */}
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-md text-xs font-semibold ${
                            isCancelled
                              ? 'bg-slate-200 text-slate-500'
                              : 'bg-slate-100 text-slate-800 border border-slate-200'
                          }`}
                        >
                          {expense.category}
                        </span>
                      </td>

                      {/* Description */}
                      <td className="px-4 py-3.5 max-w-xs">
                        <div className={`font-semibold ${isCancelled ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                          {expense.description}
                        </div>
                        {expense.notes && (
                          <div className="text-xs text-slate-400 mt-0.5 truncate">
                            {expense.notes}
                          </div>
                        )}
                      </td>

                      {/* Paid To / Reference */}
                      <td className="px-4 py-3.5 text-xs text-slate-600">
                        <div className="font-semibold text-slate-800">{expense.paidTo || '—'}</div>
                        {expense.receiptRef && (
                          <div className="text-[11px] text-slate-400 font-mono">
                            Ref: {expense.receiptRef}
                          </div>
                        )}
                      </td>

                      {/* Payment Method */}
                      <td className="px-4 py-3.5 text-xs">
                        <span className="inline-block px-2.5 py-0.5 rounded-full bg-slate-100 font-medium text-slate-700">
                          {expense.paymentMethod}
                        </span>
                      </td>

                      {/* Amount */}
                      <td className="px-4 py-3.5 text-right font-black text-sm whitespace-nowrap">
                        <span className={isCancelled ? 'line-through text-slate-400' : 'text-slate-900'}>
                          KD {Number(expense.amountKd).toFixed(3)}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5 text-center whitespace-nowrap">
                        {isCancelled ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            CANCELLED
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            ACTIVE
                          </span>
                        )}
                      </td>

                      {/* Actions: View, Edit, Cancel */}
                      <td className="px-4 py-3.5 text-center">
                        <div className="inline-flex items-center justify-center gap-1.5">
                          {/* View button */}
                          <button
                            type="button"
                            onClick={() => setViewingExpense(expense)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors cursor-pointer"
                            title="View details and audit timeline"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-500" />
                            <span>View</span>
                          </button>

                          {/* Edit button */}
                          {!isCancelled && (
                            <button
                              type="button"
                              onClick={() => openEditModal(expense)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-md transition-colors cursor-pointer"
                              title="Edit expense"
                            >
                              <Edit2 className="w-3.5 h-3.5 text-sky-600" />
                              <span>Edit</span>
                            </button>
                          )}

                          {/* Cancel Expense (Replaces hard delete!) */}
                          {!isCancelled ? (
                            <>
                              <button
                                type="button"
                                onClick={() => {
                                  setCancellingExpense(expense);
                                  setCancelReason('Duplicate or erroneous entry');
                                }}
                                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-md transition-colors cursor-pointer"
                                title="Cancel expense (reverses financial impact without hard delete)"
                              >
                                <Ban className="w-3.5 h-3.5 text-rose-600" />
                                <span>Cancel</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteExpense(expense)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-rose-800 bg-rose-100 hover:bg-rose-200 rounded-md transition-colors cursor-pointer"
                                title="Delete permanently"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-rose-700" />
                                <span>Delete</span>
                              </button>
                            </>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setAuditModalRef(expense.expenseNumber)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors cursor-pointer"
                              title="View audit trail"
                            >
                              <History className="w-3.5 h-3.5 text-slate-500" />
                              <span>History</span>
                            </button>
                          )}
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

      {/* Add / Edit Expense Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                  <Receipt className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-base text-white">
                  {editingExpense ? 'Edit Expense' : 'Add New Expense'}
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSave} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Amount (Required) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Amount (K.D.) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                    KD
                  </span>
                  <input
                    type="number"
                    step="0.001"
                    min="0.001"
                    required
                    placeholder="0.000"
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    className="w-full pl-12 pr-4 py-2.5 text-base font-bold bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-slate-900 outline-none text-slate-900"
                  />
                </div>
              </div>

              {/* Category & Date Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Category (Required) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Category <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={isCustomCategory ? 'OTHER' : formCategory}
                    onChange={(e) => {
                      if (e.target.value === 'OTHER') {
                        setIsCustomCategory(true);
                      } else {
                        setIsCustomCategory(false);
                        setFormCategory(e.target.value);
                      }
                    }}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-slate-900 outline-none text-sm font-medium text-slate-800"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                    <option value="OTHER">+ Other / Custom</option>
                  </select>
                </div>

                {/* Date (Required) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Expense Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-slate-900 outline-none text-sm font-medium text-slate-800"
                  />
                </div>
              </div>

              {/* Custom Category input if selected */}
              {isCustomCategory && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Custom Category Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter category name..."
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-slate-900 outline-none"
                  />
                </div>
              )}

              {/* Description (Optional) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Description <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ministry of Electricity & Water bill, Office supplies..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-slate-900 outline-none"
                />
              </div>

              {/* Paid To & Reference Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Paid To <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. MEW Kuwait, Landlord..."
                    value={formPaidTo}
                    onChange={(e) => setFormPaidTo(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-slate-900 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Receipt / Reference <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. MEW-78821, CHQ-402..."
                    value={formReceiptRef}
                    onChange={(e) => setFormReceiptRef(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-slate-900 outline-none"
                  />
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Payment Method
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {PAYMENT_METHODS.map((pm) => (
                    <button
                      key={pm}
                      type="button"
                      onClick={() => setFormPaymentMethod(pm)}
                      className={`px-3 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                        formPaymentMethod === pm
                          ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {pm}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes (Optional) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Internal Notes <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="Additional remarks or documentation details..."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-slate-900 outline-none resize-none"
                />
              </div>

              {/* Modal Actions */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {saving ? 'Saving...' : editingExpense ? 'Update Expense' : 'Save Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cancel Expense Confirmation Modal (Replaces Delete) */}
      {cancellingExpense && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-6">
              <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
                <Ban className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 text-center">
                Cancel Expense {cancellingExpense.expenseNumber}?
              </h3>
              <p className="text-xs text-slate-500 text-center mt-1">
                Amount: <span className="font-bold text-slate-900">KD {Number(cancellingExpense.amountKd).toFixed(3)}</span> ({cancellingExpense.category})
              </p>
              <div className="mt-3 p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                <span>
                  Per ERP audit rules, this transaction will <strong>not be deleted</strong>. It will be marked as <strong>CANCELLED</strong> and its financial/reporting impact will be reversed.
                </span>
              </div>

              <div className="mt-4">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Cancellation Reason <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-slate-900 outline-none"
                  placeholder="e.g. Duplicate entry, Incorrect amount, Voided..."
                />
              </div>

              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  type="button"
                  disabled={cancelling}
                  onClick={() => setCancellingExpense(null)}
                  className="px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Keep Expense
                </button>
                <button
                  type="button"
                  disabled={cancelling}
                  onClick={handleCancelExpense}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Expense Detail View Modal */}
      {viewingExpense && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-white">Expense Details</h3>
                <p className="text-xs text-slate-400 font-mono">{viewingExpense.expenseNumber}</p>
              </div>
              <button
                onClick={() => setViewingExpense(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-100">
                <div>
                  <div className="text-xs text-slate-400 font-medium">Amount</div>
                  <div className="text-xl font-black text-slate-900 mt-0.5">
                    KD {Number(viewingExpense.amountKd).toFixed(3)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-medium">Status</div>
                  <div className="mt-1">
                    {viewingExpense.status === 'CANCELLED' ? (
                      <span className="inline-block px-2.5 py-0.5 text-xs font-bold rounded bg-rose-50 text-rose-700 border border-rose-200">
                        CANCELLED
                      </span>
                    ) : (
                      <span className="inline-block px-2.5 py-0.5 text-xs font-bold rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                        ACTIVE / POSTED
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 font-medium">Category:</span>
                  <div className="font-bold text-slate-800 text-sm mt-0.5">{viewingExpense.category}</div>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Date:</span>
                  <div className="font-bold text-slate-800 text-sm mt-0.5">{viewingExpense.expenseDate}</div>
                </div>
              </div>

              <div>
                <span className="text-slate-400 text-xs font-medium">Description:</span>
                <div className="font-semibold text-slate-900 mt-0.5">{viewingExpense.description}</div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 font-medium">Paid To:</span>
                  <div className="font-semibold text-slate-800 mt-0.5">{viewingExpense.paidTo || '—'}</div>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Reference:</span>
                  <div className="font-semibold text-slate-800 mt-0.5 font-mono">{viewingExpense.receiptRef || '—'}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 font-medium">Payment Method:</span>
                  <div className="font-semibold text-slate-800 mt-0.5">{viewingExpense.paymentMethod}</div>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Recorded By:</span>
                  <div className="font-semibold text-slate-800 mt-0.5">{viewingExpense.recordedBy}</div>
                </div>
              </div>

              {viewingExpense.notes && (
                <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-700">
                  <span className="font-bold text-slate-600 block mb-1">Notes:</span>
                  {viewingExpense.notes}
                </div>
              )}

              {viewingExpense.status === 'CANCELLED' && (
                <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-xs text-rose-800">
                  <div className="font-bold">Cancellation Record:</div>
                  <div className="mt-1">Reason: {viewingExpense.cancellationReason || 'N/A'}</div>
                  <div className="text-rose-600 mt-0.5">
                    Cancelled by: {viewingExpense.cancelledBy || 'Owner'} on{' '}
                    {viewingExpense.cancelledAt ? new Date(viewingExpense.cancelledAt).toLocaleString() : 'N/A'}
                  </div>
                </div>
              )}

              {/* View Audit Trail button */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setAuditModalRef(viewingExpense.expenseNumber);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  <History className="w-3.5 h-3.5 text-slate-500" />
                  <span>View Audit Trail</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewingExpense(null)}
                  className="px-4 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-bold cursor-pointer hover:bg-slate-800"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Transaction Audit Modal */}
      {auditModalRef && (
        <TransactionAuditModal
          reference={auditModalRef}
          isOpen={true}
          onClose={() => setAuditModalRef(null)}
        />
      )}
    </div>
  );
};

export default ExpensesPage;
