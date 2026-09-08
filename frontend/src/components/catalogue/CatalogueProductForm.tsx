import React, { useState, useRef } from 'react';
import { Image as ImageIcon, Plus } from 'lucide-react';
import { type TemporaryCatalogueProduct } from '../../utils/catalogueUtils';

interface CatalogueProductFormProps {
  onAddProduct: (product: TemporaryCatalogueProduct) => void;
}

export const CatalogueProductForm: React.FC<CatalogueProductFormProps> = ({ onAddProduct }) => {
  const [name, setName] = useState('');
  const [articleNo, setArticleNo] = useState('');
  const [priceStr, setPriceStr] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setErrorMsg('Unsupported image format. Please use JPG, PNG, or WEBP.');
      return;
    }

    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    const objUrl = URL.createObjectURL(file);
    setImageFile(file);
    setImagePreview(objUrl);
    setErrorMsg(null);
  };

  const handleAdd = () => {
    if (!imageFile || !imagePreview) {
      setErrorMsg('Product Image is required.');
      return;
    }
    if (!name.trim()) {
      setErrorMsg('Product Name is required.');
      return;
    }
    if (!articleNo.trim()) {
      setErrorMsg('Article No. is required.');
      return;
    }
    const priceNum = parseFloat(priceStr);
    if (isNaN(priceNum) || priceNum < 0) {
      setErrorMsg('Wholesale Price must be a valid positive number.');
      return;
    }

    const newProduct: TemporaryCatalogueProduct = {
      id: Math.random().toString(36).substring(2, 9),
      imageObjUrl: imagePreview,
      name: name.trim(),
      articleNo: articleNo.trim(),
      wholesalePrice: priceNum,
    };

    onAddProduct(newProduct);

    // Reset form fields
    setName('');
    setArticleNo('');
    setPriceStr('');
    setImageFile(null);
    setImagePreview(null);
    setErrorMsg(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
      <h3 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider">Add New Product</h3>
      
      {errorMsg && (
        <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
          {errorMsg}
        </div>
      )}

      <div className="space-y-4">
        {/* Product Image */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
            Product Image
          </label>
          <div 
            className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center cursor-pointer hover:bg-slate-50 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            {imagePreview ? (
              <img src={imagePreview} alt="Preview" className="mx-auto max-h-32 object-contain rounded-md shadow-xs" />
            ) : (
              <div className="flex flex-col items-center gap-2 text-slate-500">
                <ImageIcon className="w-8 h-8 text-slate-400" />
                <span className="text-xs font-medium">Click to upload image (JPG, PNG, WEBP)</span>
              </div>
            )}
            <input 
              type="file" 
              accept=".jpg,.jpeg,.png,.webp"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileChange}
            />
          </div>
        </div>

        {/* Product Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
            Product Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors"
            placeholder="e.g. Premium Wholesale Dates"
          />
        </div>

        {/* Article No. */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
            Article No.
          </label>
          <input
            type="text"
            value={articleNo}
            onChange={(e) => setArticleNo(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors"
            placeholder="e.g. ART-10024"
          />
        </div>

        {/* Wholesale Price */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
            Wholesale Price
          </label>
          <div className="relative">
            <input
              type="number"
              min="0"
              step="0.001"
              value={priceStr}
              onChange={(e) => setPriceStr(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors"
              placeholder="0.000"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 select-none">
              K.D.
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleAdd}
          className="w-full mt-2 py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold text-sm shadow-xs transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Product</span>
        </button>
      </div>
    </div>
  );
};
