import React, { useState, useEffect } from 'react';
import { BookOpen, AlertCircle, Trash2, Eye } from 'lucide-react';
import { type TemporaryCatalogueProduct, revokeProductImageUrls } from '../utils/catalogueUtils';
import { CatalogueProductForm } from '../components/catalogue/CatalogueProductForm';
import { CatalogueProductList } from '../components/catalogue/CatalogueProductList';
import { CataloguePreviewModal } from '../components/catalogue/CataloguePreviewModal';

export const CatalogueBuilderPage: React.FC = () => {
  const [products, setProducts] = useState<TemporaryCatalogueProduct[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Warn user before leaving page if there are products
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (products.length > 0) {
        const msg = 'Catalogue is temporary. Leaving this page will clear the current catalogue.';
        e.returnValue = msg;
        return msg;
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [products.length]);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      revokeProductImageUrls(products);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddProduct = (product: TemporaryCatalogueProduct) => {
    setProducts((prev) => [...prev, product]);
  };

  const handleRemoveProduct = (id: string) => {
    setProducts((prev) => {
      const target = prev.find(p => p.id === id);
      if (target && target.imageObjUrl) {
        URL.revokeObjectURL(target.imageObjUrl);
      }
      return prev.filter(p => p.id !== id);
    });
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    setProducts((prev) => {
      const copy = [...prev];
      const temp = copy[index - 1];
      copy[index - 1] = copy[index];
      copy[index] = temp;
      return copy;
    });
  };

  const handleMoveDown = (index: number) => {
    if (index === products.length - 1) return;
    setProducts((prev) => {
      const copy = [...prev];
      const temp = copy[index + 1];
      copy[index + 1] = copy[index];
      copy[index] = temp;
      return copy;
    });
  };

  const handleClearCatalogue = () => {
    revokeProductImageUrls(products);
    setProducts([]);
    setShowClearConfirm(false);
  };

  const totalPages = products.length === 0 ? 0 : Math.ceil(products.length / 2) + 2;

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-100 overflow-y-auto">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 shrink-0">
        <div className="flex items-center gap-3 mb-1">
          <BookOpen className="w-6 h-6 text-sky-600" />
          <h1 className="text-xl font-bold text-slate-900">Catalogue Builder</h1>
        </div>
        <p className="text-sm text-slate-500">Create and export a temporary Rashidi Star wholesale catalogue.</p>
        
        {/* Warning Badge */}
        <div className="mt-3 inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold px-3 py-1.5 rounded-lg">
          <AlertCircle className="w-4 h-4 text-amber-600" />
          <span>TEMPORARY CATALOGUE: This catalogue is not saved. Refreshing or closing this page will clear all products.</span>
        </div>
      </header>

      {/* Main Content Layout */}
      <div className="flex-1 p-6 flex flex-col lg:flex-row gap-6 max-w-[1600px] w-full mx-auto">
        
        {/* LEFT COLUMN: Add Product Form */}
        <div className="w-full lg:w-[400px] shrink-0">
          <CatalogueProductForm onAddProduct={handleAddProduct} />
        </div>

        {/* RIGHT COLUMN: Temporary Product List & Actions */}
        <div className="flex-1 flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Action Bar */}
          <div className="bg-slate-50 border-b border-slate-200 p-4 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="text-sm">
                <span className="text-slate-500 font-medium">Products Added: </span>
                <span className="font-bold text-slate-900">{products.length}</span>
              </div>
              <div className="text-sm">
                <span className="text-slate-500 font-medium">Total PDF Pages: </span>
                <span className="font-bold text-slate-900">{products.length === 0 ? 0 : totalPages}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {products.length > 0 && (
                <>
                  <button
                    onClick={() => setShowClearConfirm(true)}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Clear Catalogue</span>
                  </button>
                  <button
                    onClick={() => setShowPreview(true)}
                    className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 active:bg-sky-800 rounded-lg transition-colors shadow-xs"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Preview & Export</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* List Area */}
          <div className="flex-1 p-4 overflow-y-auto bg-slate-100/50">
            <CatalogueProductList 
              products={products} 
              onRemoveProduct={handleRemoveProduct}
              onMoveUp={handleMoveUp}
              onMoveDown={handleMoveDown}
            />
          </div>
        </div>
      </div>

      {/* Clear Confirmation Dialog */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-sm w-full p-6 animate-in zoom-in-95">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Clear current catalogue?</h3>
            <p className="text-sm text-slate-600 mb-6">
              All temporary products and uploaded images will be removed. This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleClearCatalogue}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 transition-colors"
              >
                Clear Catalogue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && (
        <CataloguePreviewModal 
          products={products} 
          onClose={() => setShowPreview(false)} 
        />
      )}
    </div>
  );
};
