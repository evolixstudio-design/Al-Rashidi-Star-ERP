import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import {
  X,
  History,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  User,
  DollarSign,
  Ban,
  MessageCircle,
} from 'lucide-react';

export interface AuditRecord {
  id: number;
  entityType: string;
  entityId?: string | null;
  action: string;
  performedBy: string;
  performedAt: string;
  details?: any;
}

interface TransactionAuditModalProps {
  reference?: string;
  entityType?: string;
  entityId?: string;
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

export const TransactionAuditModal: React.FC<TransactionAuditModalProps> = ({
  reference,
  entityType,
  entityId,
  isOpen,
  onClose,
  title,
}) => {
  const [logs, setLogs] = useState<AuditRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    const fetchHistory = async () => {
      try {
        setLoading(true);
        setError('');
        let res;
        if (reference) {
          res = await api.get(`/audit/by-reference/${encodeURIComponent(reference.trim())}`);
        } else if (entityType && entityId) {
          res = await api.get(`/audit/by-entity/${entityType}/${entityId}`);
        } else {
          setLogs([]);
          setLoading(false);
          return;
        }

        if (Array.isArray(res.data)) {
          setLogs(res.data);
        } else if (res.data?.items) {
          setLogs(res.data.items);
        } else {
          setLogs([]);
        }
      } catch (err: any) {
        console.error('Failed to load transaction audit trail', err);
        setError(err.response?.data?.message || 'Failed to load transaction history');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [isOpen, reference, entityType, entityId]);

  if (!isOpen) return null;

  const getActionBadge = (action: string) => {
    const act = action.toUpperCase();
    if (act.includes('CANCEL')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
          <Ban className="w-3 h-3 text-rose-600" />
          {action}
        </span>
      );
    }
    if (act.includes('CREATE') || act.includes('RECEIVE') || act.includes('POST')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          {action}
        </span>
      );
    }
    if (act.includes('PAYMENT')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-100 text-sky-800 border border-sky-200">
          <DollarSign className="w-3 h-3 text-sky-600" />
          {action}
        </span>
      );
    }
    if (act.includes('WHATSAPP')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
          <MessageCircle className="w-3 h-3 text-emerald-600" />
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
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                {title || 'Transaction History & Audit Trail'}
              </h3>
              {reference && (
                <p className="text-xs text-sky-400 font-mono mt-0.5">Reference: {reference}</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {loading ? (
            <div className="py-12 text-center text-slate-400 font-medium">
              <Clock className="w-8 h-8 mx-auto text-slate-300 animate-spin mb-2" />
              Loading audit timeline...
            </div>
          ) : error ? (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          ) : logs.length === 0 ? (
            <div className="py-12 text-center text-slate-400 font-medium">
              <ShieldCheck className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              No audit logs recorded for this transaction reference.
            </div>
          ) : (
            <div className="relative pl-6 border-l-2 border-slate-200 space-y-6">
              {logs.map((log, idx) => {
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

                return (
                  <div key={log.id || idx} className="relative group">
                    {/* Node Dot */}
                    <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-white border-4 border-slate-900 shadow-xs" />

                    {/* Event Card */}
                    <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-4 shadow-2xs hover:bg-slate-50/80 transition-colors">
                      {/* Top Bar: Action & Timestamp */}
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          {getActionBadge(log.action)}
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                            {log.entityType}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>
                            {dateStr} • {timeStr}
                          </span>
                        </div>
                      </div>

                      {/* Performed By Owner */}
                      <div className="flex items-center gap-1.5 text-xs text-slate-700 font-semibold mb-2">
                        <User className="w-3.5 h-3.5 text-slate-500" />
                        <span>Owner / Performed By:</span>
                        <span className="text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                          {log.performedBy || 'System Owner'}
                        </span>
                      </div>

                      {/* Details & State Changes */}
                      {log.details && (
                        <div className="bg-white rounded-lg p-3 border border-slate-200/70 text-xs text-slate-700 font-mono overflow-x-auto space-y-1">
                          {typeof log.details === 'object' ? (
                            Object.entries(log.details).map(([key, val]) => {
                              if (val === null || val === undefined) return null;
                              return (
                                <div key={key} className="flex gap-2">
                                  <span className="text-slate-400 font-sans font-semibold min-w-[120px]">
                                    {key}:
                                  </span>
                                  <span className="text-slate-900 font-bold break-all">
                                    {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                                  </span>
                                </div>
                              );
                            })
                          ) : (
                            <div>{String(log.details)}</div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-1 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Immutable ERP Audit Trail • Non-modifiable</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold transition-all cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
export default TransactionAuditModal;
