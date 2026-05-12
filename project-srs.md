# TAVIA V2 — Project Architecture & Software Requirements Specification (SRS)

> **Audience:** AI agents and engineers joining the TAVIA V2 ecosystem.
> **Purpose:** Convey the current, canonical architecture, technology baseline, and coding conventions so that any contributor can produce code that is 100% consistent with existing standards on day one.
> **Year of Operation:** 2026.

---

## 1. Project Vision & Architectural Flow

### 1.1 Product Vision (Hybrid Multi-Agent Architecture)
TAVIA V2 is a **Global Loyalty Ecosystem and Autonomous Smart Cafe Platform** built on three strategic pillars.
Due to strict physical hardware constraints in the production environment (16GB System RAM, 4GB VRAM GTX 1650, 16GB Swap), **running local Large Language Models (LLMs) is strictly forbidden**. To achieve world-class autonomy, we use a hybrid Multi-Agent approach:

1. **Tenant Profit Optimization Agent (Tabular ML)** — Handles competitor analysis, dynamic pricing, and predictive maintenance based on tabular data. This MUST be built using lightweight, CPU-based Machine Learning frameworks (e.g., Scikit-Learn, XGBoost, LightGBM) inside a future `tavia-ml-engine` Python/FastAPI microservice consuming minimal RAM (~200MB). Communication with the JVM side (`tavia-ai-service`) is via a **gRPC** interface (`InferenceGrpcClient`), currently stubbed with a `MockInferenceGrpcClient`.
2. **Customer Experience Agent (NLP/Chatbot)** — Powers the mobile app with context-aware discovery, personalized coupons, and customer support conversations. This is powered by the **Gemini API (Cloud LLM)** via `GeminiApiClient` in `tavia-ai-service`, using a composite system prompt that combines static confinement rules with dynamic per-request customer context from CRM.
3. **IoT Autonomous Execution** — Physical smart machines (brewers, fetchers, cleaners) execute orders, emit telemetry, and consume raw materials through event-driven integration. The AI functions as an Autonomous Command Center, actively issuing `SCHEDULE_MAINTENANCE` commands via Kafka when the `PredictiveMaintenanceScheduler` detects high failure probability (>90%) from the Redis-backed Feature Store.

### 1.2 High-Level Microservice Flow
The ecosystem is a **Spring Cloud multi-tenant SaaS** with strict service boundaries and event-driven enrichment:

1. Clients (Web UI, Customer Mobile, Traffic Simulator) enter through **`tavia-api-gateway`** (port **8080**, WebFlux reactive gateway).
2. Gateway resolves backends via **Eureka** (**`tavia-discovery-service`**, port **8761**) using `lb://service-name` routes.
3. Every service boots by pulling configuration from **`tavia-config-service`** (port **8888**, Native profile, serving YAML from `/configurations/`).
4. **Order creation flow (canonical path):**
   - Client → `tavia-order-service` (`POST /api/v1/orders`, `X-Tenant-ID` header).
   - Order service persists the order, then synchronously enriches via REST: CRM customer → Context data → Catalog recipe resolution → Inventory batch deduction.
   - Order service calls `EnrichmentClient.adjustTenantLoyalty()` to increment the customer's tenant-scoped loyalty in CRM.
   - Order service publishes an **enriched `OrderEvent`** to the Kafka topic **`order-events`** carrying recipe-resolved raw material deductions.
   - **`tavia-inventory-service`** consumes the event for audit/reconciliation (deductions already persisted via REST).
   - **`tavia-ai-service`** consumes the same event to update `DailySales` aggregates and run its rule engine.
5. **Recipe bridge:** `tavia-catalog-service` translates a final product (e.g., `LATTE`) into a raw-material Bill of Materials (BOM). `tavia-order-service` calls Catalog's `/resolve/{productName}` endpoint before deducting inventory.
6. **IoT layer:** `tavia-iot-service` manages machines and ingests telemetry. Machine telemetry is published to Kafka topic `iot-telemetry-events`, consumed by `tavia-ai-service` which stores it in the Redis Feature Store for predictive maintenance. AI emits `SCHEDULE_MAINTENANCE` commands on the `ai-commands` topic, consumed by IoT service.

### 1.3 Service Boot Order
Governed by `@/home/tuna/Desktop/tavia_v2/tavia.sh:11-36`:
1. **Phase 0 (Infrastructure):** `tavia-config-service` → `tavia-discovery-service`
2. **Phase 1 (Core Data):** `tavia-tenant-service` → `tavia-inventory-service` → `tavia-catalog-service`
3. **Phase 2 (Operations):** `tavia-crm-service` → `tavia-order-service` → `tavia-iot-service` → `tavia-supply-service`
4. **Phase 3 (Analytics):** `tavia-context-service` → `tavia-ai-service`
5. **Phase 4 (Gateway):** `tavia-api-gateway`
6. **Phase 5 (Simulation):** `tavia-traffic-simulator`

---

## 2. Technology Stack & Versions

### 2.1 Backbone (Standard across all services)
| Layer | Technology | Version |
|-------|-----------|---------|
| **JVM** | Java (Temurin/Toolchain 21) | **21** |
| **Framework** | Spring Boot | **4.0.6** |
| **Cloud** | Spring Cloud | **2025.1.1** |
| **Serialization** | Jackson (shipped with Spring Boot 4.x) | **Jackson 3** (standard) |
| **Build** | Gradle (Groovy DSL) + Wrapper | `gradlew` |
| **Web MVC** | `spring-boot-starter-webmvc` | 4.0.6 |
| **Gateway** | `spring-cloud-starter-gateway-server-webflux` | 2025.1.1 |
| **Persistence** | Spring Data JPA + Hibernate | Spring Boot 4.x aligned |
| **Migrations** | Flyway Core + Flyway PostgreSQL | **12.5.0** |
| **Validation** | Jakarta Validation (`spring-boot-starter-validation`) | 4.0.6 |
| **Mapping** | MapStruct | **1.5.5.Final** |
| **Lombok** | compileOnly + annotationProcessor | Latest managed |
| **Feign** | `spring-cloud-starter-openfeign` | 2025.1.1 (Traffic Simulator) |
| **OpenAPI** | `springdoc-openapi-starter-webmvc-ui` | **3.0.3** |
| **Messaging** | `spring-boot-starter-kafka` | 4.0.6 |
| **Redis** | `spring-boot-starter-data-redis` | 4.0.6 (AI service) |

### 2.2 Infrastructure (Docker Compose)
| Component | Image | Purpose |
|-----------|-------|---------|
| **PostgreSQL** | `postgres:15-alpine` | Primary relational store (DB: `tavia_db`, user `tavia_user`). `mem_limit: 256m`, `shared_buffers=64MB`. |
| **pgAdmin** | `dpage/pgadmin4` | DB administration (port **5050**). |
| **Zookeeper** | `confluentinc/cp-zookeeper:7.4.0` | Kafka coordination. `mem_limit: 128m`. |
| **Kafka** | `confluentinc/cp-kafka:7.4.0` | Event bus (`PLAINTEXT://localhost:9092`). `mem_limit: 512m`, `KAFKA_HEAP_OPTS: -Xmx256m -Xms256m`. |
| **Redis** | `redis:7-alpine` | Feature Store and Caching (port **6379**). `mem_limit: 64m`. |

### 2.3 Frontend — Tenant Operational Dashboard (`tavia-ui`)
| Layer | Technology | Version |
|-------|-----------|---------|
| **Framework** | Next.js (App Router) | **16.2.4** |
| **React** | React + React DOM | **19.2.4** |
| **Styling** | Tailwind CSS (oklch color system) | **v4** |
| **UI Kit** | Shadcn UI (`shadcn`) + `@base-ui/react` | **4.5.0** |
| **Icons** | `lucide-react` | **1.11.0** |
| **State** | Zustand (persisted) | **5.0.12** |
| **Data Fetch** | `@tanstack/react-query` | **5.100.5** |
| **Toasts** | `sonner` | **2.0.7** |
| **Theming** | `next-themes` | 0.4.6 (available but dark mode is hardcoded on `<html>`) |
| **Animations** | `tw-animate-css` | 1.4.0 |
| **TypeScript** | TS | **5.x** |

### 2.4 Frontend — Customer Mobile (`tavia-customer-ui`)
| Layer | Technology | Version |
|-------|-----------|---------|
| **Runtime** | Expo (New Architecture enabled) | **~54.0.33** |
| **Router** | `expo-router` (typed routes, React Compiler) | **~6.0.23** |
| **React** | React Native | **0.81.5** |
| **HTTP** | Axios | **1.15.2** |
| **State** | Zustand + `@react-native-async-storage/async-storage` persisted stores | **5.0.12** |
| **Forms** | `react-hook-form` + `zod` + `@hookform/resolvers` | **7.74.0 / 4.4.1 / 5.2.2** |
| **Navigation** | `@react-navigation/*` | **7.x** |
| **Animations** | `react-native-reanimated` | **~4.1.1** |
| **TypeScript** | TS | **~5.9.2** |

### 2.5 Port Map (Canonical)
| Service | Port |
|---------|------|
| `tavia-api-gateway` | **8080** |
| `tavia-tenant-service` | **8081** |
| `tavia-order-service` | **8082** |
| `tavia-inventory-service` | **8083** |
| `tavia-catalog-service` | **8084** |
| `tavia-context-service` | **8087** |
| `tavia-crm-service` | **8086** |
| `tavia-iot-service` | **8088** |
| `tavia-ai-service` | **8089** |
| `tavia-supply-service` | **8090** |
| `tavia-traffic-simulator` | **8095** |
| `tavia-discovery-service` | **8761** |
| `tavia-config-service` | **8888** |
| PostgreSQL | 5432 |
| pgAdmin | 5050 |
| Kafka | 9092 |
| Zookeeper | 2181 |
| Redis | 6379 |

---

## 3. Service Map & Responsibilities

### 3.1 Infrastructure Services

**`tavia-config-service`** — Spring Cloud Config Server (Native profile). Serves all service YAMLs from `/home/tuna/Desktop/tavia_v2/configurations/`. Holds the **single source of truth** for DB credentials, Kafka settings, Flyway flags, and cross-cutting constants (`tavia.cities`, `tavia.multi-tenancy`).

**`tavia-discovery-service`** — Eureka Server. Central registry; all runtime services register here. Gateway uses `lb://<app-name>` for dynamic routing.

**`tavia-api-gateway`** — Spring Cloud Gateway (WebFlux). Single public entry point. Declares routes under `spring.cloud.gateway.server.webflux.routes` with load-balanced URIs (`lb://tavia-<service>`). Central CORS: `allowedOriginPatterns: "*"`, exposes `X-Tenant-ID` and `X-Tavia-Gateway`. Custom filters: `AddGatewayHeaderFilter` (injects `X-Tavia-Gateway` header), `LoggingFilter` (request/response logging).

### 3.2 Core Domain Services

**`tavia-tenant-service`** (`/api/v1/tenants`) — Cafe operator (tenant) registration, login, listing, status toggling. Owns the `tenants` table (`id`, `name`, `city`, `username`, `password`, `subscriptionPlan`, `isActive`, `createdAt`). Enforces the 12-city enum invariant at the entity level. Endpoint contract:
- `POST /register` — `@RequestBody TenantCreateRequest`
- `POST /login` — `@RequestBody TenantLoginRequest`
- `GET /` — `@RequestParam(required=false) City city` (optional city filter)
- `PATCH /{id}/status` — `@RequestParam boolean isActive`

**`tavia-crm-service`** (`/api/v1/crm/...`) — Customer identity, **tenant-scoped loyalty**, and customer authentication. Owns two tables:
- `customers` (global identity: `id`, `name`, `email` UNIQUE, `city`, `passwordHash`, `resetToken`, `resetTokenExpiry`) — **no `tenant_id` here**.
- `tenant_loyalty` (`id`, `customer_id`, `tenant_id`, `loyalty_level` default BRONZE, `total_spent` default 0, `UNIQUE(customer_id, tenant_id)`).

**Customer management endpoints** (`CustomerController` at `/api/v1/crm/customers`):
- `POST /` — Create customer (`@RequestHeader("X-Tenant-ID")`, `@RequestBody CreateCustomerRequest`)
- `GET /{id}` — Get by ID (`@RequestHeader("X-Tenant-ID")`)
- `GET /` — List all for tenant (`@RequestHeader("X-Tenant-ID")`)
- `PUT /{id}` — Update customer (`@RequestHeader("X-Tenant-ID")`, `@RequestBody UpdateCustomerRequest`)
- `POST /{id}/loyalty/adjust` — Adjust tenant loyalty after order (`@RequestHeader("X-Tenant-ID")`, `@RequestBody AdjustTenantLoyaltyRequest`)
- `DELETE /{id}` — Delete customer

**Customer auth endpoints** (`CustomerAuthController` at `/api/v1/crm/auth`):
- `POST /register` — `@RequestBody CustomerRegisterRequest` → `CustomerAuthResponse`
- `POST /login` — `@RequestBody CustomerLoginRequest` → `CustomerAuthResponse`
- `POST /forgot-password` — `@RequestBody ForgotPasswordRequest` (mocked email)
- `POST /reset-password` — `@RequestBody ResetPasswordRequest` (token-based)
- `POST /{customerId}/change-password` — `@RequestBody ChangePasswordRequest`
- `GET /loyalties/{customerId}` — Returns `List<TenantLoyaltyDto>` (all tenant loyalties for a customer, used by mobile profile)

**Security:** Uses standalone `spring-security-crypto` BCrypt module via `PasswordHasher` bean — does NOT pull in the full Spring Security filter chain.

**`tavia-catalog-service`** (`/api/v1/catalog/...`) — The **Recipe Bridge**. Owns `recipes` and `recipe_ingredients`. Each recipe is tenant-scoped and unique by `(tenant_id, product_name)`. The `Recipe` entity has fields: `id`, `tenantId`, `productName` (uppercase normalized), `displayName` (original casing for UI), `category` (ProductCategory enum), `description`, `active` (boolean, default true), and a `@OneToMany` list of `RecipeIngredient`. Endpoint contract:
- `POST /recipes` — Create recipe (`@RequestHeader("X-Tenant-ID")`, `@RequestBody CreateRecipeRequest`)
- `PUT /recipes/{recipeId}` — Update recipe
- `GET /recipes` — All recipes for tenant
- `GET /recipes/active` — Active-only recipes (for ordering)
- `GET /recipes/{recipeId}` — By ID
- `GET /recipes/by-product/{productName}` — By product name
- `DELETE /recipes/{recipeId}` — Delete recipe
- `GET /resolve/{productName}?quantity=N` → `List<ResolvedIngredientDto>` for downstream inventory deduction
- `GET /resolve/{productName}/exists` → `Boolean` (lightweight pre-validation)

**`tavia-inventory-service`** (`/api/v1/inventory`) — Raw-material stock only (e.g., Milk in ml, Coffee Beans in grams). Owns the `raw_materials` table (`id`, `tenant_id`, `name`, `unit`, `stock_quantity`) with `UNIQUE(tenant_id, name)`. Endpoint contract:
- `POST /` — Add or update stock (`@RequestHeader("X-Tenant-ID")`, `@RequestBody RawMaterialDto`)
- `GET /` — All raw materials for tenant (`@RequestHeader("X-Tenant-ID")`)
- `GET /{name}` — Specific raw material by name (`@RequestHeader("X-Tenant-ID")`)
- `POST /deduct` — Batch deduction (`@RequestHeader("X-Tenant-ID")`, `@RequestBody DeductionRequest`)
- `GET /tenant/{tenantId}` — Legacy compatibility (tenant ID in path)

Also hosts a Kafka `order-events` audit listener (idempotent, log-only) for traceability.

**`tavia-order-service`** (`/api/v1/orders`) — Final-product order processing. Owns `orders` table (`id`, `tenantId`, `customerId` nullable, `productName`, `quantity`, `price`, `orderDate`). Endpoint contract:
- `POST /` — `@RequestHeader("X-Tenant-ID")`, body `{customerId?, productName, quantity, price}`
- `GET /` — `@RequestHeader("X-Tenant-ID")`
- `GET /{id}` — By order ID
- `GET /count` — `@RequestHeader("X-Tenant-ID")`

Internal collaborators:
- **`EnrichmentClient`** — Synchronously calls CRM (`/api/v1/crm/customers/{id}` with `X-Tenant-ID`) and Context (`/api/v1/context`) with graceful fallbacks. Also calls `POST /api/v1/crm/customers/{id}/loyalty/adjust` to increment tenant loyalty after order completion.
- **`InventoryClient`** — Calls `POST /api/v1/inventory/deduct` as a best-effort, circuit-broken deduction.
- **`OrderEventProducer`** — Emits enriched `OrderEvent` (with `deductions[]`) to Kafka topic `order-events`.

**`tavia-iot-service`** (`/api/v1/iot`, `/api/v1/iot/machines`) — Machine registry, telemetry ingestion, and task management. Owns three tables:
- `machines` (`id`, `tenant_id`, `name`, `mac_address` UNIQUE, `firmware_version`, `machine_type`, `status`)
- `machine_tasks` (`id`, `machine_id`, `tenant_id`, `task_type`, `reference_id`, `status`, `started_at`, `completed_at`)
- `machine_telemetry` (`id`, `machine_id`, `timestamp`, `battery_level`, `cpu_temperature`, `coordinates_x`, `coordinates_y`, `network_signal_strength`, `current_error_code`, `sensor_payload` JSONB)

Enums: `MachineType` {BREWER, FETCHER, CLEANER}, `MachineStatus` {OFFLINE, IDLE, BREWING, MAINTENANCE, ERROR}, `TaskType` {PREPARE_ORDER, FETCH_MATERIAL, CLEAN_AREA}, `TaskStatus` {PENDING, IN_PROGRESS, COMPLETED, FAILED}.

Endpoint contract:
- `POST /telemetry` — Ingest telemetry (`@RequestHeader("X-Tenant-ID")`, `@RequestBody MachineTelemetryDto`)
- `POST /tasks/{taskId}/status` — Update task status (`@RequestHeader("X-Tenant-ID")`, `@RequestBody MachineTaskStatusUpdateDto`)
- `POST /machines` — Register machine (`@RequestHeader("X-Tenant-ID")`, `@RequestBody MachineRegistrationRequestDto`)
- `GET /machines` — List machines by tenant (`@RequestHeader("X-Tenant-ID")`)

Kafka integration:
- **Producer:** `IotTelemetryProducer` → topic `iot-telemetry-events`
- **Producer:** `ConsumptionEventProducer` → topic `iot-consumption-events` (raw material consumption events from machines)
- **Consumer:** `AiCommandEventListener` ← topic `ai-commands` (receives `SCHEDULE_MAINTENANCE` commands from AI)

**`tavia-context-service`** (`/api/v1/context`) — Environmental context provider (`weather`, `activeEvent`, `competitorIntensity`). Stateless singleton endpoint consumed by order enrichment and AI pipelines. Single endpoint: `GET /api/v1/context` → `ContextDto`.

**`tavia-ai-service`** (`/api/v1/ai`) — AI analytics, Gemini-powered chat, and predictive maintenance. Owns the `daily_sales` table (`id`, `tenantId`, `totalRevenue`, `totalOrders`, `reportDate`, `weather`, `loyaltyLevel`, `eventType`).

**Analytics endpoints** (`AiAnalyticsController` at `/api/v1/ai`):
- `GET /daily/{tenantId}` → `DailySalesDto` (today's aggregate for a tenant)
- `GET /insights/{tenantId}` → `String` (rule-engine-generated textual insights)

**Chat endpoints** (`AiChatController` at `/api/v1/ai/chat`):
- `POST /` — `@RequestHeader("X-Tenant-ID")`, `@RequestBody AiChatRequest {customerId, message}` → `AiChatResponse {reply}`

**AI internals:**
- **`GeminiApiClient`** — REST client calling the Gemini API (`gemini.api.url` + `gemini.api.key` from config). Sends a composite `system_instruction` (base confinement prompt + dynamic customer context) plus user message. Uses `RestClient`.
- **`AiChatServiceImpl`** — Retrieves customer profile from CRM via `@LoadBalanced RestClient.Builder` (`lb://tavia-crm-service`), builds composite system prompt, calls Gemini. Falls back to "Valued Guest" profile if CRM is unreachable.
- **`RuleEngine`** — Evaluates enriched order context (weather, loyaltyLevel, activeEvent, competitorIntensity) and produces pricing/discount suggestions. 7 rules covering weather×loyalty×competition×event combinations.
- **`FeatureStoreServiceImpl`** — **Redis-backed** feature store using `StringRedisTemplate`. Stores machine state (key: `machine:state:{machineId}`, TTL: 7 days) and hourly sales counters (key: `sales:hourly:{tenantId}:{yyyyMMddHH}`, TTL: 24h).
- **`PredictiveMaintenanceScheduler`** — `@Scheduled(fixedRate = 300000)` (every 5 minutes). Reads machine state from Redis Feature Store, calls `InferenceGrpcClient.predictFailureProbability()`, emits `SCHEDULE_MAINTENANCE` command via `AiCommandProducer` if probability > 90%.
- **`InferenceGrpcClient`** (interface) + `MockInferenceGrpcClient` (stub) — gRPC bridge to the future `tavia-ml-engine` Python microservice. Currently returns mock predictions.
- **`RestClientConfig`** — Dual `RestClient.Builder` beans: `@Primary` default (for Gemini API) and `@LoadBalanced` named `loadBalancedRestClientBuilder` (for Eureka service-to-service calls).

Kafka integration:
- **Consumer:** `OrderEventListener` ← topic `order-events` (updates DailySales + runs RuleEngine)
- **Consumer:** `IotTelemetryEventListener` ← topic `iot-telemetry-events` (updates Redis Feature Store)
- **Producer:** `AiCommandProducer` → topic `ai-commands` (emits maintenance commands)

**`tavia-supply-service`** (`/api/v1/supply`) — Handling external vendor integrations, calculating lead times, and executing purchase orders commanded by AI via the `ai-commands` Kafka topic. Currently a skeleton service.

### 3.3 Simulation & Testing

**`tavia-traffic-simulator`** (`/api/v1/simulator`, `/api/v1/dashboard`) — Closed-loop load generator for the entire ecosystem. Uses **OpenFeign** clients wired through Eureka:
- `TenantClient` → `GET /api/v1/tenants`
- `CrmClient` → `GET /api/v1/crm/customers` (with `X-Tenant-ID`)
- `CatalogClient` → `GET /api/v1/catalog/recipes/active` (with `X-Tenant-ID`)
- `OrderClient` → `POST /api/v1/orders` (with `X-Tenant-ID`)
- `IotClient` → machine listing and telemetry

Models time-of-day traffic patterns (morning rush 7–10, lunch 12–14, evening 17–19, night 22–5), random customer/recipe selection, 5% machine failure injection, and a 60-second cache TTL. Opt-in lifecycle (`/start`, `/stop`, `/status`, `/refresh-cache`). Uses SSE via `SimulatorEventBus` for real-time dashboard streaming.

---

## 4. Frontend Architecture — Tenant UI vs Customer UI

Two **separate** first-class frontend applications share typing/enum discipline but serve distinct personas and live under distinct directories.

### 4.1 `tavia-ui` — Tenant Operational Dashboard (Web)
- **Audience:** Cafe operators / tenant admins.
- **Stack:** Next.js 16 App Router + React 19 + Tailwind v4 (oklch color system) + Shadcn UI 4.x + React Query + Zustand.
- **Entry:** `@/home/tuna/Desktop/tavia_v2/tavia-ui/app/layout.tsx:27-50` composes `QueryProvider → TooltipProvider → AuthGuard → AppShell → Toaster`.
- **Theme:** Dark-first. `<html>` element has `className="dark"` hardcoded. CSS uses oklch color tokens via Tailwind v4 custom properties in `globals.css`. Light/dark mode variables defined in `:root` and `.dark` selectors.
- **Key folders:**
  - `app/` — App Router pages: `page.tsx` (overview), `customers/`, `orders/`, `products/`, `inventory/`, `machines/`, `ai-insights/`, `login/`, `register/`.
  - `components/layout/` — `app-shell.tsx`, `header.tsx`, `sidebar.tsx` (7 nav items: Overview, Customers, Orders, Products, Inventory, Machines, AI Insights + tenant info panel + live "System Online" indicator).
  - `components/dashboard/` — domain widgets (`ai-live-feed`, `customers-card`, `context-card`, `simulate-order-button`).
  - `components/ui/` — Shadcn primitives (`button`, `card`, `table`, `dialog`, `sonner`, `badge`, `input`, `label`, `scroll-area`, `select`, `separator`, `sheet`, `tooltip`).
  - `components/providers/` — `query-provider.tsx`, `auth-guard.tsx`.
  - `lib/api/client.ts` — Single fetch client; injects `X-Tenant-ID` header via `tenantHeaders(tenantId)`; parses RFC 7807 `ProblemDetail` error bodies (`detail` field) and `ApiResponse` error bodies (`message` field). Custom `ApiError` class.
  - `lib/hooks/` — React Query hooks: `use-orders`, `use-inventory`, `use-products`, `use-machines`, `use-customers`, `use-context`, `use-order-count`, `use-simulate-order`, **`use-create-inventory`** (mutation), **`use-create-product`** (mutation).
  - `lib/store/use-auth-store.ts` — Persisted Zustand store holding `tenantId`, `tenantName`, `plan`, `tenantCity`, `isAuthenticated`, `activeTenant` (composite object with `{id, name, city, plan}`). Actions: `login()`, `logout()`, `reset()`.
  - `types/index.ts` — TypeScript mirror of backend DTOs and enums (Tenant, Customer, Order, Product, InventoryItem, Machine, City, LoyaltyLevel, SubscriptionPlan, UnitType, ProductCategory, MachineType/Status, AiFeedEntry, CreateProductRequest, CreateRecipeIngredientRequest, MachineRegistrationRequest, ContextData, CreateOrderPayload, CreateCustomerRequest, RegisterTenantRequest, LoginTenantRequest, ApiResponse, RecipeIngredient).
- **Gateway wiring:** `@/home/tuna/Desktop/tavia_v2/tavia-ui/next.config.ts:1-15` rewrites `/api/:path*` → `http://localhost:8080/api/v1/:path*`.
- **IoT note:** Machine endpoints (`fetchMachines`, `registerMachine`) return raw `Machine[]`/`Machine`, NOT wrapped in `ApiResponse`, because `MachineController` returns `ResponseEntity<List<MachineDto>>` directly.

### 4.2 `tavia-customer-ui` — Customer Mobile Application (Expo)
- **Audience:** End customers discovering cafes, earning loyalty, chatting with AI.
- **Stack:** Expo 54 (New Architecture, typed routes, React Compiler) + React Native 0.81 + Zustand + Axios + RHF + Zod.
- **Theme:** Earthy Cafe Palette. Custom `TaviaDark`/`TaviaLight` navigation themes derived from `Colors` constant. Dark mode default. Persisted theme toggle via `useThemeStore` (AsyncStorage). Colors: Dark Roast Brown (`#2D1B15`), Mocha (`#5D4037`), Latte (`#D7CCC8`), Clean White (`#FAFAFA`), Beige cards (`#F5F5DC`).
- **Root layout:** `@/home/tuna/Desktop/tavia_v2/tavia-customer-ui/app/_layout.tsx:37-78` — `ThemeProvider → Stack` with navigation guard: checks Zustand hydration (`isHydrated`), redirects unauthenticated users to `/auth/login` and authenticated users away from auth screens. Splash overlay while hydrating.

- **Tab Navigation** (5 tabs in `app/(tabs)/_layout.tsx`):
  1. **Discover** (`index.tsx`) — City-based cafe discovery. `CitySelector` horizontal scroll → `CafeCard` list via `useDiscoveryStore`. Pull-to-refresh. Displays `CityDisplayLabels` for Turkish city names.
  2. **Coupons** (`coupons.tsx`) — Promo code input + coupon cards. **Currently UI-local with mock data** (`MOCK_COUPONS`). Coupon type defined in `types/index.ts`. Prepared for future backend integration.
  3. **Profile** (`profile.tsx`) — User info card, dark/light theme toggle, **tenant loyalty memberships** (fetches `GET /api/v1/crm/auth/loyalties/{customerId}` + resolves tenant names via `GET /api/v1/tenants`), change username (`PUT /api/v1/crm/customers/{id}`), change password (`POST /api/v1/crm/auth/{id}/change-password`), logout.
  4. **AI Assistant** (`chat.tsx`) — Full chat interface calling `POST /api/v1/ai/chat` with `{customerId, message}`. Animated `MascotAvatar` component (floating, pulse antenna when thinking, talking mouth animation). Requires active tenant selection (`useActiveTenantStore`). Chat history clears on tab blur via `useFocusEffect`.
  5. **Explore** — Hidden tab (`href: null`), reserved for future use.

- **Auth flow** (`app/auth/`):
  - `login.tsx` — Email/password login via `useCustomerAuthStore.login()`.
  - `register.tsx` — Name, email, password, city registration via `useCustomerAuthStore.register()`.
  - `forgot-password.tsx` — Email-based password reset request.

- **Zustand stores** (4 stores in `store/`):
  - `useCustomerAuthStore` — Persisted (AsyncStorage). Holds `customer: CustomerAuthResponse | null`, `isHydrated`, `isLoading`, `error`. Actions: `login()`, `register()`, `logout()`, `setHydrated()`, `clearError()`. Parses `ProblemDetail.detail` and `ApiResponse.message` from Axios errors.
  - `useActiveTenantStore` — Non-persisted. Holds `activeTenantId: string | null`. Set when customer selects a cafe.
  - `useDiscoveryStore` — Non-persisted. Holds `selectedCity` (default: `ISPARTA`), `tenants: TenantSummary[]`, `isLoading`, `error`. Fetches `GET /api/v1/tenants?city={city}`.
  - `useThemeStore` — Persisted (AsyncStorage). Holds `theme: 'light' | 'dark'` (default: `'dark'`). Actions: `setTheme()`, `toggleTheme()`.

- **Axios setup:** `@/home/tuna/Desktop/tavia_v2/tavia-customer-ui/lib/axios.ts:1-77` — Dynamic base URL resolution chain: (1) `EXPO_PUBLIC_API_URL` env, (2) `NativeModules.SourceCode.scriptURL` regex IP extraction, (3) legacy `Constants.expoConfig.hostUri` / `debuggerHost`, (4) fallback `localhost:8080`. Request interceptor auto-injects `X-Tenant-ID` from `useActiveTenantStore`. Timeout: 15s. Custom header `Bypass-Tunnel-Reminder: true`.

- **Types:** `@/home/tuna/Desktop/tavia_v2/tavia-customer-ui/types/index.ts:1-137` — Uses TypeScript `enum` (not string unions) for `City`, `SubscriptionPlan`, `LoyaltyLevel`. Includes `CityDisplayLabels` map for Turkish display names. Defines `TenantSummary`, `CustomerAuthResponse`, `TenantLoyaltyDto`, `CustomerRegisterRequest`, `CustomerLoginRequest`, `ForgotPasswordRequest`, `ResetPasswordRequest`, `Coupon`, `ApiResponse<T>`.

---

## 5. Database Schema Summary

Seven services own their own Flyway-managed schemas (all in `tavia_db`):

| Service | Tables | Key Constraints |
|---------|--------|-----------------|
| `tavia-tenant-service` | `tenants` | `username` UNIQUE |
| `tavia-crm-service` | `customers`, `tenant_loyalty` | `email` UNIQUE; `UNIQUE(customer_id, tenant_id)` |
| `tavia-catalog-service` | `recipes`, `recipe_ingredients` | `UNIQUE(tenant_id, product_name)` |
| `tavia-inventory-service` | `raw_materials` | `UNIQUE(tenant_id, name)` |
| `tavia-order-service` | `orders` | — |
| `tavia-iot-service` | `machines`, `machine_tasks`, `machine_telemetry` | `mac_address` UNIQUE |
| `tavia-ai-service` | `daily_sales` | — |

---

## 6. Cross-Cutting Rules & Conventions

### 6.1 Multi-Tenancy — The X-Tenant-ID Header
Every request to tenant-specific data must carry `X-Tenant-ID` as a **request header** (UUID). Controllers extract it via `@RequestHeader("X-Tenant-ID") UUID tenantId`. It is NEVER a query parameter. Gateway exposes it in `Access-Control-Expose-Headers`.

### 6.2 Global Customer / Local Loyalty (DDD Invariant)
A `Customer` is a **global** entity — unique by email, no `tenant_id` on the `customers` table. Loyalty is strictly localized via `TenantLoyalty(customer_id, tenant_id)`. The mobile profile screen displays **all** tenant loyalties for a customer via `GET /api/v1/crm/auth/loyalties/{customerId}`.

### 6.3 Recipe-Based Production (DDD Invariant)
`tavia-inventory-service` tracks ONLY raw materials. It NEVER tracks final products. `tavia-order-service` processes final products. The bridge is `tavia-catalog-service` (Recipes/BOM) and `tavia-iot-service` (Machine consumption).

### 6.4 City Enum Restriction
Only exactly 12 cities are valid: `ISTANBUL, ANKARA, IZMIR, BURSA, ANTALYA, ADANA, KONYA, SANLIURFA, GAZIANTEP, KOCAELI, ESKISEHIR, ISPARTA`. Enforced as Java enums in every service and as TypeScript enums/union types in both UIs.

### 6.5 Uniform API Envelope
Every service defines its own `dto/ApiResponse<T>` with fields `success: boolean`, `message: String`, `data: T` (and optional `timestamp`). Helpers: `success(data)`, `success(data, message)`, `error(message)`. Controllers wrap responses in `ResponseEntity<ApiResponse<T>>` unless returning a raw list where explicitly documented (e.g., `MachineController` returns raw `List<MachineDto>`).

### 6.6 Exception Handling (RFC 7807)
- **Every microservice has a `@RestControllerAdvice` `GlobalExceptionHandler`** (present across all backend services).
- Errors are returned as **`ProblemDetail`** (RFC 7807) with:
  - `status`, `title`, `detail`, `type` (URI under `https://tavia.com/errors/*`),
  - `traceId` (a random UUID per exception, also logged as `[TraceId: {}]`),
  - `timestamp` (`Instant.now()`).
- **`MissingRequestHeaderException`** (missing `X-Tenant-ID`) is always mapped to **400**, never 500.
- **Validation errors** include a field-level `errors` map.
- **Generic `Exception`** yields 500 with a traceable detail, but business exceptions must be preferred.
- **Custom exceptions:** `ResourceNotFoundException`, `BusinessException`, `DuplicateRecipeException`, `TenantNotFoundException`.

### 6.7 Persistence, Migrations & Naming
- **Flyway** governs all schema evolution — `db/migration/V<n>__<desc>.sql`. Scripts must be **idempotent** and must migrate data (`INSERT INTO ... SELECT`) before dropping columns.
- **Hibernate DDL:** `ddl-auto: validate` in every service; **never** `update` in production.
- **Table & column naming:** `snake_case`.
- **Java field naming:** `camelCase` (Hibernate maps via default physical naming strategy).
- **Uniqueness & multi-tenancy:** explicit `UNIQUE(tenant_id, <business_key>)` constraints on tenant-scoped tables (e.g., `raw_materials`, `recipes`, `tenant_loyalty`).
- **Anti-redundancy rule:** column names do not repeat the table name. E.g., on `tenant_loyalty`, use `total_spent`, **never** `total_spent_in_this_tenant`.

### 6.8 Clean Code & SOLID
- **Guard Clauses** at the start of methods — validate and return/throw early. No deep nested `if/else`.
- **SRP across modules:** domain logic lives in `service/`, transport in `controller/`, persistence in `repository/`, cross-boundary I/O in `client/` or `kafka/`.
- **No mock data** in production paths. Stubs are acceptable only as clearly named interfaces for services not yet built (e.g., `MockInferenceGrpcClient`).
- **Constructor injection only** (Lombok `@RequiredArgsConstructor` on Spring components). No field `@Autowired`.

### 6.9 Kafka / Event-Driven Rules
- **Topics:**
  - `order-events` — Canonical cross-service event. Producer: `tavia-order-service`. Consumers: `tavia-inventory-service` (audit), `tavia-ai-service` (analytics + rule engine).
  - `ai-commands` — AI commands for operations like predictive maintenance. Producer: `tavia-ai-service`. Consumer: `tavia-iot-service`.
  - `iot-telemetry-events` — IoT machine telemetry. Producer: `tavia-iot-service`. Consumer: `tavia-ai-service` (updates Redis Feature Store).
  - `iot-consumption-events` — Raw material consumption events from machines. Producer: `tavia-iot-service`.
  - `context-events` — Environmental context updates (reserved).
- **Serialization:** `ErrorHandlingDeserializer` wrapping `JsonDeserializer` with `spring.json.trusted.packages: "*"` and `spring.json.use.type.headers: false`. This is mandatory to prevent poison-pill lockups.
- **Idempotency:** Every consumer must be idempotent. The Inventory consumer is intentionally audit-only; real-time deduction is the REST path inside `OrderServiceImpl`.
- **Event shape:** `OrderEvent` carries enriched context (customer loyalty, weather, active event, competitor intensity) **plus** a `deductions[]` list of `{rawMaterialName, quantity, unit}`.
- **AI Command shape:** `AiCommandEventDto` carries `tenantId`, `targetId` (machine UUID), `commandType` (e.g., `SCHEDULE_MAINTENANCE`), `payloadJson`.

### 6.10 Logging & Observability
- **Root log level:** `INFO` (with `WARN` acceptable); `com.tavia` is set to `DEBUG`; `org.hibernate.SQL` is `DEBUG`; `org.flywaydb` is `INFO`.
- **Every logged exception carries a `traceId`** (UUID) aligned with the `ProblemDetail` response.
- **`@Slf4j`** from Lombok on any class that logs.

### 6.11 Frontend Rules
- **Tenant UI:** Shadcn UI + Tailwind v4 (oklch); React Query for reads, Zustand for client state, RHF + Zod for forms; always surface backend errors via `sonner` toasts using parsed `ProblemDetail.detail` or `message`.
- **Customer UI:** Expo Router + React Native; never hardcode `localhost`/`10.0.2.2` in Axios — resolve base URL from `NativeModules.SourceCode.scriptURL` regex (primary), with `Constants.expoConfig.hostUri` / `debuggerHost` as fallbacks and `.env` override.
- **Both UIs:** TypeScript types in `types/index.ts` must stay in lock-step with backend DTOs. Tenant UI uses string union types; Customer UI uses TypeScript `enum` — both mirror the same values.
- **Interceptors:** Outgoing requests to tenant-scoped endpoints always carry `X-Tenant-ID` (explicit helper `tenantHeaders()` in Tenant UI; Axios interceptor driven by `useActiveTenantStore` on Customer UI).

### 6.12 AI Autonomy Protocol (for agents)
- **Impact analysis first:** before modifying any microservice, consider effects on the other 12 modules.
- **Config-first:** service-local DB credentials do not belong in service YAMLs; they live in `configurations/`.
- **No improvisation:** stick to the established package layout, DTO conventions, `ApiResponse` wrapper, and `ProblemDetail` error shape.
- **Retry ceiling:** a maximum of 3 build attempts; if the build still fails, record the stack trace in `ERROR_LOG.md` and move on — never enter an infinite repair loop.
- **Hot-reload:** `spring-boot-devtools` is intentionally present across services; do not remove it.

### 6.13 Local Memory Optimization
- **Mandatory JVM Constraints:** For local development, `JAVA_TOOL_OPTIONS` must be exported with `-Xms64m -Xmx128m -XX:MaxMetaspaceSize=128m -XX:+UseSerialGC -XX:+TieredCompilation -XX:TieredStopAtLevel=1`.
- **Lazy Initialization:** `spring.main.lazy-initialization=true` is strictly required.
- **Docker resource limits:** PostgreSQL `mem_limit: 256m`, Zookeeper `mem_limit: 128m`, Kafka `mem_limit: 512m`, Redis `mem_limit: 64m`.

---

## 7. Quick Reference Card

| Topic | Source of Truth |
|-------|-----------------|
| Cities (12 enum) | `@/home/tuna/Desktop/tavia_v2/configurations/application.yml` |
| Tenant-ID header policy | `@/home/tuna/Desktop/tavia_v2/configurations/application.yml` |
| Gateway routes (lb://) | `@/home/tuna/Desktop/tavia_v2/configurations/tavia-api-gateway.yml` |
| Canonical `GlobalExceptionHandler` | `@/home/tuna/Desktop/tavia_v2/tavia-order-service/src/main/java/com/tavia/order_service/exception/GlobalExceptionHandler.java` |
| Order controller contract | `@/home/tuna/Desktop/tavia_v2/tavia-order-service/src/main/java/com/tavia/order_service/controller/OrderController.java:1-52` |
| Kafka `OrderEvent` contract | `@/home/tuna/Desktop/tavia_v2/tavia-inventory-service/src/main/java/com/tavia/inventory_service/kafka/OrderEvent.java` |
| Gemini API integration | `@/home/tuna/Desktop/tavia_v2/tavia-ai-service/src/main/java/com/tavia/ai_service/client/GeminiApiClient.java:1-104` |
| AI Chat composite prompt | `@/home/tuna/Desktop/tavia_v2/tavia-ai-service/src/main/java/com/tavia/ai_service/service/impl/AiChatServiceImpl.java:1-99` |
| Redis Feature Store | `@/home/tuna/Desktop/tavia_v2/tavia-ai-service/src/main/java/com/tavia/ai_service/service/impl/FeatureStoreServiceImpl.java:1-60` |
| Predictive Maintenance | `@/home/tuna/Desktop/tavia_v2/tavia-ai-service/src/main/java/com/tavia/ai_service/scheduler/PredictiveMaintenanceScheduler.java:1-47` |
| CRM Auth endpoints | `@/home/tuna/Desktop/tavia_v2/tavia-crm-service/src/main/java/com/tavia/crm_service/controller/CustomerAuthController.java:1-75` |
| Tenant UI API client | `@/home/tuna/Desktop/tavia_v2/tavia-ui/lib/api/client.ts:1-292` |
| Tenant UI types | `@/home/tuna/Desktop/tavia_v2/tavia-ui/types/index.ts:1-257` |
| Customer UI Axios setup | `@/home/tuna/Desktop/tavia_v2/tavia-customer-ui/lib/axios.ts:1-77` |
| Customer UI types | `@/home/tuna/Desktop/tavia_v2/tavia-customer-ui/types/index.ts:1-137` |
| Customer UI stores | `@/home/tuna/Desktop/tavia_v2/tavia-customer-ui/store/` |
| IoT Machine entity | `@/home/tuna/Desktop/tavia_v2/tavia-iot-service/src/main/java/com/tavia/iot_service/domain/Machine.java:1-41` |
| IoT Telemetry entity | `@/home/tuna/Desktop/tavia_v2/tavia-iot-service/src/main/java/com/tavia/iot_service/domain/MachineTelemetry.java:1-47` |
| Service boot order | `@/home/tuna/Desktop/tavia_v2/tavia.sh:11-36` |

---

*Following this document guarantees that new code fits the TAVIA V2 ecosystem exactly: typed enums, header-driven multi-tenancy, DTO-first APIs, `ProblemDetail` errors, Flyway-managed schemas, idempotent Kafka consumers, recipe-based inventory semantics, Redis-backed AI Feature Store, Gemini-powered customer chat, predictive maintenance scheduling, and a strict separation between the tenant operational dashboard and the global customer mobile experience.*
