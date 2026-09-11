import React, { useState, useEffect } from 'react';
import { CreditCard, X, AlertCircle } from 'lucide-react';
import { CustomerCombobox } from '../common/CustomerCombobox';
import api from '../../services/api';
import { useTranslations } from '../../hooks/useTranslations';

interface CustomerOption {
  id: number;
  name: string;
  nameAr?: string;
  phone?: string;
  totalOutstandingKd: number;
}

interface PendingInvoiceOption {
  id: number;
  invoiceNumber: string;
  invoiceDate: string;
  grandTotalAmountKd: number;
  amountReceivedKd: number;
  balanceKd: number;
}

interface ReceivePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (receipt: any) => void;
  preselectedCustomerId?: number | null;
}



export const ReceivePaymentModal: React.FC<ReceivePaymentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  preselectedCustomerId,
}) => {
  const { t } = useTranslations();
  
  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [pendingInvoices, setPendingInvoices] = useState<PendingInvoiceOption[]>([]);

  // Form states
  const [customerId, setCustomerId] = useState<number | ''>(preselectedCustomerId || '');
  const [invoiceId, setInvoiceId] = useState<number | ''>('');
  const [allocationMode, setAllocationMode] = useState<'AUTO' | 'INVOICE' | 'OPENING_BALANCE'>('AUTO');
  
  const [amountKd, setAmountKd] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [receiptDate, setReceiptDate] = useState(new Date().toISOString().split('T')[0]);
  const [referenceNo, setReferenceNo] = useState('');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  // Load customers
  useEffect(() => {
    if (isOpen) {
      api.get('/customers').then(res => setCustomers(res.data)).catch(console.error);
    }
  }, [isOpen]);

  // Handle preselection logic
  useEffect(() => {
    if (isOpen && preselectedCustomerId) {
      setCustomerId(preselectedCustomerId);
    }
  }, [isOpen, preselectedCustomerId]);

  // Load pending invoices for selected customer
  useEffect(() => {
    if (!customerId) {
      setPendingInvoices([]);
      setInvoiceId('');
      setAllocationMode('AUTO');
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

  if (!isOpen) return null;

  const selectedCustomerObj = customers.find((c) => c.id === customerId);

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
        allocationMode,
        amountKd: parsedAmount,
        paymentMethod,
        receiptDate,
        notes: notes.trim() ? `${referenceNo ? `Ref: ${referenceNo} | ` : ''}${notes.trim()}` : referenceNo ? `Ref: ${referenceNo}` : undefined,
      };

      const res = await api.post('/payments', payload);
      onSuccess(res.data);
      
    } catch (err: any) {
      setFormError(err.response?.data?.message || t.common.error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-200 animate-scale-in flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <CreditCard size={18} className="text-emerald-600" />
            <span>{t.payments.receivePayment}</span>
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Form */}
        <div className="overflow-y-auto flex-1">
          <form id="receivePaymentForm" onSubmit={handleSavePayment} className="p-6 space-y-4">
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
                onChange={setCustomerId}
                disabled={!!preselectedCustomerId}
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

            {/* Allocation Target */}
            {selectedCustomerObj && Number(selectedCustomerObj.totalOutstandingKd) > 0 && (
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Allocate Payment To
                </label>
                <select
                  value={allocationMode === 'INVOICE' && invoiceId ? `INV-${invoiceId}` : allocationMode}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === 'AUTO') {
                      setAllocationMode('AUTO');
                      setInvoiceId('');
                      setAmountKd('');
                    } else if (val === 'OPENING_BALANCE') {
                      setAllocationMode('OPENING_BALANCE');
                      setInvoiceId('');
                      // You can prefill the amount with the opening balance if you have it in CustomerOption
                      // but for now let's just let user type it or you'd need openingOutstandingKd in the option
                      setAmountKd('');
                    } else if (val.startsWith('INV-')) {
                      setAllocationMode('INVOICE');
                      const invId = Number(val.replace('INV-', ''));
                      setInvoiceId(invId);
                      const inv = pendingInvoices.find((i) => i.id === invId);
                      if (inv) {
                        setAmountKd(String(Number(inv.balanceKd).toFixed(3)));
                      }
                    }
                  }}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all"
                >
                  <option value="AUTO">Auto-Allocate (Oldest First)</option>
                  <option value="OPENING_BALANCE">Previous / Opening Outstanding Balance</option>
                  <optgroup label="Specific Invoices">
                    {pendingInvoices.map((inv) => (
                      <option key={inv.id} value={`INV-${inv.id}`}>
                        {inv.invoiceNumber} ({inv.invoiceDate}) — Balance: {Number(inv.balanceKd).toFixed(3)} KD
                      </option>
                    ))}
                  </optgroup>
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
          </form>
        </div>

        {/* Modal Buttons */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 font-semibold text-sm rounded-xl transition-colors cursor-pointer border border-slate-200 shadow-xs"
          >
            {t.common.cancel}
          </button>
          <button
            type="submit"
            form="receivePaymentForm"
            disabled={saving}
            className="px-5 py-2 bg-slate-900 hover:bg-black text-white font-bold text-sm rounded-xl shadow-md transition-all cursor-pointer inline-flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? t.common.loading : t.payments.savePayment}
          </button>
        </div>
      </div>
    </div>
  );
};
