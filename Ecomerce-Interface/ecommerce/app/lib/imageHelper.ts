/**
 * Enhanced image URL resolution helper
 * Supports:
 * 1. Full URLs (http://, https://) - returned as-is
 * 2. Relative backend paths (/uploads/...) - prefixed with API URL
 * 3. Legacy backend file references (filename.jpg) - prefixed with API URL
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

/**
 * Universal image URL resolver
 * Intelligently handles both uploaded backend images and external URLs
 * 
 * @param imageSource - Image path or URL from backend
 * @param fallback - Fallback image if source is invalid
 * @returns Resolved image URL ready for <img> src
 */
export function getImageUrl(
  imageSource: string | null | undefined, 
  fallback: string = '/placeholder-product.png'
): string {
  if (!imageSource || imageSource.trim() === '') {
    return fallback;
  }

  // If it's a full URL (starts with http:// or https://)
  // Return as-is (supports Amazon, CDN, or any external service)
  if (imageSource.startsWith('http://') || imageSource.startsWith('https://')) {
    return imageSource;
  }

  // If it's a relative path (starts with /), use as-is with API base
  if (imageSource.startsWith('/')) {
    // Avoid double-slashing
    return `${API_BASE_URL}${imageSource}`;
  }

  // Otherwise, assume it's a filename and prefix with uploads path
  // This handles legacy format: "abc123_image.jpg" -> "/api/products/{id}/img"
  return `${API_BASE_URL}/uploads/${imageSource}`;
}

/**
 * Generate product image URL from product ID
 * Backend serves product images at: /api/products/{id}/img
 * This endpoint handles both uploaded images and external URLs
 * 
 * @param productId - Product ID to fetch image for
 * @param fallback - Fallback if image unavailable
 * @returns Product image endpoint URL
 */
export function getProductImageUrl(
  productId: number, 
  fallback: string = '/placeholder-product.png'
): string {
  if (!productId || productId <= 0) {
    return fallback;
  }
  return `${API_BASE_URL}/products/${productId}/img`;
}

/**
 * Resolve image URL with intelligent fallback handling
 * Used in <img> onError handlers
 * 
 * @param imageSource - Original image source
 * @param fallback - Fallback image
 * @returns Resolved URL or fallback
 */
export function resolveImageUrl(
  imageSource: string | null | undefined,
  fallback: string = '/placeholder-product.png'
): string {
  return getImageUrl(imageSource, fallback);
}

/**
 * Check if a URL is valid (basic check)
 * Used to validate image URLs before rendering
 */
export function isValidImageUrl(url: string): boolean {
  if (!url || url.trim() === '') {
    return false;
  }
  
  try {
    // Full URLs are always valid if they parse correctly
    if (url.startsWith('http://') || url.startsWith('https://')) {
      new URL(url);
      return true;
    }
    // Relative paths are valid
    if (url.startsWith('/') || url.includes('/')) {
      return true;
    }
    // Filenames are valid
    return url.length > 0;
  } catch {
    return false;
  }
}

/**
 * Check if image source is an external URL
 * @param imageSource - Image path or URL
 * @returns true if it's an external URL (http/https)
 */
export function isExternalUrl(imageSource: string | null | undefined): boolean {
  if (!imageSource) return false;
  return imageSource.startsWith('http://') || imageSource.startsWith('https://');
}

/**
 * Check if image source is a backend-served image
 * @param imageSource - Image path or URL
 * @returns true if it's a backend path (/uploads/... or filename)
 */
export function isBackendImage(imageSource: string | null | undefined): boolean {
  if (!imageSource) return false;
  return !isExternalUrl(imageSource);
}
