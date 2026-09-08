import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import {
  X,
  BookOpen,
  Printer,
  Clock,
  ArrowDownLeft,
  ArrowUpRight,
  Receipt,
  AlertCircle,
} from 'lucide-react';

interface LedgerRow {
  id: number;
  date: string;
  type: string;
  reference: string;
  notes: string;
  debitKd: number;
  creditKd: number;
  balanceKd: number;
  status?: string;
}

interface CustomerLedgerData {
  customer: {
    id: number;
    name: string;
    nameAr?: string;
    phone?: string;
    address?: string;
    totalSalesKd: number;
    totalReceivedKd: number;
    outstandingKd: number;
  };
  totalSalesKd: number;
  totalReceivedKd: number;
  outstandingKd: number;
  ledger: LedgerRow[];
}

interface CustomerLedgerModalProps {
  customerId: number;
  customerName: string;
  isOpen: boolean;
  onClose: () => void;
  onNewSale?: (customerId: number) => void;
}

export const CustomerLedgerModal: React.FC<CustomerLedgerModalProps> = ({
  customerId,
  customerName,
  isOpen,
  onClose,
}) => {
  const [data, setData] = useState<CustomerLedgerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen || !customerId) return;

    const fetchLedger = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await api.get(`/customers/${customerId}/ledger`);
        setData(res.data);
      } catch (err: any) {
        console.error('Failed to load customer ledger', err);
        setError(err.response?.data?.message || 'Failed to fetch customer ledger');
      } finally {
        setLoading(false);
      }
    };

    fetchLedger();
  }, [isOpen, customerId]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto print:p-0 print:bg-white">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 flex flex-col max-h-[90vh] print:max-h-none print:shadow-none print:border-none">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0 print:bg-slate-100 print:text-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold print:bg-slate-200 print:text-slate-900">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg text-white print:text-slate-900">
                  Customer Statement & Ledger
                </h3>
                <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-800 text-sky-300 border border-slate-700">
                  Audit Verified
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium print:text-slate-600">
                {customerName} {data?.customer?.nameAr && `• ${data.customer.nameAr}`}
                {data?.customer?.phone && ` • Tel: ${data.customer.phone}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 print:hidden">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              title="Print Customer Statement"
            >
              <Printer className="w-3.5 h-3.5 text-sky-400" />
              <span>Print</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Financial KPI Summary Bar */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 shrink-0">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Total Invoiced (Debits)
              </div>
              <div className="text-lg font-black text-slate-900 mt-0.5">
                KD {Number(data?.totalSalesKd || 0).toFixed(3)}
              </div>
            </div>

            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Total Received (Credits)
              </div>
              <div className="text-lg font-black text-emerald-700 mt-0.5">
                KD {Number(data?.totalReceivedKd || 0).toFixed(3)}
              </div>
            </div>

            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Net Outstanding Balance
              </div>
              <div className="text-lg font-black text-rose-700 mt-0.5">
                KD {Number(data?.outstandingKd || 0).toFixed(3)}
              </div>
            </div>
          </div>
        </div>

        {/* Ledger Table Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {loading ? (
            <div className="py-16 text-center text-slate-400 font-medium">
              <Clock className="w-8 h-8 mx-auto text-slate-300 animate-spin mb-2" />
              Generating customer account ledger...
            </div>
          ) : error ? (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          ) : !data || data.ledger.length === 0 ? (
            <div className="py-16 text-center text-slate-400 font-medium">
              <Receipt className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              No financial transactions found for this customer.
            </div>
          ) : (
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-100/80 border-b border-slate-200 text-xs font-bold text-slate-700 uppercase tracking-wider">
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Reference #</th>
                    <th className="px-4 py-3">Description / Remarks</th>
                    <th className="px-4 py-3 text-right">Debit (KD)</th>
                    <th className="px-4 py-3 text-right">Credit (KD)</th>
                    <th className="px-4 py-3 text-right">Balance (KD)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.ledger.map((row, idx) => {
                    const isPayment = row.type.toLowerCase().includes('payment');
                    const isCancelled = row.type.toLowerCase().includes('cancelled');

                    return (
                      <tr
                        key={idx}
                        className={`hover:bg-slate-50/80 transition-colors ${
                          isCancelled ? 'bg-slate-50/60 opacity-60' : ''
                        }`}
                      >
                        <td className="px-4 py-3 text-xs font-medium text-slate-600 whitespace-nowrap">
                          {row.date}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-bold ${
                              isPayment
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : isCancelled
                                ? 'bg-slate-200 text-slate-600 line-through'
                                : 'bg-sky-50 text-sky-800 border border-sky-200'
                            }`}
                          >
                            {isPayment ? (
                              <ArrowDownLeft className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <ArrowUpRight className="w-3 h-3 text-sky-600" />
                            )}
                            {row.type}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs font-bold text-slate-900 whitespace-nowrap">
                          {row.reference}
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-600 max-w-xs">
                          {row.notes}
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                          {row.debitKd > 0 ? row.debitKd.toFixed(3) : '—'}
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-emerald-700 whitespace-nowrap">
                          {row.creditKd > 0 ? row.creditKd.toFixed(3) : '—'}
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-black text-sm whitespace-nowrap">
                          <span
                            className={
                              row.balanceKd > 0
                                ? 'text-rose-700'
                                : row.balanceKd < 0
                                ? 'text-emerald-700'
                                : 'text-slate-500'
                            }
                          >
                            {row.balanceKd.toFixed(3)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-100/90 font-bold border-t-2 border-slate-300 text-xs">
                    <td colSpan={4} className="px-4 py-3 text-slate-800 uppercase tracking-wider">
                      Ending Balance Due
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">
                      {data.totalSalesKd.toFixed(3)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-emerald-700">
                      {data.totalReceivedKd.toFixed(3)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-black text-base text-rose-700">
                      KD {data.outstandingKd.toFixed(3)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0 print:hidden">
          <div className="text-xs text-slate-500 font-medium">
            Calculated from verified Sales Invoices and Customer Receipts in Rashidi Star ERP.
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
export default CustomerLedgerModal;
