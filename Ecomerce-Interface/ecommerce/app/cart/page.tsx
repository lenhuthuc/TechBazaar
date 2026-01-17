'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { cartAPI, orderAPI } from '@/lib/api';
import { isAuthenticated } from '@/lib/auth';
import { getProductImageUrl } from '@/lib/imageHelper';

interface CartItem {
  productId: number;
  productName: string;
  price: number;
  quantity: number;
}

export default function CartPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [checkoutLoading, setCheckoutLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }
    fetchCartItems();
  }, [router]);

  const fetchCartItems = async (): Promise<void> => {
    setLoading(true);
    setError('');
    try {
      const data = await cartAPI.getItems();
      setCartItems(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching cart items:', error);
      setError('Không thể tải giỏ hàng');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (productId: number, newQuantity: number): Promise<void> => {
    if (newQuantity < 1) return;
    
    try {
      await cartAPI.updateItem(productId, newQuantity);
      fetchCartItems();
    } catch (error) {
      console.error('Error updating quantity:', error);
      alert('Có lỗi xảy ra khi cập nhật số lượng');
    }
  };

  const handleRemoveItem = async (productId: number): Promise<void> => {
    if (!confirm('Bạn chắc chắn muốn xóa sản phẩm này?')) return;
    
    try {
      await cartAPI.removeItem(productId);
      fetchCartItems();
    } catch (error) {
      console.error('Error removing item:', error);
      alert('Có lỗi xảy ra khi xóa sản phẩm');
    }
  };

  const handleCheckout = async (): Promise<void> => {
    setCheckoutLoading(true);
    try {
      // Default payment method (1 = possibly VNPay or first method)
      const response = await orderAPI.create(1);
      alert('Đặt hàng thành công!');
      router.push('/orders');
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Có lỗi xảy ra khi đặt hàng');
    } finally {
      setCheckoutLoading(false);
    }
  };

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const calculateTotal = (): number => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-500">Đang tải giỏ hàng...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Giỏ hàng của bạn</h1>

      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {cartItems.length > 0 ? (
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div key={item.productId} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
                <div className="flex gap-6">
                  <Link href={`/products/${item.productId}`}>
                    <div className="w-24 h-24 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer hover:opacity-80 transition">
                      <img
                        src={getProductImageUrl(item.productId)}
                        alt={item.productName}
                        className="w-full h-full object-cover"
                        onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                          e.currentTarget.src = '/placeholder-product.png';
                        }}
                      />
                    </div>
                  </Link>

                  <div className="flex-1">
                    <Link href={`/products/${item.productId}`}>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2 hover:text-blue-600 transition cursor-pointer">
                        {item.productName}
                      </h3>
                    </Link>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <span className="text-blue-600 font-bold text-lg">
                          {formatPrice(item.price)}
                        </span>
                        
                        <div className="flex items-center border border-gray-300 rounded-lg">
                          <button
                            onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1)}
                            className="px-3 py-1 hover:bg-gray-100 transition"
                            title="Giảm số lượng"
                          >
                            −
                          </button>
                          <span className="px-4 py-1 border-x border-gray-300 font-semibold">{item.quantity}</span>
                          <button
                            onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)}
                            className="px-3 py-1 hover:bg-gray-100 transition"
                            title="Tăng số lượng"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-sm text-gray-600 mb-2">
                          Thành tiền: <span className="font-bold text-blue-600">{formatPrice(item.price * item.quantity)}</span>
                        </p>
                        <button
                          onClick={() => handleRemoveItem(item.productId)}
                          className="text-red-600 hover:text-red-700 font-medium hover:underline transition"
                        >
                          Xóa
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Tóm tắt đơn hàng</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Tạm tính ({cartItems.length} sản phẩm)</span>
                  <span>{formatPrice(calculateTotal())}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Phí vận chuyển</span>
                  <span className="text-green-600 font-medium">Miễn phí</span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Tổng cộng</span>
                    <span className="text-blue-600">{formatPrice(calculateTotal())}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={checkoutLoading}
                className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {checkoutLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Đang xử lý...
                  </>
                ) : (
                  '💳 Thanh toán'
                )}
              </button>

              <Link href="/products">
                <button className="w-full mt-3 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition">
                  ← Tiếp tục mua sắm
                </button>
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-lg shadow-md">
          <svg className="w-24 h-24 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <p className="text-gray-500 text-lg mb-6">Giỏ hàng của bạn đang trống</p>
          <Link href="/products">
            <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
              Bắt đầu mua sắm
            </button>
          </Link>
        </div>
      )}
    </div>
  );
}