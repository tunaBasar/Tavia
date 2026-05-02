// ─── City Enum ───────────────────────────────────────────────────
export const CITY_VALUES = [
  "ISTANBUL",
  "ANKARA",
  "IZMIR",
  "BURSA",
  "ANTALYA",
  "ADANA",
  "KONYA",
  "SANLIURFA",
  "GAZIANTEP",
  "KOCAELI",
  "ESKISEHIR",
  "ISPARTA",
] as const;

export type City = (typeof CITY_VALUES)[number];

// ─── Subscription Plan Enum ──────────────────────────────────────
export type SubscriptionPlan = "BASIC" | "PRO" | "ENTERPRISE";

// ─── Loyalty Level Enum ──────────────────────────────────────────
export type LoyaltyLevel = "BRONZE" | "SILVER" | "GOLD" | "PLATINUM";

// ─── Auth / Tenant ───────────────────────────────────────────────

/**
 * Matches backend: TenantCreateRequest
 * Fields: name, city (City enum), username, password, subscriptionPlan
 */
export interface RegisterTenantRequest {
  name: string;
  city: City;
  username: string;
  password: string;
  subscriptionPlan: SubscriptionPlan;
}

/**
 * Matches backend: TenantLoginRequest
 * Fields: username, password
 */
export interface LoginTenantRequest {
  username: string;
  password: string;
}

/**
 * Matches backend: TenantResponse
 * Fields: id (UUID), name, city (City enum), username, subscriptionPlan, isActive, createdAt
 */
export interface Tenant {
  id: string;
  name: string;
  city: City;
  username: string;
  subscriptionPlan: SubscriptionPlan;
  isActive: boolean;
  createdAt: string;
}

// ─── API Response Wrapper ────────────────────────────────────────

/**
 * Matches backend: ApiResponse<T>
 * Fields: success, message, data
 * Note: tenant-service also has `timestamp` but context/crm/order services do not.
 * We keep it optional.
 */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp?: string;
}

// ─── Customer ────────────────────────────────────────────────────

/**
 * Matches backend: CustomerDto (crm-service)
 * Fields: id (UUID), name, email, city, loyaltyLevel, totalSpentInThisTenant
 */
export interface Customer {
  id: string;
  name: string;
  email: string;
  city: City;
  loyaltyLevel: LoyaltyLevel;
  totalSpentInThisTenant: number;
}

/**
 * Matches backend: CreateCustomerRequest (crm-service)
 */
export interface CreateCustomerRequest {
  name: string;
  email: string;
  city: City;
  tenantId: string;
  totalSpent?: number;
  loyaltyLevel?: string;
}

// ─── Context ─────────────────────────────────────────────────────

/**
 * Matches backend: ContextDto (context-service)
 * Fields: weather, activeEvent, competitorIntensity
 * Endpoint: GET /api/v1/context (no path params)
 */
export interface ContextData {
  weather: string;
  activeEvent: string;
  competitorIntensity: string;
}

// ─── Order ───────────────────────────────────────────────────────

/**
 * Matches backend: CreateOrderRequest (order-service)
 * Fields: tenantId (UUID), customerId (UUID, optional), productName, quantity, price (BigDecimal)
 * Note: Backend accepts a SINGLE product per order (flat structure), NOT an items array.
 */
export interface CreateOrderPayload {
  tenantId: string;
  customerId?: string;
  productName: string;
  quantity: number;
  price: number;
}

/**
 * Matches backend: OrderDto (order-service)
 * Fields: id (UUID), tenantId (UUID), customerId (UUID), productName, quantity, price, orderDate
 */
export interface Order {
  id: string;
  tenantId: string;
  customerId: string;
  productName: string;
  quantity: number;
  price: number;
  orderDate: string;
}

// ─── Inventory (Raw Materials — DDD) ─────────────────────────────

/**
 * Matches backend: RawMaterialDto (inventory-service)
 * Fields: id (UUID), tenantId (UUID), name, unit (UnitType enum), stockQuantity
 * Per GEMINI.md §2.2: Inventory tracks ONLY raw materials, never final products.
 */
export type UnitType = "MILLILITER" | "GRAM" | "PIECE";

export interface InventoryItem {
  id: string;
  tenantId: string;
  name: string;
  stockQuantity: number;
  unit: UnitType;
}

// ─── AI Feed Entry ───────────────────────────────────────────────
export interface AiFeedEntry {
  id: string;
  timestamp: string;
  message: string;
  type: "price_adjustment" | "discount" | "alert" | "insight";
}

// ─── Catalog / Products (Recipe-Based BOM) ───────────────────────

/**
 * Product categories from tavia-catalog-service.
 * Maps to backend enum: com.tavia.catalog_service.enums.ProductCategory
 */
export type ProductCategory =
  | "ESPRESSO_BASED"
  | "TEA"
  | "COLD_BEVERAGE"
  | "FOOD"
  | "DESSERT";

/**
 * A single ingredient in a product's recipe (Bill of Materials).
 * Maps to backend: RecipeIngredientDto
 */
export interface RecipeIngredient {
  id: string;
  rawMaterialName: string;
  quantity: number;
  unit: UnitType;
}

/**
 * A product (recipe) definition in the tenant's catalog.
 * Maps to backend: RecipeDto
 * Domain note: "Recipe" in backend = "Product" in tenant UX.
 */
export interface Product {
  id: string;
  productName: string;
  displayName: string;
  category: ProductCategory;
  description: string | null;
  active: boolean;
  ingredients: RecipeIngredient[];
}

// ─── Machines (IoT) ──────────────────────────────────────────────

export type MachineType = "BREWER" | "FETCHER" | "CLEANER";

export type MachineStatus = "OFFLINE" | "IDLE" | "BREWING" | "MAINTENANCE" | "ERROR";

export interface Machine {
  id: string;
  tenantId: string;
  name: string;
  macAddress: string;
  firmwareVersion: string;
  machineType: MachineType;
  status: MachineStatus;
}

export interface MachineRegistrationRequest {
  name: string;
  macAddress: string;
  machineType: MachineType;
}
