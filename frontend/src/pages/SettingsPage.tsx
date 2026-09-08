import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTranslations } from '../hooks/useTranslations';
import { LanguageSwitcher } from '../components/common/LanguageSwitcher';
import {
  Building,
  ShieldCheck,
  Save,
  RefreshCw,
  CheckCircle2,
  Globe,
  Database,
  Download,
  Upload,
  Terminal,
  AlertTriangle,
  FileCode,
  MessageCircle,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslations();
  
  // Backup access restricted strictly to Evolixstudio@gmail.com / ADMIN
  const isAdmin = (user?.username || '').toLowerCase() === 'evolixstudio@gmail.com' || user?.role === 'ADMIN';

  const [activeTab, setActiveTab] = useState<'company' | 'audit' | 'backup'>('company');
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // If a non-admin tries to view backup tab, reset to company
  useEffect(() => {
    if (!isAdmin && activeTab === 'backup') {
      setActiveTab('company');
    }
  }, [isAdmin, activeTab]);

  // Backup state
  const [backups, setBackups] = useState<any[]>([]);
  const [backupLoading, setBackupLoading] = useState(false);
  const [backupMessage, setBackupMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [disasterGuide, setDisasterGuide] = useState<any>(null);

  // Company state
  const [company, setCompany] = useState({
    nameEn: '',
    nameAr: '',
    address: '',
    phone: '',
    invoiceTermsEn: '',
    invoiceTermsAr: '',
  });

  // Audit state
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [auditTotal, setAuditTotal] = useState(0);



  const fetchCompany = async () => {
    try {
      const res = await api.get('/settings/company');
      if (res.data) {
        setCompany({
          nameEn: res.data.nameEn || '',
          nameAr: res.data.nameAr || '',
          address: res.data.address || '',
          phone: res.data.phone || '',
          invoiceTermsEn: res.data.invoiceTermsEn || '',
          invoiceTermsAr: res.data.invoiceTermsAr || '',
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAudit = async () => {
    try {
      const res = await api.get('/audit?limit=50');
      if (res.data) {
        setAuditLogs(res.data.items || []);
        setAuditTotal(res.data.total || 0);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchBackups = async () => {
    try {
      setBackupLoading(true);
      const [listRes, guideRes] = await Promise.all([
        api.get('/backup/list'),
        api.get('/backup/disaster-recovery-guide'),
      ]);
      setBackups(listRes.data || []);
      setDisasterGuide(guideRes.data || null);
    } catch (err) {
      console.error('Failed to load backups', err);
    } finally {
      setBackupLoading(false);
    }
  };

  const handleCreatePgDump = async () => {
    try {
      setBackupLoading(true);
      setBackupMessage(null);
      const res = await api.post('/backup/create-dump');
      setBackupMessage({ text: res.data.message || 'PostgreSQL backup created.', type: 'success' });
      fetchBackups();
    } catch (err: any) {
      setBackupMessage({ text: err.response?.data?.message || 'Failed to create PostgreSQL dump.', type: 'error' });
    } finally {
      setBackupLoading(false);
    }
  };

  const handleExportJson = async () => {
    try {
      setBackupLoading(true);
      setBackupMessage(null);
      const res = await api.get('/backup/export-json');
      const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rashidi_snapshot_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setBackupMessage({ text: 'JSON snapshot downloaded successfully.', type: 'success' });
      fetchBackups();
    } catch (err: any) {
      setBackupMessage({ text: 'Failed to export JSON snapshot.', type: 'error' });
    } finally {
      setBackupLoading(false);
    }
  };

  const handleRestoreJsonFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!window.confirm(`Are you sure you want to restore from "${file.name}"?\n\nExisting database records will be preserved or merged.`)) {
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        setBackupLoading(true);
        setBackupMessage(null);
        const parsed = JSON.parse(event.target?.result as string);
        const res = await api.post('/backup/restore-json', parsed);
        setBackupMessage({ text: res.data.message || 'Database restored successfully.', type: 'success' });
        fetchBackups();
        fetchAudit();
      } catch (err: any) {
        setBackupMessage({ text: err.response?.data?.message || 'Failed to restore database from file.', type: 'error' });
      } finally {
        setBackupLoading(false);
        e.target.value = '';
      }
    };
    reader.readAsText(file);
  };

  useEffect(() => {
    fetchCompany();
    fetchAudit();
    fetchBackups();
  }, []);

  const handleSaveCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSaveSuccess(false);
    try {
      await api.put('/settings/company', company);
      setSaveSuccess(true);
      fetchAudit(); // refresh audit trail
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-5 antialiased text-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
            {t.settings.title}
          </h1>
          <p className="text-xs text-slate-600">
            {t.settings.subtitle}
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center bg-slate-200 p-1 rounded-lg border border-slate-300 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('company')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold text-xs transition-all ${
              activeTab === 'company'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            <Building className="w-4 h-4" />
            <span>{t.settings.companyProfile}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('audit');
              fetchAudit();
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold text-xs transition-all ${
              activeTab === 'audit'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{t.settings.auditTrail} ({auditTotal})</span>
          </button>
          {isAdmin && (
            <button
              type="button"
              onClick={() => {
                setActiveTab('backup');
                fetchBackups();
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold text-xs transition-all ${
                activeTab === 'backup'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              <Database className="w-4 h-4" />
              <span>Backup & Recovery</span>
            </button>
          )}
        </div>
      </div>

      {saveSuccess && (
        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{t.settings.saveSuccess}</span>
        </div>
      )}

      {/* Tab 1: Company Profile Form */}
      {activeTab === 'company' && (
        <div className="space-y-4">
          {/* Language Preference Card */}
          <div className="bg-white rounded-xl p-4 sm:p-5 shadow-xs border border-slate-300">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-sky-100 text-sky-800 border border-sky-200 flex items-center justify-center flex-shrink-0">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {t.settings.language}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {t.settings.languageDesc}
                  </p>
                </div>
              </div>
              <div>
                <LanguageSwitcher variant="light" />
              </div>
            </div>
          </div>

          <form onSubmit={handleSaveCompany} className="bg-white rounded-xl p-4 sm:p-5 shadow-xs border border-slate-300 space-y-4">
            <div className="border-b border-slate-200 pb-3">
              <h2 className="text-sm font-bold text-slate-900">
                {t.settings.companyBasicInfo}
              </h2>
              <p className="text-xs text-slate-500">
                {t.settings.companyBasicInfoDesc}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  {t.settings.companyNameEn}
                </label>
                <input
                  type="text"
                  value={company.nameEn}
                  onChange={(e) => setCompany({ ...company, nameEn: e.target.value })}
                  placeholder="e.g. Rashidi Traders W.L.L."
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm focus:border-sky-600 focus:ring-2 focus:ring-sky-100 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  {t.settings.companyNameAr}
                </label>
                <input
                  type="text"
                  value={company.nameAr}
                  onChange={(e) => setCompany({ ...company, nameAr: e.target.value })}
                  placeholder="شركة الرشيدي للتجارة ذ.م.م"
                  dir="rtl"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm focus:border-sky-600 focus:ring-2 focus:ring-sky-100 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  {t.settings.phone}
                </label>
                <input
                  type="text"
                  value={company.phone}
                  onChange={(e) => setCompany({ ...company, phone: e.target.value })}
                  placeholder="+965 9988 7766"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm focus:border-sky-600 focus:ring-2 focus:ring-sky-100 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  {t.settings.address}
                </label>
                <input
                  type="text"
                  value={company.address}
                  onChange={(e) => setCompany({ ...company, address: e.target.value })}
                  placeholder="Shuwaikh Industrial Area, Kuwait"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm focus:border-sky-600 focus:ring-2 focus:ring-sky-100 transition-colors"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  {t.settings.invoiceTermsEn}
                </label>
                <textarea
                  rows={2}
                  value={company.invoiceTermsEn}
                  onChange={(e) => setCompany({ ...company, invoiceTermsEn: e.target.value })}
                  placeholder="Goods once sold are subject to store return policies."
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm focus:border-sky-600 focus:ring-2 focus:ring-sky-100 transition-colors"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  {t.settings.invoiceTermsAr}
                </label>
                <textarea
                  rows={2}
                  value={company.invoiceTermsAr}
                  onChange={(e) => setCompany({ ...company, invoiceTermsAr: e.target.value })}
                  placeholder="البضاعة المباعة تخضع لشروط الإرجاع المعتمدة."
                  dir="rtl"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm focus:border-sky-600 focus:ring-2 focus:ring-sky-100 transition-colors"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs rounded-lg shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{loading ? t.settings.saving : t.common.save}</span>
              </button>
            </div>
          </form>

          {/* WhatsApp Direct Integration Status */}
          <div className="bg-white rounded-xl p-4 sm:p-5 shadow-xs border border-slate-300">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    WhatsApp Direct Integration (wa.me / WhatsApp Web)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Direct plain-text messaging for Payment Receipts and Reminders. Opens wa.me / WhatsApp Web pre-filled.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Active &amp; Ready
                </span>
              </div>
            </div>
            <div className="mt-3 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex items-center gap-2">
              <span className="font-semibold text-slate-700">Simple Flow:</span>
              <span>Normalized Kuwait phone numbers (+965), clean plain text, zero API setup required.</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Audit Trail Log */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-xl shadow-xs border border-slate-300 overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                {t.settings.auditHistory}
              </h2>
              <p className="text-xs text-slate-500">
                {t.settings.auditHistoryDesc}
              </p>
            </div>
            <button
              type="button"
              onClick={fetchAudit}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg border border-slate-300 text-xs font-semibold transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{t.settings.refresh}</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-800 border-b border-slate-300 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-2.5 px-3">{t.settings.timestamp}</th>
                  <th className="py-2.5 px-3">{t.settings.action}</th>
                  <th className="py-2.5 px-3">{t.settings.performedBy}</th>
                  <th className="py-2.5 px-3">{t.settings.module}</th>
                  <th className="py-2.5 px-3">{t.settings.details}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-800 font-medium">
                {auditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-500">
                      {t.settings.noAuditEvents}
                    </td>
                  </tr>
                ) : (
                  auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-sky-50/50 transition-colors">
                      <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                        {new Date(log.performedAt).toLocaleString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold border ${
                          log.action === 'CREATE'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : log.action === 'UPDATE'
                            ? 'bg-amber-50 text-amber-900 border-amber-300'
                            : log.action === 'DELETE'
                            ? 'bg-rose-50 text-rose-800 border-rose-300'
                            : 'bg-sky-50 text-sky-800 border-sky-300'
                        }`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900 whitespace-nowrap">
                        {log.performedBy}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-700 whitespace-nowrap">
                        {log.entityType} {log.entityId ? `#${log.entityId}` : ''}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600 max-w-xs truncate" title={JSON.stringify(log.details)}>
                        {log.details ? JSON.stringify(log.details) : '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Database Backup & Disaster Recovery - Strictly Restricted to Evolixstudio@gmail.com / ADMIN */}
      {isAdmin && activeTab === 'backup' && (
        <div className="space-y-5">
          {/* Status & Quick Actions Card */}
          <div className="bg-white rounded-xl p-5 shadow-xs border border-slate-300">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-800 border border-indigo-200 flex items-center justify-center shrink-0">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    PostgreSQL Production Database & Disaster Recovery
                  </h2>
                  <p className="text-xs text-slate-500">
                    Host: 127.0.0.1:5432 | Database: <strong className="text-slate-800">rashidi_erp</strong> | Engine: PostgreSQL
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled={backupLoading}
                  onClick={handleCreatePgDump}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-60"
                >
                  <Download className="w-4 h-4" />
                  <span>{backupLoading ? 'Creating...' : 'Create PostgreSQL Backup'}</span>
                </button>

                <button
                  type="button"
                  disabled={backupLoading}
                  onClick={handleExportJson}
                  className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-lg border border-slate-300 transition-colors cursor-pointer disabled:opacity-60"
                >
                  <FileCode className="w-4 h-4" />
                  <span>Export JSON Snapshot</span>
                </button>

                <label className="inline-flex items-center gap-2 px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-xs rounded-lg border border-amber-300 transition-colors cursor-pointer">
                  <Upload className="w-4 h-4" />
                  <span>Restore from File</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleRestoreJsonFile}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Notification message */}
            {backupMessage && (
              <div
                className={`mt-4 p-3 rounded-lg text-xs font-semibold flex items-center gap-2 ${
                  backupMessage.type === 'success'
                    ? 'bg-emerald-50 border border-emerald-300 text-emerald-800'
                    : 'bg-rose-50 border border-rose-300 text-rose-800'
                }`}
              >
                {backupMessage.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span>{backupMessage.text}</span>
              </div>
            )}
          </div>

          {/* Backup History Table */}
          <div className="bg-white rounded-xl shadow-xs border border-slate-300 overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">
                Generated Backups ({backups.length})
              </h3>
              <button
                type="button"
                onClick={fetchBackups}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh</span>
              </button>
            </div>

            {backups.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs">
                No backup files generated yet. Click &quot;Create PostgreSQL Backup&quot; above to generate your first backup.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                      <th className="py-2.5 px-4">File Name</th>
                      <th className="py-2.5 px-4">Format</th>
                      <th className="py-2.5 px-4">File Size</th>
                      <th className="py-2.5 px-4">Date & Time</th>
                      <th className="py-2.5 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {backups.map((b) => (
                      <tr key={b.fileName} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2.5 px-4 font-mono font-bold text-slate-800">
                          {b.fileName}
                        </td>
                        <td className="py-2.5 px-4">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                              b.type === 'SQL_PG_DUMP'
                                ? 'bg-indigo-50 text-indigo-800 border border-indigo-200'
                                : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            }`}
                          >
                            {b.type === 'SQL_PG_DUMP' ? 'PostgreSQL SQL' : 'JSON Snapshot'}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-slate-600 font-medium">
                          {b.sizeFormatted}
                        </td>
                        <td className="py-2.5 px-4 text-slate-600">
                          {new Date(b.createdAt).toLocaleString('en-GB')}
                        </td>
                        <td className="py-2.5 px-4 text-right">
                          <a
                            href={`http://127.0.0.1:3000/api/backup/download/${encodeURIComponent(b.fileName)}`}
                            download={b.fileName}
                            className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded text-xs transition-colors"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Download</span>
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* CLI Disaster Recovery Guide Card */}
          {disasterGuide && (
            <div className="bg-slate-900 text-slate-200 rounded-xl p-5 shadow-md border border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider">
                <Terminal className="w-4 h-4" />
                <span>Production CLI Disaster Recovery Commands (pg_dump / pg_restore)</span>
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div>
                  <div className="text-slate-400 text-[11px] font-sans font-semibold mb-1">
                    1. Native PostgreSQL Compressed Dump:
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded border border-slate-800 select-all overflow-x-auto text-emerald-400">
                    {disasterGuide.commands?.manualBackup}
                  </div>
                </div>

                <div>
                  <div className="text-slate-400 text-[11px] font-sans font-semibold mb-1">
                    2. Native PostgreSQL Full Restore:
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded border border-slate-800 select-all overflow-x-auto text-amber-400">
                    {disasterGuide.commands?.manualRestore}
                  </div>
                </div>

                <div>
                  <div className="text-slate-400 text-[11px] font-sans font-semibold mb-1">
                    3. Plain SQL Backup & Restore:
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded border border-slate-800 select-all overflow-x-auto text-sky-400">
                    {disasterGuide.commands?.plainSqlBackup}
                    <br />
                    {disasterGuide.commands?.plainSqlRestore}
                  </div>
                </div>

                <div className="pt-2 text-[11px] font-sans text-slate-400">
                  <strong className="text-slate-300">Automated Daily Backup Recommendation:</strong>{' '}
                  {disasterGuide.scheduledStrategy}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
