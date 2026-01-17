'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { paymentAPI } from '@/lib/api';

export default function VnPayReturnPage() {
  const [loading, setLoading] = useState<boolean>(true);
  const [message, setMessage] = useState<string>('');
  const searchParams = useSearchParams();

  useEffect(() => {
    const qs = searchParams.toString();
    (async () => {
      setLoading(true);
      try {
        const res = await paymentAPI.handleVnPayReturn(qs);
        setMessage(res?.message || JSON.stringify(res));
      } catch (e) {
        console.error(e);
        setMessage('Có lỗi khi xử lý thanh toán');
      } finally {
        setLoading(false);
      }
    })();
  }, [searchParams]);

  if (loading) return <div className="flex justify-center items-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Kết quả thanh toán</h1>
      <p className="text-gray-700">{message}</p>
    </div>
  );
}
