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
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    let errorMessage = `${res.status} ${res.statusText}`;
    try {
      const errorBody = await res.json();
      if (errorBody?.message) {
        errorMessage = errorBody.message;
      }
    } catch {
      // body isn't JSON, use status text
    }
    throw new ApiError(res.status, errorMessage);
  }

  return res.json() as Promise<T>;
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
 * GET /api/v1/crm/customers?tenantId=<tenantId>
 * Backend: CustomerController#getAllCustomers(@RequestParam UUID tenantId)
 */
export async function fetchCustomers(tenantId?: string) {
  const query = tenantId ? `?tenantId=${tenantId}` : "";
  return request<ApiResponse<Customer[]>>(`/crm/customers${query}`);
}

/**
 * POST /api/v1/crm/customers
 * Backend: CustomerController#createCustomer(@Valid @RequestBody CreateCustomerRequest)
 */
export async function createCustomer(payload: CreateCustomerRequest) {
  return request<ApiResponse<Customer>>("/crm/customers", {
    method: "POST",
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
 * GET /api/v1/orders/:id
 * Backend: OrderController#getOrderById(@PathVariable UUID id)
 */
export async function fetchOrderById(id: string) {
  return request<ApiResponse<Order>>(`/orders/${id}`);
}

export { ApiError };
