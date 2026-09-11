import React, { useState, useEffect } from 'react';
import { DollarSign, X, AlertCircle } from 'lucide-react';
import api from '../../services/api';

interface AdjustOpeningBalanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  customerId: number;
  customerName: string;
}

export const AdjustOpeningBalanceModal: React.FC<AdjustOpeningBalanceModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  customerId,
  customerName,
}) => {
  const [openingBalanceOriginalKd, setOpeningBalanceOriginalKd] = useState<string>('');
  const [currentOutstandingKd, setCurrentOutstandingKd] = useState<number>(0);
  const [openingBalanceDate, setOpeningBalanceDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch current opening balance details if any
  useEffect(() => {
    if (isOpen && customerId) {
      api.get(`/customers/${customerId}`)
        .then(res => {
          const c = res.data;
          setCurrentOutstandingKd(c.openingOutstandingKd || 0);
          setOpeningBalanceOriginalKd(c.openingOutstandingKd ? String(c.openingOutstandingKd) : '');
          setOpeningBalanceDate(c.openingBalanceDate || new Date().toISOString().split('T')[0]);
        })
        .catch(err => console.error('Failed to load customer details', err));
    }
  }, [isOpen, customerId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!openingBalanceOriginalKd || isNaN(Number(openingBalanceOriginalKd))) {
      setError('Please enter a valid amount.');
      return;
    }

    const targetKd = Number(openingBalanceOriginalKd);
    const deltaKd = targetKd - currentOutstandingKd;

    if (deltaKd === 0) {
      setError('No changes made to the balance.');
      return;
    }

    if (!notes || !notes.trim()) {
      setError('Reason / Notes is required for adjustments.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await api.post(`/customers/${customerId}/opening-balance`, {
        amountKd: deltaKd,
        reason: notes,
      });
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to adjust opening balance.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
        <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            <span>Adjust Opening Balance</span>
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200">
            Setting the opening balance for <strong>{customerName}</strong>. 
            This represents the amount owed before using this software.
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Opening Balance (K.D.)</label>
            <input
              type="number"
              step="0.001"
              min="0"
              required
              value={openingBalanceOriginalKd}
              onChange={(e) => setOpeningBalanceOriginalKd(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-900 outline-none"
              placeholder="e.g. 150.000"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Balance As Of Date</label>
            <input
              type="date"
              required
              value={openingBalanceDate}
              onChange={(e) => setOpeningBalanceDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-900 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Reason / Notes (Required)</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-900 outline-none"
              placeholder="e.g. Migrated from old ledger"
            />
          </div>

          <div className="pt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Balance'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
