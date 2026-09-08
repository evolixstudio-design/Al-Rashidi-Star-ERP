import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslations } from '../hooks/useTranslations';
import api from '../services/api';
import {
  PackagePlus,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  X,
  Truck,
  ArrowRight,
  ArrowLeft,
  Receipt,
  Boxes,
  Eye,
  DollarSign,
  Printer,
  Sparkles,
  History,
  Trash2,
  Ban,
} from 'lucide-react';
import { TransactionAuditModal } from '../components/common/TransactionAuditModal';

/* ───────────────────── Interfaces ───────────────────── */

interface Supplier {
  id: number;
  name: string;
  country: string;
  phone?: string;
  totalPayable: number;
}

interface ProductSearchItem {
  id: number;
  articleNumber: string;
  nameEn: string;
  nameAr?: string;
  purchasePrice: number;
  sellingPrice: number;
  currentStockPcs: number;
  stockBreakdown: {
    dozen: number;
    pieces: number;
    totalPcs: number;
    displayDozPcs: string;
  };
}

interface ShipmentLineDraft {
  productId?: number;
  articleNumber: string;
  nameEn: string;
  dozen: number;
  pieces: number;
  totalPcs: number;
  unitCostKd: number;
  lineTotalKd: number;
  displayBreakdown: string;
}

interface PurchaseReceiptItem {
  id: number;
  receiptNumber: string;
  supplierId: number;
  supplier?: { id: number; name: string; country: string };
  shipmentContainerNo?: string;
  supplierInvoiceRef?: string;
  receiptDate: string;
  totalPcs: number;
  totalAmountKd: number;
  status: string;
  receivedBy: string;
  notes?: string;
  totalPcsBreakdown: {
    dozen: number;
    pieces: number;
    totalPcs: number;
    display: string;
  };
  lines?: {
    id: number;
    productId: number;
    product?: { articleNumber: string; nameEn: string };
    dozen: number;
    pieces: number;
    totalPcs: number;
    unitCostKd: number;
    lineTotalKd: number;
    displayBreakdown: string;
  }[];
}

export const PurchasesPage: React.FC = () => {
  const { t, lang } = useTranslations();
  const navigate = useNavigate();

  /* ── State ── */
  const [receipts, setReceipts] = useState<PurchaseReceiptItem[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modals
  const [showWizard, setShowWizard] = useState(false);
  const [activeReceipt, setActiveReceipt] = useState<PurchaseReceiptItem | null>(null);
  const [auditRef, setAuditRef] = useState<string | null>(null);

  /* ── Wizard Form State ── */
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [supplierId, setSupplierId] = useState<number | ''>('');
  const [shipmentContainerNo, setShipmentContainerNo] = useState('');
  const [receiptDate, setReceiptDate] = useState(new Date().toISOString().split('T')[0]);
  const [supplierInvoiceRef, setSupplierInvoiceRef] = useState('');
  const [notes, setNotes] = useState('');

  // Step 2 Item Entry
  const [lines, setLines] = useState<ShipmentLineDraft[]>([]);
  const [articleQuery, setArticleQuery] = useState('');
  const [productSuggestions, setProductSuggestions] = useState<ProductSearchItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<ProductSearchItem | null>(null);
  const [lineDozen, setLineDozen] = useState<number | ''>('');
  const [linePieces, setLinePieces] = useState<number | ''>('');
  const [lineUnitCostKd, setLineUnitCostKd] = useState<number | ''>('');
  const [newProductName, setNewProductName] = useState('');
  const [lineError, setLineError] = useState('');

  // Step 3 Submission
  const [submitting, setSubmitting] = useState(false);
  const [successReceipt, setSuccessReceipt] = useState<PurchaseReceiptItem | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  const handleCancelReceipt = async (rec: PurchaseReceiptItem) => {
    if (
      !window.confirm(
        `Are you sure you want to cancel purchase receipt ${rec.receiptNumber}?\n\nThis will deduct the received goods from current inventory and reverse supplier payable balance.`,
      )
    ) {
      return;
    }

    try {
      await api.post(`/purchases/${rec.id}/cancel`);
      showToast(`Purchase receipt ${rec.receiptNumber} was successfully cancelled and stock reversed.`, 'success');
      fetchData();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to cancel purchase receipt.', 'error');
    }
  };

  const handleDeleteReceipt = async (rec: PurchaseReceiptItem) => {
    if (
      !window.confirm(
        `Are you ABSOLUTELY sure you want to permanently delete purchase receipt ${rec.receiptNumber}?\n\nThis will completely remove the record, reverse stock, and reverse supplier payable balance.`
      )
    ) {
      return;
    }

    try {
      await api.delete(`/purchases/${rec.id}`);
      showToast(`Purchase receipt ${rec.receiptNumber} deleted permanently.`, 'success');
      fetchData();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to delete purchase receipt.', 'error');
    }
  };

  const articleInputRef = useRef<HTMLInputElement>(null);

  /* ── Load initial data ── */
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [recRes, supRes] = await Promise.all([
        api.get('/purchases'),
        api.get('/suppliers'),
      ]);
      setReceipts(recRes.data);
      setSuppliers(supRes.data);
    } catch (err) {
      console.error('Failed to load purchases data', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Product Autocomplete Search
  useEffect(() => {
    if (!articleQuery.trim() || selectedProduct) {
      setProductSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await api.get(`/products?search=${encodeURIComponent(articleQuery.trim())}`);
        setProductSuggestions(res.data.slice(0, 6));
      } catch (err) {
        console.error('Failed to query products', err);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [articleQuery, selectedProduct]);

  /* ── Reset Wizard ── */
  const resetWizard = () => {
    setStep(1);
    setSupplierId('');
    setShipmentContainerNo('');
    setReceiptDate(new Date().toISOString().split('T')[0]);
    setSupplierInvoiceRef('');
    setNotes('');
    setLines([]);
    resetLineInputs();
    setSuccessReceipt(null);
    setLineError('');
  };

  const resetLineInputs = () => {
    setArticleQuery('');
    setSelectedProduct(null);
    setNewProductName('');
    setLineDozen('');
    setLinePieces('');
    setLineUnitCostKd('');
    setLineError('');
    setProductSuggestions([]);
    setTimeout(() => {
      articleInputRef.current?.focus();
    }, 50);
  };

  /* ── Add Line Item ── */
  const handleAddLine = () => {
    setLineError('');

    let art = articleQuery.trim().toUpperCase();
    let prodName = selectedProduct ? selectedProduct.nameEn : newProductName.trim();

    // If both are empty and no product selected, prompt user
    if (!art && !prodName) {
      setLineError(lang === 'hi' ? 'Article number ya product naam enter karein.' : 'Please enter article number or product name.');
      return;
    }

    // If article is missing, auto-generate code
    if (!art) {
      art = `ART-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    // If product name is missing, use article code
    if (!prodName) {
      prodName = `Product ${art}`;
    }

    const doz = Number(lineDozen || 0);
    const pcs = Number(linePieces || 0);
    const totalPcs = doz * 12 + pcs;

    if (totalPcs <= 0) {
      setLineError(lang === 'hi' ? 'Quantity enter karein (Kam se kam 1 Dozen ya 1 Piece).' : 'Please enter quantity (at least 1 Dozen or 1 Piece).');
      return;
    }

    const cost = Number(lineUnitCostKd || 0);
    // Price is per dozen: dozQty = dozen + (pieces / 12)
    const dozQty = doz + (pcs / 12);
    const lineTotal = Number((dozQty * cost).toFixed(3));

    const newLine: ShipmentLineDraft = {
      productId: selectedProduct ? selectedProduct.id : undefined,
      articleNumber: art,
      nameEn: prodName,
      dozen: doz,
      pieces: pcs,
      totalPcs,
      unitCostKd: cost,
      lineTotalKd: lineTotal,
      displayBreakdown: `${doz} Doz ${pcs} Pcs (${totalPcs} Total Pcs)`,
    };

    setLines([...lines, newLine]);
    resetLineInputs();
  };

  const handleRemoveLine = (idx: number) => {
    setLines(lines.filter((_, i) => i !== idx));
  };

  /* ── Select from autocomplete ── */
  const handleSelectProduct = (prod: ProductSearchItem) => {
    setSelectedProduct(prod);
    setArticleQuery(prod.articleNumber);
    setLineUnitCostKd(prod.purchasePrice || '');
    setProductSuggestions([]);
  };

  /* ── Final Submit ── */
  const handleSubmitShipment = async () => {
    if (lines.length === 0) {
      setLineError(lang === 'hi' ? 'Kam se kam ek product line add karein.' : 'Please add at least one product line.');
      return;
    }

    try {
      setSubmitting(true);
      setLineError('');

      const payload = {
        supplierId: supplierId ? Number(supplierId) : undefined,
        shipmentContainerNo: shipmentContainerNo.trim() || undefined,
        supplierInvoiceRef: supplierInvoiceRef.trim() || undefined,
        receiptDate: receiptDate || new Date().toISOString().split('T')[0],
        notes: notes.trim() || undefined,
        items: lines.map((l) => ({
          productId: l.productId,
          articleNumber: l.articleNumber,
          nameEn: l.nameEn,
          dozen: l.dozen,
          pieces: l.pieces,
          unitCostKd: l.unitCostKd,
        })),
      };

      const res = await api.post('/purchases', payload);
      setSuccessReceipt(res.data);
      fetchData();
    } catch (err: any) {
      console.error('Failed to post shipment', err);
      setLineError(err.response?.data?.message || 'Shipment receive karne me masla hua.');
    } finally {
      setSubmitting(false);
    }
  };

  // Grand totals of lines in wizard
  const wizardTotalPcs = lines.reduce((sum, l) => sum + l.totalPcs, 0);
  const wizardTotalDoz = Math.floor(wizardTotalPcs / 12);
  const wizardTotalPcsRem = wizardTotalPcs % 12;
  const wizardTotalAmountKd = lines.reduce((sum, l) => sum + l.lineTotalKd, 0);

  // Filtered past shipments
  const filteredReceipts = receipts.filter((r) => {
    if (!search.trim()) return true;
    const term = search.toLowerCase().trim();
    return (
      r.receiptNumber.toLowerCase().includes(term) ||
      (r.supplier?.name && r.supplier.name.toLowerCase().includes(term)) ||
      (r.shipmentContainerNo && r.shipmentContainerNo.toLowerCase().includes(term)) ||
      (r.supplierInvoiceRef && r.supplierInvoiceRef.toLowerCase().includes(term))
    );
  });

  // KPI Summary calculations
  const totalShipmentsCount = receipts.length;
  const totalPcsAll = receipts.reduce((sum, r) => sum + Number(r.totalPcs || 0), 0);
  const totalAmountAllKd = receipts.reduce((sum, r) => sum + Number(r.totalAmountKd || 0), 0);

  const selectedSupplierObj = suppliers.find((s) => s.id === Number(supplierId));

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            <PackagePlus className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {t.purchases.title}
            </h1>
            <p className="text-slate-600 text-sm">{t.purchases.subtitle}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            resetWizard();
            setShowWizard(true);
          }}
          className="px-5 py-2.5 bg-slate-900 hover:bg-black text-white font-bold text-sm rounded-xl shadow-md inline-flex items-center gap-2 transition-all cursor-pointer hover:shadow-lg active:scale-98 self-start md:self-auto"
        >
          <Plus className="w-4 h-4 text-emerald-400 stroke-[2.5]" />
          <span>{t.purchases.receiveShipment}</span>
        </button>
      </div>

      {/* 4 Clean Compact KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Shipments Received</span>
            <span className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <PackagePlus className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{totalShipmentsCount}</div>
          <div className="text-xs text-slate-400 mt-1">Total posted receipts</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Received</span>
            <span className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <Boxes className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">
            {totalPcsAll.toLocaleString()} <span className="text-xs font-semibold text-slate-500">Pcs</span>
          </div>
          <div className="text-xs text-slate-400 mt-1">
            {Math.floor(totalPcsAll / 12)} Doz {totalPcsAll % 12} Pcs
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Purchase Value</span>
            <span className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">
            KD {totalAmountAllKd.toFixed(3)}
          </div>
          <div className="text-xs text-slate-400 mt-1">Kuwait Dinar</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Suppliers</span>
            <span className="p-2 rounded-lg bg-slate-50 text-slate-600">
              <Truck className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">
            {suppliers.length}
          </div>
          <div className="text-xs text-slate-400 mt-1">Global supply partners</div>
        </div>
      </div>

      {/* Toast Alert */}
      {toast && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between ${
            toast.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2 font-medium text-sm">
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={lang === 'hi' ? 'Receipt number, supplier, container ya invoice reference se search karein...' : 'Search by receipt number, supplier, container, or invoice reference...'}
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-base"
          />
        </div>
        {search && (
          <button
            type="button"
            onClick={() => setSearch('')}
            className="p-2.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Receipts Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-slate-500 font-medium">
            <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-base">{t.common.loading}</p>
          </div>
        ) : filteredReceipts.length === 0 ? (
          <div className="py-16 text-center text-slate-500">
            <PackagePlus className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-lg font-semibold text-slate-700">{t.purchases.noPurchases}</p>
            <p className="text-sm text-slate-500 mt-1">
              {lang === 'hi' ? 'Naya shipment receive karne ke liye upar button dabayein.' : 'Click the button above to receive a new shipment.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-4 whitespace-nowrap">{t.purchases.receiptNo}</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">{t.purchases.date}</th>
                  <th className="py-3.5 px-4">{t.purchases.supplier}</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">{t.purchases.containerNo}</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">{t.purchases.supplierInvoice}</th>
                  <th className="py-3.5 px-4 text-right whitespace-nowrap">{t.purchases.totalPcs}</th>
                  <th className="py-3.5 px-4 text-right whitespace-nowrap">{t.purchases.totalKd}</th>
                  <th className="py-3.5 px-4 text-center whitespace-nowrap">{t.purchases.receivedBy}</th>
                  <th className="py-3.5 px-4 text-right whitespace-nowrap">{t.stock.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm">
                {filteredReceipts.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-emerald-700 text-base whitespace-nowrap">
                      {rec.receiptNumber}
                    </td>

                    <td className="py-3.5 px-4 text-slate-700 font-medium whitespace-nowrap">
                      {rec.receiptDate}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{rec.supplier?.name || 'Direct / Local Purchase'}</div>
                      <div className="text-xs text-slate-500">{rec.supplier?.country || 'Local Market'}</div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-800 font-medium">
                      {rec.shipmentContainerNo || '—'}
                    </td>

                    <td className="py-3.5 px-4 text-slate-800 font-medium">
                      {rec.supplierInvoiceRef || '—'}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="font-extrabold text-slate-900 text-base">
                        {rec.totalPcsBreakdown?.display}
                      </div>
                      <div className="text-xs text-slate-500 font-medium">
                        {rec.totalPcs} Total Pcs
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right font-extrabold text-slate-900 text-base">
                      {Number(rec.totalAmountKd).toFixed(3)}{' '}
                      <span className="text-xs font-semibold text-slate-500">{t.common.currency}</span>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-block px-2 py-1 bg-slate-100 text-slate-700 rounded-md text-xs font-semibold">
                        {rec.receivedBy || 'Owner'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setActiveReceipt(rec)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs rounded-lg border border-emerald-200 transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>{t.purchases.viewReceipt}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setAuditRef(rec.receiptNumber)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg border border-slate-200 transition-colors cursor-pointer"
                          title="View Shipment Audit Trail"
                        >
                          <History className="w-3.5 h-3.5 text-slate-500" />
                          <span>History</span>
                        </button>
                        {rec.status !== 'CANCELLED' ? (
                          <>
                            <button
                              type="button"
                              onClick={() => handleCancelReceipt(rec)}
                              title="Cancel Purchase & Reverse Stock"
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-lg border border-rose-200 transition-colors cursor-pointer"
                            >
                              <Ban className="w-3.5 h-3.5" />
                              <span>Cancel</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteReceipt(rec)}
                              title="Delete permanently"
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold text-xs rounded-lg border border-rose-300 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete</span>
                            </button>
                          </>
                        ) : (
                          <span className="inline-block px-2.5 py-1 bg-slate-100 text-slate-500 rounded text-xs font-semibold">
                            Cancelled
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ───────────────────── 3-STEP RECEIVE SHIPMENT WIZARD ───────────────────── */}
      {showWizard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-4xl w-full my-auto overflow-hidden flex flex-col max-h-[95vh]">
            {/* Wizard Header with Progress Steps */}
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-500 text-white flex items-center justify-center font-bold">
                  <PackagePlus className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight">
                    {t.purchases.receiveShipment}
                  </h2>
                  <p className="text-xs text-slate-400">
                    {step === 1 && t.purchases.step1Subtitle}
                    {step === 2 && t.purchases.step2Subtitle}
                    {step === 3 && t.purchases.step3Subtitle}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowWizard(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Stepper Indicator Bar */}
            <div className="bg-slate-100 px-6 py-3 border-b border-slate-200 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2 sm:gap-4 w-full">
                <div
                  className={`flex items-center gap-2 text-xs sm:text-sm font-bold ${
                    step >= 1 ? 'text-emerald-700' : 'text-slate-400'
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs text-white ${
                      step >= 1 ? 'bg-emerald-600' : 'bg-slate-300'
                    }`}
                  >
                    1
                  </span>
                  <span>Shipment Header</span>
                </div>

                <div className="h-0.5 flex-1 bg-slate-300 mx-1">
                  <div
                    className="h-full bg-emerald-600 transition-all duration-300"
                    style={{ width: step > 1 ? '100%' : '0%' }}
                  />
                </div>

                <div
                  className={`flex items-center gap-2 text-xs sm:text-sm font-bold ${
                    step >= 2 ? 'text-emerald-700' : 'text-slate-400'
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs text-white ${
                      step >= 2 ? 'bg-emerald-600' : 'bg-slate-300'
                    }`}
                  >
                    2
                  </span>
                  <span>{lang === 'hi' ? 'Mal Add Karein' : 'Add Products'}</span>
                </div>

                <div className="h-0.5 flex-1 bg-slate-300 mx-1">
                  <div
                    className="h-full bg-emerald-600 transition-all duration-300"
                    style={{ width: step === 3 ? '100%' : '0%' }}
                  />
                </div>

                <div
                  className={`flex items-center gap-2 text-xs sm:text-sm font-bold ${
                    step === 3 ? 'text-emerald-700' : 'text-slate-400'
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs text-white ${
                      step === 3 ? 'bg-emerald-600' : 'bg-slate-300'
                    }`}
                  >
                    3
                  </span>
                  <span>{lang === 'hi' ? 'Review aur Confirm' : 'Review & Confirm'}</span>
                </div>
              </div>
            </div>

            {/* Wizard Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {lineError && (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm font-semibold flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 shrink-0 text-rose-600" />
                  <span>{lineError}</span>
                </div>
              )}

              {/* ──────────────── STEP 1: SHIPMENT HEADER ──────────────── */}
              {step === 1 && (
                <div className="space-y-4 max-w-xl mx-auto py-2">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-emerald-900 text-sm">
                    {lang === 'hi' ? (
                      <><strong>Sabhi fields optional hain.</strong> Aap seedhe <strong>(Mal Add Karein)</strong> par click kar sakte hain ya supplier details bhar sakte hain.</>
                    ) : (
                      <><strong>All fields are optional.</strong> You can proceed directly to <strong>Add Products</strong> or enter supplier details below.</>
                    )}
                  </div>

                  {/* Supplier Select */}
                  <div>
                    <label className="block text-sm font-bold text-slate-800 mb-1">
                      {t.purchases.selectSupplier}{' '}
                      <span className="text-xs font-medium text-slate-500">
                        {lang === 'hi' ? '(Optional - Direct / Local Purchase)' : '(Optional - Direct / Local Purchase)'}
                      </span>
                    </label>
                    <select
                      value={supplierId}
                      onChange={(e) => setSupplierId(e.target.value ? Number(e.target.value) : '')}
                      className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 font-bold text-base focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      <option value="">
                        {lang === 'hi' ? '-- Direct Purchase / Local Market (Bina Supplier) --' : '-- Direct Purchase / Local Market (No Supplier) --'}
                      </option>
                      {suppliers.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.country})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Container / Shipment No */}
                  <div>
                    <label className="block text-sm font-bold text-slate-800 mb-1">
                      {t.purchases.containerNo}{' '}
                      <span className="text-xs font-normal text-slate-500">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={shipmentContainerNo}
                      onChange={(e) => setShipmentContainerNo(e.target.value)}
                      placeholder={t.purchases.containerPlaceholder}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl text-slate-900 font-bold text-base focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  {/* Date & Supplier Invoice */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-800 mb-1">
                        {t.purchases.date}{' '}
                        <span className="text-xs font-normal text-slate-500">
                          {lang === 'hi' ? '(Optional - Default Aaj)' : '(Optional - Defaults to Today)'}
                        </span>
                      </label>
                      <input
                        type="date"
                        value={receiptDate}
                        onChange={(e) => setReceiptDate(e.target.value)}
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl text-slate-900 font-bold text-base focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-800 mb-1">
                        {t.purchases.supplierInvoice}{' '}
                        <span className="text-xs font-normal text-slate-500">(Optional)</span>
                      </label>
                      <input
                        type="text"
                        value={supplierInvoiceRef}
                        onChange={(e) => setSupplierInvoiceRef(e.target.value)}
                        placeholder={t.purchases.invoiceRefPlaceholder}
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl text-slate-900 font-bold text-base focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-bold text-slate-800 mb-1">
                      {t.stock.notes}{' '}
                      <span className="text-xs font-normal text-slate-500">(Optional)</span>
                    </label>
                    <textarea
                      rows={2}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder={t.purchases.notesPlaceholder}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-slate-900 text-sm focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              )}

              {/* ──────────────── STEP 2: ADD PRODUCTS ──────────────── */}
              {step === 2 && (
                <div className="space-y-6">
                  {/* Active Shipment Mini Banner */}
                  <div className="bg-slate-100 p-3.5 rounded-xl flex items-center justify-between border border-slate-200 text-sm">
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-emerald-700" />
                      <span className="font-bold text-slate-900">
                        {selectedSupplierObj?.name || (lang === 'hi' ? 'Direct / Local Purchase (Bina Supplier)' : 'Direct / Local Purchase (No Supplier)')}
                      </span>
                      {shipmentContainerNo && (
                        <span className="text-slate-500">| Container: {shipmentContainerNo}</span>
                      )}
                    </div>
                    <div className="text-slate-600 font-medium">
                      {lang === 'hi' ? 'Tarikh' : 'Date'}: {receiptDate || (lang === 'hi' ? 'Aaj' : 'Today')}
                    </div>
                  </div>

                  {/* Product Entry Box */}
                  <div className="bg-slate-50 p-5 rounded-2xl border-2 border-emerald-500/40 shadow-xs space-y-4">
                    <div className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-emerald-600" />
                      <span>{lang === 'hi' ? 'Product Add Karein (Article Number aur Quantity)' : 'Add Products (Article Number & Quantity)'}</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                      {/* Article Number search */}
                      <div className="sm:col-span-4 relative">
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Article Number <span className="text-xs font-normal text-slate-500">{lang === 'hi' ? '(Search ya Auto-Code)' : '(Search or Auto-Code)'}</span>
                        </label>
                        <input
                          ref={articleInputRef}
                          type="text"
                          value={articleQuery}
                          onChange={(e) => {
                            setArticleQuery(e.target.value);
                            setSelectedProduct(null);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddLine();
                            }
                          }}
                          placeholder={t.purchases.articleSearch}
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 text-base uppercase focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        />

                        {/* Autocomplete Dropdown */}
                        {productSuggestions.length > 0 && !selectedProduct && (
                          <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-300 rounded-xl shadow-xl z-20 overflow-hidden divide-y divide-slate-100">
                            {productSuggestions.map((prod) => (
                              <button
                                key={prod.id}
                                type="button"
                                onClick={() => handleSelectProduct(prod)}
                                className="w-full text-left px-3.5 py-2 hover:bg-emerald-50 transition-colors flex items-center justify-between text-sm"
                              >
                                <div>
                                  <span className="font-bold text-emerald-700">{prod.articleNumber}</span>
                                  <span className="text-slate-800 ml-2 font-medium">{prod.nameEn}</span>
                                </div>
                                <span className="text-xs text-slate-500">
                                  Stock: {prod.stockBreakdown.displayDozPcs}
                                </span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Product Name */}
                      <div className="sm:col-span-4">
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          {t.purchases.productNameCol} <span className="text-xs font-normal text-slate-500">(Optional)</span>
                        </label>
                        {selectedProduct ? (
                          <div className="px-3.5 py-2.5 bg-slate-200/80 border border-slate-300 rounded-xl font-bold text-slate-900 text-sm truncate">
                            {selectedProduct.nameEn}
                          </div>
                        ) : (
                          <input
                            type="text"
                            value={newProductName}
                            onChange={(e) => setNewProductName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddLine();
                              }
                            }}
                            placeholder={lang === 'hi' ? 'Product naam likhein...' : 'Enter product name...'}
                            className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl font-medium text-slate-900 text-sm focus:ring-2 focus:ring-emerald-500"
                          />
                        )}
                      </div>

                      {/* Dozen */}
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          {t.purchases.dozen}
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={lineDozen}
                          onChange={(e) => setLineDozen(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                          onFocus={(e) => e.target.select()}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddLine();
                            }
                          }}
                          placeholder="0"
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 text-base text-center focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>

                      {/* Pieces */}
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          {t.purchases.pieces}
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="11"
                          value={linePieces}
                          onChange={(e) => setLinePieces(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                          onFocus={(e) => e.target.select()}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddLine();
                            }
                          }}
                          placeholder="0"
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 text-base text-center focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    </div>

                    {/* Quantity conversion live helper & Price */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-200">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-slate-600">Calculated Quantity:</span>
                        <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 rounded-lg text-sm font-extrabold">
                          {Number(lineDozen || 0) * 12 + Number(linePieces || 0)} Total Pcs
                        </span>
                        <span className="text-xs text-slate-500">
                          ({Number(lineDozen || 0)} Doz {Number(linePieces || 0)} Pcs)
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-0.5">
                            Cost per Dozen (K.D.) <span className="text-xs font-normal text-slate-500">(Optional)</span>
                          </label>
                          <input
                            type="number"
                            step="0.001"
                            min="0"
                            value={lineUnitCostKd}
                            onChange={(e) => setLineUnitCostKd(e.target.value === '' ? '' : parseFloat(e.target.value))}
                            onFocus={(e) => e.target.select()}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddLine();
                              }
                            }}
                            placeholder="0.000"
                            className="w-32 px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-bold text-slate-900 text-sm text-right focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={handleAddLine}
                          className="mt-4 sm:mt-3 inline-flex items-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-xs transition-colors cursor-pointer"
                        >
                          <Plus className="w-4 h-4 stroke-[2.5]" />
                          <span>{t.purchases.addItem}</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Added Lines Table */}
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <div className="bg-slate-100 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
                      <span className="font-bold text-slate-800 text-sm">
                        Shipment Lines ({lines.length})
                      </span>
                      <span className="text-xs text-slate-500">
                        {lang === 'hi' ? 'Maal check karein aur confirm karein' : 'Verify items and confirm'}
                      </span>
                    </div>

                    {lines.length === 0 ? (
                      <div className="py-12 text-center text-slate-500 text-sm">
                        {t.purchases.noItemsAdded}
                      </div>
                    ) : (
                      <table className="w-full text-left border-collapse text-sm">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs font-bold uppercase">
                            <th className="py-2.5 px-3">Article</th>
                            <th className="py-2.5 px-3">{lang === 'hi' ? 'Product Naam' : 'Product Name'}</th>
                            <th className="py-2.5 px-3 text-right">Dozen + Pcs</th>
                            <th className="py-2.5 px-3 text-right">Total Pcs</th>
                            <th className="py-2.5 px-3 text-right">Cost (K.D.)</th>
                            <th className="py-2.5 px-3 text-right">Line Total (K.D.)</th>
                            <th className="py-2.5 px-3 text-center">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {lines.map((item, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/80">
                              <td className="py-2.5 px-3 font-bold text-emerald-700">
                                {item.articleNumber}
                              </td>
                              <td className="py-2.5 px-3 font-semibold text-slate-900">
                                {item.nameEn}
                              </td>
                              <td className="py-2.5 px-3 text-right font-medium text-slate-700">
                                {item.dozen} Doz {item.pieces} Pcs
                              </td>
                              <td className="py-2.5 px-3 text-right font-extrabold text-slate-900">
                                {item.totalPcs} Pcs
                              </td>
                              <td className="py-2.5 px-3 text-right text-slate-800 font-medium">
                                {Number(item.unitCostKd).toFixed(3)}
                              </td>
                              <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                                {Number(item.lineTotalKd).toFixed(3)}
                              </td>
                              <td className="py-2.5 px-3 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveLine(idx)}
                                  className="text-rose-600 hover:text-rose-800 p-1 hover:bg-rose-50 rounded-md font-bold text-xs"
                                  title="Remove line"
                                >
                                  {t.purchases.removeItem}
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="bg-slate-100 border-t-2 border-slate-300 text-slate-900 font-extrabold">
                            <td colSpan={2} className="py-3 px-3 uppercase text-xs">
                              Grand Totals
                            </td>
                            <td className="py-3 px-3 text-right">
                              {wizardTotalDoz} Doz {wizardTotalPcsRem} Pcs
                            </td>
                            <td className="py-3 px-3 text-right text-base text-emerald-700">
                              {wizardTotalPcs} Pcs
                            </td>
                            <td></td>
                            <td className="py-3 px-3 text-right text-base text-slate-900">
                              {wizardTotalAmountKd.toFixed(3)} {t.common.currency}
                            </td>
                            <td></td>
                          </tr>
                        </tfoot>
                      </table>
                    )}
                  </div>
                </div>
              )}

              {/* ──────────────── STEP 3: REVIEW & CONFIRM ──────────────── */}
              {step === 3 && (
                <div className="space-y-6">
                  {/* Confirmation Warning/Info Banner */}
                  <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 text-amber-900 text-sm flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block font-bold">
                        {lang === 'hi' ? 'Maal Review Karein:' : 'Review Shipment:'}
                      </strong>
                      <span>
                        {lang === 'hi'
                          ? 'Posting karne se inventory me maal turant add ho jayega, stock ledger me entry ho jayegi aur supplier ka payable balance update ho jayega.'
                          : 'Confirming will immediately receive items into inventory, record entries in the stock ledger, and update supplier payable balances.'}
                      </span>
                    </div>
                  </div>

                  {/* Header Summary Details Card */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-sm">
                    <div>
                      <div className="text-xs text-slate-500 font-bold uppercase">Supplier</div>
                      <div className="font-bold text-slate-900 text-base">
                        {selectedSupplierObj?.name || (lang === 'hi' ? 'Direct / Local Purchase' : 'Direct / Local Purchase')}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 font-bold uppercase">Container / Ref</div>
                      <div className="font-bold text-slate-900">
                        {shipmentContainerNo || '—'}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 font-bold uppercase">Date</div>
                      <div className="font-bold text-slate-900">
                        {receiptDate || (lang === 'hi' ? 'Aaj' : 'Today')}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 font-bold uppercase">Invoice Ref</div>
                      <div className="font-bold text-slate-900">
                        {supplierInvoiceRef || '—'}
                      </div>
                    </div>
                  </div>

                  {/* Lines Review Table */}
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-left border-collapse text-sm">
                      <thead>
                        <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 text-xs font-bold uppercase">
                          <th className="py-2.5 px-3">Article</th>
                          <th className="py-2.5 px-3">{lang === 'hi' ? 'Product Naam' : 'Product Name'}</th>
                          <th className="py-2.5 px-3 text-right">Dozen + Pcs</th>
                          <th className="py-2.5 px-3 text-right">Total Pcs</th>
                          <th className="py-2.5 px-3 text-right">Cost (K.D.)</th>
                          <th className="py-2.5 px-3 text-right">Line Total (K.D.)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {lines.map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="py-2.5 px-3 font-bold text-emerald-700">
                              {item.articleNumber}
                            </td>
                            <td className="py-2.5 px-3 font-semibold text-slate-900">
                              {item.nameEn}
                            </td>
                            <td className="py-2.5 px-3 text-right text-slate-700">
                              {item.dozen} Doz {item.pieces} Pcs
                            </td>
                            <td className="py-2.5 px-3 text-right font-extrabold text-slate-900">
                              {item.totalPcs} Pcs
                            </td>
                            <td className="py-2.5 px-3 text-right text-slate-700">
                              {Number(item.unitCostKd).toFixed(3)}
                            </td>
                            <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                              {Number(item.lineTotalKd).toFixed(3)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Grand Total Highlight Box */}
                  <div className="bg-emerald-50 border-2 border-emerald-500 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="text-xs font-extrabold uppercase tracking-wider text-emerald-800">
                        {lang === 'hi' ? 'Kul Received Quantity' : 'Total Received Quantity'}
                      </div>
                      <div className="text-2xl font-black text-emerald-900">
                        {wizardTotalDoz} Dozen {wizardTotalPcsRem} Pcs
                      </div>
                      <div className="text-sm font-bold text-emerald-700 mt-0.5">
                        ({wizardTotalPcs.toLocaleString()} Total Pcs)
                      </div>
                    </div>

                    <div className="text-left sm:text-right">
                      <div className="text-xs font-extrabold uppercase tracking-wider text-emerald-800">
                        {lang === 'hi' ? 'Kul Purchase Amount' : 'Total Purchase Amount'}
                      </div>
                      <div className="text-3xl font-black text-emerald-900">
                        {wizardTotalAmountKd.toFixed(3)}{' '}
                        <span className="text-base font-bold">{t.common.currency}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Wizard Navigation Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
              {step > 1 ? (
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => {
                    setLineError('');
                    setStep((prev) => (prev - 1) as 1 | 2);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 border border-slate-300 rounded-xl text-slate-700 font-bold text-sm hover:bg-white transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>{t.purchases.previous}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowWizard(false)}
                  className="px-4 py-2.5 border border-slate-300 rounded-xl text-slate-700 font-bold text-sm hover:bg-white"
                >
                  {t.common.cancel}
                </button>
              )}

              {step === 1 && (
                <button
                  type="button"
                  onClick={() => {
                    setLineError('');
                    setStep(2);
                  }}
                  className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer text-base"
                >
                  <span>{t.purchases.next} {lang === 'hi' ? '(Mal Add Karein)' : '(Add Products)'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}

              {step === 2 && (
                <button
                  type="button"
                  onClick={() => {
                    if (lines.length === 0) {
                      setLineError(lang === 'hi' ? 'Kam se kam ek product line add karein.' : 'Please add at least one product line.');
                      return;
                    }
                    setLineError('');
                    setStep(3);
                  }}
                  className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer text-base"
                >
                  <span>{lang === 'hi' ? 'Aage Badhein: Review Karein' : 'Next: Review & Confirm'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}

              {step === 3 && (
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleSubmitShipment}
                  className="inline-flex items-center gap-2 px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow-md transition-colors cursor-pointer text-lg focus:ring-4 focus:ring-emerald-200 disabled:opacity-50"
                >
                  <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
                  <span>
                    {submitting ? t.purchases.processing : t.purchases.receiveAndAddToStock}
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────── SUCCESS RECEIPT MODAL ───────────────────── */}
      {successReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-8 text-center space-y-6">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-12 h-12 stroke-[2.5]" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black text-slate-900">
                {t.purchases.shipmentSuccess}
              </h2>
              <p className="text-slate-600 text-base">
                Receipt No:{' '}
                <span className="font-extrabold text-emerald-700">
                  {successReceipt.receiptNumber}
                </span>
              </p>
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mt-3">
                <span className="font-extrabold text-emerald-900 text-lg">
                  {successReceipt.totalPcsBreakdown?.display} ({successReceipt.totalPcs} Total Pcs)
                </span>
                <div className="text-emerald-800 text-sm font-medium mt-1">
                  {lang === 'hi' ? 'stock me kamiyabi se add ho chuke hain.' : 'successfully added to inventory stock.'}
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  const r = successReceipt;
                  setSuccessReceipt(null);
                  setShowWizard(false);
                  setActiveReceipt(r);
                }}
                className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition-colors text-sm"
              >
                {t.purchases.viewReceipt}
              </button>

              <button
                type="button"
                onClick={() => {
                  setSuccessReceipt(null);
                  setShowWizard(false);
                  navigate('/stock');
                }}
                className="flex-1 py-3 px-4 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl shadow-xs transition-colors text-sm"
              >
                {lang === 'hi' ? 'Stock Check Karein' : 'Check Stock'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────── VIEW RECEIPT DETAILS MODAL ───────────────────── */}
      {activeReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-3xl w-full my-auto overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Receipt className="w-6 h-6 text-emerald-400" />
                <div>
                  <h2 className="text-xl font-bold">{t.purchases.receiptDetail}</h2>
                  <div className="text-xs text-slate-400">
                    Receipt: {activeReceipt.receiptNumber}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="text-slate-300 hover:text-white p-2 rounded-lg hover:bg-slate-800 flex items-center gap-1.5 text-xs font-semibold"
                  title="Print Receipt"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveReceipt(null)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {/* Header Details */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-sm">
                <div>
                  <div className="text-xs text-slate-500 font-bold uppercase">Supplier</div>
                  <div className="font-bold text-slate-900 text-base">
                    {activeReceipt.supplier?.name || '—'}
                  </div>
                  <div className="text-xs text-slate-500">{activeReceipt.supplier?.country}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 font-bold uppercase">Date</div>
                  <div className="font-bold text-slate-900">{activeReceipt.receiptDate}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 font-bold uppercase">Container / Ref</div>
                  <div className="font-bold text-slate-900">
                    {activeReceipt.shipmentContainerNo || '—'}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 font-bold uppercase">Received By</div>
                  <div className="font-bold text-slate-900">
                    {activeReceipt.receivedBy || 'Owner'}
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 text-xs font-bold uppercase">
                      <th className="py-2.5 px-3">Article</th>
                      <th className="py-2.5 px-3">Product</th>
                      <th className="py-2.5 px-3 text-right">Dozen + Pcs</th>
                      <th className="py-2.5 px-3 text-right">Total Pcs</th>
                      <th className="py-2.5 px-3 text-right">Cost (K.D.)</th>
                      <th className="py-2.5 px-3 text-right">Line Total (K.D.)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {activeReceipt.lines?.map((line) => (
                      <tr key={line.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-bold text-emerald-700">
                          {line.product?.articleNumber || '—'}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-slate-900">
                          {line.product?.nameEn || '—'}
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-700">
                          {line.dozen} Doz {line.pieces} Pcs
                        </td>
                        <td className="py-2.5 px-3 text-right font-extrabold text-slate-900">
                          {line.totalPcs} Pcs
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-700">
                          {Number(line.unitCostKd).toFixed(3)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                          {Number(line.lineTotalKd).toFixed(3)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-100 border-t-2 border-slate-300 font-black text-slate-900">
                      <td colSpan={2} className="py-3 px-3 uppercase text-xs">
                        Grand Totals
                      </td>
                      <td className="py-3 px-3 text-right">
                        {activeReceipt.totalPcsBreakdown?.display}
                      </td>
                      <td className="py-3 px-3 text-right text-emerald-700">
                        {activeReceipt.totalPcs} Pcs
                      </td>
                      <td></td>
                      <td className="py-3 px-3 text-right text-base text-slate-900">
                        {Number(activeReceipt.totalAmountKd).toFixed(3)} {t.common.currency}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveReceipt(null)}
                className="px-5 py-2 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-900 text-sm"
              >
                {t.common.close}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transaction Audit Trail Modal */}
      {auditRef && (
        <TransactionAuditModal
          reference={auditRef}
          isOpen={true}
          onClose={() => setAuditRef(null)}
        />
      )}
    </div>
  );
};
