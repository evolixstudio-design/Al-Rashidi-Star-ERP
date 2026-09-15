import React, { useState, useRef, useEffect } from 'react';
import { Image as ImageIcon, Plus, Edit2, X } from 'lucide-react';
import { type TemporaryCatalogueProduct } from '../../utils/catalogueUtils';

interface CatalogueProductFormProps {
  onAddProduct: (product: TemporaryCatalogueProduct) => void;
  editingProduct?: TemporaryCatalogueProduct;
  onUpdateProduct?: (product: TemporaryCatalogueProduct) => void;
  onCancelEdit?: () => void;
}

// Extracted to module scope so React sees a stable component identity across re-renders.
// When this was defined inside CatalogueProductForm, every keystroke recreated the
// component function, causing React to unmount/remount every InputField — stealing focus.
const InputField: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  optional?: boolean;
  type?: string;
  suffix?: React.ReactNode;
}> = ({ label, value, onChange, placeholder, optional = false, type = 'text', suffix }) => (
  <div>
    <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
      {label}
      {optional && (
        <span className="text-slate-400 font-normal lowercase tracking-normal ml-1">(Optional)</span>
      )}
    </label>
    <div className="relative">
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors"
        placeholder={placeholder}
        min={type === 'number' ? '0' : undefined}
        step={type === 'number' ? '0.001' : undefined}
      />
      {suffix && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 select-none">
          {suffix}
        </div>
      )}
    </div>
  </div>
);

export const CatalogueProductForm: React.FC<CatalogueProductFormProps> = ({ 
  onAddProduct,
  editingProduct,
  onUpdateProduct,
  onCancelEdit
}) => {
  const [name, setName] = useState('');
  const [articleNo, setArticleNo] = useState('');
  const [priceStr, setPriceStr] = useState('');
  const [size, setSize] = useState('');
  const [colour, setColour] = useState('');
  const [quality, setQuality] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Populate form when editingProduct changes
  useEffect(() => {
    if (editingProduct) {
      setName(editingProduct.name);
      setArticleNo(editingProduct.articleNo || '');
      setPriceStr(editingProduct.wholesalePrice !== undefined ? editingProduct.wholesalePrice.toString() : '');
      setSize(editingProduct.size || '');
      setColour(editingProduct.colour || '');
      setQuality(editingProduct.quality || '');
      setImagePreview(editingProduct.imageObjUrl);
      setImageFile(null); // we don't have the original file, just the blob URL
      setErrorMsg(null);
    } else {
      // Reset when not editing
      setName('');
      setArticleNo('');
      setPriceStr('');
      setSize('');
      setColour('');
      setQuality('');
      setImageFile(null);
      setImagePreview(null);
      setErrorMsg(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [editingProduct]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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

    let parsedPrice: number | undefined = undefined;
    if (priceStr.trim()) {
      const priceNum = parseFloat(priceStr);
      if (!isNaN(priceNum) && priceNum >= 0) {
        parsedPrice = priceNum;
      } else {
        setErrorMsg('Wholesale Price must be a valid positive number if provided.');
        return;
      }
    }

    const newProduct: TemporaryCatalogueProduct = {
      id: editingProduct ? editingProduct.id : Math.random().toString(36).substring(2, 9),
      imageObjUrl: imagePreview,
      name: name.trim(),
      articleNo: articleNo.trim() || undefined,
      wholesalePrice: parsedPrice,
      size: size.trim() || undefined,
      colour: colour.trim() || undefined,
      quality: quality.trim() || undefined,
    };

    if (editingProduct && onUpdateProduct) {
      onUpdateProduct(newProduct);
    } else {
      onAddProduct(newProduct);
      // Reset only if adding. If updating, parent handles resetting editingProduct which triggers useEffect
      setName('');
      setArticleNo('');
      setPriceStr('');
      setSize('');
      setColour('');
      setQuality('');
      setImageFile(null);
      setImagePreview(null);
      setErrorMsg(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
          {editingProduct ? 'Update Product' : 'Add New Product'}
        </h3>
        {editingProduct && onCancelEdit && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
      
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
        <InputField
          label="Product Name"
          value={name}
          onChange={setName}
          placeholder="e.g. Premium Wholesale Dates"
        />

        {/* Two-column grid for compact optional fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputField
            label="Article No."
            value={articleNo}
            onChange={setArticleNo}
            placeholder="e.g. ART-10024"
            optional
          />
          <InputField
            label="Wholesale Price"
            value={priceStr}
            onChange={setPriceStr}
            placeholder="0.000"
            optional
            type="number"
            suffix="K.D."
          />
        </div>

        {/* Divider */}
        <div className="border-t border-slate-200 pt-4">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Product Details</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputField
            label="Size"
            value={size}
            onChange={setSize}
            placeholder={'e.g. Free Size, S/M/L/XL, 58"'}
            optional
          />
          <InputField
            label="Colour"
            value={colour}
            onChange={setColour}
            placeholder="e.g. All Colours, White"
            optional
          />
        </div>

        <InputField
          label="Quality / Material"
          value={quality}
          onChange={setQuality}
          placeholder="e.g. Premium Quality, Japanese Cotton"
          optional
        />



        <button
          type="button"
          onClick={handleAdd}
          className="w-full mt-2 py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold text-sm shadow-xs transition-colors flex items-center justify-center gap-2"
        >
          {editingProduct ? <Edit2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          <span>{editingProduct ? 'Update Product' : 'Add Product'}</span>
        </button>
      </div>
    </div>
  );
};
