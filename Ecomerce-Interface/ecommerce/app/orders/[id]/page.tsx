'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { orderAPI } from '@/lib/api';
import { isAuthenticated } from '@/lib/auth';
import { OrderResponseDTO } from '@/lib/types';

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(true);
  const [order, setOrder] = useState<OrderResponseDTO | null>(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }
    fetchOrder();
  }, [params.id]);

  const fetchOrder = async (): Promise<void> => {
    setLoading(true);
    try {
      const data = await orderAPI.getById(Number(params.id));
      setOrder(data);
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(price));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">Không tìm thấy đơn hàng</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Chi tiết đơn hàng #{/* @ts-ignore */ order.cartItems?.[0]?.productId ? order.cartItems[0].productId : ''}</h1>

      <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
        <p><strong>Trạng thái:</strong> {order.status}</p>
        <p><strong>Địa chỉ:</strong> {order.address || '—'}</p>
        <p><strong>Tổng tiền:</strong> {formatPrice(Number(order.totalPrice))}</p>

        <div>
          <h2 className="font-semibold mb-2">Sản phẩm</h2>
          <div className="space-y-3">
            {order.cartItems.map((item) => (
              <div key={item.productId} className="flex justify-between items-center border p-3 rounded">
                <div>
                  <div className="font-medium">{item.productName}</div>
                  <div className="text-sm text-gray-500">Số lượng: {item.quantity}</div>
                </div>
                <div className="font-semibold text-blue-600">{formatPrice(Number(item.price))}</div>
              </div>
            ))}
          </div>
        </div>

        {order.paymentUrl && (
          <a href={order.paymentUrl} target="_blank" rel="noreferrer" className="inline-block px-4 py-2 bg-green-600 text-white rounded">Thanh toán</a>
        )}
      </div>
    </div>
  );
}
