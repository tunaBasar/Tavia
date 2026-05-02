import type {
  ApiResponse,
  RegisterTenantRequest,
  LoginTenantRequest,
  Tenant,
  Customer,
  ContextData,
  Order,
  CreateOrderPayload,
  CreateCustomerRequest,
  InventoryItem,
  Product,
  Machine,
  MachineRegistrationRequest,
} from "@/types";

const BASE_URL = "/api";

// ─── Core request helper ─────────────────────────────────────────

class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

async function request<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!res.ok) {
    let errorMessage = `${res.status} ${res.statusText}`;
    try {
      const errorBody = await res.json();
      if (errorBody?.detail) {
        errorMessage = errorBody.detail;
      } else if (errorBody?.message) {
        errorMessage = errorBody.message;
      }
    } catch {
      // body isn't JSON, use status text
    }
    throw new ApiError(res.status, errorMessage);
  }

  return res.json() as Promise<T>;
}

/**
 * Builds the X-Tenant-ID header object for tenant-scoped requests.
 * Per GEMINI.md §3.2: every request to tenant data MUST use the X-Tenant-ID header.
 */
function tenantHeaders(tenantId: string): HeadersInit {
  return { "X-Tenant-ID": tenantId };
}

// ─── Tenant / Auth endpoints ─────────────────────────────────────

/**
 * POST /api/v1/tenants/register
 * Backend: TenantController#register(@RequestBody TenantCreateRequest)
 */
export async function registerTenant(payload: RegisterTenantRequest) {
  return request<ApiResponse<Tenant>>("/tenants/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * POST /api/v1/tenants/login
 * Backend: TenantController#login(@RequestBody TenantLoginRequest)
 */
export async function loginTenant(payload: LoginTenantRequest) {
  return request<ApiResponse<Tenant>>("/tenants/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * GET /api/v1/tenants
 * Backend: TenantController#listAll()
 */
export async function fetchAllTenants() {
  return request<ApiResponse<Tenant[]>>("/tenants");
}

// ─── Customer endpoints ──────────────────────────────────────────

/**
 * GET /api/v1/crm/customers
 * Backend: CustomerController#getAllCustomers(@RequestHeader("X-Tenant-ID") UUID tenantId)
 *
 * FIX: Previously sent tenantId as query param, but backend requires X-Tenant-ID header.
 * This mismatch caused MissingRequestHeaderException → unhandled → 500 Internal Server Error.
 */
export async function fetchCustomers(tenantId: string) {
  return request<ApiResponse<Customer[]>>("/crm/customers", {
    headers: tenantHeaders(tenantId),
  });
}

/**
 * POST /api/v1/crm/customers
 * Backend: CustomerController#createCustomer(@RequestHeader("X-Tenant-ID"), @Valid @RequestBody CreateCustomerRequest)
 */
export async function createCustomer(
  payload: CreateCustomerRequest,
  tenantId: string
) {
  return request<ApiResponse<Customer>>("/crm/customers", {
    method: "POST",
    headers: tenantHeaders(tenantId),
    body: JSON.stringify(payload),
  });
}

// ─── Context endpoints ───────────────────────────────────────────

/**
 * GET /api/v1/context
 * Backend: ContextController#getCurrentContext()
 * Note: No path params — backend does not accept tenantId in path.
 */
export async function fetchCurrentContext() {
  return request<ApiResponse<ContextData>>("/context");
}

// ─── Inventory endpoints ─────────────────────────────────────────

/**
 * GET /api/v1/inventory/tenant/{tenantId}
 * Backend: InventoryController#getInventoryByTenantId(@PathVariable UUID tenantId)
 */
export async function fetchInventory(tenantId: string) {
  return request<ApiResponse<InventoryItem[]>>(
    `/inventory/tenant/${tenantId}`
  );
}

// ─── Order endpoints ─────────────────────────────────────────────

/**
 * POST /api/v1/orders
 * Backend: OrderController#createOrder(@Valid @RequestBody CreateOrderRequest)
 * Flat structure: tenantId, customerId, productName, quantity, price
 */
export async function createOrder(payload: CreateOrderPayload) {
  return request<ApiResponse<Order>>("/orders", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * GET /api/v1/orders
 * Backend: OrderController#getAllOrders()
 */
export async function fetchAllOrders() {
  return request<ApiResponse<Order[]>>("/orders");
}

/**
 * GET /api/v1/orders/tenant/{tenantId}
 * Backend: OrderController#getOrdersByTenantId(@PathVariable UUID tenantId)
 */
export async function fetchOrdersByTenant(tenantId: string) {
  return request<ApiResponse<Order[]>>(`/orders/tenant/${tenantId}`);
}

/**
 * GET /api/v1/orders/:id
 * Backend: OrderController#getOrderById(@PathVariable UUID id)
 */
export async function fetchOrderById(id: string) {
  return request<ApiResponse<Order>>(`/orders/${id}`);
}

/**
 * GET /api/v1/orders/tenant/{tenantId}/count
 * Backend: OrderController#countOrdersByTenantId(@PathVariable UUID tenantId)
 * Returns the total number of orders for the given tenant.
 */
export async function fetchOrderCount(tenantId: string) {
  return request<ApiResponse<number>>(`/orders/tenant/${tenantId}/count`);
}

// ─── Catalog / Product endpoints ─────────────────────────────────

/**
 * GET /api/v1/catalog/recipes/active
 * Backend: CatalogController#getActiveRecipes(@RequestHeader("X-Tenant-ID") UUID tenantId)
 * Returns only active (available) products for the tenant's menu.
 */
export async function fetchActiveProducts(tenantId: string) {
  return request<ApiResponse<Product[]>>("/catalog/recipes/active", {
    headers: tenantHeaders(tenantId),
  });
}

/**
 * GET /api/v1/catalog/recipes
 * Backend: CatalogController#getAllRecipes(@RequestHeader("X-Tenant-ID") UUID tenantId)
 * Returns all products (active + inactive) for the tenant catalog management view.
 */
export async function fetchAllProducts(tenantId: string) {
  return request<ApiResponse<Product[]>>("/catalog/recipes", {
    headers: tenantHeaders(tenantId),
  });
}

/**
 * GET /api/v1/catalog/recipes/{recipeId}
 * Backend: CatalogController#getRecipeById(@RequestHeader("X-Tenant-ID") UUID, @PathVariable UUID)
 */
export async function fetchProductById(tenantId: string, productId: string) {
  return request<ApiResponse<Product>>(`/catalog/recipes/${productId}`, {
    headers: tenantHeaders(tenantId),
  });
}

// ─── IoT / Machine endpoints ───────────────────────────────────────

/**
 * GET /api/v1/iot/machines
 * Backend: MachineController#getMachines(@RequestHeader("X-Tenant-ID") UUID tenantId)
 */
export async function fetchMachines(tenantId: string) {
  // Notice that MachineService returns List<MachineDto>, not wrapped in ApiResponse!
  // Wait, I should check my own MachineController implementation.
  // My controller returns `ResponseEntity.ok(machines);` so it's `Machine[]`, not `ApiResponse<Machine[]>`.
  // Let's type it as returning `Machine[]` directly from request.
  return request<Machine[]>("/iot/machines", {
    headers: tenantHeaders(tenantId),
  });
}

/**
 * POST /api/v1/iot/machines
 * Backend: MachineController#registerMachine(@RequestHeader("X-Tenant-ID"), @RequestBody MachineRegistrationRequest)
 */
export async function registerMachine(payload: MachineRegistrationRequest, tenantId: string) {
  return request<Machine>("/iot/machines", {
    method: "POST",
    headers: tenantHeaders(tenantId),
    body: JSON.stringify(payload),
  });
}

export { ApiError };

