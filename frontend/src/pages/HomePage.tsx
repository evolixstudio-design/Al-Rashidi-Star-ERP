import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslations } from '../hooks/useTranslations';
import api from '../services/api';
import {
  ShoppingCart,
  PackagePlus,
  CircleDollarSign,
  Receipt,
  Search,
  Clock,
  Building,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Boxes,
  AlertCircle,
  AlertTriangle,
  MessageCircle,
  RefreshCw,
  ArrowUpRight,
  FileText,
} from 'lucide-react';
import { openWhatsAppWithText } from '../services/whatsappService';

/* ───────────────────── Types ───────────────────── */

interface DashboardSummary {
  todaySales: {
    amountKd: number;
    invoiceCount: number;
  };
  pendingPayments: {
    amountKd: number;
    customerCount: number;
  };
  stockValuation: {
    totalCostValuationKd: number;
    totalStockPcs: number;
    totalStockDozen: number;
    remainderPcs: number;
  };
  stockOutToday: {
    totalPcs: number;
    dozen: number;
    pieces: number;
  };
  stockReceivedToday: {
    totalPcs: number;
    dozen: number;
    pieces: number;
  };
  thisMonthExpenses: {
    amountKd: number;
    count: number;
  };
  thisMonthProfitLoss: {
    salesRevenueKd: number;
    cogsKd: number;
    grossProfitKd: number;
    expensesKd: number;
    netProfitKd: number;
    isProfit: boolean;
  };
  thisMonthPurchases: {
    amountKd: number;
    totalPcs: number;
    dozen: number;
    pieces: number;
  };
}

interface TrendPoint {
  date: string;
  label: string;
  salesKd: number;
  profitKd: number;
  expensesKd: number;
}

interface PendingCustomer {
  id: number;
  name: string;
  nameAr?: string | null;
  phone?: string | null;
  outstandingKd: number;
  latestInvoiceNumber?: string | null;
  paymentStatus: string;
  oldestUnpaidDate?: string | null;
  daysOverdue: number;
  isOverdue: boolean;
}

interface LowStockItem {
  id: number;
  articleNumber: string;
  nameEn: string;
  nameAr?: string | null;
  currentStockPcs: number;
  currentStockDozen: number;
  currentStockRemainder: number;
  reorderLevelPcs: number;
  sellingPriceKd: number;
}

interface RecentTransaction {
  id: string;
  type: 'SALE' | 'PAYMENT' | 'PURCHASE' | 'EXPENSE';
  reference: string;
  date: string;
  amountKd: number;
  status: string;
  entityName: string;
  detail?: string;
  createdAt: string;
}

export const HomePage: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslations();
  const navigate = useNavigate();

  const [company, setCompany] = useState<{ nameEn: string; nameAr: string } | null>(null);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [trends, setTrends] = useState<TrendPoint[]>([]);
  const [trendPeriod, setTrendPeriod] = useState<string>('7d');
  const [pendingPayments, setPendingPayments] = useState<PendingCustomer[]>([]);
  const [lowStock, setLowStock] = useState<LowStockItem[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<RecentTransaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [hoveredPoint, setHoveredPoint] = useState<TrendPoint | null>(null);

  // Live clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleDateString('en-GB', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch all dashboard data
  const fetchDashboardData = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      else setRefreshing(true);

      const [compRes, sumRes, pendingRes, lowRes, transRes] = await Promise.allSettled([
        api.get('/settings/company'),
        api.get('/dashboard/summary'),
        api.get('/dashboard/pending-payments?limit=5'),
        api.get('/dashboard/low-stock?limit=5'),
        api.get('/dashboard/recent-transactions?limit=8'),
      ]);

      if (compRes.status === 'fulfilled') setCompany(compRes.value.data);
      if (sumRes.status === 'fulfilled') setSummary(sumRes.value.data);
      else console.error('Failed to load summary:', sumRes.reason);
      
      if (pendingRes.status === 'fulfilled') setPendingPayments(pendingRes.value.data);
      else console.error('Failed to load pending payments:', pendingRes.reason);
      
      if (lowRes.status === 'fulfilled') setLowStock(lowRes.value.data);
      else console.error('Failed to load low stock:', lowRes.reason);
      
      if (transRes.status === 'fulfilled') setRecentTransactions(transRes.value.data);
      else console.error('Failed to load recent transactions:', transRes.reason);
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Fetch trends when period changes
  const fetchTrends = useCallback(async (period: string) => {
    try {
      const res = await api.get(`/dashboard/trends?period=${period}`);
      setTrends(res.data);
    } catch (err) {
      console.error('Failed to load trends', err);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  useEffect(() => {
    fetchTrends(trendPeriod);
  }, [fetchTrends, trendPeriod]);

  // 5 Quick Actions
  const quickActions = [
    {
      title: 'New Sale / Invoice',
      subtitle: 'Create cash or credit invoice',
      icon: ShoppingCart,
      accentBorder: 'border-l-blue-600',
      iconBg: 'bg-blue-600 text-white',
      badge: 'Action 1',
      to: '/sales',
    },
    {
      title: 'Receive Shipment',
      subtitle: 'Receive stock from supplier',
      icon: PackagePlus,
      accentBorder: 'border-l-emerald-600',
      iconBg: 'bg-emerald-600 text-white',
      badge: 'Action 2',
      to: '/purchases',
    },
    {
      title: 'Receive Payment',
      subtitle: 'Record customer receipt',
      icon: CircleDollarSign,
      accentBorder: 'border-l-amber-600',
      iconBg: 'bg-amber-600 text-white',
      badge: 'Action 3',
      to: '/payments',
    },
    {
      title: 'Add Expense',
      subtitle: 'Record operational expenditure',
      icon: Receipt,
      accentBorder: 'border-l-purple-600',
      iconBg: 'bg-purple-600 text-white',
      badge: 'Action 4',
      to: '/expenses',
    },
    {
      title: 'Search Stock',
      subtitle: 'Check inventory & valuation',
      icon: Search,
      accentBorder: 'border-l-slate-900',
      iconBg: 'bg-slate-900 text-white',
      badge: 'Action 5',
      to: '/stock',
    },
  ];

  // WhatsApp Reminder Handler
  const openWhatsAppReminder = (cust: PendingCustomer) => {
    if (!cust.phone) return;
    const isPartial = cust.paymentStatus === 'PARTIAL';

    openWhatsAppWithText(
      {
        customerName: cust.name,
        customerPhone: cust.phone,
        invoiceNumber: cust.latestInvoiceNumber,
        invoiceDate: cust.oldestUnpaidDate,
        outstandingAmount: cust.outstandingKd,
        paymentStatus: cust.paymentStatus,
      },
      isPartial ? 'PARTIAL_REMINDER' : 'PENDING_REMINDER'
    );
  };

  // Trend Chart Calculations
  const trendMaxVal = useMemo(() => {
    if (trends.length === 0) return 100;
    const maxSales = Math.max(...trends.map((t) => t.salesKd), 0);
    const maxProfit = Math.max(...trends.map((t) => t.profitKd), 0);
    const maxExp = Math.max(...trends.map((t) => t.expensesKd), 0);
    const highest = Math.max(maxSales, maxProfit, maxExp);
    return highest > 0 ? highest * 1.15 : 100;
  }, [trends]);

  const totalPeriodSalesKd = useMemo(() => {
    return trends.reduce((sum, t) => sum + t.salesKd, 0);
  }, [trends]);

  const totalPeriodProfitKd = useMemo(() => {
    return trends.reduce((sum, t) => sum + t.profitKd, 0);
  }, [trends]);

  const totalPeriodExpensesKd = useMemo(() => {
    return trends.reduce((sum, t) => sum + t.expensesKd, 0);
  }, [trends]);

  if (loading) {
    return (
      <div className="py-24 text-center text-slate-500 font-medium text-sm flex flex-col items-center justify-center gap-3">
        <RefreshCw className="w-6 h-6 animate-spin text-slate-900" />
        <span>Loading live business dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-14 antialiased text-sm">
      {/* ───────────────────── 1. WELCOME / OWNER SESSION ───────────────────── */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-xs border border-slate-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2.5 mb-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-xs flex items-center gap-1.5 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              {t.home.ownerSessionActive}
            </span>
            <span className="text-slate-500 text-xs flex items-center gap-1.5 font-medium">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              {currentTime}
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Welcome, {user?.displayName || 'Yusuf ali jath wala'}</span>
          </h1>

          <p className="text-xs text-slate-500 font-medium mt-1">
            {company?.nameEn || 'Rashidi Star'} • <span className="font-arabic">{company?.nameAr || 'شركة الرشيدي ستار للتجارة العامة'}</span>
          </p>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto">
          <div className="flex items-center gap-3 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200">
            <div className="w-9 h-9 rounded-lg bg-slate-900 text-white flex items-center justify-center shadow-xs">
              <Building className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Current Location
              </div>
              <div className="text-xs font-bold text-slate-900">
                Kuwait Main Store
              </div>
              <div className="text-[11px] text-slate-600 font-semibold">
                Currency: Kuwait Dinar (K.D.)
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => fetchDashboardData(true)}
            disabled={refreshing}
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer border border-slate-200"
            title="Refresh Live Data"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-slate-900' : ''}`} />
          </button>
        </div>
      </div>

      {/* ───────────────────── 2. 5 QUICK ACTIONS ───────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
            Quick Actions
          </h2>
          <span className="text-xs text-slate-400 font-medium">
            Fast one-click workflows
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {quickActions.map((action, idx) => {
            const Icon = action.icon;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => navigate(action.to)}
                className={`group text-left p-3.5 rounded-xl bg-white border border-slate-200 border-l-4 ${action.accentBorder} shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between cursor-pointer`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-8 h-8 rounded-lg ${action.iconBg} flex items-center justify-center shadow-xs`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-800 transition-transform group-hover:translate-x-0.5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 group-hover:text-slate-700 transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-[11px] text-slate-400 font-medium mt-0.5 line-clamp-1">
                    {action.subtitle}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ───────────────────── 3. BUSINESS KPI CARDS (6 CARDS) ───────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
            Live Business Health KPIs
          </h2>
          <span className="text-xs text-slate-400 font-medium">
            Calculated from posted transactions
          </span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
          {/* Card 1: Today's Sales */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Today's Sales</span>
              <span className="p-1.5 rounded-lg bg-blue-50 text-blue-700">
                <ShoppingCart className="w-4 h-4" />
              </span>
            </div>
            <div className="mt-2">
              <div className="text-xl sm:text-2xl font-black text-slate-900">
                KD {summary ? summary.todaySales.amountKd.toFixed(3) : '0.000'}
              </div>
              <div className="text-xs text-slate-400 font-semibold mt-0.5">
                {summary ? `${summary.todaySales.invoiceCount} Invoices` : '—'}
              </div>
            </div>
          </div>

          {/* Card 2: Pending Payments */}
          <div
            onClick={() => navigate('/customers')}
            className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-amber-300 transition-colors cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Pending Payments</span>
              <span className="p-1.5 rounded-lg bg-amber-50 text-amber-700">
                <AlertCircle className="w-4 h-4" />
              </span>
            </div>
            <div className="mt-2">
              <div className="text-xl sm:text-2xl font-black text-amber-700">
                KD {summary ? summary.pendingPayments.amountKd.toFixed(3) : '0.000'}
              </div>
              <div className="text-xs text-slate-400 font-semibold mt-0.5 flex items-center justify-between">
                <span>{summary ? `${summary.pendingPayments.customerCount} Customers` : '—'}</span>
                <span className="text-amber-600 group-hover:underline text-[11px]">Collect →</span>
              </div>
            </div>
          </div>

          {/* Card 3: Current Stock Value */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Stock Value</span>
              <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700">
                <Boxes className="w-4 h-4" />
              </span>
            </div>
            <div className="mt-2">
              <div className="text-xl sm:text-2xl font-black text-slate-900">
                KD {summary ? summary.stockValuation.totalCostValuationKd.toFixed(3) : '0.000'}
              </div>
              <div className="text-xs text-slate-400 font-semibold mt-0.5 truncate">
                {summary ? `${summary.stockValuation.totalStockPcs.toLocaleString()} Pcs (${summary.stockValuation.totalStockDozen} Doz)` : '—'}
              </div>
            </div>
          </div>

          {/* Card 4: Stock Out Today */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Stock Out Today</span>
              <span className="p-1.5 rounded-lg bg-violet-50 text-violet-700">
                <ArrowUpRight className="w-4 h-4" />
              </span>
            </div>
            <div className="mt-2">
              <div className="text-xl sm:text-2xl font-black text-slate-900">
                {summary ? `${summary.stockOutToday.dozen} Doz ${summary.stockOutToday.pieces} Pcs` : '0 Doz 0 Pcs'}
              </div>
              <div className="text-xs text-slate-400 font-semibold mt-0.5">
                {summary ? `Total: ${summary.stockOutToday.totalPcs} Pcs sold` : '—'}
              </div>
            </div>
          </div>

          {/* Card 5: This Month Expenses */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Month Expenses</span>
              <span className="p-1.5 rounded-lg bg-purple-50 text-purple-700">
                <Receipt className="w-4 h-4" />
              </span>
            </div>
            <div className="mt-2">
              <div className="text-xl sm:text-2xl font-black text-slate-900">
                KD {summary ? summary.thisMonthExpenses.amountKd.toFixed(3) : '0.000'}
              </div>
              <div className="text-xs text-slate-400 font-semibold mt-0.5">
                {summary ? `${summary.thisMonthExpenses.count} active entries` : '—'}
              </div>
            </div>
          </div>

          {/* Card 6: This Month Profit / Loss */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                {summary && !summary.thisMonthProfitLoss.isProfit ? 'This Month Loss' : 'This Month Profit'}
              </span>
              <span className={`p-1.5 rounded-lg ${summary && !summary.thisMonthProfitLoss.isProfit ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'}`}>
                {summary && !summary.thisMonthProfitLoss.isProfit ? (
                  <TrendingDown className="w-4 h-4" />
                ) : (
                  <TrendingUp className="w-4 h-4" />
                )}
              </span>
            </div>
            <div className="mt-2">
              <div
                className={`text-xl sm:text-2xl font-black ${
                  summary && !summary.thisMonthProfitLoss.isProfit ? 'text-rose-600' : 'text-emerald-700'
                }`}
              >
                KD {summary ? Math.abs(summary.thisMonthProfitLoss.netProfitKd).toFixed(3) : '0.000'}
              </div>
              <div className="text-xs text-slate-400 font-semibold mt-0.5">
                Net P&L (Sales − COGS − Exp)
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ───────────────────── 4. SALES & PROFIT TREND GRAPH ───────────────────── */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-xs border border-slate-200 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">
                Sales & Profit Trend
              </h2>
              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-bold text-xs">
                KD 3 Decimals
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Net sales revenue vs Net calculated business profit
            </p>
          </div>

          <div className="flex items-center gap-1.5 self-start sm:self-auto bg-slate-100 p-1 rounded-xl">
            {[
              { id: '7d', label: '7 Days' },
              { id: '30d', label: '30 Days' },
              { id: 'thisMonth', label: 'This Month' },
              { id: 'thisYear', label: 'This Year' },
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setTrendPeriod(p.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  trendPeriod === p.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Legend & Summary Chips */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-5 font-semibold">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-600"></span>
              <span className="text-slate-700">Sales: <strong className="text-slate-900">KD {totalPeriodSalesKd.toFixed(3)}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-600"></span>
              <span className="text-slate-700">Net Profit: <strong className="text-slate-900">KD {totalPeriodProfitKd.toFixed(3)}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-purple-500"></span>
              <span className="text-slate-700">Expenses: <strong className="text-slate-900">KD {totalPeriodExpensesKd.toFixed(3)}</strong></span>
            </div>
          </div>

          {hoveredPoint && (
            <div className="bg-slate-900 text-white px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-3">
              <span>{hoveredPoint.label}</span>
              <span className="text-blue-300">Sales: KD {hoveredPoint.salesKd.toFixed(3)}</span>
              <span className="text-emerald-300">Profit: KD {hoveredPoint.profitKd.toFixed(3)}</span>
            </div>
          )}
        </div>

        {/* Responsive Interactive SVG Graph */}
        <div className="relative h-64 w-full pt-2">
          {trends.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-400 text-xs">
              Loading trend analytics...
            </div>
          ) : (
            <svg
              className="w-full h-full overflow-visible"
              viewBox="0 0 800 220"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563eb" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#059669" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#059669" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                const y = 200 - ratio * 180;
                return (
                  <g key={idx}>
                    <line
                      x1="0"
                      y1={y}
                      x2="800"
                      y2={y}
                      stroke="#f1f5f9"
                      strokeWidth="1"
                      strokeDasharray="4 4"
                    />
                    <text
                      x="0"
                      y={y - 4}
                      fill="#94a3b8"
                      fontSize="9"
                      fontWeight="bold"
                    >
                      KD {(trendMaxVal * ratio).toFixed(1)}
                    </text>
                  </g>
                );
              })}

              {/* Points calculation */}
              {(() => {
                const count = trends.length;
                const step = count > 1 ? 800 / (count - 1) : 400;

                const salesPoints = trends.map((p, idx) => {
                  const x = idx * step;
                  const y = 200 - (Math.max(0, p.salesKd) / trendMaxVal) * 180;
                  return { x, y, p };
                });

                const profitPoints = trends.map((p, idx) => {
                  const x = idx * step;
                  const y = 200 - (Math.max(0, p.profitKd) / trendMaxVal) * 180;
                  return { x, y, p };
                });

                const salesPathD = salesPoints.reduce(
                  (acc, pt, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${pt.x},${pt.y}`,
                  '',
                );
                const salesAreaD = `${salesPathD} L ${salesPoints[salesPoints.length - 1].x},200 L 0,200 Z`;

                const profitPathD = profitPoints.reduce(
                  (acc, pt, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${pt.x},${pt.y}`,
                  '',
                );
                const profitAreaD = `${profitPathD} L ${profitPoints[profitPoints.length - 1].x},200 L 0,200 Z`;

                return (
                  <>
                    {/* Area Fills */}
                    <path d={salesAreaD} fill="url(#salesGradient)" />
                    <path d={profitAreaD} fill="url(#profitGradient)" />

                    {/* Line Strokes */}
                    <path
                      d={salesPathD}
                      fill="none"
                      stroke="#2563eb"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d={profitPathD}
                      fill="none"
                      stroke="#059669"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    {/* Interactive dots */}
                    {salesPoints.map((pt, idx) => (
                      <g
                        key={`s-${idx}`}
                        className="cursor-pointer"
                        onMouseEnter={() => setHoveredPoint(pt.p)}
                        onMouseLeave={() => setHoveredPoint(null)}
                      >
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r="4"
                          fill="#ffffff"
                          stroke="#2563eb"
                          strokeWidth="2.5"
                        />
                      </g>
                    ))}

                    {profitPoints.map((pt, idx) => (
                      <g
                        key={`p-${idx}`}
                        className="cursor-pointer"
                        onMouseEnter={() => setHoveredPoint(pt.p)}
                        onMouseLeave={() => setHoveredPoint(null)}
                      >
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r="4"
                          fill="#ffffff"
                          stroke="#059669"
                          strokeWidth="2.5"
                        />
                      </g>
                    ))}

                    {/* X-Axis labels */}
                    {trends.map((pt, idx) => {
                      const x = idx * step;
                      // Display every Nth label to avoid crowding
                      const showLabel =
                        count <= 10 ||
                        idx === 0 ||
                        idx === count - 1 ||
                        idx % Math.ceil(count / 7) === 0;

                      if (!showLabel) return null;

                      return (
                        <text
                          key={`lbl-${idx}`}
                          x={x}
                          y="218"
                          textAnchor={idx === 0 ? 'start' : idx === count - 1 ? 'end' : 'middle'}
                          fill="#64748b"
                          fontSize="10"
                          fontWeight="600"
                        >
                          {pt.label}
                        </text>
                      );
                    })}
                  </>
                );
              })()}
            </svg>
          )}
        </div>
      </div>

      {/* ───────────────────── 5. PENDING PAYMENTS & PROFIT & LOSS ───────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Pending Payments Section */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-xs border border-slate-200 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                  <AlertCircle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Pending Payments
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Highest outstanding customer accounts
                  </p>
                </div>
              </div>

              <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 font-bold text-xs border border-amber-200">
                {pendingPayments.length} Accounts Listed
              </span>
            </div>

            {/* List of Pending Customers */}
            <div className="divide-y divide-slate-100 mt-2">
              {pendingPayments.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  All customer accounts are fully settled.
                </div>
              ) : (
                pendingPayments.map((cust) => (
                  <div key={cust.id} className="py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{cust.name}</span>
                        {cust.nameAr && (
                          <span className="text-xs text-slate-500 font-arabic">
                            ({cust.nameAr})
                          </span>
                        )}
                        {cust.isOverdue && (
                          <span className="px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 font-bold text-[10px] border border-rose-200">
                            {cust.daysOverdue} Days Overdue
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                        <span className="font-bold text-amber-800">
                          Outstanding: KD {cust.outstandingKd.toFixed(3)}
                        </span>
                        {cust.latestInvoiceNumber && (
                          <span>• Inv: {cust.latestInvoiceNumber} ({cust.paymentStatus})</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <button
                        type="button"
                        onClick={() => navigate(`/payments?customerId=${cust.id}`)}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-black text-white font-bold text-xs rounded-lg transition-colors cursor-pointer shadow-xs"
                      >
                        Receive Payment
                      </button>

                      {cust.phone && (
                        <button
                          type="button"
                          onClick={() => openWhatsAppReminder(cust)}
                          className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
                          title="Send WhatsApp Reminder"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>WA</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end">
            <button
              type="button"
              onClick={() => navigate('/customers')}
              className="text-xs font-bold text-slate-900 hover:text-slate-700 flex items-center gap-1 group cursor-pointer"
            >
              <span>View All Pending Payments</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>

        {/* Profit & Loss Summary Section */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-xs border border-slate-200 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                  <DollarSign className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Profit & Loss Summary
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Official financial statement for current month
                  </p>
                </div>
              </div>

              <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-bold text-xs">
                This Month
              </span>
            </div>

            {summary && (
              <div className="space-y-3 pt-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 font-medium">Sales Revenue (Invoiced)</span>
                  <span className="font-mono font-bold text-slate-900">
                    KD {summary.thisMonthProfitLoss.salesRevenueKd.toFixed(3)}
                  </span>
                </div>

                <div className="flex justify-between items-center text-slate-600">
                  <span className="font-medium">Cost of Goods Sold (COGS)</span>
                  <span className="font-mono font-semibold text-slate-700">
                    − KD {summary.thisMonthProfitLoss.cogsKd.toFixed(3)}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2 px-3 bg-slate-50 rounded-lg text-xs">
                  <span className="font-bold text-slate-700 uppercase">Gross Profit</span>
                  <span className="font-mono font-bold text-slate-900">
                    KD {summary.thisMonthProfitLoss.grossProfitKd.toFixed(3)}
                  </span>
                </div>

                <div className="flex justify-between items-center text-slate-600">
                  <span className="font-medium">Operating & Admin Expenses</span>
                  <span className="font-mono font-semibold text-slate-700">
                    − KD {summary.thisMonthProfitLoss.expensesKd.toFixed(3)}
                  </span>
                </div>

                {/* Net Profit Highlight */}
                <div
                  className={`p-4 rounded-xl border flex justify-between items-center ${
                    summary.thisMonthProfitLoss.isProfit
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : 'bg-rose-50 border-rose-200 text-rose-900'
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider">
                      {summary.thisMonthProfitLoss.isProfit ? 'NET PROFIT' : 'NET LOSS'}
                    </div>
                    <div className="text-[11px] opacity-75 mt-0.5">
                      Net financial balance after all deductions
                    </div>
                  </div>
                  <div className="text-2xl font-black font-mono">
                    KD {Math.abs(summary.thisMonthProfitLoss.netProfitKd).toFixed(3)}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end">
            <button
              type="button"
              onClick={() => navigate('/reports')}
              className="text-xs font-bold text-slate-900 hover:text-slate-700 flex items-center gap-1 group cursor-pointer"
            >
              <span>View Full P&L Report</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* ───────────────────── 6. STOCK OVERVIEW & SALES VS EXPENSES ───────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Stock Overview Card */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-xs border border-slate-200 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                  <Boxes className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Stock Overview
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Live stock ledger inventory movements
                  </p>
                </div>
              </div>

              <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-bold text-xs border border-blue-200">
                Live Inventory
              </span>
            </div>

            {summary && (
              <div className="grid grid-cols-2 gap-3 pt-3">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Stock</div>
                  <div className="text-lg font-black text-slate-900 mt-1">
                    {summary.stockValuation.totalStockDozen} Doz {summary.stockValuation.remainderPcs} Pcs
                  </div>
                  <div className="text-xs text-slate-400 font-semibold mt-0.5">
                    {summary.stockValuation.totalStockPcs.toLocaleString()} Total Pieces
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Stock Valuation</div>
                  <div className="text-lg font-black text-slate-900 mt-1">
                    KD {summary.stockValuation.totalCostValuationKd.toFixed(3)}
                  </div>
                  <div className="text-xs text-slate-400 font-semibold mt-0.5">
                    At purchase cost
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Stock Out Today</div>
                  <div className="text-lg font-black text-violet-700 mt-1">
                    {summary.stockOutToday.dozen} Doz {summary.stockOutToday.pieces} Pcs
                  </div>
                  <div className="text-xs text-slate-400 font-semibold mt-0.5">
                    {summary.stockOutToday.totalPcs} Pieces sold today
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Stock Received Today</div>
                  <div className="text-lg font-black text-emerald-700 mt-1">
                    {summary.stockReceivedToday.dozen} Doz {summary.stockReceivedToday.pieces} Pcs
                  </div>
                  <div className="text-xs text-slate-400 font-semibold mt-0.5">
                    {summary.stockReceivedToday.totalPcs} Pieces received
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">
              Purchases This Month: <strong>KD {summary?.thisMonthPurchases.amountKd.toFixed(3) || '0.000'}</strong> ({summary?.thisMonthPurchases.totalPcs || 0} Pcs)
            </span>
            <button
              type="button"
              onClick={() => navigate('/stock')}
              className="font-bold text-slate-900 hover:text-slate-700 flex items-center gap-1 group cursor-pointer"
            >
              <span>View Stock Ledger</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>

        {/* Sales vs Expenses Card */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-xs border border-slate-200 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Sales vs Expenses
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Revenue retention and operational burn
                  </p>
                </div>
              </div>

              <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-bold text-xs">
                {trendPeriod === '7d' ? 'Last 7 Days' : trendPeriod === '30d' ? 'Last 30 Days' : trendPeriod === 'thisMonth' ? 'This Month' : 'This Year'}
              </span>
            </div>

            {/* Visual Comparison Bars */}
            <div className="space-y-4 pt-4">
              <div>
                <div className="flex justify-between items-center text-xs font-bold mb-1.5">
                  <span className="text-blue-700">Total Sales Revenue</span>
                  <span className="text-slate-900 font-mono">KD {totalPeriodSalesKd.toFixed(3)}</span>
                </div>
                <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all duration-500"
                    style={{
                      width: `${totalPeriodSalesKd > 0 ? 100 : 0}%`,
                    }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center text-xs font-bold mb-1.5">
                  <span className="text-purple-700">Total Operating Expenses</span>
                  <span className="text-slate-900 font-mono">KD {totalPeriodExpensesKd.toFixed(3)}</span>
                </div>
                <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-600 rounded-full transition-all duration-500"
                    style={{
                      width: `${totalPeriodSalesKd > 0 ? Math.min(100, (totalPeriodExpensesKd / totalPeriodSalesKd) * 100) : totalPeriodExpensesKd > 0 ? 100 : 0}%`,
                    }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center text-xs font-bold mb-1.5">
                  <span className="text-emerald-700">Net Business Profit</span>
                  <span className="text-slate-900 font-mono">KD {totalPeriodProfitKd.toFixed(3)}</span>
                </div>
                <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                    style={{
                      width: `${totalPeriodSalesKd > 0 ? Math.max(0, Math.min(100, (totalPeriodProfitKd / totalPeriodSalesKd) * 100)) : 0}%`,
                    }}
                  ></div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
                <span>Expense-to-Revenue Ratio:</span>
                <span className="font-bold text-slate-900 font-mono">
                  {totalPeriodSalesKd > 0 ? ((totalPeriodExpensesKd / totalPeriodSalesKd) * 100).toFixed(1) : '0.0'}%
                </span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end">
            <button
              type="button"
              onClick={() => navigate('/reports')}
              className="text-xs font-bold text-slate-900 hover:text-slate-700 flex items-center gap-1 group cursor-pointer"
            >
              <span>View Financial Reports</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* ───────────────────── 7. LOW STOCK & RECENT TRANSACTIONS ───────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Low Stock Items Card */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-xs border border-slate-200 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Low Stock Alerts
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Items reaching or below reorder threshold
                  </p>
                </div>
              </div>

              <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 font-bold text-xs border border-amber-200">
                {lowStock.length} Low Products
              </span>
            </div>

            <div className="divide-y divide-slate-100 mt-2">
              {lowStock.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  All inventory products have sufficient stock levels.
                </div>
              ) : (
                lowStock.map((prod) => (
                  <div key={prod.id} className="py-3 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-blue-700">
                          {prod.articleNumber}
                        </span>
                        <span className="font-bold text-slate-900 text-xs">{prod.nameEn}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Selling: KD {prod.sellingPriceKd.toFixed(3)} • Reorder at {prod.reorderLevelPcs} Pcs
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                        {prod.currentStockDozen} Doz {prod.currentStockRemainder} Pcs ({prod.currentStockPcs} Pcs)
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end">
            <button
              type="button"
              onClick={() => navigate('/stock')}
              className="text-xs font-bold text-slate-900 hover:text-slate-700 flex items-center gap-1 group cursor-pointer"
            >
              <span>View All Stock</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>

        {/* Recent Business Activity Feed */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-xs border border-slate-200 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-800 flex items-center justify-center font-bold">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Recent Business Activity
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Live operational feed across sales, receipts, purchases & expenses
                  </p>
                </div>
              </div>

              <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-bold text-xs">
                Latest 8 Records
              </span>
            </div>

            <div className="divide-y divide-slate-100 mt-2">
              {recentTransactions.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  No recent business transactions found.
                </div>
              ) : (
                recentTransactions.map((tx) => {
                  const typeBadgeClass =
                    tx.type === 'SALE'
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : tx.type === 'PAYMENT'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : tx.type === 'PURCHASE'
                      ? 'bg-sky-50 text-sky-700 border-sky-200'
                      : 'bg-purple-50 text-purple-700 border-purple-200';

                  return (
                    <div key={tx.id} className="py-2.5 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${typeBadgeClass} uppercase tracking-wider shrink-0`}>
                          {tx.type}
                        </span>
                        <div className="min-w-0">
                          <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5 truncate">
                            <span className="font-mono">{tx.reference}</span>
                            <span>• {tx.entityName}</span>
                          </div>
                          <div className="text-[11px] text-slate-400 truncate">
                            {tx.detail || tx.date}
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="font-mono font-bold text-slate-900 text-xs">
                          KD {tx.amountKd.toFixed(3)}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {tx.date}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Detailed technical history is kept in Audit Trail</span>
            <button
              type="button"
              onClick={() => navigate('/audit')}
              className="font-bold text-slate-900 hover:text-slate-700 flex items-center gap-1 group cursor-pointer"
            >
              <span>Audit Trail Module</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
