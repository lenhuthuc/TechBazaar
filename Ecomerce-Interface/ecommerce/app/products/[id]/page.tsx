'use client';

import { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { productAPI, cartAPI, reviewAPI, userInteractionAPI } from '@/lib/api';
import { isAuthenticated } from '@/lib/auth';
import { getProductImageUrl, resolveImageUrl } from '@/lib/imageHelper';
import ProductCard from '@/components/ProductCard';

interface Product {
  id: number;
  product_name: string;
  price: number;
  quantity: number;
  description?: string;
  categoryName?: string;
  image?: string;
  rating?: number;
  ratingCount?: number;
}

interface Review {
  userName: string;
  productId: number;
  rate: number;
  comment: string;
}

interface ProductDetailsResponseDTO {
  id: number;
  product_name: string;
  price: number;
  quantity: number;
  category?: string;
  description?: string;
  image?: string;
  ratingCount?: number;
  rating?: number;
}



export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [quantity, setQuantity] = useState<number>(1);
  const [reviewText, setReviewText] = useState<string>('');
  const [rating, setRating] = useState<number>(5);
  const [addToCartLoading, setAddToCartLoading] = useState<boolean>(false);
  const [submitReviewLoading, setSubmitReviewLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [imageError, setImageError] = useState<boolean>(false);
  const [recommendations, setRecommendations] = useState<ProductDetailsResponseDTO[]>([]);
  const [recommendationsLoading, setRecommendationsLoading] = useState<boolean>(false);

  useEffect(() => {
    fetchProduct();
    fetchReviews();
    recordUserInteraction();
    fetchRecommendations();
  }, [params.id]);

  const recordUserInteraction = async (): Promise<void> => {
    if (!isAuthenticated()) {
      console.log('User not authenticated, skipping interaction tracking');
      return;
    }
    try {
      await userInteractionAPI.recordInteraction(Number(params.id));
      console.log('User interaction recorded');
    } catch (error) {
      console.error('Error recording interaction:', error);
    }
  };

  const fetchRecommendations = async (): Promise<void> => {
    setRecommendationsLoading(true);
    try {
      const data = await productAPI.getRecommendations(Number(params.id));
      setRecommendations(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      setRecommendations([]);
    } finally {
      setRecommendationsLoading(false);
    }
  };

  const fetchProduct = async (): Promise<void> => {
    setLoading(true);
    setError('');
    try {
      const data = await productAPI.getById(Number(params.id));
      setProduct(data);
    } catch (error) {
      console.error('Error fetching product:', error);
      setError('Không thể tải thông tin sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async (): Promise<void> => {
    try {
      const data = await reviewAPI.getByProduct(Number(params.id));
      console.log("Dữ liệu reviews nhận về:", data);
      console.log("Kiểu dữ liệu:", Array.isArray(data) ? "Là Array" : "Không phải Array");
      setReviews(data || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const handleAddToCart = async (): Promise<void> => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    if (!product) return;

    setAddToCartLoading(true);
    try {
      await cartAPI.updateItem(product.id, quantity);
      alert('Đã thêm vào giỏ hàng!');
      setQuantity(1);
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setAddToCartLoading(false);
    }
  };

  const handleSubmitReview = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    if (!reviewText.trim()) {
      alert('Vui lòng nhập đánh giá');
      return;
    }

    setSubmitReviewLoading(true);
    try {
      await reviewAPI.create(Number(params.id), {
        comment: reviewText,
        rate: rating,
      });
      setReviewText('');
      setRating(5);
      fetchReviews();
      alert('Đã gửi đánh giá!');
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setSubmitReviewLoading(false);
    }
  };

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(Number(price));
  };

  const getImageSrc = (): string => {
    // Try product.image field first with smart URL resolution
    if (product && product.image && !imageError) {
      return resolveImageUrl(product.image, '/placeholder-product.png');
    }
    // Fall back to dedicated endpoint
    return product ? getProductImageUrl(product.id, '/placeholder-product.png') : '/placeholder-product.png';
  };

  const handleImageError = () => {
    setImageError(true); // Fall back to endpoint on next render
  };

  const renderRating = () => {
    if (!product || !product.rating || product.rating === 0) return null;
    return (
      <div className="flex items-center gap-1 mt-2">
        <span className="text-yellow-500 text-sm font-semibold">
          ★ {product.rating.toFixed(1)}
        </span>
        {product.ratingCount && (
          <span className="text-gray-500 text-xs">({product.ratingCount})</span>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-500">Đang tải sản phẩm...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded-lg mb-4">
          {error || 'Không thể tải sản phẩm'}
        </div>
        <Link href="/products" className="text-blue-600 hover:text-blue-700 font-medium">
          ← Quay lại danh sách sản phẩm
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Product Details */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Image */}
        <div className="flex items-center justify-center bg-gray-100 rounded-lg overflow-hidden">
          <img
            src={getImageSrc()}
            alt={product.product_name}
            className="w-full h-96 object-cover"
            onError={handleImageError}
          />
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <Link href="/products" className="text-blue-600 hover:text-blue-700 text-sm font-medium mb-2 inline-block">
              ← Quay lại
            </Link>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{product.product_name}</h1>
            {renderRating()}
            {product.categoryName && (
              <span className="inline-block mt-4 px-4 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                {product.categoryName}
              </span>
            )}
          </div>

          <div className="bg-blue-50 p-6 rounded-lg">
            <p className="text-gray-600 text-sm mb-2">Giá bán</p>
            <p className="text-4xl font-bold text-blue-600">{formatPrice(product.price)}</p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-600 mb-2">
              Kho hàng: <span className="font-semibold text-gray-800">{product.quantity} sản phẩm</span>
            </p>
            {product.quantity <= 0 && (
              <p className="text-red-600 font-semibold">Hết hàng</p>
            )}
          </div>

          {product.description && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-2 font-semibold">Mô tả:</p>
              <p className="text-gray-700">{product.description}</p>
            </div>
          )}

          {/* Add to Cart */}
          {product.quantity > 0 && (
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <label className="text-gray-700 font-medium">Số lượng:</label>
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 hover:bg-gray-100 transition"
                    disabled={addToCartLoading}
                  >
                    −
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-16 text-center border-l border-r border-gray-300 py-2"
                    min="1"
                    max={product.quantity}
                    disabled={addToCartLoading}
                  />
                  <button
                    onClick={() => setQuantity(Math.min(product.quantity, quantity + 1))}
                    className="px-3 py-2 hover:bg-gray-100 transition"
                    disabled={addToCartLoading}
                  >
                    +
                  </button>
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={addToCartLoading || product.quantity <= 0}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {addToCartLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Đang thêm...
                  </>
                ) : (
                  '🛒 Thêm vào giỏ hàng'
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Reviews Section */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800">Đánh giá sản phẩm</h2>

        {/* Add Review Form */}
        {isAuthenticated() && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Chia sẻ đánh giá của bạn</h3>
            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Đánh giá</label>
                <select
                  value={rating}
                  onChange={(e) => setRating(parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={submitReviewLoading}
                >
                  <option value={5}>⭐⭐⭐⭐⭐ Rất tốt</option>
                  <option value={4}>⭐⭐⭐⭐ Tốt</option>
                  <option value={3}>⭐⭐⭐ Bình thường</option>
                  <option value={2}>⭐⭐ Không tốt</option>
                  <option value={1}>⭐ Rất không tốt</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nhận xét</label>
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Nhập nhận xét của bạn..."
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={submitReviewLoading}
                />
              </div>

              <button
                type="submit"
                disabled={submitReviewLoading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {submitReviewLoading ? 'Đang gửi...' : 'Gửi đánh giá'}
              </button>
            </form>
          </div>
        )}

        {!isAuthenticated() && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
            <p className="text-gray-700 mb-4">Vui lòng đăng nhập để chia sẻ đánh giá</p>
            <Link
              href="/login"
              className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Đăng nhập
            </Link>
          </div>
        )}

        {/* Reviews List */}
        <div className="space-y-4">
          {reviews.length === 0 ? (
            <p className="text-center text-gray-500 py-8">Chưa có đánh giá nào</p>
          ) : (
            reviews.map((review, idx) => (
              <div key={idx} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-gray-800">{review.userName}</h4>
                  <span className="text-yellow-500">
                    {'⭐'.repeat(review.rate)}
                  </span>
                </div>
                <p className="text-gray-700">{review.comment}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Recommendations Section */}
      <div className="space-y-6 border-t pt-8">
        <h2 className="text-2xl font-bold text-gray-800">Sản phẩm gợi ý tương tự</h2>

        {recommendationsLoading && (
          <div className="flex justify-center items-center min-h-64">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-500">Đang tải sản phẩm gợi ý...</p>
            </div>
          </div>
        )}

        {!recommendationsLoading && recommendations.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">Không có sản phẩm gợi ý nào</p>
          </div>
        )}

        {!recommendationsLoading && recommendations.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {recommendations.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}