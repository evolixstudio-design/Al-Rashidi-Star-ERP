import React from 'react';
import { type TemporaryCatalogueProduct } from '../../utils/catalogueUtils';
import { ChevronUp, ChevronDown, Trash2 } from 'lucide-react';

interface CatalogueProductListProps {
  products: TemporaryCatalogueProduct[];
  onRemoveProduct: (id: string) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
}

export const CatalogueProductList: React.FC<CatalogueProductListProps> = ({ 
  products, 
  onRemoveProduct, 
  onMoveUp, 
  onMoveDown 
}) => {
  if (products.length === 0) {
    return (
      <div className="bg-slate-50 border border-slate-200 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-slate-400">
        <p className="text-sm font-medium">No products added yet.</p>
        <p className="text-xs mt-1">Add products using the form to build your catalogue.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {products.map((product, index) => (
        <div 
          key={product.id} 
          className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex items-center gap-4 transition-all hover:border-slate-300 hover:shadow-sm"
        >
          {/* Order controls */}
          <div className="flex flex-col gap-1">
            <button
              type="button"
              onClick={() => onMoveUp(index)}
              disabled={index === 0}
              className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded disabled:opacity-30 disabled:cursor-not-allowed"
              title="Move Up"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onMoveDown(index)}
              disabled={index === products.length - 1}
              className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded disabled:opacity-30 disabled:cursor-not-allowed"
              title="Move Down"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          {/* Thumbnail */}
          <div className="w-16 h-16 shrink-0 bg-slate-50 border border-slate-200 rounded-lg overflow-hidden flex items-center justify-center">
            <img 
              src={product.imageObjUrl} 
              alt={product.name} 
              className="w-full h-full object-contain"
            />
          </div>

          {/* Product Info */}
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-slate-900 truncate" title={product.name}>
              {product.name}
            </h4>
            <div className="text-xs text-slate-500 font-medium mt-0.5 truncate">
              Art: {product.articleNo}
            </div>
          </div>

          {/* Price & Actions */}
          <div className="flex items-center gap-4 text-right pl-2">
            <div>
              <div className="text-[10px] uppercase font-bold tracking-wider text-emerald-600">Wholesale</div>
              <div className="text-sm font-bold text-slate-900">
                {product.wholesalePrice.toFixed(3)} <span className="text-xs font-semibold text-slate-500">K.D.</span>
              </div>
            </div>
            
            <button
              type="button"
              onClick={() => onRemoveProduct(product.id)}
              className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              title="Remove Product"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
