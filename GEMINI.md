# **TAVIA V2 - SYSTEM CONTEXT, ARCHITECTURE & CODING LAWS**

## **1. EXECUTIVE SUMMARY & SYSTEM VISION**
TAVIA V2 is a **Global Loyalty Ecosystem and Smart Cafe/Tenant Management Platform**. 
You are acting as an Elite Senior Full-Stack Architect. Every line of code must be written with the foresight that this system is managed by AI models optimizing for tenant profit and customer satisfaction in the year **2026** and beyond.

### **The Two Primary AI Agents:**
1.  **Tenant Profit Optimization Assistant (Core):** Analyzes real-world 2026 temporal data (exams, holidays, weather, competitor occupancy, Google reviews) to optimize dynamic pricing, forecast inventory, and control smart cafe IoT hardware (HVAC, lighting, machines).
2.  **Customer Experience Assistant:** Manages mobile app (React Native/Expo) interactions, providing context-aware discounts and localized loyalty rewards.

---

## **2. THE DOMAIN LAWS (CRITICAL BUSINESS LOGIC)**

### **2.1 Global Customers, Local Loyalty**
*   **Global Ecosystem:** A `Customer` is a global entity (identified by a unique email) moving across the Tavia network.
*   **Local Loyalty:** A customer's points, tier (BRONZE, SILVER, GOLD, PLATINUM), and total spent are strictly tied to a specific `tenant_id` via the `TenantLoyalty` table. NEVER couple a global customer directly to a single tenant.

### **2.2 The City Enum Constraint**
*   Only 12 cities are valid: `ISTANBUL, ANKARA, IZMIR, BURSA, ANTALYA, ADANA, KONYA, SANLIURFA, GAZIANTEP, KOCAELI, ESKISEHIR, ISPARTA`. No strings; use Enums globally.

---

## **3. STRICT CODING & ENGINEERING RULES (NON-NEGOTIABLE)**

### **3.1 Clean Code & Anti-Spaghetti Architecture**
*   **SOLID & DRY:** Must be strictly followed. Code must be highly modular and predictable.
*   **Guard Clauses (Early Returns):** DO NOT use deep nested `if-else` blocks. Validate inputs and negative states at the very beginning of a method and return/throw immediately.
*   **No Mock Data:** NEVER use mock data or hardcoded arrays. All data must come from real API or DB integrations. Handle missing data gracefully.
*   **No Redundant Naming:** Use clean database naming (e.g., table `tenant_loyalty`, column `total_spent` — NEVER `total_spent_in_this_tenant`).

### **3.2 Database & Microservice Boundaries**
*   **ID-Based Referencing:** DO NOT create direct JPA `@ManyToOne` relationships across microservice boundaries. Use UUID-based cross-referencing to maintain strict decoupling.
*   **Migrations:** Use **Flyway** (`ddl-auto: validate` in production). Always write idempotent SQL scripts (e.g., move data before dropping columns).
*   **Multi-Tenancy Isolation:** Every request to tenant data MUST extract and use the `X-Tenant-ID` header. DB isolation relies on strict exact constraint matching (e.g., `UNIQUE(customer_id, tenant_id)`).

### **3.3 Backend (Spring Boot 4.x / Cloud 5.x)**
*   **DTO Sync:** Never expose JPA Entities to the presentation layer. Use strict MapStruct/manual mappers.
*   **Validation:** Enforce Jakarta Validation (`@NotNull`, `@NotBlank`) on incoming DTOs.
*   **Gateway Routing:** Use Spring Boot WebFlux structures (`spring.cloud.gateway.server.webflux.routes`) to route traffic to underlying services.

### **3.4 Global Exception Handling & Observability**
*   **Centralized Error Handling:** EVERY microservice MUST have a `@RestControllerAdvice` or `@ControllerAdvice` class. Do not handle generic exceptions inside individual controllers.
*   **Standardized Error Responses:** Strictly use the 2026 standard `ProblemDetail` (RFC 7807) for REST errors. Mobile and Web UI depend on a consistent error structure (e.g., `title`, `status`, `detail`).
*   **Logging & Tracing:** Never silently swallow exceptions (`catch(Exception e) {}`). Always log the error with its context. In a microservice ecosystem, logging without a Correlation ID / Trace ID is unacceptable.

### **3.5 Frontend (Next.js 15 - tavia-ui) & Mobile (Expo)**
*   **Type Safety:** Match TypeScript interfaces (`types/index.ts`) exactly with Backend DTOs.
*   **State & Headers:** Use Zustand for `activeTenantId` and an Axios interceptor to automatically append the `X-Tenant-ID` header.
*   **UI Components:** Strictly stick to **Shadcn UI** and **Tailwind CSS**. Use **React Hook Form + Zod** for schema validation matching backend rules.
*   **Resilient API Calls:** Wrap all Axios/fetch calls in try-catch blocks. Parse backend error payloads gracefully and display user-friendly toast/alert messages instead of generic "Network Errors".

### **3.6 Event-Driven Standards (Kafka)**
*   **Idempotency:** Kafka consumers must be idempotent (safe to process the same message twice).
*   **Resilience:** All consumers must implement `ErrorHandlingDeserializer` and `spring.json.trusted.packages: "*"` to prevent Poison Pill lockups.
*   **Enrichment:** Order events must be enriched with CRM/Context data before hitting Kafka. If Context API fails, fallback gracefully (e.g., `UNKNOWN`) without failing the order.

---

## **4. AI AUTONOMY & EXECUTION PROTOCOL**

When modifying code as an AI Agent, you must strictly follow this execution loop:
1.  **Analyze Impact:** Check how a change in one microservice affects the other 8 before writing code.
2.  **Autonomous Execution:** If a build/compilation fails, retry a maximum of **3 times**.
3.  **Failure Logging:** If it still fails, log the stack trace into `ERROR_LOG.md` and move to the next phase. DO NOT get stuck in an infinite loop.
4.  **Progress:** Mark completed checklist items with `[x]`. 
5.  **No Improvisation:** System integrity is more important than speed. Stick to the architecture. Do not redesign the wheel.