import React, { useEffect, useState, useCallback } from 'react';
import { useTranslations } from '../hooks/useTranslations';
import api from '../services/api';
import { translateEnglishToArabic } from '../utils/translate';
import {
  Search,
  Plus,
  Pencil,
  ArrowUpDown,
  ScrollText,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  X,
  Filter,
  Boxes,
  Package,
  FileSpreadsheet,
  Upload,
  Download,
  DollarSign,
  Trash2,
} from 'lucide-react';
import ProductThumbnail from '../components/common/ProductThumbnail';
import ProductImageUpload from '../components/common/ProductImageUpload';

/* ───────────────────── Types ───────────────────── */

interface ProductItem {
  id: number;
  articleNumber: string;
  nameEn: string;
  nameAr?: string;
  category?: { id: number; nameEn: string };
  color?: string;
  size?: string;
  purchasePrice: number;
  sellingPrice: number;
  currentStockPcs: number;
  reorderLevelPcs: number;
  isActive: boolean;
  notes?: string;
  stockBreakdown: {
    dozen: number;
    pieces: number;
    totalPcs: number;
    displayDozPcs: string;
  };
  isLowStock: boolean;
  status: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
  hasImage: boolean;
  imageUpdatedAt?: string | null;
}

interface CategoryItem {
  id: number;
  nameEn: string;
  nameAr?: string;
}

interface LedgerEntry {
  id: number;
  productId: number;
  quantityChangePcs: number;
  balanceAfterPcs: number;
  sourceType: string;
  sourceReference: string;
  notes?: string;
  performedBy: string;
  createdAt: string;
  quantityChangeDisplay: string;
  balanceAfterDisplay: string;
}

/* ───────────────────── Component ───────────────────── */

export const StockPage: React.FC = () => {
  const { t, lang } = useTranslations();

  /* ── State ── */
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [lowStockFilter, setLowStockFilter] = useState(false);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editProduct, setEditProduct] = useState<ProductItem | null>(null);
  const [adjustProduct, setAdjustProduct] = useState<ProductItem | null>(null);
  const [ledgerProduct, setLedgerProduct] = useState<ProductItem | null>(null);

  // Success toast
  const [toast, setToast] = useState('');

  /* ── Data fetching ── */
  const fetchProducts = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set('search', search.trim());
      if (categoryFilter) params.set('categoryId', categoryFilter);
      if (lowStockFilter) params.set('lowStock', 'true');
      const res = await api.get(`/products?${params.toString()}`);
      setProducts(res.data);
    } catch (err) {
      console.error('Failed to load products', err);
    } finally {
      setLoading(false);
    }
  }, [search, categoryFilter, lowStockFilter]);

  const handleDeleteProduct = async (product: ProductItem) => {
    if (
      !window.confirm(
        `Are you ABSOLUTELY sure you want to permanently delete product "${product.nameEn}" (${product.articleNumber})?\n\nThis will completely remove it from the system.`
      )
    ) {
      return;
    }

    try {
      await api.delete(`/products/${product.id}`);
      showToast(`Product ${product.articleNumber} deleted permanently.`);
      fetchProducts();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to delete product. It may be used in invoices or receipts.');
    }
  };

  const fetchCategories = useCallback(async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data);
    } catch (err) {
      console.error('Failed to load categories', err);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      setLoading(true);
      fetchProducts();
    }, 300);
    return () => clearTimeout(debounce);
  }, [fetchProducts]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 4000);
  };

  const onProductSaved = () => {
    fetchProducts();
  };

  /* ── Status badge helper ── */
  const statusBadge = (status: string) => {
    if (status === 'OUT_OF_STOCK')
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold border bg-rose-50 text-rose-800 border-rose-300">
          <XCircle className="w-3 h-3" /> {t.stock.outOfStock}
        </span>
      );
    if (status === 'LOW_STOCK')
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold border bg-amber-50 text-amber-900 border-amber-300">
          <AlertTriangle className="w-3 h-3" /> {t.stock.lowStock}
        </span>
      );
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold border bg-emerald-50 text-emerald-800 border-emerald-300">
        <CheckCircle2 className="w-3 h-3" /> {t.stock.inStock}
      </span>
    );
  };

  /* ───────────────────── Render ───────────────────── */
  return (
    <div className="max-w-7xl mx-auto space-y-5 antialiased text-sm">
      {/* Toast */}
      {toast && (
        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold flex items-center gap-2 shadow-xs animate-pulse">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
              <Boxes className="w-5 h-5 text-emerald-400" />
            </div>
            <span>{t.stock.title}</span>
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">{t.stock.subtitle}</p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setShowImportModal(true)}
            className="px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-sm rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>{t.stock.importStock}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="px-5 py-2.5 bg-slate-900 hover:bg-black text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer hover:shadow-lg active:scale-98"
          >
            <Plus className="w-4 h-4 text-emerald-400 stroke-[2.5]" />
            <span>{t.stock.addProduct}</span>
          </button>
        </div>
      </div>

      {/* 4 Clean Compact KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Products</span>
            <span className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <Package className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">
            {products.length}
          </div>
          <div className="text-xs text-slate-400 mt-1">Catalog items</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Stock</span>
            <span className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <Boxes className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">
            {products.reduce((sum, p) => sum + Number(p.currentStockPcs || 0), 0).toLocaleString()} <span className="text-xs font-semibold text-slate-500">Pcs</span>
          </div>
          <div className="text-xs text-slate-400 mt-1">
            {Math.floor(products.reduce((sum, p) => sum + Number(p.currentStockPcs || 0), 0) / 12)} Doz {products.reduce((sum, p) => sum + Number(p.currentStockPcs || 0), 0) % 12} Pcs
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Inventory Value</span>
            <span className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">
            KD {products.reduce((sum, p) => sum + ((Number(p.currentStockPcs || 0) / 12) * Number(p.purchasePrice || 0)), 0).toFixed(3)}
          </div>
          <div className="text-xs text-slate-400 mt-1">At purchase cost</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Stock Alerts</span>
            <span className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <AlertTriangle className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-700">
            {products.filter((p) => p.status === 'LOW_STOCK' || p.status === 'OUT_OF_STOCK').length}
          </div>
          <div className="text-xs text-slate-400 mt-1">Low or out of stock</div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-xl p-3 sm:p-4 shadow-xs border border-slate-200 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.stock.searchPlaceholder}
            className="w-full pl-10 pr-3 py-2 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="pl-8 pr-4 py-2 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-slate-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all cursor-pointer"
            >
              <option value="">{t.stock.allCategories}</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.nameEn}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={() => setLowStockFilter(!lowStockFilter)}
            className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              lowStockFilter
                ? 'bg-amber-50 text-amber-800 border-amber-300 shadow-xs'
                : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 inline mr-1 text-amber-600" />
            {t.stock.lowStockOnly}
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs min-w-[850px]">
            <thead>
              <tr className="bg-slate-100 text-slate-800 border-b border-slate-300 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-2.5 px-3 w-14 text-center">Img</th>
                <th className="py-2.5 px-3">{t.stock.articleNo}</th>
                <th className="py-2.5 px-3">{t.stock.product}</th>
                <th className="py-2.5 px-3 hidden md:table-cell">{t.stock.category}</th>
                <th className="py-2.5 px-3 text-right">{t.stock.stockDozPcs}</th>
                <th className="py-2.5 px-3 text-right hidden sm:table-cell">{t.stock.totalPcs}</th>
                <th className="py-2.5 px-3 text-right hidden lg:table-cell">{t.stock.sellingPrice}</th>
                <th className="py-2.5 px-3 text-center">{t.stock.statusCol}</th>
                <th className="py-2.5 px-3 text-center">{t.stock.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-800 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-500">
                    {t.common.loading}
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-500">
                    <Package className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    {t.stock.noProducts}
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr key={p.id} className="hover:bg-sky-50/50 transition-colors">
                    <td className="py-2.5 px-3 text-center">
                      <ProductThumbnail
                        productId={p.id}
                        articleNumber={p.articleNumber}
                        productName={p.nameEn}
                        hasImage={p.hasImage}
                        imageUpdatedAt={p.imageUpdatedAt}
                        size="md"
                      />
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-sky-800 whitespace-nowrap">
                      {p.articleNumber}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-slate-900">{p.nameEn}</div>
                      {p.color && (
                        <div className="text-[11px] text-slate-500">
                          {p.color}
                          {p.size ? ` • ${p.size}` : ''}
                        </div>
                      )}
                    </td>
                    <td className="py-2.5 px-3 hidden md:table-cell text-slate-600">
                      {p.category?.nameEn || '—'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold whitespace-nowrap">
                      <span className="text-slate-900">
                        {p.stockBreakdown.dozen} Doz {p.stockBreakdown.pieces} Pcs
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right hidden sm:table-cell font-mono text-slate-600">
                      {p.stockBreakdown.totalPcs}
                    </td>
                    <td className="py-2.5 px-3 text-right hidden lg:table-cell font-mono text-slate-900">
                      {p.sellingPrice.toFixed(3)} K.D.
                    </td>
                    <td className="py-2.5 px-3 text-center">{statusBadge(p.status)}</td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => setEditProduct(p)}
                          className="p-1.5 rounded-md text-slate-500 hover:bg-sky-100 hover:text-sky-700 transition-colors"
                          title={t.stock.editProduct}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setAdjustProduct(p)}
                          className="p-1.5 rounded-md text-slate-500 hover:bg-amber-100 hover:text-amber-700 transition-colors"
                          title={t.stock.adjustStock}
                        >
                          <ArrowUpDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setLedgerProduct(p)}
                          className="p-1.5 rounded-md text-slate-500 hover:bg-purple-100 hover:text-purple-700 transition-colors"
                          title={t.stock.viewLedger}
                        >
                          <ScrollText className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteProduct(p)}
                          className="p-1.5 rounded-md text-slate-500 hover:bg-rose-100 hover:text-rose-700 transition-colors"
                          title="Delete Product"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Add Product Modal ── */}
      {showAddModal && (
        <AddProductModal
          t={t}
          lang={lang}
          categories={categories}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            onProductSaved();
            // Toast is handled in AddProductModal if image fails, so we won't overwrite it here unconditionally, actually we can just rely on AddProductModal to show the success toast.
            setShowAddModal(false);
          }}
        />
      )}

      {/* ── Import Opening Stock Modal ── */}
      {showImportModal && (
        <ImportOpeningStockModal
          t={t}
          lang={lang}
          onClose={() => setShowImportModal(false)}
          onSuccess={() => {
            onProductSaved();
            showToast(t.stock.importSuccess);
            setShowImportModal(false);
          }}
        />
      )}

      {/* ── Edit Product Modal ── */}
      {editProduct && (
        <EditProductModal
          t={t}
          lang={lang}
          product={editProduct}
          categories={categories}
          onClose={() => setEditProduct(null)}
          onSuccess={() => {
            onProductSaved();
            setEditProduct(null);
          }}
          onImageChanged={() => onProductSaved()}
        />
      )}

      {/* ── Stock Adjustment Modal ── */}
      {adjustProduct && (
        <AdjustStockModal
          t={t}
          lang={lang}
          product={adjustProduct}
          onClose={() => setAdjustProduct(null)}
          onSuccess={() => {
            onProductSaved();
            showToast(t.stock.stockAdjusted);
            setAdjustProduct(null);
          }}
        />
      )}

      {/* ── Stock Ledger Drawer ── */}
      {ledgerProduct && (
        <StockLedgerDrawer
          t={t}
          product={ledgerProduct}
          onClose={() => setLedgerProduct(null)}
        />
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════
   ADD PRODUCT MODAL
   ═══════════════════════════════════════════════════ */

function AddProductModal({
  t,
  lang,
  categories,
  onClose,
  onSuccess,
}: {
  t: any;
  lang: string;
  categories: CategoryItem[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [form, setForm] = useState({
    articleNumber: '',
    nameEn: '',
    nameAr: '',
    categoryId: '',
    color: '',
    size: '',
    purchasePrice: '',
    sellingPrice: '',
    reorderLevelPcs: '12',
    initialDozen: '0',
    initialPieces: '0',
    notes: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [_toastMsg, _setToastMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.articleNumber.trim() || !form.nameEn.trim()) {
      setError(t.common.required);
      return;
    }
    setSaving(true);
    setError('');
    try {
      const createdProd = await api.post('/products', {
        articleNumber: form.articleNumber.trim(),
        nameEn: form.nameEn.trim(),
        nameAr: form.nameAr.trim() || undefined,
        categoryId: form.categoryId ? Number(form.categoryId) : undefined,
        color: form.color.trim() || undefined,
        size: form.size.trim() || undefined,
        purchasePrice: Number(form.purchasePrice) || 0,
        sellingPrice: Number(form.sellingPrice) || 0,
        reorderLevelPcs: Number(form.reorderLevelPcs) || 12,
        initialDozen: Number(form.initialDozen) || 0,
        initialPieces: Number(form.initialPieces) || 0,
        notes: form.notes.trim() || undefined,
      });

      if (imageFile && createdProd.data?.id) {
        try {
          const formData = new FormData();
          formData.append('image', imageFile);
          await api.post(`/products/${createdProd.data.id}/image`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          alert('Product saved and image uploaded successfully.');
        } catch (imgErr) {
          alert('Product saved, but photo upload failed. You can upload the photo from Edit Product.');
        }
      } else {
        alert('Product created successfully.');
      }

      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || t.common.error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalOverlay onClose={onClose}>
      <div className="bg-white rounded-2xl w-full max-h-[92vh] overflow-y-auto p-6 shadow-2xl border border-slate-300">
        <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <Plus className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">{t.stock.addProduct}</h2>
              <p className="text-xs text-slate-500">{lang === 'hi' ? 'Naye maal ki jankari darj karein' : 'Enter product details and initial stock'}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3.5">
            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Product Image (Optional)</label>
              <input
                type="file"
                accept="image/jpeg, image/png, image/webp"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-xs transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <FormField label={t.stock.articleNo} required>
              <input
                type="text"
                value={form.articleNumber}
                onChange={(e) => setForm({ ...form, articleNumber: e.target.value })}
                placeholder="ART-001"
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 font-bold text-sm uppercase placeholder:font-normal placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-xs transition-colors"
              />
            </FormField>
            <FormField label={t.stock.productName} required>
              <input
                type="text"
                value={form.nameEn}
                onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
                onBlur={async () => {
                  if (form.nameEn && !form.nameAr) {
                    const translated = await translateEnglishToArabic(form.nameEn);
                    if (translated) setForm({ ...form, nameAr: translated });
                  }
                }}
                placeholder={lang === 'hi' ? 'Product naam (English)' : 'Product name (English)'}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 font-semibold text-sm placeholder:font-normal placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-xs transition-colors"
              />
            </FormField>
          </div>

          <FormField label={t.stock.productNameAr}>
            <input
              type="text"
              dir="rtl"
              value={form.nameAr}
              onChange={(e) => setForm({ ...form, nameAr: e.target.value })}
              placeholder="اسم المنتج بالعربي (اختياري)"
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 font-semibold text-sm placeholder:font-normal placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-xs transition-colors"
            />
          </FormField>

          <div className="grid grid-cols-3 gap-3.5">
            <FormField label={t.stock.category}>
              <select
                value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 font-semibold text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-xs transition-colors"
              >
                <option value="">— {lang === 'hi' ? 'Category Chunein' : 'Select'} —</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.nameEn}</option>
                ))}
              </select>
            </FormField>
            <FormField label={t.stock.color}>
              <input
                type="text"
                value={form.color}
                onChange={(e) => setForm({ ...form, color: e.target.value })}
                placeholder="White, Blue..."
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 font-semibold text-sm placeholder:font-normal placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-xs transition-colors"
              />
            </FormField>
            <FormField label={t.stock.size}>
              <input
                type="text"
                value={form.size}
                onChange={(e) => setForm({ ...form, size: e.target.value })}
                placeholder={'58", XL...'}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 font-semibold text-sm placeholder:font-normal placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-xs transition-colors"
              />
            </FormField>
          </div>

          <div className="grid grid-cols-3 gap-3.5">
            <FormField label={`${t.stock.purchasePrice} (per Dozen)`}>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-sm">KD</span>
                <input
                  type="number"
                  step="0.001"
                  min="0"
                  value={form.purchasePrice}
                  onChange={(e) => setForm({ ...form, purchasePrice: e.target.value })}
                  onFocus={(e) => e.target.select()}
                  placeholder="0.000"
                  className="w-full pl-12 pr-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 font-bold text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-xs transition-colors"
                />
              </div>
            </FormField>
            <FormField label={`${t.stock.sellingPrice} (per Dozen)`}>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-sm">KD</span>
                <input
                  type="number"
                  step="0.001"
                  min="0"
                  value={form.sellingPrice}
                  onChange={(e) => setForm({ ...form, sellingPrice: e.target.value })}
                  onFocus={(e) => e.target.select()}
                  placeholder="0.000"
                  className="w-full pl-12 pr-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 font-bold text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-xs transition-colors"
                />
              </div>
            </FormField>
            <FormField label={t.stock.reorderLevel}>
              <input
                type="number"
                min="0"
                value={form.reorderLevelPcs}
                onChange={(e) => setForm({ ...form, reorderLevelPcs: e.target.value })}
                placeholder="12"
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 font-bold text-sm text-center focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-xs transition-colors"
              />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <FormField label={t.stock.initialDozen}>
              <input
                type="number"
                min="0"
                value={form.initialDozen}
                onChange={(e) => setForm({ ...form, initialDozen: e.target.value })}
                onFocus={(e) => e.target.select()}
                placeholder="0"
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 font-bold text-sm text-center focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-xs transition-colors"
              />
            </FormField>
            <FormField label={t.stock.initialPieces}>
              <input
                type="number"
                min="0"
                max="11"
                value={form.initialPieces}
                onChange={(e) => setForm({ ...form, initialPieces: e.target.value })}
                onFocus={(e) => e.target.select()}
                placeholder="0"
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 font-bold text-sm text-center focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-xs transition-colors"
              />
            </FormField>
          </div>

          {(Number(form.initialDozen) > 0 || Number(form.initialPieces) > 0) && (
            <div className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center">
              {lang === 'hi' ? 'Opening Stock' : 'Opening Stock'}: {form.initialDozen} Doz {form.initialPieces} Pcs = <span className="text-emerald-900 font-extrabold">{Number(form.initialDozen) * 12 + Number(form.initialPieces)} Total Pcs</span>
            </div>
          )}

          <FormField label={t.stock.notes}>
            <textarea
              rows={2}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder={lang === 'hi' ? 'Optional remarks...' : 'Optional notes about this product...'}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 font-medium text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-xs transition-colors"
            />
          </FormField>

          <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold text-sm hover:bg-slate-50 transition-colors cursor-pointer"
            >
              {t.common.cancel}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
            >
              {saving ? t.common.loading : t.common.save}
            </button>
          </div>
        </form>
      </div>
    </ModalOverlay>
  );
}

/* ═══════════════════════════════════════════════════
   EDIT PRODUCT MODAL
   ═══════════════════════════════════════════════════ */

function EditProductModal({
  t,
  lang,
  product,
  categories,
  onClose,
  onSuccess,
  onImageChanged,
}: {
  t: any;
  lang: string;
  product: ProductItem;
  categories: CategoryItem[];
  onClose: () => void;
  onSuccess: () => void;
  onImageChanged: () => void;
}) {
  const [localProduct, setLocalProduct] = useState(product);
  const [form, setForm] = useState({
    nameEn: product.nameEn,
    nameAr: product.nameAr || '',
    categoryId: product.category?.id ? String(product.category.id) : '',
    color: product.color || '',
    size: product.size || '',
    purchasePrice: String(product.purchasePrice),
    sellingPrice: String(product.sellingPrice),
    reorderLevelPcs: String(product.reorderLevelPcs),
    isActive: product.isActive,
    notes: product.notes || '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.put(`/products/${product.id}`, {
        nameEn: form.nameEn.trim(),
        nameAr: form.nameAr.trim() || undefined,
        categoryId: form.categoryId ? Number(form.categoryId) : undefined,
        color: form.color.trim() || undefined,
        size: form.size.trim() || undefined,
        purchasePrice: Number(form.purchasePrice) || 0,
        sellingPrice: Number(form.sellingPrice) || 0,
        reorderLevelPcs: Number(form.reorderLevelPcs) || 12,
        isActive: form.isActive,
        notes: form.notes.trim() || undefined,
      });
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || t.common.error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalOverlay onClose={onClose}>
      <div className="bg-white rounded-2xl w-full max-h-[92vh] overflow-y-auto p-6 shadow-2xl border border-slate-300">
        <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
              <Pencil className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">{t.stock.editProduct}</h2>
              <p className="text-xs text-slate-500 font-mono font-bold text-emerald-700">{product.articleNumber}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex items-center gap-4 mb-4 p-4 border border-slate-200 rounded-xl bg-slate-50">
           <ProductThumbnail
             productId={localProduct.id}
             articleNumber={localProduct.articleNumber}
             productName={localProduct.nameEn}
             hasImage={localProduct.hasImage}
             imageUpdatedAt={localProduct.imageUpdatedAt}
             size="lg"
           />
           <div className="flex-1">
             <h3 className="text-sm font-bold text-slate-900 mb-2">Product Photo</h3>
             <ProductImageUpload
               productId={localProduct.id}
               hasImage={localProduct.hasImage}
               onUploadSuccess={(newUpdatedAt) => {
                 setLocalProduct({ ...localProduct, hasImage: true, imageUpdatedAt: newUpdatedAt });
                 onImageChanged();
               }}
               onRemoveSuccess={() => {
                 setLocalProduct({ ...localProduct, hasImage: false, imageUpdatedAt: null });
                 onImageChanged();
               }}
             />
           </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3.5">
            <FormField label={t.stock.productName} required>
              <input
                type="text"
                value={form.nameEn}
                onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 font-semibold text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-xs transition-colors"
              />
            </FormField>
            <FormField label={t.stock.productNameAr}>
              <input
                type="text"
                dir="rtl"
                value={form.nameAr}
                onChange={(e) => setForm({ ...form, nameAr: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 font-semibold text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-xs transition-colors"
              />
            </FormField>
          </div>

          <div className="grid grid-cols-3 gap-3.5">
            <FormField label={t.stock.category}>
              <select
                value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 font-semibold text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-xs transition-colors"
              >
                <option value="">— {lang === 'hi' ? 'Category Chunein' : 'Select'} —</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.nameEn}</option>
                ))}
              </select>
            </FormField>
            <FormField label={t.stock.color}>
              <input
                type="text"
                value={form.color}
                onChange={(e) => setForm({ ...form, color: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 font-semibold text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-xs transition-colors"
              />
            </FormField>
            <FormField label={t.stock.size}>
              <input
                type="text"
                value={form.size}
                onChange={(e) => setForm({ ...form, size: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 font-semibold text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-xs transition-colors"
              />
            </FormField>
          </div>

          <div className="grid grid-cols-3 gap-3.5">
            <FormField label={t.stock.purchasePrice}>
              <input
                type="number"
                step="0.001"
                min="0"
                value={form.purchasePrice}
                onChange={(e) => setForm({ ...form, purchasePrice: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 font-bold text-sm text-right focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-xs transition-colors"
              />
            </FormField>
            <FormField label={t.stock.sellingPrice}>
              <input
                type="number"
                step="0.001"
                min="0"
                value={form.sellingPrice}
                onChange={(e) => setForm({ ...form, sellingPrice: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 font-bold text-sm text-right focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-xs transition-colors"
              />
            </FormField>
            <FormField label={t.stock.reorderLevel}>
              <input
                type="number"
                min="0"
                value={form.reorderLevelPcs}
                onChange={(e) => setForm({ ...form, reorderLevelPcs: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 font-bold text-sm text-center focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-xs transition-colors"
              />
            </FormField>
          </div>

          <FormField label={t.stock.notes}>
            <textarea
              rows={2}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 font-medium text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-xs transition-colors"
            />
          </FormField>

          <label className="flex items-center gap-2.5 cursor-pointer py-1">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
            />
            <span className="text-sm font-bold text-slate-700">{t.stock.activeStatus}</span>
          </label>

          <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold text-sm hover:bg-slate-50 transition-colors cursor-pointer"
            >
              {t.common.cancel}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
            >
              {saving ? t.common.loading : t.common.save}
            </button>
          </div>
        </form>
      </div>
    </ModalOverlay>
  );
}

/* ═══════════════════════════════════════════════════
   STOCK ADJUSTMENT MODAL
   ═══════════════════════════════════════════════════ */

function AdjustStockModal({
  t,
  lang,
  product,
  onClose,
  onSuccess,
}: {
  t: any;
  lang?: string;
  product: ProductItem;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [type, setType] = useState<'ADD' | 'REMOVE'>('ADD');
  const [dozen, setDozen] = useState('0');
  const [pieces, setPieces] = useState('0');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const totalPcs = Number(dozen) * 12 + Number(pieces);
  const reasons = [
    { value: 'Recount', label: t.stock.reasonRecount },
    { value: 'Damage', label: t.stock.reasonDamage },
    { value: 'Shortage', label: t.stock.reasonShortage },
    { value: 'Return', label: t.stock.reasonReturn },
    { value: 'Other', label: t.stock.reasonOther },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (totalPcs <= 0) {
      setError(t.common.required);
      return;
    }
    if (!reason) {
      setError(t.common.required);
      return;
    }
    setSaving(true);
    setError('');
    try {
      await api.post('/stock/adjust', {
        productId: product.id,
        dozen: Number(dozen) || 0,
        pieces: Number(pieces) || 0,
        type,
        reason,
        notes: notes.trim() || undefined,
      });
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || t.common.error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalOverlay onClose={onClose}>
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-300">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200">
          <div>
            <h2 className="text-base font-extrabold text-slate-900">{t.stock.adjustStock}</h2>
            <p className="text-xs text-slate-500 font-medium">
              <span className="font-mono font-bold text-emerald-700">{product.articleNumber}</span> • {product.nameEn}
            </p>
            <p className="text-xs text-sky-700 font-bold mt-0.5">
              Current: {product.stockBreakdown.displayDozPcs} ({product.stockBreakdown.totalPcs} Pcs)
            </p>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type Toggle */}
          <div className="flex rounded-xl overflow-hidden border border-slate-300 p-1 bg-slate-100 gap-1">
            <button
              type="button"
              onClick={() => setType('ADD')}
              className={`flex-1 py-2 text-xs font-extrabold rounded-lg transition-colors cursor-pointer ${
                type === 'ADD' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-700 hover:bg-white'
              }`}
            >
              + {t.stock.addStock}
            </button>
            <button
              type="button"
              onClick={() => setType('REMOVE')}
              className={`flex-1 py-2 text-xs font-extrabold rounded-lg transition-colors cursor-pointer ${
                type === 'REMOVE' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-700 hover:bg-white'
              }`}
            >
              − {t.stock.removeStock}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormField label={t.stock.adjustDozen}>
              <input
                type="number"
                min="0"
                value={dozen}
                onChange={(e) => setDozen(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 font-bold text-sm text-center focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-xs transition-colors"
              />
            </FormField>
            <FormField label={t.stock.adjustPieces}>
              <input
                type="number"
                min="0"
                value={pieces}
                onChange={(e) => setPieces(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 font-bold text-sm text-center focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-xs transition-colors"
              />
            </FormField>
          </div>

          {totalPcs > 0 && (
            <div className={`text-xs font-extrabold rounded-xl p-2.5 text-center border ${
              type === 'ADD'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-rose-50 text-rose-800 border-rose-300'
            }`}>
              {type === 'ADD' ? '+' : '−'} {dozen} Doz {pieces} Pcs = {type === 'ADD' ? '+' : '−'}{totalPcs} Total Pcs
            </div>
          )}

          <FormField label={t.stock.reason} required>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 font-semibold text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-xs transition-colors"
            >
              <option value="">— {lang === 'hi' ? 'Karan Chunein' : 'Select Reason'} —</option>
              {reasons.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </FormField>

          <FormField label={t.stock.notes}>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 font-medium text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-xs transition-colors"
              placeholder={lang === 'hi' ? 'Koyi zaroori note (optional)...' : 'Optional adjustment notes...'}
            />
          </FormField>

          <div className="pt-3 border-t border-slate-200 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors cursor-pointer"
            >
              {t.common.cancel}
            </button>
            <button
              type="submit"
              disabled={saving || totalPcs <= 0}
              className={`px-5 py-2 rounded-xl text-white font-bold text-xs shadow-xs transition-colors disabled:opacity-50 cursor-pointer ${
                type === 'ADD' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
              }`}
            >
              {saving ? t.common.loading : t.common.confirm}
            </button>
          </div>
        </form>
      </div>
    </ModalOverlay>
  );
}

/* ═══════════════════════════════════════════════════
   STOCK LEDGER DRAWER
   ═══════════════════════════════════════════════════ */

function StockLedgerDrawer({
  t,
  product,
  onClose,
}: {
  t: any;
  product: ProductItem;
  onClose: () => void;
}) {
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get(`/stock/ledger?productId=${product.id}&limit=100`);
        setEntries(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [product.id]);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs" onClick={onClose}></div>
      <div className="relative w-full max-w-2xl bg-white shadow-2xl border-l border-slate-300 z-10 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ScrollText className="w-4 h-4 text-purple-600" />
              {t.stock.ledgerTitle}
            </h2>
            <p className="text-[11px] text-slate-500 font-mono">
              {product.articleNumber} — {product.nameEn}
            </p>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="sticky top-0">
              <tr className="bg-slate-100 text-slate-800 border-b border-slate-300 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-2.5 px-3">{t.stock.ledgerDate}</th>
                <th className="py-2.5 px-3">{t.stock.ledgerChange}</th>
                <th className="py-2.5 px-3">{t.stock.ledgerBalance}</th>
                <th className="py-2.5 px-3">{t.stock.ledgerSource}</th>
                <th className="py-2.5 px-3">{t.stock.ledgerBy}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-800 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-500">{t.common.loading}</td>
                </tr>
              ) : entries.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-500">{t.stock.noLedgerEntries}</td>
                </tr>
              ) : (
                entries.map((entry) => {
                  const isPositive = entry.quantityChangePcs >= 0;
                  return (
                    <tr key={entry.id} className="hover:bg-sky-50/50 transition-colors">
                      <td className="py-2 px-3 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                        {new Date(entry.createdAt).toLocaleString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className={`py-2 px-3 font-bold whitespace-nowrap ${isPositive ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {entry.quantityChangeDisplay}
                      </td>
                      <td className="py-2 px-3 text-slate-700 whitespace-nowrap">
                        {entry.balanceAfterDisplay}
                      </td>
                      <td className="py-2 px-3">
                        <span className="inline-block px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-semibold">
                          {entry.sourceType}
                        </span>
                        {entry.sourceReference && (
                          <div className="text-[10px] text-slate-500 mt-0.5">{entry.sourceReference}</div>
                        )}
                      </td>
                      <td className="py-2 px-3 text-slate-600 whitespace-nowrap">
                        {entry.performedBy}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-200 flex justify-end flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-xs transition-colors"
          >
            {t.stock.closeLedger}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   IMPORT OPENING STOCK MODAL
   ═══════════════════════════════════════════════════ */

interface ParsedImportRow {
  rowNum: number;
  articleNumber: string;
  nameEn: string;
  nameAr?: string;
  categoryName?: string;
  color?: string;
  size?: string;
  openingDozen: number;
  openingPieces: number;
  totalPcs: number;
  purchasePrice: number;
  sellingPrice: number;
  reorderLevelPcs: number;
  notes?: string;
  isValid: boolean;
  errorMsg?: string;
}

function ImportOpeningStockModal({
  t,
  lang,
  onClose,
  onSuccess,
}: {
  t: any;
  lang?: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [fileContent, setFileContent] = useState('');
  const [rows, setRows] = useState<ParsedImportRow[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Sample CSV generator
  const downloadSampleCsv = () => {
    const header =
      'Article Number,Product Name,Arabic Name,Category,Color,Size,Opening Dozen,Opening Pieces,Purchase Price,Selling Price,Reorder Level,Notes\n';
    const sample1 =
      'ART-301,Japanese Cotton Pure White,قطن ياباني فاخر,Textiles & Cotton,White,58 Inch,10,6,2.500,3.750,24,Opening batch\n';
    const sample2 =
      'ART-302,Saudi Shemagh Red,شماغ احمر سعودي,Scarves & Shemagh,Red & White,58,5,0,3.200,4.500,12,Premium box\n';
    const sample3 =
      'ART-303,Kuwaiti Ghutra White,غترة كويتية بيضاء,Scarves & Shemagh,White,54,8,4,1.800,2.600,12,Standard box\n';
    const blob = new Blob([header + sample1 + sample2 + sample3], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Rashidi_Opening_Stock_Template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Parse CSV text into validated rows
  const parseCsvText = (text: string) => {
    if (!text.trim()) {
      setRows([]);
      return;
    }
    const rawLines = text
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);
    if (rawLines.length <= 1) {
      setRows([]);
      return;
    }

    const dataLines = rawLines.slice(1);
    const parsed: ParsedImportRow[] = [];
    const seenArticles = new Set<string>();

    dataLines.forEach((line, idx) => {
      const cols = line.split(',').map((c) => c.trim().replace(/^["']|["']$/g, ''));
      if (cols.length === 0 || (cols.length === 1 && !cols[0])) return;

      const art = (cols[0] || '').toUpperCase();
      const name = cols[1] || '';
      const nameAr = cols[2] || '';
      const category = cols[3] || '';
      const color = cols[4] || '';
      const size = cols[5] || '';
      const doz = Math.max(0, parseInt(cols[6] || '0', 10) || 0);
      const pcs = Math.max(0, parseInt(cols[7] || '0', 10) || 0);
      const purchasePrice = Math.max(0, parseFloat(cols[8] || '0') || 0);
      const sellingPrice = Math.max(0, parseFloat(cols[9] || '0') || 0);
      const reorderLevel = Math.max(0, parseInt(cols[10] || '12', 10) || 12);
      const notes = cols[11] || '';

      const totalPcs = doz * 12 + pcs;
      let isValid = true;
      let errorMsg = '';

      if (!art) {
        isValid = false;
        errorMsg = lang === 'hi' ? 'Article number required hai' : 'Article number is required';
      } else if (seenArticles.has(art)) {
        isValid = false;
        errorMsg = lang === 'hi' ? `Duplicate article "${art}" is file me hai` : `Duplicate article "${art}" in file`;
      } else if (!name) {
        isValid = false;
        errorMsg = lang === 'hi' ? 'Product name required hai' : 'Product name is required';
      }

      if (art) seenArticles.add(art);

      parsed.push({
        rowNum: idx + 2,
        articleNumber: art,
        nameEn: name,
        nameAr,
        categoryName: category,
        color,
        size,
        openingDozen: doz,
        openingPieces: pcs,
        totalPcs,
        purchasePrice,
        sellingPrice,
        reorderLevelPcs: reorderLevel,
        notes,
        isValid,
        errorMsg,
      });
    });

    setRows(parsed);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      setFileContent(content);
      parseCsvText(content);
    };
    reader.readAsText(file);
  };

  const validRows = rows.filter((r) => r.isValid);
  const totalPiecesToImport = validRows.reduce((sum, r) => sum + r.totalPcs, 0);
  const totalDoz = Math.floor(totalPiecesToImport / 12);
  const totalPcsRem = totalPiecesToImport % 12;

  const handleSubmit = async () => {
    if (validRows.length === 0) return;
    try {
      setIsSubmitting(true);
      setSubmitError('');

      await api.post('/products/bulk-import', {
        items: validRows.map((r) => ({
          articleNumber: r.articleNumber,
          nameEn: r.nameEn,
          nameAr: r.nameAr || undefined,
          categoryName: r.categoryName || undefined,
          color: r.color || undefined,
          size: r.size || undefined,
          openingDozen: r.openingDozen,
          openingPieces: r.openingPieces,
          purchasePrice: r.purchasePrice,
          sellingPrice: r.sellingPrice,
          reorderLevelPcs: r.reorderLevelPcs,
          notes: r.notes || undefined,
        })),
      });

      onSuccess();
    } catch (err: any) {
      console.error('Bulk import failed', err);
      setSubmitError(err.response?.data?.message || (lang === 'hi' ? 'Import fail ho gaya. Data check karein.' : 'Import failed. Please verify the CSV data.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-4xl w-full my-auto overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">{t.stock.importStock}</h2>
              <p className="text-xs text-slate-400">{t.stock.importStockDesc}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {submitError && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm font-semibold flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 shrink-0 text-rose-600" />
              <span>{submitError}</span>
            </div>
          )}

          {/* Action Cards: Download Template & Upload */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 flex flex-col justify-between gap-3">
              <div>
                <span className="font-bold text-slate-900 text-sm block">
                  {lang === 'hi' ? '1. Template CSV Download Karein' : '1. Download CSV Template'}
                </span>
                <span className="text-xs text-slate-600">
                  {lang === 'hi' ? 'Dozen + Pieces opening stock bharne ke liye sample template use karein.' : 'Use our formatted template with Dozen + Pieces structure.'}
                </span>
              </div>
              <button
                type="button"
                onClick={downloadSampleCsv}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 font-bold text-xs rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4 text-emerald-600" />
                <span>{t.stock.downloadTemplate}</span>
              </button>
            </div>

            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 flex flex-col justify-between gap-3">
              <div>
                <span className="font-bold text-slate-900 text-sm block">
                  {lang === 'hi' ? '2. CSV File Upload Karein' : '2. Upload Filled CSV'}
                </span>
                <span className="text-xs text-slate-600">
                  {lang === 'hi' ? 'Apni tayyar ki hui CSV file yahan browse karke select karein.' : 'Browse and select your filled CSV file from your device.'}
                </span>
              </div>
              <label className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-xs transition-colors cursor-pointer">
                <Upload className="w-4 h-4" />
                <span>{t.stock.uploadCsv}</span>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Direct CSV Text Area (Alternative) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {t.stock.pasteCsv} {lang === 'hi' ? '(Direct text paste)' : '(Or paste CSV content directly)'}
            </label>
            <textarea
              rows={3}
              value={fileContent}
              onChange={(e) => {
                setFileContent(e.target.value);
                parseCsvText(e.target.value);
              }}
              placeholder="Article Number,Product Name,Arabic Name,Category,Color,Size,Opening Dozen,Opening Pieces,Purchase Price,Selling Price,Reorder Level,Notes&#10;ART-101,Pure White Cotton,,Textiles,White,58,10,6,2.5,3.75,12,Opening"
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl font-mono text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-xs"
            />
          </div>

          {/* Parsed Rows Preview */}
          {rows.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-sm">
                  {lang === 'hi' ? `Parsed Products Preview (${rows.length} rows)` : `Parsed Products Preview (${rows.length} rows)`}
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  {validRows.length} {lang === 'hi' ? 'valid' : 'valid'} • {rows.length - validRows.length} {lang === 'hi' ? 'errors' : 'errors'}
                </span>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden max-h-60 overflow-y-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="sticky top-0 bg-slate-100 border-b border-slate-200 text-slate-700 font-bold uppercase">
                    <tr>
                      <th className="py-2 px-3">Row</th>
                      <th className="py-2 px-3">Article</th>
                      <th className="py-2 px-3">{lang === 'hi' ? 'Product Naam' : 'Product Name'}</th>
                      <th className="py-2 px-3">Category</th>
                      <th className="py-2 px-3 text-right">Dozen + Pcs</th>
                      <th className="py-2 px-3 text-right">Total Pcs</th>
                      <th className="py-2 px-3 text-right">Cost (KD)</th>
                      <th className="py-2 px-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {rows.map((r) => (
                      <tr
                        key={r.rowNum}
                        className={r.isValid ? 'hover:bg-slate-50' : 'bg-rose-50/50'}
                      >
                        <td className="py-2 px-3 text-slate-500">#{r.rowNum}</td>
                        <td className="py-2 px-3 font-bold text-slate-900">{r.articleNumber || '—'}</td>
                        <td className="py-2 px-3 font-semibold text-slate-800">{r.nameEn || '—'}</td>
                        <td className="py-2 px-3 text-slate-600">{r.categoryName || '—'}</td>
                        <td className="py-2 px-3 text-right font-medium">
                          {r.openingDozen} Doz {r.openingPieces} Pcs
                        </td>
                        <td className="py-2 px-3 text-right font-extrabold text-emerald-700">
                          {r.totalPcs} Pcs
                        </td>
                        <td className="py-2 px-3 text-right text-slate-700">
                          {r.purchasePrice.toFixed(3)}
                        </td>
                        <td className="py-2 px-3 text-center">
                          {r.isValid ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                              <CheckCircle2 className="w-3 h-3" /> Valid
                            </span>
                          ) : (
                            <span
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full"
                              title={r.errorMsg}
                            >
                              <XCircle className="w-3 h-3" /> {r.errorMsg}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Total Stock Summary Alert */}
              <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-800 block">
                    {lang === 'hi' ? 'Kul Opening Stock (Calculated)' : 'Total Opening Stock (Calculated)'}
                  </span>
                  <span className="text-xl font-black text-emerald-900">
                    {totalDoz} Dozen {totalPcsRem} Pcs
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-emerald-700 block">Total Pieces:</span>
                  <span className="text-xl font-black text-emerald-900">
                    {totalPiecesToImport.toLocaleString()} Pcs
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 font-bold text-sm hover:bg-white transition-colors cursor-pointer"
          >
            {t.common.cancel}
          </button>

          <button
            type="button"
            disabled={isSubmitting || validRows.length === 0 || rows.some((r) => !r.isValid)}
            onClick={handleSubmit}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow-xs transition-colors cursor-pointer text-sm disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>
              {isSubmitting
                ? (lang === 'hi' ? 'Import ho raha hai...' : 'Importing products...')
                : (lang === 'hi'
                    ? `${validRows.length} Products Import Karein & Stock Ledger me Dalein`
                    : `Import ${validRows.length} Products & Post to Stock Ledger`)}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   SHARED HELPERS
   ═══════════════════════════════════════════════════ */

function ModalOverlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="fixed inset-0" onClick={onClose}></div>
      <div className="relative z-10 w-full max-w-xl my-auto">{children}</div>
    </div>
  );
}

function FormField({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
        {label}
        {required && <span className="text-rose-500 ml-1 font-black">*</span>}
      </label>
      {children}
    </div>
  );
}
