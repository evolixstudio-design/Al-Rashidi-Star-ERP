import React, { useEffect, useState, useCallback } from 'react';
import api from '../services/api';
import {
  ShoppingBag,
  Package,
  Users,
  Receipt,
  Scale,
  Printer,
  RefreshCw,
  AlertCircle,
  FileSpreadsheet,
  Layers,
} from 'lucide-react';

/* ───────────────────── Types ───────────────────── */

type ReportTab = 'sales' | 'purchases' | 'stock' | 'customers' | 'expenses' | 'pnl';

export const ReportsPage: React.FC = () => {
  /* ── Tab State ── */
  const [activeTab, setActiveTab] = useState<ReportTab>('sales');

  /* ── Date Filters (Default: start of current month to today) ── */
  const getInitialDates = () => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return { from: `${year}-${month}-01`, to: todayStr };
  };

  const [fromDate, setFromDate] = useState(getInitialDates().from);
  const [toDate, setToDate] = useState(getInitialDates().to);
  const [activePreset, setActivePreset] = useState<'today' | 'thisWeek' | 'thisMonth' | 'lastMonth' | 'thisYear' | 'all'>('thisMonth');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  /* ── Data States ── */
  const [salesData, setSalesData] = useState<any>(null);
  const [purchaseData, setPurchaseData] = useState<any>(null);
  const [stockData, setStockData] = useState<any>(null);
  const [customerData, setCustomerData] = useState<any>(null);
  const [expenseData, setExpenseData] = useState<any>(null);
  const [pnlData, setPnlData] = useState<any>(null);

  /* ── Fetch Handler ── */
  const fetchActiveReport = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const params: any = {};
      if (fromDate) params.from = fromDate;
      if (toDate) params.to = toDate;

      switch (activeTab) {
        case 'sales': {
          const res = await api.get('/reports/sales-summary', { params });
          setSalesData(res.data);
          break;
        }
        case 'purchases': {
          const res = await api.get('/reports/purchase-summary', { params });
          setPurchaseData(res.data);
          break;
        }
        case 'stock': {
          const res = await api.get('/reports/stock-valuation');
          setStockData(res.data);
          break;
        }
        case 'customers': {
          const res = await api.get('/reports/customer-outstanding');
          setCustomerData(res.data);
          break;
        }
        case 'expenses': {
          const res = await api.get('/reports/expense-summary', { params });
          setExpenseData(res.data);
          break;
        }
        case 'pnl': {
          const res = await api.get('/reports/profit-loss', { params });
          setPnlData(res.data);
          break;
        }
      }
    } catch (err: any) {
      console.error('Failed to load report', err);
      setError(err.response?.data?.message || 'Failed to load report data');
    } finally {
      setLoading(false);
    }
  }, [activeTab, fromDate, toDate]);

  useEffect(() => {
    fetchActiveReport();
  }, [fetchActiveReport]);

  /* ── Presets ── */
  const applyPreset = (preset: 'today' | 'thisWeek' | 'thisMonth' | 'lastMonth' | 'thisYear' | 'all') => {
    setActivePreset(preset);
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const year = now.getFullYear();

    if (preset === 'today') {
      setFromDate(todayStr);
      setToDate(todayStr);
    } else if (preset === 'thisWeek') {
      const dayOfWeek = now.getDay();
      const firstDay = new Date(now);
      firstDay.setDate(now.getDate() - dayOfWeek);
      setFromDate(firstDay.toISOString().split('T')[0]);
      setToDate(todayStr);
    } else if (preset === 'thisMonth') {
      const month = String(now.getMonth() + 1).padStart(2, '0');
      setFromDate(`${year}-${month}-01`);
      setToDate(todayStr);
    } else if (preset === 'lastMonth') {
      const lastMonthDate = new Date(year, now.getMonth() - 1, 1);
      const endLastMonthDate = new Date(year, now.getMonth(), 0);
      setFromDate(lastMonthDate.toISOString().split('T')[0]);
      setToDate(endLastMonthDate.toISOString().split('T')[0]);
    } else if (preset === 'thisYear') {
      setFromDate(`${year}-01-01`);
      setToDate(todayStr);
    } else if (preset === 'all') {
      setFromDate('');
      setToDate('');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  /* ── Export CSV Helper (with UTF-8 BOM for Excel) ── */
  const exportCsv = () => {
    let filename = `Report_${activeTab}_${new Date().toISOString().split('T')[0]}`;
    let headers: string[] = [];
    let rows: any[][] = [];

    if (activeTab === 'sales' && salesData) {
      headers = ['Article #', 'Product Name', 'Volume Sold', 'Total Amount (KD)'];
      const products = salesData.topSellingProducts || [];
      rows = products.map((p: any) => [
        p.articleNumber || '',
        p.productName || p.nameEn || '',
        p.quantitySoldDisplay || (p.totalDozen !== undefined ? `${p.totalDozen} dz ${p.remainderPcs || 0} pcs` : `${p.totalPcs || 0} pcs`),
        Number(p.totalRevenueKd ?? p.totalKd ?? 0).toFixed(3),
      ]);
    } else if (activeTab === 'purchases' && purchaseData) {
      headers = ['Supplier Name', 'Shipments', 'Pieces', 'Total Amount (KD)'];
      const suppliers = purchaseData.bySupplier || purchaseData.supplierBreakdown || [];
      rows = suppliers.map((s: any) => [
        s.supplierName || 'Unknown Supplier',
        s.count ?? s.receiptCount ?? 0,
        s.totalPcs ?? s.pieces ?? 0,
        Number(s.totalKd || 0).toFixed(3),
      ]);
    } else if (activeTab === 'expenses' && expenseData) {
      headers = ['Category', 'Total Amount (KD)', 'Number of Entries', 'Percentage'];
      const categories = expenseData.byCategory || expenseData.categoryBreakdown || [];
      rows = categories.map((c: any) => [
        c.category || '',
        Number(c.totalKd || 0).toFixed(3),
        c.count || 0,
        c.percentage ? `${c.percentage}%` : '',
      ]);
    } else if (activeTab === 'customers' && customerData) {
      headers = ['Customer Name', 'Phone', 'Total Invoiced (KD)', 'Total Received (KD)', 'Outstanding (KD)'];
      const customers = customerData.customers || [];
      rows = customers.map((c: any) => [
        c.customerName || c.name || '',
        c.phone || '',
        Number(c.totalSalesKd || 0).toFixed(3),
        Number(c.totalReceivedKd || 0).toFixed(3),
        Number(c.outstandingKd || 0).toFixed(3),
      ]);
    } else if (activeTab === 'stock' && stockData) {
      if (stockData.items && stockData.items.length > 0) {
        headers = ['Article #', 'Product Name', 'In Stock', 'Cost Price (KD)', 'Selling Price (KD)', 'Valuation (KD)'];
        rows = stockData.items.map((i: any) => [
          i.articleNumber || '',
          i.productName || i.nameEn || '',
          i.stockDisplay || `${i.totalPcs || 0} pcs`,
          Number(i.costPriceKd || 0).toFixed(3),
          Number(i.sellingPriceKd || 0).toFixed(3),
          Number(i.totalValuationKd || 0).toFixed(3),
        ]);
      } else {
        headers = ['Category', 'Product Count', 'Stock Volume', 'Cost Valuation (KD)', 'Retail Valuation (KD)'];
        rows = (stockData.categoryBreakdown || []).map((cb: any) => [
          cb.categoryName || '',
          cb.productCount || 0,
          cb.totalDozen !== undefined ? `${cb.totalDozen} dz ${cb.remainderPcs || 0} pcs` : `${cb.totalStockPcs || 0} pcs`,
          Number(cb.costValuationKd || 0).toFixed(3),
          Number(cb.retailValuationKd || 0).toFixed(3),
        ]);
      }
    } else if (activeTab === 'pnl' && pnlData) {
      headers = ['Line Item', 'Amount (KD)'];
      rows = [
        ['Total Operating Revenue', Number(pnlData.revenue?.totalRevenueKd || 0).toFixed(3)],
        ['Cost of Goods Sold (COGS)', Number(pnlData.costOfGoodsSold?.totalCogsKd ?? pnlData.cogs?.totalCogsKd ?? 0).toFixed(3)],
        ['Gross Operating Profit', Number(pnlData.grossProfitKd ?? pnlData.grossProfit?.grossProfitKd ?? 0).toFixed(3)],
        ['Operating & Administrative Expenses', Number(pnlData.operatingExpenses?.totalExpensesKd || 0).toFixed(3)],
        ['Net Business Profit', Number(pnlData.netProfitKd ?? pnlData.netProfit?.netProfitKd ?? 0).toFixed(3)],
      ];
    } else {
      headers = ['Metric', 'Value'];
      rows = [
        ['Generated At', new Date().toLocaleString()],
        ['Tab', activeTab],
      ];
    }

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((r) => r.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const tabs: { key: ReportTab; label: string; icon: any }[] = [
    { key: 'sales', label: 'Sales', icon: ShoppingBag },
    { key: 'purchases', label: 'Purchases', icon: Package },
    { key: 'stock', label: 'Stock', icon: Layers },
    { key: 'customers', label: 'Customer Balances', icon: Users },
    { key: 'expenses', label: 'Expenses', icon: Receipt },
    { key: 'pnl', label: 'Profit & Loss', icon: Scale },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header - Fixed contrast on buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Reports & Analytics
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Business performance and financial reports
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Refresh button */}
          <button
            onClick={fetchActiveReport}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-800 text-sm font-semibold rounded-lg border border-slate-300 shadow-2xs hover:shadow-xs transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 text-slate-600 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          {/* Export CSV */}
          <button
            onClick={exportCsv}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-800 text-sm font-semibold rounded-lg border border-slate-300 shadow-2xs hover:shadow-xs transition-all active:scale-95 cursor-pointer"
            title="Export CSV / Excel"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          {/* Print / Export button (High Contrast!) */}
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-lg shadow-sm hover:shadow transition-all active:scale-95 cursor-pointer"
          >
            <Printer className="w-4 h-4 text-sky-400" />
            <span>Print / Export</span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation - High visibility active tab */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-200/80 rounded-xl overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-sky-400' : 'text-slate-500'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Consistent Date Filter Component across all reports */}
      {activeTab !== 'stock' && activeTab !== 'customers' && (
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            {/* Custom Range Inputs */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                <span>From:</span>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => {
                    setFromDate(e.target.value);
                    setActivePreset('all');
                  }}
                  className="bg-slate-50 border border-slate-300 text-slate-900 text-xs font-semibold rounded-lg px-2.5 py-1.5 outline-none focus:border-slate-900"
                />
              </div>

              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                <span>To:</span>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => {
                    setToDate(e.target.value);
                    setActivePreset('all');
                  }}
                  className="bg-slate-50 border border-slate-300 text-slate-900 text-xs font-semibold rounded-lg px-2.5 py-1.5 outline-none focus:border-slate-900"
                />
              </div>
            </div>

            {/* Quick Presets */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {(
                [
                  { id: 'today', label: 'Today' },
                  { id: 'thisWeek', label: 'This Week' },
                  { id: 'thisMonth', label: 'This Month' },
                  { id: 'lastMonth', label: 'Last Month' },
                  { id: 'thisYear', label: 'This Year' },
                  { id: 'all', label: 'All Time' },
                ] as const
              ).map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => applyPreset(p.id)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    activePreset === p.id
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Report Content Panels */}
      {loading ? (
        <div className="bg-white rounded-xl p-16 border border-slate-200 text-center text-slate-400 font-medium">
          <RefreshCw className="w-8 h-8 mx-auto text-slate-300 animate-spin mb-2" />
          Loading report analysis...
        </div>
      ) : error ? (
        <div className="p-5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm font-semibold flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      ) : (
        <div>
          {/* TAB 1: SALES REPORT */}
          {activeTab === 'sales' && salesData && (
            <div className="space-y-6">
              {/* 4 Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Total Sales
                  </span>
                  <div className="text-2xl font-black text-slate-900 mt-2">
                    KD {Number(salesData.summary?.totalSalesKd ?? salesData.metrics?.totalSalesKd ?? 0).toFixed(3)}
                  </div>
                  <div className="text-xs text-slate-500 mt-1 font-medium">
                    {salesData.summary?.postedCount ?? salesData.metrics?.totalInvoices ?? 0} Posted Invoices
                  </div>
                </div>

                <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Total Received
                  </span>
                  <div className="text-2xl font-black text-emerald-700 mt-2">
                    KD {Number(salesData.summary?.totalReceivedKd ?? salesData.metrics?.totalReceivedKd ?? 0).toFixed(3)}
                  </div>
                  <div className="text-xs text-slate-500 mt-1 font-medium">
                    Collected Cash & Electronic
                  </div>
                </div>

                <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Outstanding
                  </span>
                  <div className="text-2xl font-black text-rose-700 mt-2">
                    KD {Number(salesData.summary?.totalOutstandingKd ?? salesData.metrics?.totalOutstandingKd ?? 0).toFixed(3)}
                  </div>
                  <div className="text-xs text-slate-500 mt-1 font-medium">
                    Pending Invoices
                  </div>
                </div>

                <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Cancelled
                  </span>
                  <div className="text-2xl font-black text-slate-700 mt-2">
                    {salesData.summary?.cancelledCount ?? salesData.metrics?.cancelledInvoices ?? 0}
                  </div>
                  <div className="text-xs text-slate-500 mt-1 font-medium">
                    Voided transactions (Excluded)
                  </div>
                </div>
              </div>

              {/* Distinct Section 1: Top Selling Products */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="px-5 py-3.5 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
                  <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">
                    Top Selling Products
                  </h3>
                  <span className="text-xs font-semibold text-slate-500">
                    By sales volume
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-slate-50/50 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase">
                        <th className="px-4 py-3">Article #</th>
                        <th className="px-4 py-3">Product Name</th>
                        <th className="px-4 py-3">Volume Sold</th>
                        <th className="px-4 py-3 text-right">Total Revenue</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {salesData.topSellingProducts?.length > 0 ? (
                        salesData.topSellingProducts.map((p: any) => (
                          <tr key={p.productId || p.articleNumber} className="hover:bg-slate-50/70">
                            <td className="px-4 py-3 font-mono font-bold text-xs text-slate-900">
                              {p.articleNumber}
                            </td>
                            <td className="px-4 py-3 font-semibold text-slate-800">
                              {p.productName || p.nameEn}
                            </td>
                            <td className="px-4 py-3 text-xs font-medium text-slate-600">
                              {p.quantitySoldDisplay || (p.totalDozen !== undefined ? `${p.totalDozen} dz ${p.remainderPcs || 0} pcs` : `${p.totalPcs || 0} pcs`)}
                            </td>
                            <td className="px-4 py-3 text-right font-black text-sm text-slate-900">
                              KD {Number(p.totalRevenueKd ?? p.totalKd ?? 0).toFixed(3)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="px-4 py-8 text-center text-slate-400 text-xs">
                            No product sales recorded in this date range.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Distinct Section 2 & 3: Payment Methods & Daily Sales Trend */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Payment Methods */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
                  <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider mb-4">
                    Payment Methods Breakdown
                  </h3>
                  <div className="space-y-3">
                    {(salesData.byPaymentMethod || salesData.paymentMethods)?.length > 0 ? (
                      (salesData.byPaymentMethod || salesData.paymentMethods).map((pm: any) => (
                        <div
                          key={pm.paymentMethod || pm.method}
                          className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200/80"
                        >
                          <div>
                            <div className="font-bold text-slate-900 text-sm">{pm.paymentMethod || pm.method}</div>
                            <div className="text-xs text-slate-500 font-medium">
                              {pm.count} Invoices
                            </div>
                          </div>
                          <div className="font-black text-base text-slate-900">
                            KD {Number(pm.totalKd || 0).toFixed(3)}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-xs text-slate-400 text-center py-6">
                        No payments recorded.
                      </div>
                    )}
                  </div>
                </div>

                {/* Daily Sales Trend */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
                  <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider mb-4">
                    Daily Sales Trend
                  </h3>
                  <div className="space-y-2 max-h-72 overflow-y-auto">
                    {(salesData.dailySales || salesData.dailyTrend)?.length > 0 ? (
                      (salesData.dailySales || salesData.dailyTrend).map((d: any) => (
                        <div
                          key={d.date}
                          className="flex items-center justify-between py-2 border-b border-slate-100 last:border-none text-xs"
                        >
                          <span className="font-mono text-slate-600 font-medium">{d.date}</span>
                          <span className="font-black text-slate-900">
                            KD {Number(d.totalRevenueKd ?? d.totalKd ?? 0).toFixed(3)}{' '}
                            <span className="text-slate-400 font-normal">({d.invoiceCount ?? d.count ?? 0} inv)</span>
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="text-xs text-slate-400 text-center py-6">
                        No daily transactions.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PURCHASES REPORT */}
          {activeTab === 'purchases' && purchaseData && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Total Purchases
                  </span>
                  <div className="text-2xl font-black text-slate-900 mt-2">
                    KD {Number(purchaseData.summary?.totalPurchasesKd ?? purchaseData.metrics?.totalPurchasesKd ?? 0).toFixed(3)}
                  </div>
                  <div className="text-xs text-slate-500 mt-1 font-medium">
                    {purchaseData.summary?.receiptCount ?? purchaseData.metrics?.totalReceiptsCount ?? 0} Purchase Shipments
                  </div>
                </div>

                <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Total Volume Received
                  </span>
                  <div className="text-2xl font-black text-slate-900 mt-2">
                    {purchaseData.summary?.totalPieces ?? purchaseData.metrics?.totalPieces ?? 0} Pcs
                  </div>
                  <div className="text-xs text-slate-500 mt-1 font-medium">
                    {purchaseData.metrics?.totalDozen !== undefined ? `${purchaseData.metrics.totalDozen} dz ${purchaseData.metrics.remainderPcs || 0} pcs in warehouse` : 'Stock added to warehouse'}
                  </div>
                </div>

                <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Suppliers Invoiced
                  </span>
                  <div className="text-2xl font-black text-slate-900 mt-2">
                    {(purchaseData.bySupplier || purchaseData.supplierBreakdown)?.length || 0}
                  </div>
                  <div className="text-xs text-slate-500 mt-1 font-medium">
                    Active International & Local Suppliers
                  </div>
                </div>
              </div>

              {/* Purchases by Supplier */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="px-5 py-3.5 bg-slate-50/80 border-b border-slate-200 font-bold text-sm text-slate-900 uppercase">
                  Purchases by Supplier
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-slate-50/50 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase">
                        <th className="px-4 py-3">Supplier</th>
                        <th className="px-4 py-3">Shipments</th>
                        <th className="px-4 py-3 text-right">Total Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(purchaseData.bySupplier || purchaseData.supplierBreakdown)?.map((s: any) => (
                        <tr key={s.supplierId || s.supplierName} className="hover:bg-slate-50/70">
                          <td className="px-4 py-3 font-semibold text-slate-900">
                            {s.supplierName}
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-600">
                            {s.count ?? s.receiptCount ?? 0} Receipts {s.totalPcs ? `(${s.totalPcs} pcs)` : ''}
                          </td>
                          <td className="px-4 py-3 text-right font-black text-slate-900">
                            KD {Number(s.totalKd || 0).toFixed(3)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: STOCK VALUATION */}
          {activeTab === 'stock' && stockData && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Total Inventory Valuation (Cost)
                  </span>
                  <div className="text-2xl font-black text-slate-900 mt-2">
                    KD {Number(stockData.totalCostValuationKd ?? stockData.metrics?.totalCostValuationKd ?? 0).toFixed(3)}
                  </div>
                  <div className="text-xs text-slate-500 mt-1 font-medium">
                    Weighted Average Cost Basis
                  </div>
                </div>

                <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Retail Valuation (Selling Price)
                  </span>
                  <div className="text-2xl font-black text-emerald-700 mt-2">
                    KD {Number(stockData.totalRetailValuationKd ?? stockData.metrics?.totalRetailValuationKd ?? 0).toFixed(3)}
                  </div>
                  <div className="text-xs text-slate-500 mt-1 font-medium">
                    Potential Retail Value {stockData.metrics?.potentialProfitKd ? `(+KD ${Number(stockData.metrics.potentialProfitKd).toFixed(3)} profit)` : ''}
                  </div>
                </div>

                <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Total Articles in Stock
                  </span>
                  <div className="text-2xl font-black text-slate-900 mt-2">
                    {stockData.items?.length || stockData.metrics?.totalProducts || 0}
                  </div>
                  <div className="text-xs text-slate-500 mt-1 font-medium">
                    {stockData.metrics?.totalStockPcs ? `${stockData.metrics.totalStockPcs} Pcs (${stockData.metrics.totalStockDozen || 0} dz ${stockData.metrics.remainderPcs || 0} pcs)` : 'Active Catalog Items'}
                  </div>
                </div>
              </div>

              {/* Stock Items Table or Category Breakdown Table */}
              {stockData.items && stockData.items.length > 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                  <div className="px-5 py-3.5 bg-slate-50/80 border-b border-slate-200 font-bold text-sm text-slate-900 uppercase">
                    Current Stock Valuation By Article
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-sm">
                      <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase">
                          <th className="px-4 py-3">Article #</th>
                          <th className="px-4 py-3">Product</th>
                          <th className="px-4 py-3">In Stock</th>
                          <th className="px-4 py-3 text-right">Cost Price</th>
                          <th className="px-4 py-3 text-right">Selling Price</th>
                          <th className="px-4 py-3 text-right">Total Valuation</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {stockData.items.map((item: any) => (
                          <tr key={item.articleNumber || item.productId} className="hover:bg-slate-50/70">
                            <td className="px-4 py-3 font-mono font-bold text-xs text-slate-900">
                              {item.articleNumber}
                            </td>
                            <td className="px-4 py-3 font-semibold text-slate-800">
                              {item.productName || item.nameEn}
                            </td>
                            <td className="px-4 py-3 text-xs font-semibold text-slate-700">
                              {item.stockDisplay || `${item.totalPcs || 0} pcs`}
                            </td>
                            <td className="px-4 py-3 text-right font-mono text-xs text-slate-600">
                              KD {Number(item.costPriceKd || 0).toFixed(3)}
                            </td>
                            <td className="px-4 py-3 text-right font-mono text-xs text-slate-600">
                              KD {Number(item.sellingPriceKd || 0).toFixed(3)}
                            </td>
                            <td className="px-4 py-3 text-right font-mono font-black text-sm text-slate-900">
                              KD {Number(item.totalValuationKd || 0).toFixed(3)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                  <div className="px-5 py-3.5 bg-slate-50/80 border-b border-slate-200 font-bold text-sm text-slate-900 uppercase">
                    Stock Valuation By Category
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-sm">
                      <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase">
                          <th className="px-4 py-3">Category</th>
                          <th className="px-4 py-3 text-center">Products</th>
                          <th className="px-4 py-3">Total Stock Volume</th>
                          <th className="px-4 py-3 text-right">Cost Valuation</th>
                          <th className="px-4 py-3 text-right">Retail Valuation</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {(stockData.categoryBreakdown || []).map((cb: any) => (
                          <tr key={cb.categoryName} className="hover:bg-slate-50/70">
                            <td className="px-4 py-3 font-semibold text-slate-900">
                              {cb.categoryName}
                            </td>
                            <td className="px-4 py-3 text-center text-xs text-slate-600">
                              {cb.productCount}
                            </td>
                            <td className="px-4 py-3 text-xs font-medium text-slate-700">
                              {cb.totalDozen !== undefined ? `${cb.totalDozen} dz ${cb.remainderPcs || 0} pcs` : `${cb.totalStockPcs} pcs`}
                            </td>
                            <td className="px-4 py-3 text-right font-mono text-xs font-semibold text-slate-800">
                              KD {Number(cb.costValuationKd || 0).toFixed(3)}
                            </td>
                            <td className="px-4 py-3 text-right font-mono font-black text-sm text-emerald-700">
                              KD {Number(cb.retailValuationKd || 0).toFixed(3)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: CUSTOMER BALANCES */}
          {activeTab === 'customers' && customerData && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Total Customer Outstanding
                  </span>
                  <div className="text-2xl font-black text-rose-700 mt-2">
                    KD {Number(customerData.totalOutstandingKd ?? customerData.metrics?.totalOutstandingKd ?? 0).toFixed(3)}
                  </div>
                  <div className="text-xs text-slate-500 mt-1 font-medium">
                    All Customer Receivables
                  </div>
                </div>

                <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Customers with Balance
                  </span>
                  <div className="text-2xl font-black text-slate-900 mt-2">
                    {customerData.customersWithBalanceCount ?? customerData.metrics?.withOutstandingCount ?? 0}
                  </div>
                  <div className="text-xs text-slate-500 mt-1 font-medium">
                    Accounts Pending Payment
                  </div>
                </div>

                <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Fully Settled Customers
                  </span>
                  <div className="text-2xl font-black text-emerald-700 mt-2">
                    {customerData.settledCustomersCount ?? (customerData.metrics?.totalCustomers !== undefined ? Math.max(0, customerData.metrics.totalCustomers - (customerData.metrics.withOutstandingCount || 0)) : 0)}
                  </div>
                  <div className="text-xs text-slate-500 mt-1 font-medium">
                    Zero Balance
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="px-5 py-3.5 bg-slate-50/80 border-b border-slate-200 font-bold text-sm text-slate-900 uppercase">
                  Customer Receivables Schedule
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-slate-50/50 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase">
                        <th className="px-4 py-3">Customer</th>
                        <th className="px-4 py-3">Phone</th>
                        <th className="px-4 py-3 text-right">Total Invoiced</th>
                        <th className="px-4 py-3 text-right">Total Received</th>
                        <th className="px-4 py-3 text-right">Outstanding Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {customerData.customers?.map((c: any) => (
                        <tr key={c.customerId || c.id} className="hover:bg-slate-50/70">
                          <td className="px-4 py-3 font-semibold text-slate-900">
                            {c.customerName || c.name}
                          </td>
                          <td className="px-4 py-3 text-xs font-mono text-slate-600">
                            {c.phone || '—'}
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-xs text-slate-900">
                            KD {Number(c.totalSalesKd || 0).toFixed(3)}
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-xs text-emerald-700 font-bold">
                            KD {Number(c.totalReceivedKd || 0).toFixed(3)}
                          </td>
                          <td className="px-4 py-3 text-right font-mono font-black text-sm text-rose-700">
                            KD {Number(c.outstandingKd || 0).toFixed(3)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: EXPENSES REPORT */}
          {activeTab === 'expenses' && expenseData && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Total Operational Expenses
                  </span>
                  <div className="text-2xl font-black text-slate-900 mt-2">
                    KD {Number(expenseData.summary?.totalExpensesKd ?? expenseData.metrics?.totalExpensesKd ?? 0).toFixed(3)}
                  </div>
                  <div className="text-xs text-slate-500 mt-1 font-medium">
                    {expenseData.summary?.totalExpenseCount ?? expenseData.metrics?.totalExpenseCount ?? 0} Posted Entries (Cancelled excluded)
                  </div>
                </div>

                <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Top Category
                  </span>
                  <div className="text-2xl font-black text-slate-900 mt-2">
                    {(expenseData.byCategory || expenseData.categoryBreakdown)?.[0]?.category || 'None'}
                  </div>
                  <div className="text-xs text-slate-500 mt-1 font-medium">
                    KD {Number((expenseData.byCategory || expenseData.categoryBreakdown)?.[0]?.totalKd || 0).toFixed(3)}
                  </div>
                </div>

                <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Active Categories
                  </span>
                  <div className="text-2xl font-black text-slate-900 mt-2">
                    {(expenseData.byCategory || expenseData.categoryBreakdown)?.length || 0}
                  </div>
                  <div className="text-xs text-slate-500 mt-1 font-medium">
                    Category distribution
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="px-5 py-3.5 bg-slate-50/80 border-b border-slate-200 font-bold text-sm text-slate-900 uppercase">
                  Expenses by Category
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-slate-50/50 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase">
                        <th className="px-4 py-3">Category</th>
                        <th className="px-4 py-3 text-center">Entries</th>
                        <th className="px-4 py-3 text-right">% of Total</th>
                        <th className="px-4 py-3 text-right">Total Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(expenseData.byCategory || expenseData.categoryBreakdown)?.map((cat: any) => (
                        <tr key={cat.category} className="hover:bg-slate-50/70">
                          <td className="px-4 py-3 font-semibold text-slate-900">
                            {cat.category}
                          </td>
                          <td className="px-4 py-3 text-center text-xs text-slate-600">
                            {cat.count}
                          </td>
                          <td className="px-4 py-3 text-right text-xs font-mono text-slate-600">
                            {cat.percentage ? `${cat.percentage}%` : '—'}
                          </td>
                          <td className="px-4 py-3 text-right font-mono font-black text-slate-900">
                            KD {Number(cat.totalKd || 0).toFixed(3)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: PROFIT & LOSS (P&L) */}
          {activeTab === 'pnl' && pnlData && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Total Revenue (Sales)
                  </span>
                  <div className="text-2xl font-black text-slate-900 mt-2">
                    KD {Number(pnlData.revenue?.totalRevenueKd || 0).toFixed(3)}
                  </div>
                  <div className="text-xs text-slate-500 mt-1 font-medium">
                    {pnlData.revenue?.invoiceCount ? `${pnlData.revenue.invoiceCount} Posted Invoices (${pnlData.revenue.totalItemsSoldPcs || 0} pcs sold)` : 'Posted Invoices'}
                  </div>
                </div>

                <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Cost of Goods Sold (COGS)
                  </span>
                  <div className="text-2xl font-black text-slate-700 mt-2">
                    KD {Number(pnlData.costOfGoodsSold?.totalCogsKd ?? pnlData.cogs?.totalCogsKd ?? 0).toFixed(3)}
                  </div>
                  <div className="text-xs text-slate-500 mt-1 font-medium">
                    Cost of items delivered
                  </div>
                </div>

                <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Net Profit
                  </span>
                  <div
                    className={`text-2xl font-black mt-2 ${
                      Number(pnlData.netProfitKd ?? pnlData.netProfit?.netProfitKd ?? 0) >= 0 ? 'text-emerald-700' : 'text-rose-700'
                    }`}
                  >
                    KD {Number(pnlData.netProfitKd ?? pnlData.netProfit?.netProfitKd ?? 0).toFixed(3)}
                  </div>
                  <div className="text-xs text-slate-500 mt-1 font-medium">
                    {pnlData.netProfit?.netMarginPercent !== undefined ? `Net Margin: ${pnlData.netProfit.netMarginPercent}%` : 'Operating Gross Profit minus Expenses'}
                  </div>
                </div>
              </div>

              {/* Detailed P&L Breakdown Card */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
                <h3 className="font-bold text-base text-slate-900 uppercase tracking-wider pb-3 border-b border-slate-200">
                  Income Statement Statement
                </h3>

                <div className="space-y-3 font-mono text-sm">
                  <div className="flex justify-between items-center py-1">
                    <span className="font-sans font-semibold text-slate-800">
                      Total Operating Revenue
                    </span>
                    <span className="font-bold text-slate-900">
                      KD {Number(pnlData.revenue?.totalRevenueKd || 0).toFixed(3)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-1 text-slate-600">
                    <span className="font-sans font-medium text-slate-700 pl-4">
                      Less: Cost of Goods Sold (COGS)
                    </span>
                    <span className="font-semibold text-rose-700">
                      - KD {Number(pnlData.costOfGoodsSold?.totalCogsKd ?? pnlData.cogs?.totalCogsKd ?? 0).toFixed(3)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-2 border-t border-b border-slate-200 bg-slate-50/80 px-3 rounded-lg font-bold">
                    <span className="font-sans text-slate-900">
                      Gross Operating Profit {pnlData.grossProfit?.grossMarginPercent ? `(${pnlData.grossProfit.grossMarginPercent}% margin)` : ''}
                    </span>
                    <span className="text-slate-900">
                      KD {Number(pnlData.grossProfitKd ?? pnlData.grossProfit?.grossProfitKd ?? 0).toFixed(3)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-1 text-slate-600">
                    <span className="font-sans font-medium text-slate-700 pl-4">
                      Less: Operating & Administrative Expenses
                    </span>
                    <span className="font-semibold text-rose-700">
                      - KD {Number(pnlData.operatingExpenses?.totalExpensesKd || 0).toFixed(3)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-3 border-t-2 border-slate-900 bg-slate-900 text-white px-4 rounded-xl font-bold text-base">
                    <span className="font-sans text-white">Net Business Profit</span>
                    <span
                      className={
                        Number(pnlData.netProfitKd ?? pnlData.netProfit?.netProfitKd ?? 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }
                    >
                      KD {Number(pnlData.netProfitKd ?? pnlData.netProfit?.netProfitKd ?? 0).toFixed(3)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
