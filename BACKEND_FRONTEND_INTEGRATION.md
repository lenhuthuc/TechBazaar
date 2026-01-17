# Backend & Frontend Integration Guide

## Overview
This document details the integration of new recommendation features and fixes for image handling across the full-stack e-commerce application.

---

## Backend Changes

### 1. New Controller: `UserInteractionController`
**File**: `src/main/java/com/trash/ecommerce/controller/UserInteractionController.java`

Exposes user interaction and personalized recommendation endpoints:

#### Endpoints:
- **POST** `/api/interactions/record?productId={id}`
  - Records a user viewing/interacting with a product
  - Builds user interaction history for recommendations
  - Requires authentication (Bearer token)

- **GET** `/api/interactions/my-recommendations`
  - Returns personalized product recommendations for current user
  - Uses user's interaction history
  - Calls `userInteractionService.getUserInteractions(userId)`
  - Returns `List<ProductDetailsResponseDTO>`

- **GET** `/api/interactions/product/{productId}`
  - Analytics endpoint: Shows all users who interacted with a product
  - Returns interaction count and data
  - Calls `userInteractionService.getProductInteractions(productId)`

---

### 2. Updated: `ProductController`
**File**: `src/main/java/com/trash/ecommerce/controller/ProductController.java`

Added new recommendation endpoint:

- **GET** `/api/products/{id}/recommendations`
  - Returns products similar to the specified product
  - Uses content-based recommendation system
  - Calls `productService.getProductsRecommendation(productId)`
  - Returns `List<ProductDetailsResponseDTO>`
  - Includes error handling and logging

---

## Frontend Changes

### 1. Enhanced Type Definitions
**File**: `app/lib/types.ts`

**Updates to `ProductDetailsResponseDTO`**:
```typescript
export interface ProductDetailsResponseDTO {
  id: number;
  product_name: string;
  price: number;
  quantity: number;
  category?: string;
  description?: string;
  image?: string; // ✨ NEW: Can be relative path or full URL
  ratingCount?: number;
  rating?: number; // ✨ NEW: Average rating from reviews (0-5)
}
```

**New Types Added**:
- `RecommendationResponseDTO` - Product recommendation responses
- `UserInteractionDTO` - User interaction event tracking

**Updated `ReviewResponseDTO`**:
- Added `reviewId?: number` - Allows clients to delete reviews

**Why**: Backend now returns product ratings from database triggers, and products can have external image URLs.

---

### 2. Improved Image Helper
**File**: `app/lib/imageHelper.ts`

**Key Functions**:

#### `resolveImageUrl(imageSource, fallback?)`
Universal resolver supporting:
- External URLs (Amazon, CDN): `https://m.media-amazon.com/...` → returned as-is
- Backend relative paths: `/uploads/abc123.jpg` → prefixed with API URL
- Legacy filenames: `abc123.jpg` → `/api/uploads/abc123.jpg`
- Invalid/null → fallback image

#### `getProductImageUrl(productId, fallback?)`
Product image endpoint: `/api/products/{productId}/img`
The backend can serve either uploaded images or external URLs.

#### New Helpers:
- `isExternalUrl()` - Check if image is from external source
- `isBackendImage()` - Check if image is backend-served
- Enhanced `isValidImageUrl()` - Validates all image types

**Why**: Products can now have images from Amazon, CDN, or uploaded to backend.

---

### 3. Updated ProductCard Component
**File**: `app/components/ProductCard.tsx`

**Key Improvements**:

```typescript
// ✨ Intelligent image loading
const getImageSrc = (): string => {
  if (product.image && !imageError) {
    return resolveImageUrl(product.image);
  }
  return getProductImageUrl(product.id);
};

// ✨ Better error handling
const [imageError, setImageError] = useState(false);
const handleImageError = () => {
  setImageError(true); // Fall back to endpoint
};

// ✨ Display product ratings
const renderRating = () => {
  if (!product.rating || product.rating === 0) return null;
  return (
    <div className="flex items-center gap-1 mt-2">
      <span className="text-yellow-500 text-sm font-semibold">
        ★ {product.rating.toFixed(1)}
      </span>
      {product.ratingCount && (
        <span className="text-gray-500 text-xs">({product.ratingCount})</span>
      )}
    </div>
  );
};
```

**What it fixes**:
- ✅ Loads external URLs (Amazon links) without breaking
- ✅ Falls back to backend endpoint if URL fails
- ✅ Displays product ratings
- ✅ Shows review count
- ✅ Cleaner error handling with state

---

### 4. API Client Updates
**File**: `app/lib/api.ts`

**New Methods in `productAPI`**:
```typescript
getRecommendations: async (productId: number) => {
  // GET /api/products/{productId}/recommendations
  // Returns similar products
}
```

**New Module: `userInteractionAPI`**:
```typescript
recordInteraction(productId)      // POST /api/interactions/record
getMyRecommendations()            // GET /api/interactions/my-recommendations
getProductInteractions(productId) // GET /api/interactions/product/{productId}
```

**Error Handling**: All methods catch errors and return sensible defaults (empty arrays/objects).

---

## How It Works End-to-End

### Scenario 1: User Views Product with External Image
1. Backend returns product with `image: "https://m.media-amazon.com/..."`
2. Frontend calls `resolveImageUrl(image)` → returns URL as-is
3. `<img src={url}` displays Amazon image correctly
4. If image fails, `onError` handler triggers fallback to backend endpoint

### Scenario 2: User Views Product with Uploaded Image
1. Backend returns product with `image: "uploads/abc123.jpg"` or null
2. Frontend calls `resolveImageUrl(image)` → returns `/api/uploads/abc123.jpg`
3. Or falls back to `/api/products/{id}/img` endpoint
4. Backend serves uploaded image

### Scenario 3: User Gets Product Recommendations
1. User views product → `recordInteraction(productId)` called
2. Recommendation engine builds user profile
3. `getMyRecommendations()` returns similar products
4. OR `productAPI.getRecommendations(productId)` shows similar items

### Scenario 4: Product Ratings
1. When user reviews product, trigger updates `product.rating` and `product.rating_count`
2. Frontend fetches product with updated rating
3. `ProductCard` displays `★ 4.5 (12 reviews)`

---

## API Response Examples

### Product Recommendations
```json
[
  {
    "id": 5,
    "product_name": "Similar Item",
    "price": 299000,
    "quantity": 50,
    "image": "https://amazon.com/...",
    "rating": 4.3,
    "ratingCount": 15
  }
]
```

### User Recommendations
```json
[
  {
    "id": 10,
    "product_name": "Recommended for You",
    "price": 599000,
    "rating": 4.8
  }
]
```

---

## Configuration

### Environment Variables (Frontend)
Ensure `.env.local` has:
```bash
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

### Backend Properties
No additional configuration needed - uses existing Spring Boot setup.

---

## Testing Checklist

### Backend
- [ ] Product recommendations endpoint returns similar items
- [ ] User interaction recording works
- [ ] User recommendations show up after interactions
- [ ] Rating trigger updates product rating after review

### Frontend
- [ ] External URLs (Amazon) load in ProductCard
- [ ] Local uploaded images load correctly
- [ ] Image error fallback works
- [ ] Product ratings display correctly
- [ ] Recommendation endpoints called successfully

---

## Best Practices

### For Images:
1. Store external URLs in `product.image` field
2. Let `resolveImageUrl()` handle detection
3. Always provide fallback image
4. Use `onError` handlers for graceful degradation

### For Recommendations:
1. Call `recordInteraction()` when user views/clicks product
2. Use `getMyRecommendations()` for personalized sections
3. Use `getRecommendations(productId)` for related items
4. Cache results client-side to reduce API calls

### For Error Handling:
1. Catch errors in API calls
2. Return sensible defaults (empty arrays)
3. Log errors to console
4. Don't break UI on failed requests

---

## Future Enhancements

1. **Image Optimization**: Add image resizing/compression for external URLs
2. **Caching**: Cache recommendations client-side
3. **Analytics**: Track which recommendations users click
4. **A/B Testing**: Test different recommendation algorithms
5. **Batch Loading**: Load recommendation data with product fetch
6. **Search Integration**: Include recommendations in search results
