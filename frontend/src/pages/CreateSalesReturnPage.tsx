import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowLeft, Save, AlertCircle, ChevronDown } from 'lucide-react';
import { useSalesReturns } from '../hooks/useSalesReturns';
import api from '../services/api';
import { normalizeSearchText } from '../utils/searchUtils';

const InvoiceCombobox = ({
  invoices,
  onSelect,
  disabled
}: {
  invoices: any[];
  onSelect: (inv: any) => void;
  disabled?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      inputRef.current?.focus();
      setHighlightedIndex(0);
    } else {
      setSearch('');
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  const filtered = useMemo(() => {
    let list = invoices.filter(i => i.status === 'POSTED');

    if (!search.trim()) {
      // Show recent eligible (not obviously fully returned based on KD)
      list = list.filter(i => !(i.totalAmountKd > 0 && Number(i.totalReturnedKd) >= Number(i.totalAmountKd) - 0.001));
      return list.slice(0, 20);
    }

    const q = normalizeSearchText(search);
    return list.filter(i => 
      normalizeSearchText(i.invoiceNumber).includes(q) ||
      normalizeSearchText(i.customer?.name).includes(q) ||
      normalizeSearchText(i.customer?.nameAr).includes(q) ||
      normalizeSearchText(i.customer?.phone).includes(q)
    );
  }, [invoices, search]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => Math.min(prev + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[highlightedIndex]) {
        onSelect(filtered[highlightedIndex]);
        setIsOpen(false);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
    }
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      {!isOpen ? (
        <div 
          tabIndex={disabled ? -1 : 0}
          onKeyDown={handleKeyDown}
          onClick={() => { if (!disabled) setIsOpen(true); }}
          className={`w-full px-4 py-3 border border-slate-200 rounded-xl flex items-center justify-between transition-all ${disabled ? 'bg-slate-50 text-slate-500 cursor-not-allowed' : 'bg-slate-50 hover:bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer'}`}
        >
          <div className="flex items-center text-slate-500">
            <Search size={20} className="mr-3" />
            <span>Search by invoice number, customer name, Arabic name, or phone...</span>
          </div>
          <ChevronDown size={20} className="text-slate-400" />
        </div>
      ) : (
        <div className="w-full bg-white border border-slate-300 rounded-xl shadow-2xl z-50 overflow-hidden absolute top-0 left-0">
          <div className="p-3 border-b border-slate-100 flex items-center bg-slate-50">
            <Search size={20} className="text-blue-600 ml-2 mr-3 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setHighlightedIndex(0);
              }}
              onKeyDown={handleKeyDown}
              placeholder="Search by invoice number, customer name, Arabic name, or phone..."
              className="w-full bg-transparent border-none text-base focus:outline-none focus:ring-0 py-1"
            />
          </div>
          <div className="max-h-96 overflow-y-auto py-2">
            {filtered.length === 0 ? (
              <div className="px-6 py-8 text-slate-500 text-center">
                <p className="font-medium text-slate-700">No eligible invoice found.</p>
                <p className="text-sm mt-1">Try searching by invoice number, customer name, Arabic name, or phone.</p>
              </div>
            ) : (
              filtered.map((inv, idx) => (
                <div
                  key={inv.id}
                  onClick={() => {
                    onSelect(inv);
                    setIsOpen(false);
                  }}
                  onMouseEnter={() => setHighlightedIndex(idx)}
                  className={`px-5 py-3 cursor-pointer border-b border-slate-50 last:border-0 ${highlightedIndex === idx ? 'bg-blue-50/70' : 'hover:bg-slate-50'}`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-bold text-slate-900 text-sm mb-1">{inv.invoiceNumber}</div>
                      <div className="text-slate-700 font-medium text-sm">
                        {inv.customer?.name}
                        {inv.customer?.nameAr && <span className="font-arabic font-normal text-slate-500 ml-1.5">({inv.customer.nameAr})</span>}
                      </div>
                      {inv.customer?.phone && <div className="text-xs text-slate-500 mt-0.5">{inv.customer.phone}</div>}
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-slate-700">{new Date(inv.invoiceDate).toLocaleDateString()}</div>
                      <div className="text-sm font-bold text-blue-700 mt-1">KD {Number(inv.totalAmountKd).toFixed(3)}</div>
                      <div className="text-xs text-slate-500 mt-0.5">Total Pcs: {inv.totalPcs}</div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export const CreateSalesReturnPage: React.FC = () => {
  const navigate = useNavigate();
  const { createReturn } = useSalesReturns();

  const [allInvoices, setAllInvoices] = useState<any[]>([]);
  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // returnLines[invoiceLineId] = { returnDozen, returnPieces }
  const [returnLines, setReturnLines] = useState<Record<number, { dozen: number; pieces: number }>>({});
  const [reason, setReason] = useState('Customer changed mind');

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const res = await api.get('/sales');
        const invs = res.data.data || res.data;
        setAllInvoices(invs);
      } catch (err) {
        console.error('Failed to load invoices', err);
      }
    };
    fetchInvoices();
  }, []);

  const handleSelectInvoice = async (inv: any) => {
    setLoading(true);
    setError(null);
    try {
      if (inv.status === 'CANCELLED') {
        setError('Cannot return a cancelled invoice');
        setInvoice(null);
        return;
      }
      
      // Fetch previous returns to calculate remaining quantities
      const returnsRes = await api.get(`/sales-returns/invoice/${inv.id}`);
      const pastReturns = returnsRes.data.data || returnsRes.data || [];
      
      // Calculate previously returned pieces per line (POSTED only)
      const returnedPcsMap: Record<number, number> = {};
      for (const ret of pastReturns) {
        if (ret.status === 'POSTED' && ret.lines) {
          for (const rline of ret.lines) {
            returnedPcsMap[rline.invoiceLineId] = (returnedPcsMap[rline.invoiceLineId] || 0) + Number(rline.returnTotalPcs || 0);
          }
        }
      }
      
      // Attach to invoice lines
      inv.lines = inv.lines?.map((line: any) => {
        const alreadyReturnedPcs = returnedPcsMap[line.id] || 0;
        const remainingPcs = Number(line.totalPcs || 0) - alreadyReturnedPcs;
        return { ...line, alreadyReturnedPcs, remainingPcs };
      });

      setInvoice(inv);
      setReturnLines({});
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load invoice details');
      setInvoice(null);
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (lineId: number, field: 'dozen' | 'pieces', value: string) => {
    const num = parseInt(value) || 0;
    setReturnLines((prev) => ({
      ...prev,
      [lineId]: {
        ...prev[lineId],
        [field]: num,
        ...(field === 'dozen' ? {} : { pieces: prev[lineId]?.pieces || 0 }),
        ...(field === 'pieces' ? {} : { dozen: prev[lineId]?.dozen || 0 }),
      },
    }));
  };

  const calculateTotalReturn = () => {
    if (!invoice || !invoice.lines) return 0;
    let total = 0;
    for (const line of invoice.lines) {
      const ret = returnLines[line.id];
      if (!ret) continue;
      const totalPcs = (ret.dozen || 0) * 12 + (ret.pieces || 0);
      const originalPricePerDozen = Number(line.unitPriceKd);
      total += (totalPcs / 12) * originalPricePerDozen;
    }
    return total;
  };

  const handleSubmit = async () => {
    if (!invoice) return;

    // Filter out empty returns
    const lines = Object.entries(returnLines)
      .map(([lineId, qty]) => ({
        invoiceLineId: parseInt(lineId),
        returnDozen: qty.dozen || 0,
        returnPieces: qty.pieces || 0,
      }))
      .filter((l) => l.returnDozen > 0 || l.returnPieces > 0);

    if (lines.length === 0) {
      setError('Please specify return quantities for at least one item.');
      return;
    }

    try {
      await createReturn({
        invoiceId: invoice.id,
        returnReason: reason,
        lines,
      });
      navigate('/sales-returns');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create return');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/sales-returns')}
          className="p-2 hover:bg-slate-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-slate-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Create Sales Return</h1>
          <p className="text-sm text-slate-500">Process a return or credit note for an existing invoice</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6">
        <div className="flex gap-4 relative">
          <div className="flex-1 w-full">
            <InvoiceCombobox 
              invoices={allInvoices}
              onSelect={handleSelectInvoice}
              disabled={loading}
            />
          </div>
          {invoice && (
            <button
              onClick={() => {
                setInvoice(null);
                setReturnLines({});
              }}
              disabled={loading}
              className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors disabled:opacity-50"
            >
              Clear
            </button>
          )}
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        {invoice && (
          <div className="space-y-6 border-t border-slate-100 pt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl">
              <div>
                <div className="text-sm text-slate-500">Invoice Number</div>
                <div className="font-medium">{invoice.invoiceNumber}</div>
              </div>
              <div>
                <div className="text-sm text-slate-500">Customer</div>
                <div className="font-medium">{invoice.customer?.name}</div>
              </div>
              <div>
                <div className="text-sm text-slate-500">Date</div>
                <div className="font-medium">{new Date(invoice.invoiceDate).toLocaleDateString()}</div>
              </div>
              <div>
                <div className="text-sm text-slate-500">Gross Total</div>
                <div className="font-medium">{Number(invoice.totalAmountKd).toFixed(3)} K.D.</div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 mb-4">Select Return Quantities</h3>
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Product</th>
                      <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Orig. Qty</th>
                      <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Prev. Returned</th>
                      <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Remaining</th>
                      <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Orig. Price (Dz)</th>
                      <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase text-center">Return Dz</th>
                      <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase text-center">Return Pcs</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {invoice.lines?.map((line: any) => {
                      const ret = returnLines[line.id] || { dozen: 0, pieces: 0 };
                      const currentRetPcs = (ret.dozen || 0) * 12 + (ret.pieces || 0);
                      const isOverReturn = currentRetPcs > line.remainingPcs;

                      return (
                        <tr key={line.id} className={currentRetPcs > 0 ? (isOverReturn ? 'bg-red-50/50' : 'bg-blue-50/50') : ''}>
                          <td className="py-3 px-4">
                            <div className="font-medium">{line.product?.nameEn}</div>
                            <div className="text-xs text-slate-500">{line.product?.articleNumber}</div>
                          </td>
                          <td className="py-3 px-4">
                            {line.dozen} dz {line.pieces} pcs
                          </td>
                          <td className="py-3 px-4 text-amber-600 font-medium">
                            {Math.floor(line.alreadyReturnedPcs / 12)} dz {line.alreadyReturnedPcs % 12} pcs
                          </td>
                          <td className="py-3 px-4 text-emerald-600 font-medium">
                            {Math.floor(line.remainingPcs / 12)} dz {line.remainingPcs % 12} pcs
                          </td>
                          <td className="py-3 px-4">
                            {Number(line.unitPriceKd).toFixed(3)} K.D.
                          </td>
                          <td className="py-3 px-4 text-center">
                            <input
                              type="number"
                              min="0"
                              disabled={line.remainingPcs === 0}
                              className={`w-20 px-2 py-1 border rounded-lg text-center focus:ring-2 focus:ring-blue-600 ${isOverReturn ? 'border-red-500' : 'border-slate-200'}`}
                              value={ret.dozen || ''}
                              onChange={(e) => handleQuantityChange(line.id, 'dozen', e.target.value)}
                            />
                          </td>
                          <td className="py-3 px-4 text-center">
                            <input
                              type="number"
                              min="0"
                              max="11"
                              disabled={line.remainingPcs === 0}
                              className={`w-20 px-2 py-1 border rounded-lg text-center focus:ring-2 focus:ring-blue-600 ${isOverReturn ? 'border-red-500' : 'border-slate-200'}`}
                              value={ret.pieces || ''}
                              onChange={(e) => handleQuantityChange(line.id, 'pieces', e.target.value)}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              
              {invoice.lines?.every((l: any) => l.remainingPcs === 0) && (
                <div className="mt-4 p-4 bg-amber-50 text-amber-700 rounded-xl border border-amber-200 font-medium text-center">
                  All items from this invoice have already been returned.
                </div>
              )}
            </div>

            <div className="flex items-end justify-between">
              <div className="w-1/2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Reason for Return</label>
                <select
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                >
                  <option value="Customer changed mind">Customer changed mind</option>
                  <option value="Defective / Damaged product">Defective / Damaged product</option>
                  <option value="Wrong item delivered">Wrong item delivered</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="text-right">
                <div className="text-sm text-slate-500 mb-1">Total Return Amount</div>
                <div className="text-3xl font-bold text-blue-600">
                  {calculateTotalReturn().toFixed(3)} K.D.
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 flex justify-end gap-4">
              <button
                onClick={() => navigate('/sales-returns')}
                className="px-6 py-3 font-medium text-slate-600 hover:bg-slate-50 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading || calculateTotalReturn() <= 0}
                className="px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="w-5 h-5" />
                Post Return
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
