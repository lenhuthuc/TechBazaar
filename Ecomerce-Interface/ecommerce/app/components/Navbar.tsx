'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { isAuthenticated, isAdmin, removeTokens } from '@/lib/auth';
import { userAPI, cartAPI } from '@/lib/api';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);
  const [adminUser, setAdminUser] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setAuthenticated(isAuthenticated());
    setAdminUser(isAdmin());
    
    if (isAuthenticated()) {
      fetchCartCount();
    }
  }, [pathname]);

  const fetchCartCount = async () => {
    try {
      const data = await cartAPI.getItems();
      const count = Array.isArray(data) ? data.reduce((sum, item) => sum + (item.quantity || 0), 0) : 0;
      setCartCount(count);
    } catch (error) {
      console.error('Error fetching cart count:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await userAPI.logout();
      removeTokens();
      setAuthenticated(false);
      setAdminUser(false);
      setCartCount(0);
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-2xl font-bold text-blue-600 hover:text-blue-700 transition">
            E-Shop
          </Link>

          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-8">
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 transition font-medium"
            >
              Tìm
            </button>
          </form>

          <div className="flex items-center space-x-2 md:space-x-4">
            <Link href="/products" className="text-gray-700 hover:text-blue-600 font-medium transition text-sm md:text-base">
              Sản phẩm
            </Link>

            {authenticated ? (
              <>
                <Link 
                  href="/cart" 
                  className="relative text-gray-700 hover:text-blue-600 font-medium transition text-sm md:text-base"
                >
                  🛒
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </Link>

                <div className="hidden md:flex md:space-x-2">
                  <Link href="/orders" className="text-gray-700 hover:text-blue-600 font-medium transition text-sm">
                    Đơn hàng
                  </Link>
                  <Link href="/profile" className="text-gray-700 hover:text-blue-600 font-medium transition text-sm">
                    Tài khoản
                  </Link>
                  {adminUser && (
                    <Link href="/admin/users" className="text-gray-700 hover:text-blue-600 font-medium transition text-sm">
                      Quản trị
                    </Link>
                  )}
                </div>

                <button
                  onClick={handleLogout}
                  className="px-3 md:px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium text-sm md:text-base"
                >
                  Đăng xuất
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-gray-700 hover:text-blue-600 font-medium transition text-sm md:text-base">
                  Đăng nhập
                </Link>
                <Link href="/register" className="px-3 md:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm md:text-base">
                  Đăng ký
                </Link>
              </>
            )}
          </div>
        </div>

        <form onSubmit={handleSearch} className="md:hidden pb-4">
          <div className="flex">
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 transition font-medium"
            >
              Tìm
            </button>
          </div>
        </form>
      </div>
    </nav>
  );
}