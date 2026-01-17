'use client';

import Link from 'next/link';
import { isAdmin } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminIndexPage() {
  const router = useRouter();

  useEffect(() => {
    if (!isAdmin()) {
      router.push('/');
    }
  }, [router]);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Bảng điều khiển Admin</h1>
      <p className="text-gray-600 mb-6">Chọn mục quản lý nhanh bên trái hoặc dùng các liên kết dưới đây.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/admin/users" className="block p-4 bg-white rounded shadow hover:shadow-lg">
          <h2 className="font-bold">Quản lý người dùng</h2>
          <p className="text-sm text-gray-500">Xem, sửa, xóa người dùng</p>
        </Link>

        <Link href="/admin/products" className="block p-4 bg-white rounded shadow hover:shadow-lg">
          <h2 className="font-bold">Quản lý sản phẩm</h2>
          <p className="text-sm text-gray-500">Thêm, cập nhật, xóa sản phẩm</p>
        </Link>

        <Link href="/invoices" className="block p-4 bg-white rounded shadow hover:shadow-lg">
          <h2 className="font-bold">Hóa đơn</h2>
          <p className="text-sm text-gray-500">Tạo và quản lý hóa đơn</p>
        </Link>

        <Link href="/orders" className="block p-4 bg-white rounded shadow hover:shadow-lg">
          <h2 className="font-bold">Đơn hàng</h2>
          <p className="text-sm text-gray-500">Xem đơn hàng (người dùng hiện tại)</p>
        </Link>

        <Link href="/payments/methods" className="block p-4 bg-white rounded shadow hover:shadow-lg">
          <h2 className="font-bold">Phương thức thanh toán</h2>
          <p className="text-sm text-gray-500">Thêm phương thức thanh toán</p>
        </Link>
      </div>
    </div>
  );
}
