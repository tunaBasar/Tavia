# TAVIA V2 — Project Architecture & Software Requirements Specification (SRS)

> **Audience:** AI agents and engineers joining the TAVIA V2 ecosystem.
> **Purpose:** Convey the current, canonical architecture, technology baseline, and coding conventions so that any contributor can produce code that is 100% consistent with existing standards on day one.
> **Year of Operation:** 2026.

---

## 1. Project Vision & Architectural Flow

### 1.1 Product Vision
TAVIA V2 is a **Global Loyalty Ecosystem and Autonomous Smart Cafe Platform** built on three strategic pillars:

1. **Tenant Profit Optimization AI** — Ingests temporal/contextual signals (weather, events, competitor intensity, loyalty tier, etc.) and produces dynamic pricing, discount, and inventory guidance per tenant.
2. **Customer Experience AI** — Powers the mobile app with context-aware discovery, personalized coupons, and localized loyalty rewards.
3. **IoT Autonomous Execution** — Physical smart machines (brewers, fetchers, cleaners) execute orders, emit telemetry, and consume raw materials through event-driven integration.

### 1.2 High-Level Microservice Flow
The ecosystem is a **Spring Cloud multi-tenant SaaS** with strict service boundaries and event-driven enrichment:

1. Clients (Web UI, Customer Mobile, Traffic Simulator) enter through **`tavia-api-gateway`** (port **8080**, WebFlux reactive gateway).
2. Gateway resolves backends via **Eureka** (**`tavia-discovery-service`**, port **8761**) using `lb://service-name` routes.
3. Every service boots by pulling configuration from **`tavia-config-service`** (port **8888**, Native profile, serving YAML from `/configurations/`).
4. **Order creation flow (canonical path):**
   - Client → `tavia-order-service` (`POST /api/v1/orders`, `X-Tenant-ID` header).
   - Order service persists the order, then synchronously enriches via REST: CRM customer → Context data → Catalog recipe resolution → Inventory batch deduction.
   - Order service publishes an **enriched `OrderEvent`** to the Kafka topic **`order-events`** carrying recipe-resolved raw material deductions.
   - **`tavia-inventory-service`** consumes the event for audit/reconciliation (deductions already persisted via REST).
   - **`tavia-ai-service`** consumes the same event to update `DailySales` aggregates and run its rule engine.
5. **Recipe bridge:** `tavia-catalog-service` translates a final product (e.g., `LATTE`) into a raw-material Bill of Materials (BOM). `tavia-order-service` calls Catalog’s `/resolve/{productName}` endpoint before deducting inventory.
6. **IoT layer:** `tavia-iot-service` manages machines and ingests telemetry. Simulated machine failures surface as `ERR_*` codes through the telemetry pipeline.

### 1.3 Service Boot Order
Governed by `@/home/tuna/Desktop/tavia_v2/tavia.sh:11-35`:
1. `tavia-config-service` → `tavia-discovery-service`
2. `tavia-tenant-service` → `tavia-inventory-service` → `tavia-catalog-service`
3. `tavia-crm-service` → `tavia-order-service` → `tavia-iot-service`
4. `tavia-context-service` → `tavia-ai-service`
5. `tavia-api-gateway`
6. `tavia-traffic-simulator`

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

### 2.2 Infrastructure (Docker Compose)
| Component | Image | Purpose |
|-----------|-------|---------|
| **PostgreSQL** | `postgres:15-alpine` | Primary relational store (DB: `tavia_db`, user `tavia_user`). |
| **pgAdmin** | `dpage/pgadmin4` | DB administration (port **5050**). |
| **Zookeeper** | `confluentinc/cp-zookeeper:7.4.0` | Kafka coordination. |
| **Kafka** | `confluentinc/cp-kafka:7.4.0` | Event bus (`PLAINTEXT://localhost:9092`). |

### 2.3 Frontend — Tenant Operational Dashboard (`tavia-ui`)
| Layer | Technology | Version |
|-------|-----------|---------|
| **Framework** | Next.js (App Router) | **16.2.4** |
| **React** | React + React DOM | **19.2.4** |
| **Styling** | Tailwind CSS | **v4** |
| **UI Kit** | Shadcn UI (`shadcn`) + Radix primitives via `@base-ui/react` | 4.x |
| **Icons** | `lucide-react` | 1.x |
| **State** | Zustand (persisted) | 5.x |
| **Data Fetch** | `@tanstack/react-query` | 5.x |
| **Toasts** | `sonner` | 2.x |
| **Theming** | `next-themes` | 0.4.x |
| **TypeScript** | TS | 5.x |

### 2.4 Frontend — Customer Mobile (`tavia-customer-ui`)
| Layer | Technology | Version |
|-------|-----------|---------|
| **Runtime** | Expo | **~54.0.33** |
| **Router** | `expo-router` | ~6.0.23 |
| **React** | React Native | **0.81.5** |
| **HTTP** | Axios | 1.15.x |
| **State** | Zustand + `@react-native-async-storage/async-storage` persisted store | 5.x |
| **Forms** | `react-hook-form` + `zod` + `@hookform/resolvers` | current |
| **Navigation** | `@react-navigation/*` | 7.x |

### 2.5 Port Map (Canonical)
| Service | Port |
|---------|------|
| `tavia-api-gateway` | **8080** |
| `tavia-tenant-service` | **8081** |
| `tavia-order-service` | **8082** |
| `tavia-inventory-service` | **8083** |
| `tavia-ai-service` | **8084** |
| `tavia-crm-service` | **8086** |
| `tavia-context-service` | **8087** |
| `tavia-catalog-service` | **8088** |
| `tavia-iot-service` | **8089** |
| `tavia-traffic-simulator` | **8095** |
| `tavia-discovery-service` (Eureka) | **8761** |
| `tavia-config-service` | **8888** |
| PostgreSQL | 5432 |
| pgAdmin | 5050 |
| Kafka | 9092 |
| Zookeeper | 2181 |

---

## 3. Service Map & Responsibilities

### 3.1 Infrastructure Services

**`tavia-config-service`** — Spring Cloud Config Server (Native profile). Serves all service YAMLs from `/home/tuna/Desktop/tavia_v2/configurations/`. Holds the **single source of truth** for DB credentials, Kafka settings, Flyway flags, and cross-cutting constants (`tavia.cities`, `tavia.multi-tenancy`).

**`tavia-discovery-service`** — Eureka Server. Central registry; all runtime services register here. Gateway uses `lb://<app-name>` for dynamic routing.

**`tavia-api-gateway`** — Spring Cloud Gateway (WebFlux). Single public entry point. Declares routes under `spring.cloud.gateway.server.webflux.routes` with load-balanced URIs (`lb://tavia-<service>`). Central CORS: `allowedOriginPatterns: "*"`, exposes `X-Tenant-ID` and `X-Tavia-Gateway`.

### 3.2 Core Domain Services

**`tavia-tenant-service`** (`/api/v1/tenants`) — Cafe operator (tenant) registration, login, listing, status toggling. Owns the `tenants` table (`id`, `name`, `city`, `username`, `password`, `subscriptionPlan`, `isActive`, `createdAt`). Enforces the 12-city enum invariant at the entity level.

**`tavia-crm-service`** (`/api/v1/crm/...`) — Customer identity and **tenant-scoped loyalty**. Owns two tables:
- `customers` (global identity: `id`, `name`, `email` UNIQUE, `city`, `passwordHash`) — **no `tenant_id` here**.
- `tenant_loyalty` (`customer_id`, `tenant_id`, `loyalty_level`, `total_spent`, `UNIQUE(customer_id, tenant_id)`).
Also exposes customer-facing auth endpoints consumed by the mobile app (`/api/v1/crm/auth/login`, `/register`, `/forgot-password`, `/reset-password`).

**`tavia-catalog-service`** (`/api/v1/catalog/...`) — The **Recipe Bridge**. Owns `recipes` and `recipe_ingredients`. Exposes CRUD on recipes plus the resolver used by order-service:
- `GET /recipes`, `GET /recipes/active`, `GET /recipes/{id}`, `GET /recipes/by-product/{productName}`
- `GET /resolve/{productName}?quantity=N` → `List<ResolvedIngredientDto>` for downstream inventory deduction.
Each recipe is tenant-scoped and unique by `(tenant_id, product_name)`.

**`tavia-inventory-service`** (`/api/v1/inventory`) — Raw-material stock only (e.g., Milk in ml, Coffee Beans in grams). Owns the `raw_materials` table with `UNIQUE(tenant_id, name)`. Batch deduction endpoint (`POST /deduct`) is the authoritative sync path. Also hosts a Kafka `order-events` audit listener (idempotent, log-only) for traceability.

**`tavia-order-service`** (`/api/v1/orders`) — Final-product order processing. Current endpoint contract:
- `POST /api/v1/orders` — `@RequestHeader("X-Tenant-ID")`, body `{customerId?, productName, quantity, price}`
- `GET /api/v1/orders` — `@RequestHeader("X-Tenant-ID")`
- `GET /api/v1/orders/{id}`
- `GET /api/v1/orders/count` — `@RequestHeader("X-Tenant-ID")`

Internal collaborators:
- **`EnrichmentClient`** — Synchronously calls CRM (`/api/v1/crm/customers/{id}` with `X-Tenant-ID`) and Context (`/api/v1/context`) with graceful fallbacks.
- **`InventoryClient`** — Calls `POST /api/v1/inventory/deduct` as a best-effort, circuit-broken deduction.
- **`OrderEventProducer`** — Emits enriched `OrderEvent` (with `deductions[]`) to Kafka topic `order-events`.

**`tavia-iot-service`** (`/api/v1/iot`, `/api/v1/iot/machines`) — Machine registry and telemetry ingestion. Owns `machines`, `machine_tasks`, `machine_telemetry`. Exposes telemetry ingestion (`POST /telemetry`) and task status updates (`POST /tasks/{id}/status`).

**`tavia-context-service`** (`/api/v1/context`) — Environmental context provider (`weather`, `activeEvent`, `competitorIntensity`). Stateless singleton endpoint consumed by order enrichment and AI pipelines.

**`tavia-ai-service`** (`/api/v1/ai`) — AI analytics. Consumes `order-events` to maintain `daily_sales` aggregates (revenue, orders, weather, loyalty, event) and runs a pluggable `RuleEngine` producing pricing/discount suggestions. Exposes daily sales and insights read endpoints per tenant.

### 3.3 Simulation & Testing

**`tavia-traffic-simulator`** (`/api/v1/simulator`, `/api/v1/dashboard`) — Closed-loop load generator for the entire ecosystem. Uses **OpenFeign** clients wired through Eureka:
- `TenantClient` → `GET /api/v1/tenants`
- `CrmClient` → `GET /api/v1/crm/customers` (with `X-Tenant-ID`)
- `CatalogClient` → `GET /api/v1/catalog/recipes/active` (with `X-Tenant-ID`)
- `OrderClient` → `POST /api/v1/orders` (with `X-Tenant-ID`)
- `IotClient` → machine listing and telemetry

Models time-of-day traffic patterns (morning rush 7–10, lunch 12–14, evening 17–19, night 22–5), random customer/recipe selection, 5% machine failure injection, and a 60-second cache TTL. Opt-in lifecycle (`/start`, `/stop`, `/status`, `/refresh-cache`).

---

## 4. Frontend Architecture — Tenant UI vs Customer UI

Two **separate** first-class frontend applications share typing/enum discipline but serve distinct personas and live under distinct directories.

### 4.1 `tavia-ui` — Tenant Operational Dashboard (Web)
- **Audience:** Cafe operators / tenant admins.
- **Stack:** Next.js 16 App Router + React 19 + Tailwind 4 + Shadcn UI + React Query + Zustand.
- **Entry:** `@/home/tuna/Desktop/tavia_v2/tavia-ui/app/layout.tsx` composes `QueryProvider → TooltipProvider → AuthGuard → AppShell`.
- **Key folders:**
  - `app/` — App Router pages: `page.tsx` (overview), `customers/`, `orders/`, `products/`, `inventory/`, `machines/`, `ai-insights/`, `login/`, `register/`.
  - `components/layout/` — `app-shell.tsx`, `header.tsx`, `sidebar.tsx`.
  - `components/dashboard/` — domain widgets (AI live feed, customers card, context card, simulate-order).
  - `components/ui/` — Shadcn primitives (`button`, `card`, `table`, `dialog`, `sonner`, etc.).
  - `components/providers/` — `query-provider.tsx`, `auth-guard.tsx`.
  - `lib/api/client.ts` — Single fetch client; injects `X-Tenant-ID` header via `tenantHeaders(tenantId)`; parses RFC 7807 `ProblemDetail` error bodies.
  - `lib/hooks/` — React Query hooks (`use-orders`, `use-inventory`, `use-products`, `use-machines`, `use-customers`, `use-context`, `use-order-count`, `use-simulate-order`).
  - `lib/store/use-auth-store.ts` — Persisted Zustand store holding `tenantId`, `tenantName`, `plan`, `tenantCity`, `isAuthenticated`.
  - `types/index.ts` — TypeScript mirror of backend DTOs and enums (Tenant, Customer, Order, Product, InventoryItem, Machine, City, LoyaltyLevel, SubscriptionPlan, UnitType, ProductCategory, MachineType/Status).
- **Gateway wiring:** `@/home/tuna/Desktop/tavia_v2/tavia-ui/next.config.ts` rewrites `/api/:path*` → `http://localhost:8080/api/v1/:path*`.
- **Branding:** Dark-first theme, gradient stat cards, live status indicator.

### 4.2 `tavia-customer-ui` — Customer Mobile (Expo / React Native)
- **Audience:** End customers discovering cafes, managing coupons, and accessing loyalty.
- **Stack:** Expo 54 + React Native 0.81 + expo-router + Axios + Zustand + React Hook Form + Zod.
- **Entry:** `@/home/tuna/Desktop/tavia_v2/tavia-customer-ui/app/_layout.tsx` applies a custom `TaviaDark` navigation theme and gates auth.
- **Key folders:**
  - `app/` — File-based routes:
    - `(tabs)/` — Main tab surface (`index.tsx` = Discover, `coupons.tsx`, `profile.tsx`, plus a hidden `explore.tsx`).
    - `auth/` — `login.tsx`, `register.tsx`, `forgot-password.tsx`, `_layout.tsx`.
    - `modal.tsx` — Bottom-sheet modal shell.
  - `components/` — `cafe-card.tsx`, `city-selector.tsx`, themed primitives, haptic tab button.
  - `store/` — Zustand stores: `useCustomerAuthStore.ts` (persisted auth), `useDiscoveryStore.ts` (selected city + tenant list).
  - `lib/axios.ts` — Central Axios instance pointing at the gateway. **Dynamically resolves** the host via `Constants.expoGoConfig?.debuggerHost`, falling back to `EXPO_PUBLIC_API_URL` or `localhost:8080` — never a hard-coded LAN IP.
  - `hooks/`, `constants/`, `types/index.ts` (mirrors CRM/tenant DTOs).
- **Persona divergence:** Customer UI operates **against global customer identity** (email/password via `/api/v1/crm/auth/*`) and **selects a tenant**; the tenant UI operates **inside an already-authenticated tenant context** and injects `X-Tenant-ID` on every request.

### 4.3 Shared Frontend Standards
- **Type parity:** TypeScript interfaces in `types/index.ts` must mirror backend DTOs exactly (field names, enum strings, nullability).
- **Enums:** 12-city enum is duplicated as literal unions / TS enums on both apps; values must match the backend Java enum strings exactly.
- **HTTP discipline:** Always send `X-Tenant-ID` for tenant-scoped endpoints; gracefully parse `ProblemDetail` (`title`, `detail`, `traceId`) into toasts/alerts.

---

## 5. Directory Map (Top-Level)

```
tavia_v2/
├── .windsurfrules                 # Senior Engineer system prompt (canonical rules)
├── GEMINI.md                      # Extended architectural charter
├── tavia.sh                       # Build/start/stop/status/logs orchestrator
├── docker-compose.yml             # Postgres, pgAdmin, Zookeeper, Kafka
├── db-seed.js                     # Seed utility
├── configurations/                # Centralized YAMLs (served by config-service)
│   ├── application.yml            # Shared properties (cities, tenant-id header)
│   ├── tavia-api-gateway.yml      # Gateway CORS + routes
│   ├── tavia-tenant-service.yml
│   ├── tavia-crm-service.yml
│   ├── tavia-order-service.yml
│   ├── tavia-inventory-service.yml
│   ├── tavia-catalog-service.yml
│   ├── tavia-iot-service.yml
│   ├── tavia-ai-service.yml
│   ├── tavia-context-service.yml
│   └── tavia-traffic-simulator.yml
│
├── tavia-config-service/          # Spring Cloud Config (native, port 8888)
├── tavia-discovery-service/       # Eureka Server (port 8761)
├── tavia-api-gateway/             # WebFlux Gateway (port 8080)
│
├── tavia-tenant-service/          # Tenant domain (port 8081)
├── tavia-order-service/           # Order domain + Kafka producer (port 8082)
├── tavia-inventory-service/       # Raw materials + Kafka audit (port 8083)
├── tavia-ai-service/              # AI analytics + Kafka consumer (port 8084)
├── tavia-crm-service/             # Customers + TenantLoyalty (port 8086)
├── tavia-context-service/         # Environmental context (port 8087)
├── tavia-catalog-service/         # Recipe BOM bridge (port 8088)
├── tavia-iot-service/             # Machines + telemetry (port 8089)
├── tavia-traffic-simulator/       # Feign-based load generator (port 8095)
│
├── tavia-ui/                      # Next.js 16 tenant dashboard
│   ├── app/                       # App Router pages
│   ├── components/                # dashboard/, layout/, providers/, ui/
│   ├── lib/                       # api/client.ts, hooks/, store/, utils.ts
│   └── types/index.ts             # Shared DTO mirrors
│
└── tavia-customer-ui/             # Expo React Native customer app
    ├── app/                       # (tabs)/, auth/, modal.tsx, _layout.tsx
    ├── components/                # cafe-card, city-selector, themed-*
    ├── lib/axios.ts               # Gateway-aware Axios instance
    ├── store/                     # useCustomerAuthStore, useDiscoveryStore
    ├── hooks/, constants/
    └── types/index.ts
```

### 5.1 Canonical Backend Module Skeleton
Every Spring Boot service follows this internal layout under `src/main/java/com/tavia/<service>/`:

```
<ServiceName>Application.java
config/            # Beans, WebClient/RestClient setup, KafkaConfig
controller/        # @RestController, @RequestMapping("/api/v1/...")
service/           # Interfaces + *Impl
repository/        # Spring Data JPA interfaces
entity/ or domain/ # @Entity classes (JPA)
dto/               # Request + response DTOs (incl. ApiResponse<T>)
mapper/            # MapStruct or manual mappers
enums/             # Domain enums (City, UnitType, ProductCategory, ...)
exception/         # GlobalExceptionHandler + typed exceptions
kafka/             # Producers, consumers, event classes (when applicable)
client/            # REST/Feign clients to other services (when applicable)
```

Resources: `src/main/resources/`
- `application.yml` (only name + config-server + Eureka pointers — credentials live centrally).
- `db/migration/V*.sql` (Flyway versioned scripts).

---

## 6. Architectural Standards & Coding Rules

### 6.1 Domain Invariants (Non-Negotiable)
- **Global Customer / Local Loyalty:** `customers.tenant_id` MUST NOT exist. Loyalty is localized in `tenant_loyalty` with `UNIQUE(customer_id, tenant_id)`.
- **Recipe-Based Production:** `tavia-inventory-service` tracks **only** raw materials. `tavia-order-service` sells final products. The bridge is always `tavia-catalog-service` (recipe resolution) followed by inventory deduction.
- **City Enum (12 only):** `ISTANBUL, ANKARA, IZMIR, BURSA, ANTALYA, ADANA, KONYA, SANLIURFA, GAZIANTEP, KOCAELI, ESKISEHIR, ISPARTA`. Never use loose strings; always typed enums.
- **Cross-service references are ID-based (UUID).** Never model `@ManyToOne` across microservice boundaries.

### 6.2 Multi-Tenancy Discipline
- **`X-Tenant-ID` header is the only legal channel** for the active tenant. Extracted in controllers via `@RequestHeader("X-Tenant-ID") UUID tenantId` and enforced down to the repository layer.
- **Never** pass tenant IDs as path variables or query params for tenant-scoped operations.
- Centralized validation policy lives in `@/home/tuna/Desktop/tavia_v2/configurations/application.yml` (`tavia.multi-tenancy.tenant-id-header-validation`).

### 6.3 DTO, Entity, Mapping & Validation
- **Never expose JPA entities** through controllers — always DTOs.
- **Every DTO** uses Lombok `@Data @Builder @NoArgsConstructor @AllArgsConstructor`.
- **All-args constructors are mandatory** (required by Jackson 3 deserialization in conjunction with `@NoArgsConstructor` for Lombok `@Builder`); keep constructor parameter order aligned with field declaration order so MapStruct and Jackson can both bind predictably.
- **Jakarta Validation** must annotate request DTOs:
  - `@NotNull`, `@NotBlank`, `@Email`, `@Min`, `@DecimalMin`, `@NotEmpty`, `@Valid` on nested collections.
- **MapStruct** (`1.5.5.Final`) is preferred for entity↔DTO mapping; simple mappers may be hand-written but must be in `mapper/`.

### 6.4 Jackson 3 & JSON Standard
Spring Boot 4.x ships with **Jackson 3** by default. The following annotations are standard across the codebase:
- **`@JsonIgnoreProperties(ignoreUnknown = true)`** on DTOs that deserialize payloads from **other microservices** (consumer-side Feign clients, Kafka events, cross-service response envelopes). Prevents backward-compat breakage when an upstream adds a field. Canonical examples:
  - `@/home/tuna/Desktop/tavia_v2/tavia-inventory-service/src/main/java/com/tavia/inventory_service/kafka/OrderEvent.java:20`
  - `@/home/tuna/Desktop/tavia_v2/tavia-traffic-simulator/src/main/java/com/tavia/trafficsimulator/dto/ApiResponse.java:15`
- **`@JsonInclude(JsonInclude.Include.NON_NULL)`** on outgoing API envelopes where nullable payload fields should be omitted (see `@/home/tuna/Desktop/tavia_v2/tavia-crm-service/src/main/java/com/tavia/crm_service/dto/ApiResponse.java:13`).
- **Enums are serialized by name** (`EnumType.STRING` on JPA; default Jackson string serialization). TypeScript mirrors must use the exact backend string values.
- **UUIDs are always `java.util.UUID`** in Java and `string` in TypeScript. Never use `Long`/`number` for identifiers.

### 6.5 Uniform API Envelope
Every service defines its own `dto/ApiResponse<T>` with fields `success: boolean`, `message: String`, `data: T` (and optional `timestamp`). Helpers: `success(data)`, `success(data, message)`, `error(message)`. Controllers wrap responses in `ResponseEntity<ApiResponse<T>>` unless returning a raw list where explicitly documented.

### 6.6 Exception Handling (RFC 7807)
- **Every microservice has a `@RestControllerAdvice` `GlobalExceptionHandler`** (9 present across the backend).
- Errors are returned as **`ProblemDetail`** (RFC 7807) with:
  - `status`, `title`, `detail`, `type` (URI under `https://tavia.com/errors/*`),
  - `traceId` (a random UUID per exception, also logged as `[TraceId: {}]`),
  - `timestamp` (`Instant.now()`).
- **`MissingRequestHeaderException`** (missing `X-Tenant-ID`) is always mapped to **400**, never 500.
- **Validation errors** include a field-level `errors` map.
- **Generic `Exception`** yields 500 with a traceable detail, but business exceptions must be preferred.

Reference implementation: `@/home/tuna/Desktop/tavia_v2/tavia-order-service/src/main/java/com/tavia/order_service/exception/GlobalExceptionHandler.java:1-99`.

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
- **No mock data** in production paths. Stubs are acceptable only as clearly named interfaces for services not yet built.
- **Constructor injection only** (Lombok `@RequiredArgsConstructor` on Spring components). No field `@Autowired`.

### 6.9 Kafka / Event-Driven Rules
- **Topic:** `order-events` is the canonical cross-service event. Producer: `tavia-order-service`. Consumers: `tavia-inventory-service` (audit), `tavia-ai-service` (analytics).
- **Serialization:** `ErrorHandlingDeserializer` wrapping `JsonDeserializer` with `spring.json.trusted.packages: "*"` and `spring.json.use.type.headers: false`. This is mandatory to prevent poison-pill lockups.
- **Idempotency:** Every consumer must be idempotent. The Inventory consumer is intentionally audit-only; real-time deduction is the REST path inside `OrderServiceImpl`.
- **Event shape:** `OrderEvent` carries enriched context (customer loyalty, weather, active event, competitor intensity) **plus** a `deductions[]` list of `{rawMaterialName, quantity, unit}`.

### 6.10 Logging & Observability
- **Root log level:** `INFO` (with `WARN` acceptable); `com.tavia` is set to `DEBUG`; `org.hibernate.SQL` is `DEBUG`; `org.flywaydb` is `INFO`.
- **Every logged exception carries a `traceId`** (UUID) aligned with the `ProblemDetail` response.
- **`@Slf4j`** from Lombok on any class that logs.

### 6.11 Frontend Rules
- **Tenant UI:** Shadcn UI + Tailwind v4; React Query for reads, Zustand for client state, RHF + Zod for forms; always surface backend errors via `sonner` toasts using parsed `ProblemDetail.detail` or `message`.
- **Customer UI:** Expo Router + React Native; never hardcode `localhost`/`10.0.2.2` in Axios — resolve base URL from `Constants.expoGoConfig.debuggerHost` with env fallback.
- **Both UIs:** TypeScript types in `types/index.ts` must stay in lock-step with backend DTOs.
- **Interceptors:** Outgoing requests to tenant-scoped endpoints always carry `X-Tenant-ID` (explicit helper `tenantHeaders()` in Tenant UI; store-driven on Customer UI).

### 6.12 AI Autonomy Protocol (for agents)
- **Impact analysis first:** before modifying any microservice, consider effects on the other 11 modules.
- **Config-first:** service-local DB credentials do not belong in service YAMLs; they live in `configurations/`.
- **No improvisation:** stick to the established package layout, DTO conventions, `ApiResponse` wrapper, and `ProblemDetail` error shape.
- **Retry ceiling:** a maximum of 3 build attempts; if the build still fails, record the stack trace in `ERROR_LOG.md` and move on — never enter an infinite repair loop.
- **Hot-reload:** `spring-boot-devtools` is intentionally present across services; do not remove it.

---

## 7. Quick Reference Card

| Topic | Source of Truth |
|-------|-----------------|
| Cities (12 enum) | `@/home/tuna/Desktop/tavia_v2/configurations/application.yml:8-21` |
| Tenant-ID header policy | `@/home/tuna/Desktop/tavia_v2/configurations/application.yml:22-27` |
| Gateway routes (lb://) | `@/home/tuna/Desktop/tavia_v2/configurations/tavia-api-gateway.yml:26-89` |
| Canonical `GlobalExceptionHandler` | `@/home/tuna/Desktop/tavia_v2/tavia-order-service/src/main/java/com/tavia/order_service/exception/GlobalExceptionHandler.java:1-99` |
| Order controller contract | `@/home/tuna/Desktop/tavia_v2/tavia-order-service/src/main/java/com/tavia/order_service/controller/OrderController.java:1-52` |
| Kafka `OrderEvent` contract | `@/home/tuna/Desktop/tavia_v2/tavia-inventory-service/src/main/java/com/tavia/inventory_service/kafka/OrderEvent.java:1-40` |
| Tenant UI API client | `@/home/tuna/Desktop/tavia_v2/tavia-ui/lib/api/client.ts:1-263` |
| Customer UI Axios setup | `@/home/tuna/Desktop/tavia_v2/tavia-customer-ui/lib/axios.ts:1-53` |
| Service boot order | `@/home/tuna/Desktop/tavia_v2/tavia.sh:11-35` |

---

*Following this document guarantees that new code fits the TAVIA V2 ecosystem exactly: typed enums, header-driven multi-tenancy, DTO-first APIs, `ProblemDetail` errors, Flyway-managed schemas, idempotent Kafka consumers, recipe-based inventory semantics, and a strict separation between the tenant operational dashboard and the global customer mobile experience.*
