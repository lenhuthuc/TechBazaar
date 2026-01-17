'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { productAPI, userInteractionAPI } from '@/lib/api';
import ProductCard from '@/components/ProductCard';
import { isAuthenticated } from '@/lib/auth';

interface Product {
  id: number;
  product_name: string;
  price: number;
  quantity: number;
  categoryName?: string;
  category?: string;
  description?: string;
  image?: string;
  ratingCount?: number;
  rating?: number;
}

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [recommendationsLoading, setRecommendationsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [showRecommendations, setShowRecommendations] = useState<boolean>(false);

  useEffect(() => {
    fetchProducts();
    if (isAuthenticated()) {
      fetchRecommendations();
    }
  }, []);

  const fetchProducts = async (): Promise<void> => {
    setLoading(true);
    setError('');
    try {
      const data = await productAPI.getAll(0, 12);
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Không thể tải sản phẩm. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendations = async (): Promise<void> => {
    setRecommendationsLoading(true);
    try {
      const data = await userInteractionAPI.getMyRecommendations();
      setRecommendations(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      setRecommendations([]);
    } finally {
      setRecommendationsLoading(false);
    }
  };

  return (
    <div className="space-y-12">
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl p-12 text-center">
        <h1 className="text-5xl font-bold mb-4">Chào mừng đến E-Shop</h1>
        <p className="text-xl mb-8">Khám phá hàng ngàn sản phẩm chất lượng với giá tốt nhất</p>
        <Link
          href="/products"
          className="inline-block px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition"
        >
          Xem tất cả sản phẩm
        </Link>
      </section>

      <section>
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <h2 className="text-3xl font-bold text-gray-800">
              {isAuthenticated() && showRecommendations ? 'Sản phẩm được gợi ý cho bạn' : 'Sản phẩm nổi bật'}
            </h2>
            {isAuthenticated() && recommendations.length > 0 && (
              <div className="flex gap-2">
                <button
                  onClick={() => setShowRecommendations(false)}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    !showRecommendations
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Nổi bật
                </button>
                <button
                  onClick={() => setShowRecommendations(true)}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    showRecommendations
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Dành cho bạn
                </button>
              </div>
            )}
          </div>
          <Link href="/products" className="text-blue-600 hover:text-blue-700 font-medium">
            Xem tất cả →
          </Link>
        </div>

        {showRecommendations && isAuthenticated() ? (
          <>
            {recommendationsLoading && (
              <div className="flex justify-center items-center min-h-64">
                <div className="flex flex-col items-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                  <p className="text-gray-500">Đang tải sản phẩm gợi ý...</p>
                </div>
              </div>
            )}

            {!recommendationsLoading && recommendations.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">Không có sản phẩm gợi ý nào. Hãy xem thêm sản phẩm để nhận gợi ý!</p>
              </div>
            )}

            {!recommendationsLoading && recommendations.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {recommendations.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            {loading && (
              <div className="flex justify-center items-center min-h-64">
                <div className="flex flex-col items-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                  <p className="text-gray-500">Đang tải sản phẩm...</p>
                </div>
              </div>
            )}

            {error && (
              <div className="mb-8 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center justify-between">
                <span>{error}</span>
                <button
                  onClick={fetchProducts}
                  className="px-4 py-2 bg-red-700 text-white rounded hover:bg-red-800 transition"
                >
                  Thử lại
                </button>
              </div>
            )}

            {!loading && !error && products.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">Không có sản phẩm nào</p>
              </div>
            )}

            {!loading && products.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </>
        )}
      </section>

      <section className="grid md:grid-cols-3 gap-8 py-12">
        <div className="text-center p-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-2">Chất lượng đảm bảo</h3>
          <p className="text-gray-600">Sản phẩm chính hãng 100%</p>
        </div>

        <div className="text-center p-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-2">Giá tốt nhất</h3>
          <p className="text-gray-600">Cam kết giá rẻ nhất thị trường</p>
        </div>

        <div className="text-center p-6">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-2">Giao hàng nhanh</h3>
          <p className="text-gray-600">Miễn phí vận chuyển toàn quốc</p>
        </div>
      </section>
    </div>
  );
}