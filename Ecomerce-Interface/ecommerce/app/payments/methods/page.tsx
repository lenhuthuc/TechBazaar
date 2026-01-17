'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { paymentAPI } from '@/lib/api';
import { isAuthenticated } from '@/lib/auth';

export default function PaymentMethodsPage() {
  const router = useRouter();
  const [name, setName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
    }
  }, [router]);

  const handleAdd = async () => {
    if (!name.trim()) {
      setMessage('Vui lòng nhập tên phương thức');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const res = await paymentAPI.addPaymentMethod(name);
      setMessage(res?.message || 'Thêm phương thức thành công');
      setName('');
    } catch (e) {
      console.error('Error adding payment method:', e);
      setMessage('Không thể thêm phương thức. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      handleAdd();
    }
  };

  if (!isAuthenticated()) {
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">
        Quản lý phương thức thanh toán
      </h1>

      <div className="bg-white p-6 rounded-lg shadow">
        <div className="space-y-4">
          <div>
            <label 
              htmlFor="payment-name" 
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Tên phương thức
            </label>
            <input
              id="payment-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ví dụ: VNPay, MoMo, COD..."
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            />
          </div>

          <button
            onClick={handleAdd}
            disabled={loading || !name.trim()}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Đang thêm...' : 'Thêm phương thức'}
          </button>

          {message && (
            <div
              className={`p-3 rounded-md text-sm ${
                message.includes('thành công')
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}