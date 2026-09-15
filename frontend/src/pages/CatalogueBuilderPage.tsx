import React, { useState, useEffect } from 'react';
import { BookOpen, AlertCircle, Trash2, Eye } from 'lucide-react';
import { type TemporaryCatalogueProduct, revokeProductImageUrls } from '../utils/catalogueUtils';
import { CatalogueProductForm } from '../components/catalogue/CatalogueProductForm';
import { CatalogueProductList } from '../components/catalogue/CatalogueProductList';
import { CataloguePreviewModal } from '../components/catalogue/CataloguePreviewModal';

export const CatalogueBuilderPage: React.FC = () => {
  const [products, setProducts] = useState<TemporaryCatalogueProduct[]>([]);
  const [editingProduct, setEditingProduct] = useState<TemporaryCatalogueProduct | undefined>(undefined);
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

  const handleUpdateProduct = (updatedProduct: TemporaryCatalogueProduct) => {
    setProducts((prev) => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
    setEditingProduct(undefined);
  };

  const handleEditProduct = (id: string) => {
    const target = products.find(p => p.id === id);
    if (target) {
      setEditingProduct(target);
    }
  };

  const handleCancelEdit = () => {
    setEditingProduct(undefined);
  };

  const handleRemoveProduct = (id: string) => {
    setProducts((prev) => {
      const target = prev.find(p => p.id === id);
      // Only revoke if this image is not being used by the editing product
      if (target && target.imageObjUrl && target.id !== editingProduct?.id) {
        URL.revokeObjectURL(target.imageObjUrl);
      }
      return prev.filter(p => p.id !== id);
    });
    if (editingProduct?.id === id) {
      setEditingProduct(undefined);
    }
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
    setEditingProduct(undefined);
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
        <div className="mt-3 flex items-start sm:items-center gap-2 bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold px-3 py-2 rounded-lg break-words">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5 sm:mt-0" />
          <span className="leading-relaxed">TEMPORARY CATALOGUE: This catalogue is not saved. Refreshing or closing this page will clear all products.</span>
        </div>
      </header>

      {/* Main Content Layout */}
      <div className="flex-1 p-6 flex flex-col lg:flex-row gap-6 max-w-[1600px] w-full mx-auto">
        
        {/* LEFT COLUMN: Add Product Form */}
        <div className="w-full lg:w-[400px] shrink-0">
          <CatalogueProductForm 
            onAddProduct={handleAddProduct}
            editingProduct={editingProduct}
            onUpdateProduct={handleUpdateProduct}
            onCancelEdit={handleCancelEdit}
          />
        </div>

        {/* RIGHT COLUMN: Temporary Product List & Actions */}
        <div className="flex-1 flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Action Bar */}
          <div className="bg-slate-50 border-b border-slate-200 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
              <div className="text-sm">
                <span className="text-slate-500 font-medium">Products Added: </span>
                <span className="font-bold text-slate-900">{products.length}</span>
              </div>
              <div className="text-sm">
                <span className="text-slate-500 font-medium">Total PDF Pages: </span>
                <span className="font-bold text-slate-900">{products.length === 0 ? 0 : totalPages}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              {products.length > 0 && (
                <>
                  <button
                    onClick={() => setShowClearConfirm(true)}
                    className="flex flex-1 md:flex-none items-center justify-center gap-1.5 px-3 py-2.5 min-h-touch text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4 shrink-0" />
                    <span>Clear Catalogue</span>
                  </button>
                  <button
                    onClick={() => setShowPreview(true)}
                    className="flex flex-1 md:flex-none items-center justify-center gap-1.5 px-4 py-2.5 min-h-touch text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 active:bg-sky-800 rounded-lg transition-colors shadow-xs"
                  >
                    <Eye className="w-4 h-4 shrink-0" />
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
              onEditProduct={handleEditProduct}
              onMoveUp={handleMoveUp}
              onMoveDown={handleMoveDown}
            />
          </div>
        </div>
      </div>

      {/* Clear Confirmation Dialog */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl max-w-[calc(100vw-24px)] sm:max-w-sm w-full p-6 animate-scale-in max-h-[90dvh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Clear current catalogue?</h3>
            <p className="text-sm text-slate-600 mb-6">
              All temporary products and uploaded images will be removed. This action cannot be undone.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="w-full sm:w-auto px-4 py-2.5 min-h-touch rounded-xl text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleClearCatalogue}
                className="w-full sm:w-auto px-4 py-2.5 min-h-touch rounded-xl text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 transition-colors shadow-xs"
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
