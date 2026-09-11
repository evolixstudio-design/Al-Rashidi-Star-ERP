import React, { useRef, useState } from 'react';
import { Upload, X, Camera } from 'lucide-react';
import api from '../../services/api';

interface ProductImageUploadProps {
  productId: number;
  hasImage: boolean;
  onUploadSuccess: (newUpdatedAt: string) => void;
  onRemoveSuccess?: () => void;
  className?: string;
}

const ProductImageUpload: React.FC<ProductImageUploadProps> = ({
  productId,
  hasImage,
  onUploadSuccess,
  onRemoveSuccess,
  className = '',
}) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setError('Image must be smaller than 10 MB.');
      return;
    }

    if (!file.type.startsWith('image/')) {
      setError('Unsupported image format.');
      return;
    }

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await api.post(`/products/${productId}/image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      if (response.data?.success) {
        onUploadSuccess(response.data.imageUpdatedAt || new Date().toISOString());
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Image upload failed. Please try again.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = async () => {
    if (!window.confirm('Remove this product photo?')) return;
    
    setUploading(true);
    setError(null);
    try {
      const response = await api.delete(`/products/${productId}/image`);
      if (response.data?.success && onRemoveSuccess) {
        onRemoveSuccess();
      }
    } catch (err: any) {
      setError('Failed to remove image.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div className="flex items-center gap-2">
        <input
          type="file"
          accept="image/jpeg, image/png, image/webp"
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileChange}
          disabled={uploading}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className={`flex items-center justify-center gap-2 bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded text-sm font-medium transition-colors ${
            uploading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {uploading ? (
            <span className="animate-pulse">Uploading...</span>
          ) : (
            <>
              {hasImage ? <Camera size={16} /> : <Upload size={16} />}
              {hasImage ? 'Change Image' : 'Add Image'}
            </>
          )}
        </button>
        {hasImage && onRemoveSuccess && (
          <button
            type="button"
            onClick={handleRemove}
            disabled={uploading}
            className="flex items-center justify-center gap-1 text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded text-sm font-medium transition-colors"
          >
            <X size={16} />
            Remove
          </button>
        )}
      </div>
      {error && <p className="text-red-500 text-xs">{error}</p>}
    </div>
  );
};

export default ProductImageUpload;
