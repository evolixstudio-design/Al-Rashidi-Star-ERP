import React, { useEffect, useState, useCallback } from 'react';
import api from '../services/api';
import {
  History,
  ShieldCheck,
  Search,
  User,
  CheckCircle2,
  RefreshCw,
  Download,
  Printer,
  DollarSign,
  Ban,
  Eye,
  X,
} from 'lucide-react';

interface AuditItem {
  id: number;
  entityType: string;
  entityId?: string | null;
  action: string;
  performedBy: string;
  performedAt: string;
  details?: any;
}

export const AuditPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedModule, setSelectedModule] = useState('ALL');
  const [selectedAction, setSelectedAction] = useState('ALL');
  const [selectedOwner, setSelectedOwner] = useState('ALL');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [activePreset, setActivePreset] = useState<'today' | 'thisWeek' | 'thisMonth' | 'all'>('all');
  const [selectedLog, setSelectedLog] = useState<AuditItem | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const params: any = { limit: 100 };
      if (search.trim()) params.search = search.trim();
      if (selectedModule !== 'ALL') params.module = selectedModule;
      if (selectedAction !== 'ALL') params.action = selectedAction;
      if (selectedOwner !== 'ALL') params.performedBy = selectedOwner;
      if (fromDate) params.from = fromDate;
      if (toDate) params.to = toDate;

      const res = await api.get('/audit', { params });
      if (res.data?.items) {
        setLogs(res.data.items);
        setTotal(res.data.total || res.data.items.length);
      } else if (Array.isArray(res.data)) {
        setLogs(res.data);
        setTotal(res.data.length);
      }
    } catch (err) {
      console.error('Failed to load audit logs', err);
    } finally {
      setLoading(false);
    }
  }, [search, selectedModule, selectedAction, selectedOwner, fromDate, toDate]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchLogs();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchLogs]);

  const applyPreset = (preset: 'today' | 'thisWeek' | 'thisMonth' | 'all') => {
    setActivePreset(preset);
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

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
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      setFromDate(`${year}-${month}-01`);
      setToDate(todayStr);
    } else if (preset === 'all') {
      setFromDate('');
      setToDate('');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const exportAuditCsv = () => {
    const headers = ['Timestamp', 'Owner', 'Module', 'Action', 'Entity ID', 'Reference / Details'];
    const rows = logs.map((l) => [
      new Date(l.performedAt).toLocaleString(),
      l.performedBy,
      l.entityType,
      l.action,
      l.entityId || '',
      typeof l.details === 'object' ? JSON.stringify(l.details) : String(l.details || ''),
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Audit_Trail_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getActionBadge = (action: string) => {
    const act = action.toUpperCase();
    if (act.includes('CANCEL')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
          <Ban className="w-3 h-3 text-rose-600" />
          {action}
        </span>
      );
    }
    if (act.includes('CREATE') || act.includes('RECEIVE') || act.includes('POST')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          {action}
        </span>
      );
    }
    if (act.includes('PAYMENT')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-50 text-sky-700 border border-sky-200">
          <DollarSign className="w-3 h-3 text-sky-600" />
          {action}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200">
        <ShieldCheck className="w-3 h-3 text-slate-600" />
        {action}
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Transaction Audit Trail
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-900 text-white shadow-2xs">
              Immutable
            </span>
          </div>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Tamper-proof chronological log of business transactions and owner actions
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchLogs}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-800 text-sm font-semibold rounded-lg border border-slate-300 shadow-2xs transition-all active:scale-95 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 text-slate-600 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={exportAuditCsv}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-800 text-sm font-semibold rounded-lg border border-slate-300 shadow-2xs transition-all active:scale-95 cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-lg shadow-sm transition-all active:scale-95 cursor-pointer"
          >
            <Printer className="w-4 h-4 text-sky-400" />
            <span>Print Audit Log</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search box */}
          <div className="relative flex-1 min-w-[260px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by invoice (INV-*), receipt (RCP-*), expense (EXP-*), customer, or owner..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 focus:border-slate-400 rounded-lg outline-none transition-colors placeholder:text-slate-400"
            />
          </div>

          {/* Module Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase">Module:</span>
            <select
              value={selectedModule}
              onChange={(e) => setSelectedModule(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold rounded-lg px-3 py-2 outline-none cursor-pointer"
            >
              <option value="ALL">All Modules</option>
              <option value="SALES_INVOICE">Sales / Invoices</option>
              <option value="PURCHASE">Purchases / Shipments</option>
              <option value="PAYMENT">Customer Payments</option>
              <option value="EXPENSE">Expenses</option>
              <option value="STOCK">Inventory & Stock</option>
              <option value="CUSTOMER">Customers</option>
              <option value="SUPPLIER">Suppliers</option>
              <option value="AUTH">Authentication</option>
              <option value="SETTINGS">Company Settings</option>
              <option value="BACKUP">Database Backup</option>
            </select>
          </div>

          {/* Action Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase">Action:</span>
            <select
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold rounded-lg px-3 py-2 outline-none cursor-pointer"
            >
              <option value="ALL">All Actions</option>
              <option value="CREATE">CREATE / POST</option>
              <option value="CANCEL">CANCEL / VOID</option>
              <option value="UPDATE">UPDATE / EDIT</option>
              <option value="LOGIN">LOGIN</option>
              <option value="LOGOUT">LOGOUT</option>
            </select>
          </div>

          {/* Owner Filter (Strictly 2 owners: Yusuf ali jath wala and Aliasgar jath wala) */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase">Owner:</span>
            <select
              value={selectedOwner}
              onChange={(e) => setSelectedOwner(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold rounded-lg px-3 py-2 outline-none cursor-pointer"
            >
              <option value="ALL">All Owners</option>
              <option value="Yusuf ali jath wala">Yusuf ali jath wala</option>
              <option value="Aliasgar jath wala">Aliasgar jath wala</option>
            </select>
          </div>
        </div>

        {/* Date Filters Row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
              <span>From:</span>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => {
                  setFromDate(e.target.value);
                  setActivePreset('all');
                }}
                className="bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-lg px-2.5 py-1.5 outline-none"
              />
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
              <span>To:</span>
              <input
                type="date"
                value={toDate}
                onChange={(e) => {
                  setToDate(e.target.value);
                  setActivePreset('all');
                }}
                className="bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-lg px-2.5 py-1.5 outline-none"
              />
            </div>
          </div>

          {/* Quick Presets */}
          <div className="flex items-center gap-1.5">
            {(
              [
                { id: 'today', label: 'Today' },
                { id: 'thisWeek', label: 'This Week' },
                { id: 'thisMonth', label: 'This Month' },
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

      {/* Audit Log Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 py-3 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-600">
          <span>{total} Verified Audit Records</span>
          <span className="text-emerald-700 font-semibold flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            Append-Only Secure Log
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase tracking-wider">
                <th className="px-4 py-3.5">Date & Time</th>
                <th className="px-4 py-3.5">Owner</th>
                <th className="px-4 py-3.5">Module</th>
                <th className="px-4 py-3.5">Action</th>
                <th className="px-4 py-3.5">Reference #</th>
                <th className="px-4 py-3.5">Details / Summary</th>
                <th className="px-4 py-3.5 text-center">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-400 font-medium">
                    Loading audit trail...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-400 font-medium">
                    <History className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    No audit records match your search criteria.
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const date = new Date(log.performedAt);
                  const dateStr = date.toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  });
                  const timeStr = date.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true,
                  });

                  const ref =
                    log.details?.invoiceNumber ||
                    log.details?.reference ||
                    log.details?.expenseNumber ||
                    log.details?.receiptNumber ||
                    log.details?.purchaseNumber ||
                    log.details?.articleNumber ||
                    (log.entityId ? `#${log.entityId}` : '—');

                  return (
                    <tr
                      key={log.id}
                      className="hover:bg-slate-50/70 transition-colors text-slate-800"
                    >
                      {/* Timestamp */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="font-mono text-xs font-bold text-slate-900">{dateStr}</div>
                        <div className="font-mono text-[11px] text-slate-400">{timeStr}</div>
                      </td>

                      {/* Owner */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                          <User className="w-3.5 h-3.5 text-slate-500" />
                          {log.performedBy || 'System Owner'}
                        </span>
                      </td>

                      {/* Module */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="text-xs font-bold text-slate-700">
                          {log.entityType}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        {getActionBadge(log.action)}
                      </td>

                      {/* Reference */}
                      <td className="px-4 py-3.5 font-mono text-xs font-bold text-slate-900 whitespace-nowrap">
                        {ref}
                      </td>

                      {/* Summary */}
                      <td className="px-4 py-3.5 text-xs text-slate-600 max-w-sm truncate">
                        {log.details ? (
                          <span>
                            {log.details.customerName && `Customer: ${log.details.customerName} • `}
                            {log.details.totalAmountKd !== undefined && `KD ${Number(log.details.totalAmountKd).toFixed(3)} • `}
                            {log.details.amountKd !== undefined && `KD ${Number(log.details.amountKd).toFixed(3)} • `}
                            {log.details.reason && `Reason: ${log.details.reason} • `}
                            {log.details.paymentStatus && `Status: ${log.details.paymentStatus}`}
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>

                      {/* Inspect Drawer Action */}
                      <td className="px-4 py-3.5 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setSelectedLog(log)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-500" />
                          <span>Inspect</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspect Audit Record Modal / Drawer */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 flex flex-col max-h-[85vh]">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-white">Audit Event Detail</h3>
                <p className="text-xs text-slate-400 font-mono">Event ID #{selectedLog.id}</p>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-100">
                <div>
                  <div className="text-xs text-slate-400 font-medium">Timestamp</div>
                  <div className="font-bold text-slate-900 text-sm mt-0.5 font-mono">
                    {new Date(selectedLog.performedAt).toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-medium">Recorded Owner</div>
                  <div className="font-bold text-slate-900 text-sm mt-0.5">
                    {selectedLog.performedBy}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-100">
                <div>
                  <div className="text-xs text-slate-400 font-medium">Module / Domain</div>
                  <div className="font-bold text-slate-900 text-sm mt-0.5">
                    {selectedLog.entityType}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-medium">Action Performed</div>
                  <div className="mt-1">{getActionBadge(selectedLog.action)}</div>
                </div>
              </div>

              {selectedLog.entityId && (
                <div>
                  <div className="text-xs text-slate-400 font-medium">Internal Record ID</div>
                  <div className="font-mono font-bold text-slate-900 mt-0.5">
                    {selectedLog.entityId}
                  </div>
                </div>
              )}

              {/* Detailed payload state */}
              <div>
                <div className="text-xs text-slate-400 font-medium mb-1.5">
                  Event State & Payload Data
                </div>
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 font-mono text-xs text-slate-800 space-y-1.5 overflow-x-auto">
                  {selectedLog.details && typeof selectedLog.details === 'object' ? (
                    Object.entries(selectedLog.details).map(([k, v]) => (
                      <div key={k} className="flex gap-2">
                        <span className="text-slate-400 font-sans font-semibold min-w-[130px]">
                          {k}:
                        </span>
                        <span className="text-slate-900 font-bold break-all">
                          {typeof v === 'object' ? JSON.stringify(v) : String(v)}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div>{String(selectedLog.details || 'No additional payload')}</div>
                  )}
                </div>
              </div>
            </div>

            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Non-Deletable ERP Record</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditPage;
