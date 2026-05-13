/**
 * Tavia Customer App - Shared Types
 * Strictly matches Backend DTOs from tavia-tenant-service and tavia-crm-service
 */

// ============================================================
// ENUMS
// ============================================================

/** The 12 valid cities in the Tavia ecosystem. Matches com.tavia.crm_service.entity.City */
export enum City {
  ISTANBUL = 'ISTANBUL',
  ANKARA = 'ANKARA',
  IZMIR = 'IZMIR',
  BURSA = 'BURSA',
  ANTALYA = 'ANTALYA',
  ADANA = 'ADANA',
  KONYA = 'KONYA',
  SANLIURFA = 'SANLIURFA',
  GAZIANTEP = 'GAZIANTEP',
  KOCAELI = 'KOCAELI',
  ESKISEHIR = 'ESKISEHIR',
  ISPARTA = 'ISPARTA',
}

/** Display labels for city enum values */
export const CityDisplayLabels: Record<City, string> = {
  [City.ISTANBUL]: 'İstanbul',
  [City.ANKARA]: 'Ankara',
  [City.IZMIR]: 'İzmir',
  [City.BURSA]: 'Bursa',
  [City.ANTALYA]: 'Antalya',
  [City.ADANA]: 'Adana',
  [City.KONYA]: 'Konya',
  [City.SANLIURFA]: 'Şanlıurfa',
  [City.GAZIANTEP]: 'Gaziantep',
  [City.KOCAELI]: 'Kocaeli',
  [City.ESKISEHIR]: 'Eskişehir',
  [City.ISPARTA]: 'Isparta',
};

/** Matches com.tavia.tenant_service.entity.SubscriptionPlan */
export enum SubscriptionPlan {
  BASIC = 'BASIC',
  PRO = 'PRO',
  ENTERPRISE = 'ENTERPRISE',
}

/** Matches com.tavia.crm_service.entity.LoyaltyLevel */
export enum LoyaltyLevel {
  BRONZE = 'BRONZE',
  SILVER = 'SILVER',
  GOLD = 'GOLD',
  PLATINUM = 'PLATINUM',
}

// ============================================================
// BACKEND DTO INTERFACES
// ============================================================

/** Matches the generic ApiResponse wrapper from the backend */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

/** Matches com.tavia.tenant_service.dto.TenantResponse */
export interface TenantSummary {
  id: string;
  name: string;
  city: City;
  username: string;
  subscriptionPlan: SubscriptionPlan;
  isActive: boolean;
  createdAt: string;
}

/** Matches com.tavia.crm_service.dto.CustomerAuthResponse */
export interface CustomerAuthResponse {
  id: string;
  name: string;
  email: string;
  city: City;
}

/** Matches com.tavia.crm_service.dto.TenantLoyaltyDto */
export interface TenantLoyaltyDto {
  id: string;
  tenantId: string;
  loyaltyLevel: LoyaltyLevel;
  totalSpent: number;
}

// ============================================================
// AUTH REQUEST TYPES
// ============================================================

/** Matches com.tavia.crm_service.dto.CustomerRegisterRequest */
export interface CustomerRegisterRequest {
  name: string;
  email: string;
  password: string;
  city: string;
}

/** Matches com.tavia.crm_service.dto.CustomerLoginRequest */
export interface CustomerLoginRequest {
  email: string;
  password: string;
}

/** Matches com.tavia.crm_service.dto.ForgotPasswordRequest */
export interface ForgotPasswordRequest {
  email: string;
}

/** Matches com.tavia.crm_service.dto.ResetPasswordRequest */
export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

// ============================================================
// CATALOG TYPES (tavia-catalog-service)
// ============================================================

/** Matches com.tavia.catalog_service.enums.ProductCategory */
export enum ProductCategory {
  ESPRESSO_BASED = 'ESPRESSO_BASED',
  TEA = 'TEA',
  COLD_BEVERAGE = 'COLD_BEVERAGE',
  FOOD = 'FOOD',
  DESSERT = 'DESSERT',
}

/** Display labels for product categories */
export const ProductCategoryLabels: Record<ProductCategory, string> = {
  [ProductCategory.ESPRESSO_BASED]: 'Espresso',
  [ProductCategory.TEA]: 'Tea',
  [ProductCategory.COLD_BEVERAGE]: 'Cold Drinks',
  [ProductCategory.FOOD]: 'Food',
  [ProductCategory.DESSERT]: 'Dessert',
};

/** Matches com.tavia.catalog_service.dto.RecipeDto */
export interface RecipeDto {
  id: string;
  productName: string;
  displayName: string;
  category: ProductCategory;
  description: string | null;
  price: number | null;
  active: boolean;
}

// ============================================================
// ORDER TYPES (tavia-order-service)
// ============================================================

/** Matches com.tavia.order_service.dto.CreateOrderRequest */
export interface CreateOrderRequest {
  customerId: string;
  productName: string;
  quantity: number;
  price: number;
}

/** Matches com.tavia.order_service.dto.OrderDto */
export interface OrderResponse {
  id: string;
  tenantId: string;
  customerId: string;
  productName: string;
  quantity: number;
  price: number;
  orderDate: string;
}

// ============================================================
// COUPON TYPES (UI-local for now)
// ============================================================

export interface Coupon {
  id: string;
  code: string;
  title: string;
  description: string;
  discount: string;
  expiresAt: string;
  isUsed: boolean;
}
