import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import {
  Search,
  CheckCircle2,
  AlertCircle,
  X,
  FileText,
  Printer,
  MessageCircle,
  DollarSign,
  ArrowRight,
  ArrowLeft,
  Clock,
  Ban,
  Check,
  User,
  Phone,
  Calendar,
  Boxes,
  HelpCircle,
} from 'lucide-react';
import RashidiStarInvoice from '../components/common/RashidiStarInvoice';
import { useTranslations } from '../hooks/useTranslations';

/* ───────────────────── Interfaces ───────────────────── */

interface CustomerOption {
  id: number;
  name: string;
  nameAr?: string;
  phone?: string;
  totalOutstandingKd: number;
}

interface ProductOption {
  id: number;
  articleNumber: string;
  nameEn: string;
  nameAr?: string;
  currentStockPcs: number;
  currentStockDozen?: number;
  currentStockRemainderPcs?: number;
  sellingPriceKd: number;
}

interface InvoiceLineItem {
  id: number;
  productId: number;
  dozen: number;
  pieces: number;
  totalPieces: number;
  unitPriceKd: number;
  lineTotalKd: number;
  product?: {
    articleNumber: string;
    nameEn: string;
    nameAr?: string;
  };
}

interface SalesInvoiceItem {
  id: number;
  invoiceNumber: string;
  invoiceDate: string;
  paymentType?: string;
  paymentStatus: 'PAID' | 'PARTIAL' | 'PENDING';
  invoiceStatus: 'POSTED' | 'CANCELLED';
  totalPcs: number;
  totalPcsBreakdown?: {
    dozen: number;
    pieces: number;
    totalPcs: number;
    display: string;
  };
  grandTotalAmountKd: number;
  amountReceivedKd: number;
  amountOutstandingKd: number;
  paymentMethod?: string;
  dueDate?: string;
  notes?: string;
  createdAt: string;
  customer?: {
    id: number;
    name: string;
    nameAr?: string;
    phone?: string;
    address?: string;
  };
  lines?: InvoiceLineItem[];
}

interface AddedLineState {
  productId: number;
  productName: string;
  articleNumber: string;
  dozen: number;
  pieces: number;
  totalPcs: number;
  unitPriceKd: number;
  lineTotalKd: number;
}

/* ───────────────────── Main Component ───────────────────── */

export const SalesPage: React.FC = () => {
  const { lang } = useTranslations();
  const [searchParams] = useSearchParams();

  /* ── State ── */
  const [invoices, setInvoices] = useState<SalesInvoiceItem[]>([]);
  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PAID' | 'PARTIAL' | 'PENDING' | 'CANCELLED'>('ALL');
  const [toast, setToast] = useState('');

  // Modals
  const [showWizard, setShowWizard] = useState(false);
  const [viewInvoiceModal, setViewInvoiceModal] = useState<SalesInvoiceItem | null>(null);

  // Wizard state: Step 1 = Customer (OPTIONAL), Step 2 = Products, Step 3 = Payment
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1: Customer (OPTIONAL)
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | ''>('');
  const [customCustomerName, setCustomCustomerName] = useState('');
  const [customPhone, setCustomPhone] = useState('');
  const [customAddress, setCustomAddress] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');

  // Step 2: Line items
  const [lineItems, setLineItems] = useState<AddedLineState[]>([]);
  const [activeProductId, setActiveProductId] = useState<number | ''>('');
  const [inputDozen, setInputDozen] = useState<number | ''>(1);
  const [inputPieces, setInputPieces] = useState<number | ''>(0);
  const [inputUnitPrice, setInputUnitPrice] = useState<number | ''>('');
  const [productEntryError, setProductEntryError] = useState('');

  // Step 3: Payment
  const [paymentChoice, setPaymentChoice] = useState<'PAID' | 'PARTIAL' | 'PENDING'>('PAID');
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'K-Net' | 'Bank Transfer' | 'Other'>('Cash');
  const [amountReceivedKd, setAmountReceivedKd] = useState<number>(0);

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  /* ── Data Fetching ── */
  const fetchInvoices = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/sales');
      setInvoices(res.data);
    } catch (err) {
      console.error('Failed to load sales invoices', err);
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

  const fetchProducts = useCallback(async () => {
    try {
      const res = await api.get('/products');
      setProducts(res.data);
    } catch (err) {
      console.error('Failed to load products', err);
    }
  }, []);

  useEffect(() => {
    fetchInvoices();
    fetchCustomers();
    fetchProducts();
  }, [fetchInvoices, fetchCustomers, fetchProducts]);

  // If redirected with ?customerId=123, pre-select customer and open wizard
  useEffect(() => {
    const cid = searchParams.get('customerId');
    if (cid && customers.length > 0) {
      const found = customers.find((c) => c.id === Number(cid));
      if (found) {
        setSelectedCustomerId(found.id);
        setCustomCustomerName(found.name);
        setCustomPhone(found.phone || '');
        setShowWizard(true);
        setStep(1);
      }
    }
  }, [searchParams, customers]);

  const showSuccessToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 4000);
  };

  /* ── Calculation Helpers ── */
  const grandTotalAmount = useMemo(() => {
    return lineItems.reduce((sum, item) => sum + item.lineTotalKd, 0);
  }, [lineItems]);

  const grandTotalPieces = useMemo(() => {
    return lineItems.reduce((sum, item) => sum + item.totalPcs, 0);
  }, [lineItems]);

  const grandTotalBreakdown = useMemo(() => {
    const doz = Math.floor(grandTotalPieces / 12);
    const pcs = grandTotalPieces % 12;
    return { doz, pcs, display: `${doz} Doz ${pcs} Pcs` };
  }, [grandTotalPieces]);

  // Sync amount received when payment choice changes
  useEffect(() => {
    if (paymentChoice === 'PAID') {
      setAmountReceivedKd(Number(grandTotalAmount.toFixed(3)));
    } else if (paymentChoice === 'PENDING') {
      setAmountReceivedKd(0);
    }
  }, [paymentChoice, grandTotalAmount]);

  // When active product is selected in wizard, set default selling price
  const selectedProductObj = useMemo(() => {
    return products.find((p) => p.id === Number(activeProductId));
  }, [products, activeProductId]);

  const handleProductSelect = (prodId: number | '') => {
    setActiveProductId(prodId);
    setProductEntryError('');
    if (prodId) {
      const p = products.find((prod) => prod.id === Number(prodId));
      if (p) {
        setInputUnitPrice(Number(p.sellingPriceKd) || 0);
      }
    } else {
      setInputUnitPrice('');
    }
  };

  /* ── Add Product Line ── */
  const handleAddProductLine = () => {
    setProductEntryError('');
    if (!selectedProductObj) {
      setProductEntryError('Please select an article / product.');
      return;
    }

    const doz = Number(inputDozen) || 0;
    const pcs = Number(inputPieces) || 0;
    const totalPcs = doz * 12 + pcs;

    if (totalPcs <= 0) {
      setProductEntryError('Quantity must be greater than zero.');
      return;
    }

    const unitPrice = Number(inputUnitPrice) || 0;
    if (unitPrice <= 0) {
      setProductEntryError('Selling price must be greater than zero.');
      return;
    }

    // Check available stock
    const currentStock = Number(selectedProductObj.currentStockPcs || 0);
    const alreadyAddedPcs = lineItems
      .filter((l) => l.productId === selectedProductObj.id)
      .reduce((sum, l) => sum + l.totalPcs, 0);

    if (totalPcs + alreadyAddedPcs > currentStock) {
      const availDoz = Math.floor(currentStock / 12);
      const availPcs = currentStock % 12;
      setProductEntryError(
        `Insufficient stock! Available: ${availDoz} Doz ${availPcs} Pcs (${currentStock} Pcs).`
      );
      return;
    }

    // Price is per dozen: dozQty = dozen + (pieces / 12)
    const dozQty = doz + (pcs / 12);
    const lineTotalKd = Number((dozQty * unitPrice).toFixed(3));

    setLineItems([
      ...lineItems,
      {
        productId: selectedProductObj.id,
        productName: selectedProductObj.nameEn,
        articleNumber: selectedProductObj.articleNumber,
        dozen: doz,
        pieces: pcs,
        totalPcs,
        unitPriceKd: unitPrice,
        lineTotalKd,
      },
    ]);

    // Reset entry inputs
    setActiveProductId('');
    setInputDozen(1);
    setInputPieces(0);
    setInputUnitPrice('');
  };

  const handleRemoveLine = (index: number) => {
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  /* ── Open / Reset Wizard ── */
  const openNewInvoiceWizard = () => {
    setStep(1);
    setSelectedCustomerId('');
    setCustomCustomerName('');
    setCustomPhone('');
    setCustomAddress('');
    setInvoiceDate(new Date().toISOString().split('T')[0]);
    setDueDate('');
    setNotes('');
    setLineItems([]);
    setActiveProductId('');
    setInputDozen(1);
    setInputPieces(0);
    setInputUnitPrice('');
    setPaymentChoice('PAID');
    setPaymentMethod('Cash');
    setAmountReceivedKd(0);
    setSubmitError('');
    setProductEntryError('');
    setShowWizard(true);
  };

  /* ── Submit Invoice ── */
  const handlePostInvoice = async () => {
    if (lineItems.length === 0) {
      setSubmitError('Invoice must contain at least one product.');
      return;
    }

    if (paymentChoice === 'PARTIAL') {
      const rec = Number(amountReceivedKd) || 0;
      if (rec <= 0 || rec >= grandTotalAmount) {
        setSubmitError('Partial payment must be greater than 0 and less than total amount.');
        return;
      }
    }

    try {
      setSubmitting(true);
      setSubmitError('');

      // If customer is selected from dropdown
      let finalCustomerId = selectedCustomerId ? Number(selectedCustomerId) : undefined;
      let finalCustomerName = customCustomerName.trim() || undefined;

      // If customer was left empty, it will be automatically handled as 'Walk-in Customer' on backend
      const payload = {
        customerId: finalCustomerId,
        customerName: finalCustomerName,
        customerPhone: customPhone.trim() || undefined,
        customerAddress: customAddress.trim() || undefined,
        invoiceDate,
        dueDate: dueDate || undefined,
        notes: notes.trim() || undefined,
        paymentStatus: paymentChoice,
        paymentMethod: paymentChoice !== 'PENDING' ? paymentMethod : undefined,
        amountReceivedKd:
          paymentChoice === 'PAID'
            ? grandTotalAmount
            : paymentChoice === 'PARTIAL'
            ? Number(amountReceivedKd)
            : 0,
        items: lineItems.map((line) => ({
          productId: line.productId,
          dozen: line.dozen,
          pieces: line.pieces,
          unitPriceKd: line.unitPriceKd,
        })),
      };

      const res = await api.post('/sales', payload);
      const savedInvoice = res.data;
      showSuccessToast(`Invoice ${savedInvoice.invoiceNumber} created successfully!`);
      setShowWizard(false);
      fetchInvoices();
      fetchProducts();
      fetchCustomers();

      // Automatically open the physical bill view for immediate review/printing!
      setViewInvoiceModal(savedInvoice);
    } catch (err: any) {
      setSubmitError(err.response?.data?.message || 'Failed to create invoice.');
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Cancel Invoice ── */
  const handleCancelInvoice = async (invoice: SalesInvoiceItem) => {
    if (
      !window.confirm(
        `Are you sure you want to cancel invoice ${invoice.invoiceNumber}?\n\nThis will restore ${invoice.totalPcs} pieces back to stock and reverse customer outstanding.`
      )
    ) {
      return;
    }

    try {
      await api.post(`/sales/${invoice.id}/cancel`);
      showSuccessToast(`Invoice ${invoice.invoiceNumber} cancelled. Stock restored.`);
      fetchInvoices();
      fetchProducts();
      fetchCustomers();
      if (viewInvoiceModal?.id === invoice.id) {
        setViewInvoiceModal(null);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to cancel invoice.');
    }
  };

  /* ── Note: WhatsApp is handled through the RashidiStarInvoice modal ── */

  /* ── Filtered Invoices ── */
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const q = search.toLowerCase().trim();
      const matchSearch =
        !q ||
        inv.invoiceNumber.toLowerCase().includes(q) ||
        (inv.customer?.name && inv.customer.name.toLowerCase().includes(q)) ||
        (inv.customer?.phone && inv.customer.phone.includes(q));

      if (!matchSearch) return false;

      if (statusFilter === 'ALL') return true;
      if (statusFilter === 'CANCELLED') return inv.invoiceStatus === 'CANCELLED';
      return inv.paymentStatus === statusFilter && inv.invoiceStatus !== 'CANCELLED';
    });
  }, [invoices, search, statusFilter]);

  /* ── 4 Compact Summary Metrics ── */
  const { totalSalesSum, totalReceivedSum, totalOutstandingSum } = useMemo(() => {
    const activeInvoices = invoices.filter((i) => i.invoiceStatus !== 'CANCELLED');
    return {
      totalSalesSum: activeInvoices.reduce((s, i) => s + Number(i.grandTotalAmountKd || 0), 0),
      totalReceivedSum: activeInvoices.reduce((s, i) => s + Number(i.amountReceivedKd || 0), 0),
      totalOutstandingSum: activeInvoices.reduce((s, i) => s + Number(i.amountOutstandingKd || 0), 0),
    };
  }, [invoices]);

  return (
    <div className="max-w-7xl mx-auto space-y-6 antialiased text-slate-800">
      {/* Toast Alert */}
      {toast && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-sm font-semibold flex items-center gap-2.5 shadow-sm animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {/* ───────────────────── 1. HEADER ───────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Sales & Invoices</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Create invoice, check payment and manage sales
          </p>
        </div>

        <div>
          <button
            type="button"
            onClick={openNewInvoiceWizard}
            className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-2.5 bg-slate-900 hover:bg-black text-white font-bold text-sm rounded-xl shadow-md transition-all cursor-pointer hover:shadow-lg active:scale-98"
          >
            <span>+ New Invoice</span>
          </button>
        </div>
      </div>

      {/* ───────────────────── 2. FOUR COMPACT SUMMARY CARDS ───────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Total Invoices */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Total Invoices
            </div>
            <div className="text-xl font-extrabold text-slate-900 mt-0.5">{invoices.length}</div>
          </div>
        </div>

        {/* Card 2: Total Sales K.D. */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-sky-50 flex items-center justify-center text-sky-600 shrink-0">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Total Sales K.D.
            </div>
            <div className="text-xl font-extrabold text-slate-900 mt-0.5">
              {totalSalesSum.toFixed(3)}
            </div>
          </div>
        </div>

        {/* Card 3: Received K.D. */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Received K.D.
            </div>
            <div className="text-xl font-extrabold text-emerald-700 mt-0.5">
              {totalReceivedSum.toFixed(3)}
            </div>
          </div>
        </div>

        {/* Card 4: Outstanding K.D. (Attention styling without harsh red) */}
        <div className="bg-amber-50/60 rounded-xl p-4 border border-amber-200 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">
              Outstanding K.D.
            </div>
            <div className="text-xl font-extrabold text-amber-900 mt-0.5">
              {totalOutstandingSum.toFixed(3)}
            </div>
          </div>
        </div>
      </div>

      {/* ───────────────────── 3. SEARCH & FILTERS ───────────────────── */}
      <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3.5">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search invoice, customer or phone..."
            className="w-full pl-10 pr-3.5 py-2 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-colors"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {(
            [
              { id: 'ALL', label: 'All' },
              { id: 'PAID', label: 'Paid' },
              { id: 'PARTIAL', label: 'Partial' },
              { id: 'PENDING', label: 'Pending' },
              { id: 'CANCELLED', label: 'Cancelled' },
            ] as const
          ).map((tab) => {
            const isActive = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ───────────────────── 4. INVOICES LIST / TABLE ───────────────────── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-500 font-medium">
            <div className="w-8 h-8 border-3 border-slate-300 border-t-slate-800 rounded-full animate-spin mx-auto mb-3" />
            Loading invoices...
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <FileText className="w-12 h-12 mx-auto mb-2 text-slate-300" />
            <p className="font-semibold text-slate-600">No invoices found.</p>
            <p className="text-xs text-slate-400 mt-1">Try changing filters or search terms.</p>
          </div>
        ) : (
          <>
            {/* Desktop / Laptop Table View (hidden on small screens) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">Invoice No.</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Quantity</th>
                    <th className="py-3 px-4 text-right">Total</th>
                    <th className="py-3 px-4 text-right">Received</th>
                    <th className="py-3 px-4 text-right">Outstanding</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredInvoices.map((inv) => {
                    const isCancelled = inv.invoiceStatus === 'CANCELLED';
                    const hasOutstanding = Number(inv.amountOutstandingKd || 0) > 0 && !isCancelled;
                    const custPhone = inv.customer?.phone;

                    return (
                      <tr
                        key={inv.id}
                        className={`transition-colors ${
                          isCancelled
                            ? 'bg-slate-50/50 opacity-60'
                            : 'hover:bg-slate-50/80'
                        }`}
                      >
                        {/* Invoice No. */}
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                          {isCancelled ? (
                            <span className="line-through text-slate-400">{inv.invoiceNumber}</span>
                          ) : (
                            <span className="text-slate-900">{inv.invoiceNumber}</span>
                          )}
                        </td>

                        {/* Customer */}
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-900">
                            {inv.customer?.name || 'Walk-in Customer'}
                          </div>
                          {custPhone && (
                            <div className="text-[11px] text-slate-400 font-normal mt-0.5">
                              {custPhone}
                            </div>
                          )}
                        </td>

                        {/* Date */}
                        <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                          {inv.invoiceDate}
                        </td>

                        {/* Quantity (Business Format: Doz + Pcs, Total Pcs below) */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="font-bold text-slate-900">
                            {inv.totalPcsBreakdown?.display || `${inv.totalPcs} Pcs`}
                          </div>
                          <div className="text-[11px] text-slate-400 font-normal">
                            {inv.totalPcs} Pcs Total
                          </div>
                        </td>

                        {/* Total Amount */}
                        <td className="py-3.5 px-4 text-right font-bold text-slate-900 whitespace-nowrap">
                          {Number(inv.grandTotalAmountKd || 0).toFixed(3)} K.D.
                        </td>

                        {/* Received Amount */}
                        <td className="py-3.5 px-4 text-right font-bold text-emerald-700 whitespace-nowrap">
                          {Number(inv.amountReceivedKd || 0).toFixed(3)} K.D.
                        </td>

                        {/* Outstanding Amount */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          {hasOutstanding ? (
                            <span className="inline-block px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 font-extrabold text-[11px]">
                              {Number(inv.amountOutstandingKd || 0).toFixed(3)} K.D.
                            </span>
                          ) : (
                            <span className="text-slate-400 font-mono">0.000 K.D.</span>
                          )}
                        </td>

                        {/* Status Badge */}
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          {isCancelled ? (
                            <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-200 text-slate-600 uppercase">
                              Cancelled
                            </span>
                          ) : inv.paymentStatus === 'PAID' ? (
                            <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase">
                              Paid
                            </span>
                          ) : inv.paymentStatus === 'PARTIAL' ? (
                            <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 uppercase">
                              Partial
                            </span>
                          ) : (
                            <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 uppercase">
                              Pending
                            </span>
                          )}
                        </td>

                        {/* Actions (Text + Icons) */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5">
                            {/* View */}
                            <button
                              type="button"
                              onClick={() => setViewInvoiceModal(inv)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-md transition-colors cursor-pointer text-xs"
                              title="View Exact Physical Bill"
                            >
                              <FileText className="w-3.5 h-3.5 text-slate-600" />
                              <span>View</span>
                            </button>

                            {/* Print */}
                            <button
                              type="button"
                              onClick={() => {
                                setViewInvoiceModal(inv);
                                setTimeout(() => window.print(), 250);
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-md transition-colors cursor-pointer text-xs"
                              title="Print Invoice"
                            >
                              <Printer className="w-3.5 h-3.5 text-slate-600" />
                              <span>Print</span>
                            </button>

                            {/* WhatsApp (Visible on all active invoices) */}
                            {!isCancelled && (
                              <button
                                type="button"
                                onClick={() => setViewInvoiceModal(inv)}
                                disabled={!custPhone}
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md font-bold transition-colors text-xs cursor-pointer ${
                                  custPhone
                                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                }`}
                                title={
                                  custPhone
                                    ? (inv.paymentStatus === 'PAID' ? 'Send WhatsApp Payment Receipt' : 'Send WhatsApp Payment Reminder')
                                    : (lang === 'hi' ? 'Mobile number add karenge to WhatsApp available hoga.' : 'Add mobile number to enable WhatsApp.')
                                }
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                                <span>{inv.paymentStatus === 'PAID' ? 'Receipt' : 'WhatsApp'}</span>
                              </button>
                            )}

                            {/* Cancel */}
                            {!isCancelled && (
                              <button
                                type="button"
                                onClick={() => handleCancelInvoice(inv)}
                                className="inline-flex items-center gap-1 px-2 py-1 bg-transparent hover:bg-rose-50 text-slate-400 hover:text-rose-600 font-bold rounded-md transition-colors cursor-pointer text-xs"
                                title="Cancel and Restore Stock"
                              >
                                <Ban className="w-3.5 h-3.5" />
                                <span>Cancel</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile / Tablet Responsive Card View (visible on screens < md) */}
            <div className="md:hidden divide-y divide-slate-200">
              {filteredInvoices.map((inv) => {
                const isCancelled = inv.invoiceStatus === 'CANCELLED';
                const hasOutstanding = Number(inv.amountOutstandingKd || 0) > 0 && !isCancelled;
                const custPhone = inv.customer?.phone;

                return (
                  <div
                    key={inv.id}
                    className={`p-4 space-y-3 ${
                      isCancelled ? 'bg-slate-50/60 opacity-65' : 'bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-mono font-bold text-slate-900 text-sm">
                          {inv.invoiceNumber}
                        </span>
                        <div className="text-xs font-semibold text-slate-800 mt-0.5">
                          {inv.customer?.name || 'Walk-in Customer'}
                        </div>
                        {custPhone && <div className="text-[11px] text-slate-400">{custPhone}</div>}
                      </div>

                      <div>
                        {isCancelled ? (
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-600 uppercase">
                            Cancelled
                          </span>
                        ) : inv.paymentStatus === 'PAID' ? (
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase">
                            Paid
                          </span>
                        ) : inv.paymentStatus === 'PARTIAL' ? (
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 uppercase">
                            Partial
                          </span>
                        ) : (
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 uppercase">
                            Pending
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-lg text-xs">
                      <div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase">Qty</div>
                        <div className="font-bold text-slate-900">
                          {inv.totalPcsBreakdown?.display || `${inv.totalPcs} Pcs`}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase">Total</div>
                        <div className="font-bold text-slate-900">
                          {Number(inv.grandTotalAmountKd).toFixed(3)}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase">Outstanding</div>
                        <div
                          className={`font-bold ${
                            hasOutstanding ? 'text-amber-800' : 'text-slate-500'
                          }`}
                        >
                          {Number(inv.amountOutstandingKd).toFixed(3)}
                        </div>
                      </div>
                    </div>

                    {/* Actions bar */}
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setViewInvoiceModal(inv)}
                        className="flex-1 py-1.5 bg-slate-100 text-slate-800 font-bold rounded-lg text-xs inline-flex items-center justify-center gap-1.5"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>View</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setViewInvoiceModal(inv);
                          setTimeout(() => window.print(), 250);
                        }}
                        className="flex-1 py-1.5 bg-slate-100 text-slate-800 font-bold rounded-lg text-xs inline-flex items-center justify-center gap-1.5"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Print</span>
                      </button>

                      {!isCancelled && (
                        <button
                          type="button"
                          onClick={() => setViewInvoiceModal(inv)}
                          disabled={!custPhone}
                          className={`flex-1 py-1.5 font-bold rounded-lg text-xs inline-flex items-center justify-center gap-1.5 ${
                            custPhone
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                          }`}
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>{inv.paymentStatus === 'PAID' ? 'Receipt' : 'WA'}</span>
                        </button>
                      )}

                      {!isCancelled && (
                        <button
                          type="button"
                          onClick={() => handleCancelInvoice(inv)}
                          className="px-2.5 py-1.5 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-bold"
                          title="Cancel"
                        >
                          <Ban className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* ───────────────────── 5. NEW INVOICE MODAL (3 CLEAR STEPS) ───────────────────── */}
      {showWizard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[92vh]">
            {/* Modal Top Header */}
            <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <span>New Sales Invoice</span>
                  <span className="text-xs px-2 py-0.5 bg-slate-800 text-emerald-400 rounded-md font-mono">
                    Step {step} of 3
                  </span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {step === 1 && 'Customer Information (Optional)'}
                  {step === 2 && 'Product & Quantity Selection'}
                  {step === 3 && 'Payment Status & Finalize'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowWizard(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error Banner */}
            {submitError && (
              <div className="p-3 bg-rose-50 border-b border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2 shrink-0">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto flex-1 space-y-5">
              {/* ──────── STEP 1: CUSTOMER DETAILS (COMPLETELY OPTIONAL) ──────── */}
              {step === 1 && (
                <div className="space-y-4 animate-fade-in">
                  <div className="bg-sky-50/70 border border-sky-200 rounded-xl p-3 flex items-start gap-2.5 text-xs text-sky-900">
                    <HelpCircle className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Customer details are OPTIONAL.</span> If the customer
                      does not want to provide personal details, simply click{' '}
                      <span className="font-bold underline">Quick Walk-in</span> or{' '}
                      <span className="font-bold underline">Next</span> to proceed directly to product entry.
                    </div>
                  </div>

                  <div className="space-y-3">
                    {/* Existing Customer Selector */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Select Existing Customer <span className="text-slate-400 font-normal">(Optional)</span>
                      </label>
                      <select
                        value={selectedCustomerId}
                        onChange={(e) => {
                          const val = e.target.value;
                          setSelectedCustomerId(val ? Number(val) : '');
                          if (val) {
                            const c = customers.find((cust) => cust.id === Number(val));
                            if (c) {
                              setCustomCustomerName(c.name);
                              setCustomPhone(c.phone || '');
                            }
                          }
                        }}
                        className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800"
                      >
                        <option value="">— Walk-in Customer (Default) —</option>
                        {customers.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name} {c.phone ? `(${c.phone})` : ''}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Or Manual Customer Name */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Customer Name <span className="text-slate-400 font-normal">(Optional)</span>
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            type="text"
                            value={customCustomerName}
                            onChange={(e) => setCustomCustomerName(e.target.value)}
                            placeholder="e.g. Al-Bahar Store or Walk-in"
                            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Mobile / Phone <span className="text-slate-400 font-normal">(Optional, for WhatsApp)</span>
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            type="text"
                            value={customPhone}
                            onChange={(e) => setCustomPhone(e.target.value)}
                            placeholder="e.g. 99598297"
                            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Address & Notes */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Address <span className="text-slate-400 font-normal">(Optional)</span>
                        </label>
                        <input
                          type="text"
                          value={customAddress}
                          onChange={(e) => setCustomAddress(e.target.value)}
                          placeholder="e.g. Souk Al-Kabeer, Shop 12"
                          className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Internal Reference / Notes <span className="text-slate-400 font-normal">(Optional)</span>
                        </label>
                        <input
                          type="text"
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="e.g. Cash sale at counter"
                          className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800"
                        />
                      </div>
                    </div>

                    {/* Date and Due Date */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Invoice Date
                        </label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            type="date"
                            value={invoiceDate}
                            onChange={(e) => setInvoiceDate(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Due Date <span className="text-slate-400 font-normal">(Optional)</span>
                        </label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            type="date"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ──────── STEP 2: PRODUCT ENTRY ──────── */}
              {step === 2 && (
                <div className="space-y-4 animate-fade-in">
                  {/* Product Entry Form */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                    <div className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Boxes className="w-4 h-4 text-slate-700" />
                      <span>Product Entry</span>
                    </div>

                    {productEntryError && (
                      <div className="text-xs text-rose-600 font-semibold bg-rose-50 border border-rose-200 p-2 rounded-lg">
                        {productEntryError}
                      </div>
                    )}

                    {/* Article / Product Search Selector */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Search Article / Product <span className="text-rose-600">*</span>
                      </label>
                      <select
                        value={activeProductId}
                        onChange={(e) => handleProductSelect(e.target.value ? Number(e.target.value) : '')}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800"
                      >
                        <option value="">— Select Product by Article No. or Name —</option>
                        {products
                          .filter((p) => (p.currentStockPcs || 0) > 0)
                          .map((p) => {
                            const doz = Math.floor((p.currentStockPcs || 0) / 12);
                            const pcs = (p.currentStockPcs || 0) % 12;
                            return (
                              <option key={p.id} value={p.id}>
                                [{p.articleNumber}] {p.nameEn} — Avail: {doz} Doz {pcs} Pcs ({p.currentStockPcs} Pcs)
                              </option>
                            );
                          })}
                      </select>
                    </div>

                    {/* Available Stock Box */}
                    {selectedProductObj && (
                      <div className="bg-white border border-slate-200 rounded-lg p-3 flex items-center justify-between text-xs">
                        <div>
                          <div className="text-[10px] text-slate-400 font-bold uppercase">Available Stock</div>
                          <div className="text-sm font-extrabold text-slate-900">
                            {Math.floor(selectedProductObj.currentStockPcs / 12)} Doz{' '}
                            {selectedProductObj.currentStockPcs % 12} Pcs
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-[10px] text-slate-400 font-bold uppercase">Total Pieces</div>
                          <div className="text-sm font-bold font-mono text-slate-700">
                            {selectedProductObj.currentStockPcs} Pcs
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Quantity & Price Row */}
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Dozen <span className="text-rose-600">*</span>
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={inputDozen}
                          onChange={(e) => setInputDozen(e.target.value === '' ? '' : Number(e.target.value))}
                          onFocus={(e) => e.target.select()}
                          placeholder="0"
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 text-center"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Pieces</label>
                        <input
                          type="number"
                          min="0"
                          max="11"
                          value={inputPieces}
                          onChange={(e) => setInputPieces(e.target.value === '' ? '' : Number(e.target.value))}
                          onFocus={(e) => e.target.select()}
                          placeholder="0"
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 text-center"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Price per Dozen (K.D.) <span className="text-rose-600">*</span>
                        </label>
                        <input
                          type="number"
                          step="0.001"
                          min="0"
                          value={inputUnitPrice}
                          onChange={(e) => setInputUnitPrice(e.target.value === '' ? '' : Number(e.target.value))}
                          onFocus={(e) => e.target.select()}
                          placeholder="0.000"
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 text-right font-mono"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-1">
                      <button
                        type="button"
                        onClick={handleAddProductLine}
                        className="px-4 py-2 bg-slate-900 hover:bg-black text-white font-bold text-xs rounded-xl shadow-xs inline-flex items-center justify-center transition-all cursor-pointer"
                      >
                        <span>+ Add Product</span>
                      </button>
                    </div>
                  </div>

                  {/* Added Items List */}
                  <div>
                    <div className="text-xs font-bold text-slate-700 mb-2 flex items-center justify-between">
                      <span>Added Products ({lineItems.length})</span>
                      <span className="text-slate-500 font-semibold">
                        Total: {grandTotalBreakdown.display} ({grandTotalPieces} Pcs)
                      </span>
                    </div>

                    {lineItems.length === 0 ? (
                      <div className="border border-dashed border-slate-300 rounded-xl p-8 text-center text-slate-400 text-xs">
                        No products added yet. Select a product above and click <b>+ Add Product</b>.
                      </div>
                    ) : (
                      <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 text-xs">
                        {lineItems.map((item, idx) => (
                          <div key={idx} className="p-3 flex items-center justify-between gap-3 hover:bg-slate-50">
                            <div className="flex-1">
                              <div className="font-bold text-slate-900">
                                [{item.articleNumber}] {item.productName}
                              </div>
                              <div className="text-[11px] text-slate-500">
                                {item.dozen} Doz {item.pieces} Pcs ({item.totalPcs} Pcs) @ {item.unitPriceKd.toFixed(3)} K.D./Doz
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-extrabold text-slate-900">
                                {item.lineTotalKd.toFixed(3)} K.D.
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveLine(idx)}
                                className="text-rose-500 hover:text-rose-700 text-[11px] font-semibold mt-0.5"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        ))}

                        <div className="p-3 bg-slate-50 flex items-center justify-between font-bold text-xs">
                          <span>Grand Total</span>
                          <span className="text-sm font-black text-slate-900">
                            {grandTotalAmount.toFixed(3)} K.D.
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ──────── STEP 3: PAYMENT & FINALIZE ──────── */}
              {step === 3 && (
                <div className="space-y-5 animate-fade-in">
                  {/* Summary recap */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between text-xs">
                    <div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase">Customer</div>
                      <div className="font-bold text-slate-900">
                        {customCustomerName.trim() || 'Walk-in Customer'}
                      </div>
                      {customPhone && <div className="text-slate-500 text-[11px]">{customPhone}</div>}
                    </div>

                    <div className="text-right">
                      <div className="text-[10px] text-slate-400 font-bold uppercase">Total Invoice Amount</div>
                      <div className="text-lg font-black text-slate-900">
                        {grandTotalAmount.toFixed(3)} K.D.
                      </div>
                      <div className="text-slate-500 text-[11px]">
                        {grandTotalBreakdown.display} ({grandTotalPieces} Pcs)
                      </div>
                    </div>
                  </div>

                  {/* 3 Clear Payment Choice Buttons */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">
                      Select Payment Status <span className="text-rose-600">*</span>
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {(['PAID', 'PARTIAL', 'PENDING'] as const).map((choice) => {
                        const isSel = paymentChoice === choice;
                        return (
                          <button
                            key={choice}
                            type="button"
                            onClick={() => setPaymentChoice(choice)}
                            className={`p-3.5 rounded-xl border-2 text-center transition-all cursor-pointer ${
                              isSel
                                ? choice === 'PAID'
                                  ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-black shadow-xs'
                                  : choice === 'PARTIAL'
                                  ? 'border-amber-600 bg-amber-50 text-amber-900 font-black shadow-xs'
                                  : 'border-rose-600 bg-rose-50 text-rose-900 font-black shadow-xs'
                                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 font-bold'
                            }`}
                          >
                            <div className="text-sm">{choice}</div>
                            <div className="text-[10px] opacity-75 mt-0.5">
                              {choice === 'PAID' && '100% Cash/Card Paid'}
                              {choice === 'PARTIAL' && 'Advance / Part Payment'}
                              {choice === 'PENDING' && 'Full Credit / Payable Later'}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Choice Details */}
                  {paymentChoice === 'PAID' && (
                    <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-4 space-y-3 text-xs">
                      <div className="font-bold text-emerald-900">Paid in Full: {grandTotalAmount.toFixed(3)} K.D.</div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Payment Method</label>
                        <div className="grid grid-cols-4 gap-2">
                          {(['Cash', 'K-Net', 'Bank Transfer', 'Other'] as const).map((m) => (
                            <button
                              key={m}
                              type="button"
                              onClick={() => setPaymentMethod(m)}
                              className={`py-2 text-center rounded-lg font-bold border transition-colors cursor-pointer ${
                                paymentMethod === m
                                  ? 'bg-emerald-700 text-white border-emerald-700'
                                  : 'bg-white text-slate-700 border-slate-300'
                              }`}
                            >
                              {m}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {paymentChoice === 'PARTIAL' && (
                    <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-4 space-y-3 text-xs">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">
                            Amount Received (K.D.) <span className="text-rose-600">*</span>
                          </label>
                          <input
                            type="number"
                            step="0.001"
                            min="0.001"
                            max={grandTotalAmount - 0.001}
                            value={amountReceivedKd}
                            onChange={(e) => setAmountReceivedKd(Number(e.target.value))}
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 text-right font-mono"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Payment Method</label>
                          <select
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value as any)}
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                          >
                            <option value="Cash">Cash</option>
                            <option value="K-Net">K-Net</option>
                            <option value="Bank Transfer">Bank Transfer</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                      </div>

                      {/* Live Calculation */}
                      <div className="grid grid-cols-3 gap-2 bg-white p-3 rounded-lg border border-amber-200 text-center">
                        <div>
                          <div className="text-[10px] text-slate-400 font-bold uppercase">Invoice Total</div>
                          <div className="font-bold text-slate-900">{grandTotalAmount.toFixed(3)} K.D.</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-emerald-600 font-bold uppercase">Received</div>
                          <div className="font-bold text-emerald-700">
                            {Number(amountReceivedKd || 0).toFixed(3)} K.D.
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] text-amber-600 font-bold uppercase">Outstanding</div>
                          <div className="font-bold text-amber-800">
                            {Math.max(0, grandTotalAmount - (Number(amountReceivedKd) || 0)).toFixed(3)} K.D.
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {paymentChoice === 'PENDING' && (
                    <div className="bg-rose-50/60 border border-rose-200 rounded-xl p-4 text-xs space-y-2">
                      <div className="font-bold text-rose-900">
                        Full Amount Outstanding: {grandTotalAmount.toFixed(3)} K.D.
                      </div>
                      <p className="text-slate-500">
                        No immediate payment collected. The balance will be recorded against the customer's
                        ledger and an optional payment reminder can be sent via WhatsApp.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer Controls */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
              <div>
                {step > 1 && (
                  <button
                    type="button"
                    onClick={() => setStep((s) => (s - 1) as any)}
                    className="px-4 py-2 bg-white border border-slate-300 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-100 transition-colors cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                {step === 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        // Quick Walk-in: skip straight to step 2 with Walk-in
                        setSelectedCustomerId('');
                        setCustomCustomerName('Walk-in Customer');
                        setStep(2);
                      }}
                      className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                    >
                      Quick Walk-in (Skip Details)
                    </button>

                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="px-5 py-2 bg-slate-900 hover:bg-black text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <span>Next: Add Products</span>
                      <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
                    </button>
                  </>
                )}

                {step === 2 && (
                  <button
                    type="button"
                    disabled={lineItems.length === 0}
                    onClick={() => {
                      if (lineItems.length === 0) {
                        setProductEntryError('Please add at least one product before proceeding.');
                        return;
                      }
                      setStep(3);
                    }}
                    className="px-5 py-2 bg-slate-900 hover:bg-black text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer inline-flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <span>Next: Payment</span>
                    <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
                  </button>
                )}

                {step === 3 && (
                  <button
                    type="button"
                    disabled={submitting || lineItems.length === 0}
                    onClick={handlePostInvoice}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-xl shadow-md transition-all cursor-pointer inline-flex items-center gap-2 disabled:opacity-50"
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>{submitting ? 'Posting...' : 'Complete & Print Invoice'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────── 6. RASHIDI STAR PHYSICAL INVOICE MODAL ───────────────────── */}
      {viewInvoiceModal && (
        <RashidiStarInvoice
          invoice={viewInvoiceModal}
          onClose={() => setViewInvoiceModal(null)}
          onPrint={() => window.print()}
          onCancel={() => handleCancelInvoice(viewInvoiceModal)}
        />
      )}
    </div>
  );
};

export default SalesPage;
