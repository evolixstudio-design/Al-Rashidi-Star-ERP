import React, { useEffect, useState, useCallback } from 'react';
import { useTranslations } from '../hooks/useTranslations';
import api from '../services/api';
import {
  Truck,
  Plus,
  Search,
  Pencil,
  Phone,
  MessageCircle,
  Package,
  Globe,
  AlertCircle,
  CheckCircle2,
  X,
  Building,
  RefreshCw,
  Upload,
} from 'lucide-react';
import { CsvImportModal } from '../components/common/CsvImportModal';

/* ───────────────────── Interfaces ───────────────────── */

interface SupplierItem {
  id: number;
  name: string;
  contactPerson?: string;
  phone?: string;
  country: string;
  address?: string;
  totalPayable: number;
  isActive: boolean;
  shipmentCount: number;
  createdAt: string;
}

interface PurchaseReceiptItem {
  id: number;
  receiptNumber: string;
  shipmentContainerNo?: string;
  supplierInvoiceRef?: string;
  receiptDate: string;
  totalPcs: number;
  totalAmountKd: number;
  status: string;
  totalPcsBreakdown?: {
    dozen: number;
    pieces: number;
    totalPcs: number;
    display: string;
  };
}

export const SuppliersPage: React.FC = () => {
  const { t, lang } = useTranslations();

  /* ── State ── */
  const [suppliers, setSuppliers] = useState<SupplierItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState('');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editSupplier, setEditSupplier] = useState<SupplierItem | null>(null);
  const [historySupplier, setHistorySupplier] = useState<SupplierItem | null>(null);
  const [supplierHistory, setSupplierHistory] = useState<PurchaseReceiptItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('China');
  const [address, setAddress] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  /* ── Fetch suppliers ── */
  const fetchSuppliers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/suppliers');
      setSuppliers(res.data);
    } catch (err) {
      console.error('Failed to load suppliers', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  const showSuccessToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 4000);
  };

  /* ── Reset form ── */
  const resetForm = () => {
    setName('');
    setContactPerson('');
    setPhone('');
    setCountry('China');
    setAddress('');
    setIsActive(true);
    setFormError('');
  };

  /* ── Open Add Modal ── */
  const handleOpenAdd = () => {
    resetForm();
    setShowAddModal(true);
  };

  /* ── Open Edit Modal ── */
  const handleOpenEdit = (sup: SupplierItem) => {
    setName(sup.name);
    setContactPerson(sup.contactPerson || '');
    setPhone(sup.phone || '');
    setCountry(sup.country || 'China');
    setAddress(sup.address || '');
    setIsActive(sup.isActive);
    setFormError('');
    setEditSupplier(sup);
  };

  /* ── Save (Create / Update) ── */
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError(t.common.required + ' (Supplier Name)');
      return;
    }

    try {
      setSaving(true);
      setFormError('');

      if (editSupplier) {
        await api.put(`/suppliers/${editSupplier.id}`, {
          name: name.trim(),
          contactPerson: contactPerson.trim() || undefined,
          phone: phone.trim() || undefined,
          country: country.trim() || 'China',
          address: address.trim() || undefined,
          isActive,
        });
        showSuccessToast(t.suppliers.supplierUpdated);
        setEditSupplier(null);
      } else {
        await api.post('/suppliers', {
          name: name.trim(),
          contactPerson: contactPerson.trim() || undefined,
          phone: phone.trim() || undefined,
          country: country.trim() || 'China',
          address: address.trim() || undefined,
        });
        showSuccessToast(t.suppliers.supplierCreated);
        setShowAddModal(false);
      }

      resetForm();
      fetchSuppliers();
    } catch (err: any) {
      console.error('Failed to save supplier', err);
      setFormError(err.response?.data?.message || t.common.error);
    } finally {
      setSaving(false);
    }
  };

  /* ── Open History Modal ── */
  const handleOpenHistory = async (sup: SupplierItem) => {
    setHistorySupplier(sup);
    setHistoryLoading(true);
    try {
      const res = await api.get(`/suppliers/${sup.id}`);
      setSupplierHistory(res.data.purchases || []);
    } catch (err) {
      console.error('Failed to load supplier history', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  /* ── Filtered suppliers ── */
  const filteredSuppliers = suppliers.filter((s) => {
    if (!search.trim()) return true;
    const term = search.toLowerCase().trim();
    return (
      s.name.toLowerCase().includes(term) ||
      (s.contactPerson && s.contactPerson.toLowerCase().includes(term)) ||
      (s.phone && s.phone.toLowerCase().includes(term)) ||
      s.country.toLowerCase().includes(term)
    );
  });

  // Summary totals
  const totalPayableAll = suppliers.reduce((sum, s) => sum + Number(s.totalPayable || 0), 0);
  const totalShipmentsAll = suppliers.reduce((sum, s) => sum + Number(s.shipmentCount || 0), 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-18 right-6 z-50 bg-emerald-600 text-white px-5 py-3.5 rounded-xl shadow-xl flex items-center gap-3 animate-fade-in text-base font-semibold">
          <CheckCircle2 className="w-6 h-6 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                {t.suppliers.title}
              </h1>
              <p className="text-slate-600 text-sm">{t.suppliers.subtitle}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setShowImportModal(true)}
            className="px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-sm rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>Import CSV</span>
          </button>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-5 py-2.5 bg-slate-900 hover:bg-black text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer hover:shadow-lg active:scale-98"
          >
            <Plus className="w-4 h-4 text-emerald-400 stroke-[2.5]" />
            <span>{t.suppliers.addSupplier}</span>
          </button>
        </div>
      </div>

      {/* 4 Clean Compact KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Suppliers</span>
            <span className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <Building className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{suppliers.length}</div>
          <div className="text-xs text-slate-400 mt-1">Directory partners</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Partners</span>
            <span className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <Globe className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-700">
            {suppliers.filter((s) => s.isActive).length}
          </div>
          <div className="text-xs text-slate-400 mt-1">Active trading accounts</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Shipments</span>
            <span className="p-2 rounded-lg bg-purple-50 text-purple-600">
              <Package className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{totalShipmentsAll}</div>
          <div className="text-xs text-slate-400 mt-1">Shipments received</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Payable</span>
            <span className="p-2 rounded-lg bg-rose-50 text-rose-600">
              <AlertCircle className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-bold text-rose-600">
            KD {totalPayableAll.toFixed(3)}
          </div>
          <div className="text-xs text-slate-400 mt-1">Outstanding dues</div>
        </div>
      </div>

      {/* Search & Action Bar */}
      <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search supplier name, contact person, phone or country..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all"
          />
        </div>
      </div>

      {/* Suppliers Table */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-500 font-medium text-sm">
            {t.common.loading}
          </div>
        ) : filteredSuppliers.length === 0 ? (
          <div className="py-16 text-center text-slate-500">
            <Truck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-lg font-semibold text-slate-700">{t.suppliers.noSuppliers}</p>
            <p className="text-sm text-slate-500 mt-1">
              {lang === 'hi' ? 'Upar diye gaye button se naya supplier add karein.' : 'Use the button above to add a new supplier.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[850px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-4 whitespace-nowrap">{t.suppliers.name}</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">{t.suppliers.country}</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">{t.suppliers.contactPerson} & {t.suppliers.phone}</th>
                  <th className="py-3.5 px-4 text-right whitespace-nowrap">{t.suppliers.totalPayable}</th>
                  <th className="py-3.5 px-4 text-center whitespace-nowrap">{t.suppliers.shipments}</th>
                  <th className="py-3.5 px-4 text-center whitespace-nowrap">{t.suppliers.status}</th>
                  <th className="py-3.5 px-4 text-right whitespace-nowrap">{t.suppliers.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm">
                {filteredSuppliers.map((sup) => (
                  <tr key={sup.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 text-base">{sup.name}</div>
                      {sup.address && (
                        <div className="text-xs text-slate-500 truncate max-w-xs">{sup.address}</div>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">
                        <Globe className="w-3.5 h-3.5 text-slate-500" />
                        {sup.country || 'China'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">
                        {sup.contactPerson || '—'}
                      </div>
                      {sup.phone ? (
                        <div className="flex items-center gap-2 mt-0.5">
                          <a
                            href={`tel:${sup.phone}`}
                            className="inline-flex items-center gap-1 text-xs text-sky-700 hover:text-sky-900 font-medium"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            {sup.phone}
                          </a>
                          <a
                            href={`https://wa.me/${sup.phone.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-emerald-700 hover:text-emerald-900 font-semibold bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded-sm border border-emerald-200"
                            title="WhatsApp Chat"
                          >
                            <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                            WA
                          </a>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">No phone</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      {sup.totalPayable > 0 ? (
                        <span className="inline-block font-extrabold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200 text-base">
                          {Number(sup.totalPayable).toFixed(3)} {t.common.currency}
                        </span>
                      ) : (
                        <span className="font-semibold text-slate-500">
                          0.000 {t.common.currency}
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleOpenHistory(sup)}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-sky-50 hover:bg-sky-100 text-sky-700 font-semibold rounded-lg text-xs border border-sky-200 cursor-pointer"
                      >
                        <Package className="w-3.5 h-3.5" />
                        <span>{sup.shipmentCount} Shipments</span>
                      </button>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          sup.isActive
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {sup.isActive ? t.suppliers.active : t.suppliers.inactive}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(sup)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-slate-700 hover:text-sky-700 hover:bg-sky-50 rounded-lg font-semibold text-xs border border-slate-300 hover:border-sky-300 transition-colors cursor-pointer"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        <span>{t.common.edit}</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ───────────────────── Add / Edit Supplier Modal ───────────────────── */}
      {(showAddModal || editSupplier) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Truck className="w-6 h-6 text-sky-400" />
                <h2 className="text-xl font-bold">
                  {editSupplier ? t.suppliers.editSupplier : t.suppliers.addSupplier}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowAddModal(false);
                  setEditSupplier(null);
                }}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-sm font-semibold flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Supplier Name */}
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-1">
                  {t.suppliers.name} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Guangzhou Shengli Textile Co."
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium text-base"
                />
              </div>

              {/* Country & Contact Person */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-1">
                    {t.suppliers.country}
                  </label>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="China, Kuwait, India..."
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium text-base"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-1">
                    {t.suppliers.contactPerson}
                  </label>
                  <input
                    type="text"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    placeholder="e.g. Mr. Zhang Chen"
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium text-base"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-1">
                  {t.suppliers.phone}
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={lang === 'hi' ? '+86 138 0000 0000 ya +965 9900 1122' : '+86 138 0000 0000 or +965 9900 1122'}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium text-base"
                />
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-1">
                  {t.suppliers.address}
                </label>
                <textarea
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Factory or office address..."
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium text-sm"
                />
              </div>

              {/* Status toggle if editing */}
              {editSupplier && (
                <div className="flex items-center gap-3 pt-2">
                  <input
                    type="checkbox"
                    id="supplierActive"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-5 h-5 text-sky-600 rounded-sm focus:ring-sky-500 border-slate-300"
                  />
                  <label htmlFor="supplierActive" className="text-sm font-bold text-slate-800 cursor-pointer">
                    {lang === 'hi' ? 'Supplier Active Hai' : 'Supplier is Active'}
                  </label>
                </div>
              )}

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditSupplier(null);
                  }}
                  className="px-5 py-2.5 border border-slate-300 rounded-xl text-slate-700 font-bold hover:bg-slate-50 transition-colors"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold shadow-sm transition-colors focus:ring-4 focus:ring-sky-200 disabled:opacity-50"
                >
                  {saving ? t.settings.saving : t.common.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ───────────────────── Supplier Shipment History Modal ───────────────────── */}
      {historySupplier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full overflow-hidden max-h-[90vh] flex flex-col">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div>
                <div className="text-xs text-sky-400 font-bold uppercase tracking-wider">
                  Shipment History
                </div>
                <h2 className="text-xl font-bold">{historySupplier.name}</h2>
              </div>
              <button
                type="button"
                onClick={() => setHistorySupplier(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <div className="text-xs text-slate-500 font-bold uppercase">
                    {lang === 'hi' ? 'Mulk (Country)' : 'Country'}
                  </div>
                  <div className="text-base font-bold text-slate-800">{historySupplier.country}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-500 font-bold uppercase">
                    {lang === 'hi' ? 'Dene Baqi (Payable)' : 'Total Payable'}
                  </div>
                  <div className="text-xl font-extrabold text-rose-600">
                    {Number(historySupplier.totalPayable).toFixed(3)} {t.common.currency}
                  </div>
                </div>
              </div>

              {historyLoading ? (
                <div className="py-12 text-center text-slate-500">
                  <RefreshCw className="w-6 h-6 animate-spin text-sky-600 mx-auto mb-2" />
                  <p>{t.common.loading}</p>
                </div>
              ) : supplierHistory.length === 0 ? (
                <div className="py-12 text-center text-slate-500">
                  <Package className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="font-semibold text-slate-700">
                    {lang === 'hi' ? 'Is supplier se abhi tak koi shipment receive nahi hui.' : 'No shipments received from this supplier yet.'}
                  </p>
                </div>
              ) : (
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-200 text-xs font-bold text-slate-700 uppercase">
                        <th className="py-2.5 px-3">Receipt No.</th>
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3">Container / Ref</th>
                        <th className="py-2.5 px-3 text-right">Total Pcs</th>
                        <th className="py-2.5 px-3 text-right">Amount (K.D.)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {supplierHistory.map((rec) => (
                        <tr key={rec.id} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 font-bold text-sky-700">{rec.receiptNumber}</td>
                          <td className="py-2.5 px-3 text-slate-600">{rec.receiptDate}</td>
                          <td className="py-2.5 px-3 text-slate-800">
                            {rec.shipmentContainerNo || rec.supplierInvoiceRef || '—'}
                          </td>
                          <td className="py-2.5 px-3 text-right font-semibold text-slate-900">
                            {rec.totalPcsBreakdown?.display || `${rec.totalPcs} Pcs`}
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                            {Number(rec.totalAmountKd).toFixed(3)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setHistorySupplier(null)}
                className="px-5 py-2 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-900 text-sm"
              >
                {t.common.close}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────── CSV BULK IMPORT MODAL ───────────────────── */}
      {showImportModal && (
        <CsvImportModal
          title="Import Suppliers & Opening Payables"
          description="Upload supplier list from China, India, Kuwait with contact and payable balance."
          columns={[
            { key: 'name', label: 'Supplier Name', required: true },
            { key: 'contactPerson', label: 'Contact Person' },
            { key: 'phone', label: 'Phone Number' },
            { key: 'country', label: 'Country' },
            { key: 'address', label: 'Address' },
            { key: 'openingPayableKd', label: 'Opening Payable (KD)', type: 'number' },
          ]}
          sampleRows={[
            { name: 'Guangzhou Shengli Textile Co.', contactPerson: 'Mr. Zhang Chen', phone: '+86 20 8899 1122', country: 'China', address: 'Guangzhou, Guangdong', openingPayableKd: 1250.000 },
            { name: 'Yiwu Export Garments Ltd.', contactPerson: 'Ms. Lin Wei', phone: '+86 579 8555 4321', country: 'China', address: 'Yiwu International Trade City', openingPayableKd: 640.500 },
          ]}
          endpoint="/suppliers/bulk-import"
          onSuccess={(count) => {
            setShowImportModal(false);
            showSuccessToast(`Successfully imported ${count} suppliers.`);
            fetchSuppliers();
          }}
          onClose={() => setShowImportModal(false)}
        />
      )}
    </div>
  );
};
