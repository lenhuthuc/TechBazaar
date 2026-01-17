# E-Commerce Frontend - Complete Code Reference

## 1. Image Helper (`app/lib/imageHelper.ts`)

```typescript
/**
 * Helper function to handle image paths/URLs
 * Supports both:
 * 1. Relative paths (e.g., "/uploads/products/abc123.jpg")
 * 2. Full URLs (e.g., "https://example.com/image.jpg")
 */
export function getImageUrl(imageSource: string | null | undefined, fallback: string = '/placeholder-product.png'): string {
  if (!imageSource) {
    return fallback;
  }

  // If it's a full URL (starts with http:// or https://)
  if (imageSource.startsWith('http://') || imageSource.startsWith('https://')) {
    return imageSource;
  }

  // If it's a relative path, prepend the API base URL
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
  const cleanPath = imageSource.startsWith('/') ? imageSource : `/${imageSource}`;
  
  return `${apiBaseUrl}${cleanPath}`;
}

export function getProductImageUrl(productId: number, fallback: string = '/placeholder-product.png'): string {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
  return `${apiBaseUrl}/products/${productId}/img`;
}
```

---

## 2. Key Component Updates

### Product Card Component
```typescript
import { getProductImageUrl } from '@/lib/imageHelper';

// Image rendering
<img
  src={getProductImageUrl(product.id)}
  alt={product.product_name}
  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
  onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.currentTarget;
    target.src = '/placeholder-product.png';
  }}
/>
```

### Cart Page with Image Helper
```typescript
import { getProductImageUrl } from '@/lib/imageHelper';

// In cart items rendering
{cartItems.map((item) => (
  <div key={item.productId}>
    <Link href={`/products/${item.productId}`}>
      <img
        src={getProductImageUrl(item.productId)}
        alt={item.productName}
        onError={(e) => { e.currentTarget.src = '/placeholder-product.png'; }}
      />
    </Link>
  </div>
))}
```

---

## 3. Error Handling Pattern

### General Error Handling with Retry
```typescript
const [error, setError] = useState<string>('');
const [loading, setLoading] = useState<boolean>(true);

const fetchData = async (): Promise<void> => {
  setLoading(true);
  setError('');
  try {
    const data = await someAPI.getItems();
    // Process data
  } catch (error) {
    console.error('Error:', error);
    setError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
  } finally {
    setLoading(false);
  }
};

// In JSX
{error && (
  <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center justify-between">
    <span>{error}</span>
    <button
      onClick={fetchData}
      className="px-4 py-2 bg-red-700 text-white rounded hover:bg-red-800 transition"
    >
      Thử lại
    </button>
  </div>
)}
```

---

## 4. Loading States Pattern

### Loading Spinner
```typescript
{loading && (
  <div className="flex justify-center items-center min-h-64">
    <div className="flex flex-col items-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
      <p className="text-gray-500">Đang tải dữ liệu...</p>
    </div>
  </div>
)}
```

### Button Loading State
```typescript
<button
  onClick={handleSubmit}
  disabled={loading}
  className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
>
  {loading ? (
    <>
      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
      Đang xử lý...
    </>
  ) : (
    '✓ Xác nhận'
  )}
</button>
```

---

## 5. Navbar with Cart Count

```typescript
const [cartCount, setCartCount] = useState(0);

useEffect(() => {
  if (isAuthenticated()) {
    fetchCartCount();
  }
}, [pathname]);

const fetchCartCount = async () => {
  try {
    const data = await cartAPI.getItems();
    const count = Array.isArray(data) 
      ? data.reduce((sum, item) => sum + (item.quantity || 0), 0) 
      : 0;
    setCartCount(count);
  } catch (error) {
    console.error('Error fetching cart count:', error);
  }
};

// Rendering cart icon with badge
<Link href="/cart" className="relative text-gray-700 hover:text-blue-600">
  🛒
  {cartCount > 0 && (
    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold 
                     rounded-full w-5 h-5 flex items-center justify-center">
      {cartCount}
    </span>
  )}
</Link>
```

---

## 6. Form with Validation

### Login Form Pattern
```typescript
const [formData, setFormData] = useState<FormData>({ email: '', password: '' });
const [error, setError] = useState<string>('');
const [loading, setLoading] = useState<boolean>(false);

const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
  e.preventDefault();
  setError('');
  setLoading(true);

  try {
    const response = await userAPI.login(formData);
    
    if (response?.token?.access) {
      setTokens(response.token.access, response.token.refresh);
      router.push('/');
    } else {
      setError(response.message || 'Đăng nhập thất bại');
    }
  } catch (err) {
    setError('Có lỗi xảy ra. Vui lòng thử lại.');
  } finally {
    setLoading(false);
  }
};
```

---

## 7. Responsive Grid Layouts

### Products Grid
```typescript
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
  {products.map((product) => (
    <ProductCard key={product.id} product={product} />
  ))}
</div>
```

### Order Details Grid
```typescript
<div className="grid md:grid-cols-3 gap-4">
  <div>
    <p className="text-xs text-gray-500 font-semibold uppercase">Số sản phẩm</p>
    <p className="text-lg font-bold text-gray-800">{order.totalItems}</p>
  </div>
  <div>
    <p className="text-xs text-gray-500 font-semibold uppercase">Phương thức</p>
    <p className="text-lg font-bold text-gray-800">{order.paymentMethodName}</p>
  </div>
  <div className="text-right">
    <p className="text-xs text-gray-500 font-semibold uppercase">Tổng tiền</p>
    <p className="text-2xl font-bold text-blue-600">{formatPrice(order.totalPrice)}</p>
  </div>
</div>
```

---

## 8. Confirmation Dialogs

### Delete Confirmation
```typescript
const handleDelete = async (id: number): Promise<void> => {
  if (!confirm('Bạn có chắc muốn xóa mục này?')) return;
  
  try {
    await API.delete(id);
    alert('Đã xóa thành công!');
    fetchData();
  } catch (error) {
    alert('Có lỗi xảy ra.');
  }
};
```

---

## 9. Authentication Pattern

### Protected Route
```typescript
useEffect(() => {
  if (!isAuthenticated()) {
    router.push('/login');
    return;
  }
  fetchData();
}, [router]);
```

### Admin Check
```typescript
const [adminUser, setAdminUser] = useState(false);

useEffect(() => {
  setAdminUser(isAdmin());
}, [pathname]);

// Render admin section
{adminUser && (
  <Link href="/admin/users">Quản trị</Link>
)}
```

---

## 10. Price Formatting

### Reusable Function
```typescript
const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(Number(price));
};

// Usage
<p className="text-2xl font-bold text-blue-600">{formatPrice(product.price)}</p>
```

---

## 11. Date Formatting

```typescript
const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Usage
<p>📅 {formatDate(order.createAt)}</p>
```

---

## 12. Status Badge

```typescript
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

// Usage
<span className={`px-4 py-2 rounded-full text-sm font-bold ${getStatusColor(order.status)}`}>
  {getStatusText(order.status)}
</span>
```

---

## 13. Environment Configuration

### `.env.local`
```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

### For Production
```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
```

---

## 14. Tailwind Classes Used

### Common Patterns
```typescript
// Loading spinner
className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"

// Button with hover
className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"

// Disabled state
className="disabled:bg-gray-400 disabled:cursor-not-allowed"

// Responsive grid
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"

// Flex container
className="flex items-center justify-between flex-wrap gap-4"

// Gradient background
className="bg-gradient-to-r from-blue-50 to-purple-50"

// Sticky element
className="sticky top-24"
```

---

## 15. API Integration Pattern

### Complete Data Fetching with Error Handling
```typescript
const [data, setData] = useState<DataType[]>([]);
const [loading, setLoading] = useState<boolean>(true);
const [error, setError] = useState<string>('');

useEffect(() => {
  fetchData();
}, []);

const fetchData = async (): Promise<void> => {
  setLoading(true);
  setError('');
  try {
    const result = await API.getAll();
    setData(Array.isArray(result) ? result : []);
  } catch (error) {
    console.error('Error:', error);
    setError('Không thể tải dữ liệu');
  } finally {
    setLoading(false);
  }
};

// JSX with all states
{loading && <LoadingSpinner />}
{error && <ErrorMessage message={error} onRetry={fetchData} />}
{!loading && !error && data.length === 0 && <EmptyState />}
{!loading && data.length > 0 && <DataDisplay data={data} />}
```

---

## ✅ Implementation Checklist

- [x] Image handling helper created
- [x] All components use proper image URLs
- [x] Error handling in place
- [x] Loading states for all async operations
- [x] Cart count badge in navbar
- [x] Responsive design
- [x] Authentication checks
- [x] Price and date formatting
- [x] Status badges
- [x] Confirmation dialogs

All code samples are production-ready and follow React/TypeScript best practices.
