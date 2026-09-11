import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ProductImagePreviewProps {
  imageUrl: string;
  productName: string;
  articleNumber: string;
  onClose: () => void;
}

const ProductImagePreview: React.FC<ProductImagePreviewProps> = ({
  imageUrl,
  productName,
  articleNumber,
  onClose,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4 sm:p-8"
      onClick={onClose}
    >
      <div
        className="relative max-w-4xl w-full max-h-full flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-0 right-0 p-4 flex gap-4 -mt-12 sm:mt-0 sm:-mr-12">
          <button
            onClick={onClose}
            className="text-white hover:text-gray-300 transition-colors bg-black bg-opacity-50 rounded-full p-2"
            aria-label="Close preview"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="bg-white rounded overflow-hidden shadow-2xl w-full flex flex-col" style={{ maxHeight: '90vh' }}>
          <div className="flex-grow overflow-hidden flex items-center justify-center bg-gray-100 p-2 relative min-h-[300px]">
             <img
              src={imageUrl}
              alt={productName}
              className="max-w-full max-h-[70vh] object-contain"
            />
          </div>
          <div className="p-4 border-t bg-white">
            <h3 className="text-lg font-bold text-gray-800">{productName}</h3>
            <p className="text-sm text-gray-500">Article: {articleNumber}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductImagePreview;
