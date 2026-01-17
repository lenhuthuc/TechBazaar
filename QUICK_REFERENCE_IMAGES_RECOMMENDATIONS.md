# Quick Reference: Image Handling & Recommendations

## Frontend Image Loading

### Basic Usage
```typescript
import { resolveImageUrl, getProductImageUrl } from '@/lib/imageHelper';

// For any image source (external URL, relative path, or filename)
const imageSrc = resolveImageUrl(product.image);

// For product images specifically
const productImageUrl = getProductImageUrl(productId);
```

### In Components
```typescript
<img 
  src={resolveImageUrl(product.image)}
  alt={product.product_name}
  onError={(e) => {
    e.currentTarget.src = '/placeholder-product.png';
  }}
/>
```

### ProductCard Example (Already Updated)
```typescript
const getImageSrc = (): string => {
  if (product.image && !imageError) {
    return resolveImageUrl(product.image);
  }
  return getProductImageUrl(product.id);
};

<img src={getImageSrc()} onError={handleImageError} />
```

---

## Backend Recommendation APIs

### ProductController
```bash
# Get similar products (content-based)
GET /api/products/{id}/recommendations
Response: List<ProductDetailsResponseDTO>
```

### UserInteractionController
```bash
# Record user view/interaction
POST /api/interactions/record?productId={id}
Headers: Authorization: Bearer {token}
Response: { message: "Interaction recorded successfully" }

# Get personalized recommendations for current user
GET /api/interactions/my-recommendations
Headers: Authorization: Bearer {token}
Response: List<ProductDetailsResponseDTO>

# Get interaction stats for a product (admin)
GET /api/interactions/product/{productId}
Response: { count: number, data: List<UserInteractions> }
```

---

## Frontend API Usage

### Get Similar Products
```typescript
import { productAPI } from '@/lib/api';

const recommendations = await productAPI.getRecommendations(productId);
```

### Record User Interaction
```typescript
import { userInteractionAPI } from '@/lib/api';

// When user clicks/views a product
await userInteractionAPI.recordInteraction(productId);
```

### Get User Recommendations
```typescript
const personalizedRecs = await userInteractionAPI.getMyRecommendations();
```

---

## Image URL Detection

```typescript
import { 
  isExternalUrl,      // true if URL starts with http/https
  isBackendImage,     // true if local path or filename
  isValidImageUrl     // true if URL structure is valid
} from '@/lib/imageHelper';

if (isExternalUrl(product.image)) {
  // Amazon, CDN, etc.
} else if (isBackendImage(product.image)) {
  // Uploaded or backend-served
}
```

---

## ProductDetailsResponseDTO Structure

```typescript
{
  id: 1,
  product_name: "Product Name",
  price: 299000,
  quantity: 50,
  category: "Electronics",           // ✨ NEW/Enhanced
  description: "...",                // ✨ NEW/Enhanced
  image: "https://amazon.com/..." or "/uploads/abc.jpg",  // ✨ NEW
  rating: 4.5,                      // ✨ NEW (0-5 scale)
  ratingCount: 12                    // ✨ NEW
}
```

---

## Error Handling Examples

### Safe Image Loading
```typescript
const handleImageError = () => {
  setImageError(true);
  // Falls back to /api/products/{id}/img
};

<img 
  src={getImageSrc()}
  onError={handleImageError}
  alt="Product"
/>
```

### Safe API Calls
```typescript
try {
  const recs = await productAPI.getRecommendations(id);
  return recs || [];
} catch (error) {
  console.error('Failed to load recommendations:', error);
  return [];
}
```

---

## Database Integration (Backend)

### Product Table Updates
```sql
-- These columns now populated by trigger on review insert
ALTER TABLE product ADD COLUMN rating DECIMAL(3,1) DEFAULT 0;
ALTER TABLE product ADD COLUMN rating_count INT DEFAULT 0;

-- Trigger automatically updates these when reviews are added/deleted
CREATE TRIGGER update_rating_after_review
AFTER INSERT ON review
FOR EACH ROW
BEGIN
  UPDATE product
  SET rating = (SELECT AVG(rating) FROM review WHERE product_id = NEW.product_id),
      rating_count = (SELECT COUNT(*) FROM review WHERE product_id = NEW.product_id)
  WHERE id = NEW.product_id;
END;
```

### Product Entity (Java)
```java
@Column(name = "rating", precision = 3, scale = 1)
private BigDecimal rating = BigDecimal.ZERO;

@Column(name = "rating_count")
private Integer ratingCount = 0;
```

---

## Common Issues & Solutions

### Issue: External URLs Not Loading
**Cause**: ImageHelper not recognizing URL  
**Solution**: Check if URL starts with `http://` or `https://`
```typescript
console.log(isExternalUrl(product.image)); // Should be true
```

### Issue: Backend Images Not Loading
**Cause**: Relative path incorrect  
**Solution**: Ensure API_BASE_URL is set in `.env.local`
```bash
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

### Issue: Recommendations Not Appearing
**Cause**: User interactions not recorded  
**Solution**: Call `recordInteraction()` when user views product
```typescript
useEffect(() => {
  userInteractionAPI.recordInteraction(productId);
}, [productId]);
```

### Issue: Ratings Not Updating
**Cause**: Database trigger not executing  
**Solution**: Verify trigger exists and database has rating columns
```sql
SHOW TRIGGERS WHERE Trigger = 'update_rating_after_review';
```

---

## Testing Recommendations

### Frontend Tests
```typescript
// Test image URL resolution
expect(resolveImageUrl('https://example.com/img.jpg'))
  .toBe('https://example.com/img.jpg');

expect(resolveImageUrl('uploads/test.jpg'))
  .toContain('/api/uploads/test.jpg');

// Test recommendation API
const recs = await productAPI.getRecommendations(1);
expect(recs).toBeInstanceOf(Array);
```

### Backend Tests
```java
// Test recommendation endpoint
mockMvc.perform(get("/api/products/1/recommendations"))
  .andExpect(status().isOk())
  .andExpect(jsonPath("$", hasSize(greaterThan(0))));

// Test interaction recording
mockMvc.perform(post("/api/interactions/record?productId=1")
  .header("Authorization", "Bearer " + token))
  .andExpect(status().isOk());
```

---

## Performance Tips

1. **Cache Recommendations**: Don't fetch on every render
   ```typescript
   const [recs, setRecs] = useState(null);
   useEffect(() => {
     if (!recs) {
       userInteractionAPI.getMyRecommendations().then(setRecs);
     }
   }, []);
   ```

2. **Lazy Record Interactions**: Debounce/throttle to avoid too many requests
   ```typescript
   const recordInteractionDebounced = debounce(
     (id) => userInteractionAPI.recordInteraction(id),
     500
   );
   ```

3. **Batch Load Images**: Preload recommended product images
   ```typescript
   recommendations.forEach(rec => {
     const img = new Image();
     img.src = resolveImageUrl(rec.image);
   });
   ```

---

## Links & References

- **Recommendation System**: `RecommandSystem-ConentBased/app/recommender.py`
- **Product Service**: `Ecommerce/src/.../service/ProductServiceImpl.java`
- **User Interaction Service**: `Ecommerce/src/.../service/UserInteractionServiceImpl.java`
- **Database Schema**: `Ecommerce/ecommerceDB.sql`
- **Frontend Config**: `Ecomerce-Interface/ecommerce/.env.local`
