// Shared types mirroring backend DTOs
export interface CartItemDetailsResponseDTO {
  productId: number;
  productName: string;
  price: number; // BigDecimal -> number
  quantity: number; // Long -> number
}

export interface CartDetailsResponseDTO {
  cartItems: CartItemDetailsResponseDTO[];
}

export interface OrderSummaryDTO {
  id: number;
  createAt: string; // Date -> string
  status: string;
  totalPrice: number;
  paymentMethodName?: string;
  paymentUrl?: string | null;
  totalItems: number;
}

export interface OrderResponseDTO {
  cartItems: CartItemDetailsResponseDTO[];
  totalPrice: number;
  status: string; // enum -> string
  address?: string;
  paymentUrl?: string | null;
}

/**
 * Product DTO with support for:
 * - Backend uploaded images (stored as relative paths)
 * - External image URLs (Amazon, etc.)
 * - Product rating and rating count from database trigger
 */
export interface ProductDetailsResponseDTO {
  id: number;
  product_name: string;
  price: number;
  quantity: number;
  category?: string;
  description?: string;
  image?: string; // Can be relative path or full URL
  ratingCount?: number;
  rating?: number; // Average rating from reviews (0-5)
}

export type RatingEnum = 'ONE' | 'TWO' | 'THREE' | 'FOUR' | 'FIVE';
export interface ReviewResponseDTO {
  reviewId?: number; // Added to support deletion
  userName: string;
  productId: number;
  rate: RatingEnum;
  comment: string;
}

export interface PaymentMethodResponseDTO {
  RspCode: string;
  Message: string;
}

export interface PaymentMethodMessageResponseDTO {
  message: string;
}

export interface InvoiceResponseDTO {
  id: number;
  userId: number;
  orderId: number;
  totalAmount: number;
  createdAt: string; // Date -> string
}

export interface UserProfileDTO {
  id: number;
  email: string;
  address?: string;
  roles: string[];
}

export interface TokenDTO {
  access: string | null;
  refresh: string | null;
}

/**
 * Recommendation response from backend
 * Lists products similar to the queried product
 */
export interface RecommendationResponseDTO {
  recommendedProducts: ProductDetailsResponseDTO[];
  totalCount: number;
}

/**
 * User interaction event
 * Tracks when a user views/interacts with a product
 */
export interface UserInteractionDTO {
  userId: number;
  productId: number;
  createdAt: string;
}
