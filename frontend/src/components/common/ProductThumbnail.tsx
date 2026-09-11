import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Package } from 'lucide-react';
import ProductImagePreview from './ProductImagePreview';

interface ProductThumbnailProps {
  productId: number;
  articleNumber: string;
  productName: string;
  hasImage: boolean;
  imageUpdatedAt?: string | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
  disablePreview?: boolean;
}

const ProductThumbnail: React.FC<ProductThumbnailProps> = ({
  productId,
  articleNumber,
  productName,
  hasImage,
  imageUpdatedAt,
  size = 'sm',
  className = '',
  onClick,
  disablePreview = false,
}) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const [showPreview, setShowPreview] = useState<boolean>(false);

  useEffect(() => {
    let objectUrl: string | null = null;
    let isMounted = true;

    const fetchImage = async () => {
      if (!hasImage || !productId) return;

      setLoading(true);
      setError(false);
      try {
        const response = await api.get(`/products/${productId}/image`, {
          responseType: 'blob',
          params: { v: imageUpdatedAt ? new Date(imageUpdatedAt).getTime() : Date.now() },
        });

        if (isMounted) {
          objectUrl = URL.createObjectURL(response.data);
          setImageUrl(objectUrl);
        }
      } catch (err) {
        if (isMounted) {
          setError(true);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchImage();

    return () => {
      isMounted = false;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [productId, hasImage, imageUpdatedAt]);

  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      onClick();
      return;
    }
    if (!disablePreview && hasImage && !error && imageUrl) {
      e.stopPropagation();
      setShowPreview(true);
    }
  };

  return (
    <>
      <div
        className={`flex items-center justify-center bg-gray-100 rounded overflow-hidden flex-shrink-0 cursor-pointer ${sizeClasses[size]} ${className}`}
        onClick={handleClick}
        title={hasImage && !disablePreview ? 'Click to preview' : undefined}
      >
        {loading ? (
          <div className="animate-pulse bg-gray-200 w-full h-full" />
        ) : error || !hasImage || !imageUrl ? (
          <Package className="text-gray-400 w-1/2 h-1/2" />
        ) : (
          <img
            src={imageUrl}
            alt={productName || articleNumber}
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {showPreview && imageUrl && (
        <ProductImagePreview
          imageUrl={imageUrl}
          productName={productName}
          articleNumber={articleNumber}
          onClose={() => setShowPreview(false)}
        />
      )}
    </>
  );
};

export default ProductThumbnail;
