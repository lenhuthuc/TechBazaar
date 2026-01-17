'use client';

import { useEffect, useState } from 'react';
import { orderAPI, invoiceAPI } from '@/lib/api';
import { isAuthenticated } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { OrderSummaryDTO, InvoiceResponseDTO } from '@/lib/types';

export default function InvoicesPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<OrderSummaryDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [creatingFor, setCreatingFor] = useState<number | null>(null);
  const [paymentMethodId, setPaymentMethodId] = useState<number>(1);
  const [createdInvoice, setCreatedInvoice] = useState<InvoiceResponseDTO | null>(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }
    fetchOrders();
  }, [router]);

  const fetchOrders = async (): Promise<void> => {
    setLoading(true);
    try {
      const data: OrderSummaryDTO[] = await orderAPI.getMyOrders();
      setOrders(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInvoice = async (orderId: number) => {
    setCreatingFor(orderId);
    try {
      const inv: InvoiceResponseDTO = await invoiceAPI.create(orderId, paymentMethodId);
      setCreatedInvoice(inv);
      alert('Hóa đơn đã được tạo');
    } catch (e) {
      console.error(e);
      alert('Không thể tạo hóa đơn');
    } finally {
      setCreatingFor(null);
    }
  };

  if (loading) return <div className="flex justify-center items-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Hóa đơn của tôi</h1>

      {orders.length === 0 ? (
        <div className="text-gray-500">Bạn chưa có đơn hàng nào để tạo hóa đơn.</div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white p-4 rounded shadow flex items-center justify-between">
              <div>
                <div className="font-semibold">Đơn hàng #{order.id}</div>
                <div className="text-sm text-gray-500">Tổng: {new Intl.NumberFormat('vi-VN',{style:'currency',currency:'VND'}).format(Number(order.totalPrice))}</div>
              </div>

              <div className="flex items-center space-x-3">
                <select value={paymentMethodId} onChange={(e) => setPaymentMethodId(Number(e.target.value))} className="border rounded px-2 py-1">
                  <option value={1}>Tiền mặt (1)</option>
                  <option value={2}>VNPay (2)</option>
                </select>

                <button onClick={() => handleCreateInvoice(order.id)} className="px-4 py-2 bg-blue-600 text-white rounded">{creatingFor === order.id ? 'Đang...' : 'Tạo hóa đơn'}</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {createdInvoice && (
        <div className="bg-green-50 border border-green-200 p-4 rounded">
          <div>Hóa đơn #{createdInvoice.id} được tạo thành công.</div>
        </div>
      )}
    </div>
  );
}