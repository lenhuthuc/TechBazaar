# E-Commerce Frontend - Quick Start Guide

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager
- Backend API running on `http://localhost:8080`

---

## 📦 Installation

```bash
cd Ecomerce-Interface/ecommerce

# Install dependencies
npm install

# Create .env.local file
echo "NEXT_PUBLIC_API_URL=http://localhost:8080/api" > .env.local
```

---

## 🏃 Running the Project

### Development Mode
```bash
npm run dev
```
Visit: http://localhost:3000

### Production Build
```bash
npm run build
npm start
```

---

## 📁 Project Structure

```
ecommerce/
├── app/
│   ├── lib/
│   │   ├── imageHelper.ts        ← NEW: Image URL handling
│   │   ├── api.ts                ← API service
│   │   ├── auth.ts               ← Authentication utilities
│   │   └── types.ts              ← TypeScript types
│   ├── components/
│   │   ├── Navbar.tsx            ← Navigation (UPDATED)
│   │   ├── ProductCard.tsx       ← Product card (UPDATED)
│   │   ├── CartItem.tsx
│   │   ├── ReviewForm.tsx
│   │   └── AdminSidebar.tsx
│   ├── page.tsx                  ← Home page (UPDATED)
│   ├── login/page.tsx            ← Login page
│   ├── register/page.tsx         ← Register page
│   ├── products/
│   │   ├── page.tsx              ← Products list
│   │   └── [id]/page.tsx         ← Product detail (REWRITTEN)
│   ├── cart/page.tsx             ← Shopping cart (UPDATED)
│   ├── orders/page.tsx           ← Order history (UPDATED)
│   ├── profile/page.tsx          ← User profile
│   ├── invoices/page.tsx
│   ├── payments/
│   └── admin/
├── public/                       ← Static assets
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.ts
```

---

## 🎯 Key Features Implemented

### 1. Image Handling ✅
- Handles both relative paths and external URLs
- Automatic fallback to placeholder image
- Used throughout: ProductCard, ProductDetailPage, CartPage

**Usage:**
```typescript
import { getProductImageUrl } from '@/lib/imageHelper';

<img src={getProductImageUrl(productId)} alt="Product" />
```

### 2. Error Handling ✅
- All API calls have try-catch blocks
- User-friendly error messages
- Retry buttons on failed operations
- Error states in UI

### 3. Loading States ✅
- Loading spinners for all async operations
- Disabled buttons during operations
- Loading text messages

### 4. Shopping Cart ✅
- Add/remove items
- Update quantities
- Real-time subtotal calculation
- Cart count badge in navbar
- Checkout functionality

### 5. Product Reviews ✅
- View all reviews for a product
- Submit new reviews (authenticated users only)
- Star rating system (1-5 stars)
- Display reviewer name and comment

### 6. User Authentication ✅
- Login with email/password
- Register new account
- JWT token storage
- Protected routes
- Logout functionality

### 7. Order Management ✅
- View all user orders
- Order status tracking
- Payment links for pending orders
- Cancel orders
- Order details view

### 8. Responsive Design ✅
- Mobile-first approach
- Tablet and desktop optimization
- Touch-friendly buttons
- Proper spacing and padding

---

## 🔑 Main Pages

### Home Page (`/`)
- Featured products grid
- Hero banner with CTA
- Feature highlights section
- Error handling and retry

### Products Page (`/products`)
- Product listing with grid layout
- Search functionality
- Product cards with images
- Price and stock display

### Product Detail Page (`/products/[id]`)
- Product image and description
- Price and stock info
- Add to cart with quantity selector
- Reviews section
- Submit review form (authenticated)

### Cart Page (`/cart`)
- View all cart items
- Update quantities
- Remove items
- Cart summary
- Checkout button
- Continue shopping link

### Orders Page (`/orders`)
- View all user orders
- Order status tracking
- Payment links
- Cancel orders
- Order details link

### Login Page (`/login`)
- Email and password fields
- Error messages
- Link to register page

### Register Page (`/register`)
- Email, password, confirm password
- Form validation
- Link to login page

### Profile Page (`/profile`)
- View user information
- Edit profile
- Save changes

---

## 🛠️ API Integration

All API calls go through `app/lib/api.ts`:

### User API
```typescript
userAPI.login(credentials)      // Login
userAPI.register(userData)      // Register
userAPI.logout()                // Logout
userAPI.getProfile()            // Get profile
userAPI.updateProfile(id, data) // Update profile
userAPI.refreshToken()          // Refresh JWT
```

### Product API
```typescript
productAPI.getAll(page, size)           // Get all products
productAPI.getById(id)                  // Get product details
productAPI.getImage(id)                 // Get product image URL
productAPI.searchByName(name, page, size) // Search products
```

### Cart API
```typescript
cartAPI.getItems()              // Get cart items
cartAPI.updateItem(id, qty)     // Add/update item quantity
cartAPI.removeItem(id)          // Remove item from cart
```

### Order API
```typescript
orderAPI.create(paymentMethod)  // Create order
orderAPI.getMyOrders()          // Get user's orders
orderAPI.getById(id)            // Get order details
orderAPI.delete(id)             // Cancel order
```

### Review API
```typescript
reviewAPI.create(productId, data)    // Create review
reviewAPI.getByProduct(productId)    // Get product reviews
reviewAPI.delete(productId, reviewId) // Delete review
```

---

## 🔐 Authentication Flow

1. User enters email/password on login page
2. API validates and returns JWT token
3. Token stored in localStorage
4. Token automatically added to all API requests
5. On logout, token is removed
6. Protected pages redirect to login if not authenticated

---

## 📝 Environment Variables

### Required
```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

### Optional (for production)
```env
NODE_ENV=production
```

---

## 🎨 Styling

### Tailwind CSS
- All styling uses Tailwind CSS classes
- Responsive breakpoints: `sm`, `md`, `lg`, `xl`, `2xl`
- Custom colors and spacing defined in `tailwind.config.ts`
- Dark mode support available

### Common Tailwind Patterns Used
- Grid layouts: `grid`, `md:grid-cols-2`, `lg:grid-cols-3`
- Flexbox: `flex`, `items-center`, `justify-between`
- Spacing: `p-4`, `m-4`, `gap-4`
- Colors: `bg-blue-600`, `text-gray-800`, `border-gray-300`
- Transitions: `hover:`, `transition`, `duration-300`

---

## 🧪 Testing the Features

### Test Image Handling
1. Go to home page
2. Check if product images load correctly
3. Click product to see detail page image
4. Go to cart and verify cart item images

### Test Error Handling
1. Disconnect internet/stop backend
2. Try to fetch products
3. Should see error message with retry button
4. Click retry when backend is back

### Test Loading States
1. Open network throttling in DevTools
2. Navigate between pages
3. Should see loading spinners
4. Buttons should be disabled during operations

### Test Cart Functionality
1. Click "Add to Cart" on any product
2. Check navbar cart count badge
3. Go to cart page
4. Verify items and quantities
5. Update quantities and remove items
6. Proceed to checkout

### Test Authentication
1. Click "Đăng ký" (Register) link
2. Fill form and create account
3. Login with credentials
4. Go to profile and update info
5. Logout and verify redirect

### Test Order Management
1. Add products to cart
2. Click checkout
3. Go to orders page
4. See order in list
5. Click "Xem chi tiết" for details
6. Try to cancel (if pending)

---

## 🚨 Troubleshooting

### Issue: Images not loading
**Solution**: Check `NEXT_PUBLIC_API_URL` in `.env.local`
- Should be: `http://localhost:8080/api`
- Ensure backend is running

### Issue: Cannot login
**Solution**: Check backend is running and accessible
- Test: `curl http://localhost:8080/api/user/auth/login`

### Issue: Cart items disappear after refresh
**Solution**: Normal behavior - cart is server-side
- Add items again or implement client-side persistence

### Issue: Styles not loading
**Solution**: Clear Next.js cache and rebuild
```bash
rm -rf .next
npm run dev
```

### Issue: TypeScript errors
**Solution**: Run type check
```bash
npx tsc --noEmit
```

---

## 📚 Additional Documentation

For more details, see:
- [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) - Full feature overview
- [MODIFIED_FILES_LIST.md](./MODIFIED_FILES_LIST.md) - List of all changes
- [CODE_REFERENCE.md](./CODE_REFERENCE.md) - Code examples and patterns

---

## 🤝 Support

### Backend Integration
Ensure backend is running with:
- User endpoints: `/api/user/auth/login`, `/api/user/auth/register`
- Product endpoints: `/api/products`
- Cart endpoints: `/api/cart`
- Order endpoints: `/api/orders`
- Review endpoints: `/api/reviews`

### Database Requirements
- Users table with email/password
- Products table with name/price/quantity
- Cart table linked to users
- Orders table with status
- Reviews table for products

---

## ✅ Deployment Checklist

Before deploying to production:

- [ ] Update `NEXT_PUBLIC_API_URL` to production backend
- [ ] Build project: `npm run build`
- [ ] Test all features
- [ ] Check error handling
- [ ] Verify image loading
- [ ] Test authentication flow
- [ ] Check responsive design on mobile
- [ ] Clear browser cache and cookies
- [ ] Test on different browsers
- [ ] Set proper CORS headers on backend

---

## 🎉 You're Ready!

The frontend is now fully functional with:
- ✅ Proper image handling
- ✅ Error states and retry logic
- ✅ Loading indicators
- ✅ Cart functionality
- ✅ Authentication
- ✅ Order management
- ✅ Responsive design
- ✅ Product reviews

Happy coding! 🚀
