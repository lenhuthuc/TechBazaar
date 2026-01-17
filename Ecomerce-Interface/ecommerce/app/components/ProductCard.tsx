'use client';

import Link from 'next/link';
import Image from 'next/image';
import { getProductImageUrl, resolveImageUrl } from '@/lib/imageHelper';
import { useState } from 'react';

interface Product {
  id: number;
  product_name: string;
  price: number;
  quantity: number;
  category?: string;
  description?: string;
  image?: string; // Can be relative path or external URL
  ratingCount?: number;
  rating?: number; // Average rating from reviews
}

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [imageError, setImageError] = useState(false);

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(Number(price));
  };

  /**
   * Resolve image URL handling both:
   * 1. Product.image field (if available) - can be external URL or relative path
   * 2. Backend image endpoint - /api/products/{id}/img
   * 3. Fallback to placeholder
   */
  const getImageSrc = (): string => {
    // If product has image field, use resolved URL
    if (product.image && !imageError) {
      return resolveImageUrl(product.image, '/placeholder-product.png');
    }
    // Fall back to dedicated product image endpoint
    return getProductImageUrl(product.id, '/placeholder-product.png');
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const renderRating = () => {
    if (!product.rating || product.rating === 0) return null;
    
    return (
      <div className="flex items-center gap-1 mt-2">
        <span className="text-yellow-500 text-sm font-semibold">★ {product.rating.toFixed(1)}</span>
        {product.ratingCount && (
          <span className="text-gray-500 text-xs">({product.ratingCount})</span>
        )}
      </div>
    );
  };

  return (
    <Link href={`/products/${product.id}`}>
      <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden group cursor-pointer">
        <div className="relative w-full aspect-square bg-gray-200 overflow-hidden">
          <img
            src={getImageSrc()}
            alt={product.product_name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            onError={handleImageError}
          />
          {product.quantity <= 0 && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <span className="text-white font-bold text-lg">Hết hàng</span>
            </div>
          )}
        </div>

        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2 group-hover:text-blue-600 transition">
            {product.product_name}
          </h3>

          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-blue-600">
              {formatPrice(product.price)}
            </span>

            <span className="text-sm text-gray-500">
              Còn: {product.quantity}
            </span>
          </div>

          {/* Display product rating */}
          {renderRating()}

          {product.category && (
            <div className="mt-3">
              <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                {product.category}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}