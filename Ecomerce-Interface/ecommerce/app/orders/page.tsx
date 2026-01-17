'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { orderAPI } from '@/lib/api';
import { isAuthenticated } from '@/lib/auth';

type OrderSummary = {
  id: number;
  createAt: string;
  status: string;
  totalPrice: number;
  paymentMethodName?: string;
  paymentUrl?: string | null;
  totalItems: number;
}

export default function OrdersPage() {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }
    fetchOrders();
  }, [router]);

  const fetchOrders = async (): Promise<void> => {
    setLoading(true);
    setError('');
    try {
      const data: OrderSummary[] = await orderAPI.getMyOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Không thể tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(Number(price));
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      'PENDING': 'bg-yellow-100 text-yellow-800',
      'PROCESSING': 'bg-blue-100 text-blue-800',
      'SHIPPED': 'bg-purple-100 text-purple-800',
      'DELIVERED': 'bg-green-100 text-green-800',
      'CANCELLED': 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status: string): string => {
    const statusMap: Record<string, string> = {
      'PENDING': 'Chờ xử lý',
      'PROCESSING': 'Đang xử lý',
      'SHIPPED': 'Đang giao',
      'DELIVERED': 'Đã giao',
      'CANCELLED': 'Đã hủy',
    };
    return statusMap[status] || status;
  };

  const handleCancelOrder = async (orderId: number): Promise<void> => {
    if (!confirm('Bạn có chắc muốn hủy đơn hàng này?')) return;

    setCancellingId(orderId);
    try {
      await orderAPI.delete(orderId);
      fetchOrders();
      alert('Đã hủy đơn hàng!');
    } catch (error) {
      console.error('Error cancelling order:', error);
      alert('Có lỗi xảy ra khi hủy đơn hàng');
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-500">Đang tải danh sách đơn hàng...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Đơn hàng của tôi</h1>

      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={fetchOrders}
            className="px-4 py-2 bg-red-700 text-white rounded hover:bg-red-800 transition"
          >
            Thử lại
          </button>
        </div>
      )}

      {orders.length > 0 ? (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-6 py-4 border-b">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-semibold text-gray-600">Đơn hàng #{order.id}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      📅 {formatDate(order.createAt)}
                    </p>
                  </div>
                  <span className={`px-4 py-2 rounded-full text-sm font-bold ${getStatusColor(order.status)}`}>
                    {getStatusText(order.status)}
                  </span>
                </div>
              </div>

              <div className="px-6 py-4">
                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-500 font-semibold uppercase">Số sản phẩm</p>
                    <p className="text-lg font-bold text-gray-800">{order.totalItems} sản phẩm</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-semibold uppercase">Phương thức thanh toán</p>
                    <p className="text-lg font-bold text-gray-800">{order.paymentMethodName || 'Chưa xác định'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 font-semibold uppercase">Tổng tiền</p>
                    <p className="text-2xl font-bold text-blue-600">{formatPrice(Number(order.totalPrice))}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 px-6 py-4 border-t flex items-center justify-between flex-wrap gap-4">
                <Link href={`/orders/${order.id}`} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium">
                  Xem chi tiết
                </Link>

                {order.status === 'PENDING' && order.paymentUrl && (
                  <a 
                    href={order.paymentUrl} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
                  >
                    💳 Thanh toán
                  </a>
                )}

                {order.status === 'PENDING' && (
                  <button
                    onClick={() => handleCancelOrder(order.id)}
                    disabled={cancellingId === order.id}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {cancellingId === order.id ? 'Đang hủy...' : '❌ Hủy đơn'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-lg shadow-md">
          <svg className="w-24 h-24 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-gray-500 text-lg mb-6">Bạn chưa có đơn hàng nào</p>
          <Link href="/products">
            <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium">
              🛍️ Bắt đầu mua sắm
            </button>
          </Link>
        </div>
      )}
    </div>
  );
}