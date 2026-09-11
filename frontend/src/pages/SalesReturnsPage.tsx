import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSalesReturns } from '../hooks/useSalesReturns';
import type { SalesReturn } from '../hooks/useSalesReturns';
import { Search, Plus, AlertCircle } from 'lucide-react';
import { normalizeSearchText } from '../utils/searchUtils';

export const SalesReturnsPage: React.FC = () => {
  const { fetchReturns, loading, error } = useSalesReturns();
  const [returns, setReturns] = useState<SalesReturn[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const loadReturns = async () => {
    try {
      const data = await fetchReturns();
      setReturns(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadReturns();
  }, [fetchReturns]);

  const filteredReturns = returns.filter((r) => {
    const q = normalizeSearchText(searchTerm);
    return (
      normalizeSearchText(r.returnNumber).includes(q) ||
      normalizeSearchText(r.customer?.name).includes(q) ||
      normalizeSearchText(r.invoice?.invoiceNumber).includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Sales Returns / Credit Notes</h1>
          <p className="text-sm text-slate-500 mt-1">Manage customer returns and refunds</p>
        </div>
        <button
          onClick={() => navigate('/sales-returns/create')}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span className="font-medium">Create Return</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {/* Controls */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Return #, Customer, or Invoice #"
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Date & Number
                </th>
                <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Invoice
                </th>
                <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">
                  Return Amount
                </th>
                <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">
                  Status
                </th>
                <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">
                  Refund Due
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    Loading...
                  </td>
                </tr>
              ) : filteredReturns.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    No returns found.
                  </td>
                </tr>
              ) : (
                filteredReturns.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-medium text-slate-900">{r.returnNumber}</div>
                      <div className="text-sm text-slate-500">{new Date(r.returnDate).toLocaleDateString()}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-slate-900 font-medium">{r.customer?.name}</div>
                    </td>
                    <td className="py-4 px-6 text-blue-600 hover:underline cursor-pointer">
                      {r.invoice?.invoiceNumber}
                    </td>
                    <td className="py-4 px-6 text-right font-medium text-slate-900">
                      {Number(r.totalReturnAmountKd).toFixed(3)} K.D.
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          r.status === 'POSTED'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right font-medium">
                      {r.status === 'POSTED' && Number(r.refundRequiredKd) > 0 ? (
                        <span className="text-amber-600">{Number(r.refundRequiredKd).toFixed(3)} K.D.</span>
                      ) : (
                        <span className="text-slate-400">0.000 K.D.</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
