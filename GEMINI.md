# **TAVIA V2 - SYSTEM CONTEXT, ARCHITECTURE & CODING LAWS**

## **1. EXECUTIVE SUMMARY & SYSTEM VISION**
TAVIA V2 is a **Global Loyalty Ecosystem and Autonomous Smart Cafe Platform**. 
You are acting as an Elite Senior Full-Stack Architect. Every line of code must be written with the foresight that this system is managed by AI models optimizing for tenant profit, and physical IoT robots preparing orders in the year **2026** and beyond.

### **The Three Primary Pillars:**
1.  **Tenant Profit Optimization Agent:** Analyzes real-world 2026 temporal data (exams, holidays, weather, competitor occupancy) to optimize dynamic pricing and forecast raw material inventory.
2.  **Customer Experience Agent:** Manages mobile app (React Native/Expo) interactions, providing context-aware discounts and localized loyalty rewards.
3.  **IoT Autonomous Execution (Future):** Smart machines will physically brew the coffee and emit events about exact raw material consumption. The software architecture must be fundamentally ready for this event-driven physical reality.

---

## **2. THE DOMAIN LAWS (CRITICAL BUSINESS LOGIC)**

### **2.1 Global Customers, Local Loyalty**
*   **Global Ecosystem:** A `Customer` is a global entity (identified by a unique email) moving across the Tavia network. The `customers` table MUST NOT contain any `tenant_id`.
*   **Local Loyalty:** A customer's points, tier (BRONZE, SILVER, GOLD, PLATINUM), and total spent are strictly tied to a specific `tenant_id` via the `TenantLoyalty` table. NEVER couple a global customer directly to a single tenant.

### **2.2 Domain-Driven Design: Recipe-Based Production (Crucial)**
*   **Inventory = Raw Materials:** The `tavia-inventory-service` tracks ONLY raw materials (e.g., Milk in ml, Coffee Beans in grams). It NEVER tracks final sold products like "Latte".
*   **Orders = Final Products:** The `tavia-order-service` processes transactions for final products (e.g., "1x Latte").
*   **The Bridge (Catalog & IoT):** A final product is translated into raw materials via a "Recipe" (Bill of Materials). We are anticipating a future `tavia-catalog-service` (for recipes) and `tavia-iot-service` (for machine consumption). *Until they are built, `order-service` must use strictly decoupled Mock/Stub Interfaces to resolve recipes before deducting from inventory.*

### **2.3 The City Enum Constraint**
*   Only 12 cities are valid: `ISTANBUL, ANKARA, IZMIR, BURSA, ANTALYA, ADANA, KONYA, SANLIURFA, GAZIANTEP, KOCAELI, ESKISEHIR, ISPARTA`. No strings; use Enums globally.

---

## **3. STRICT CODING & ENGINEERING RULES (NON-NEGOTIABLE)**

### **3.1 Clean Code & Anti-Spaghetti Architecture**
*   **SOLID & DRY:** Must be strictly followed. Code must be highly modular and predictable.
*   **Guard Clauses (Early Returns):** DO NOT use deep nested `if-else` blocks. Validate inputs at the very beginning of a method and return/throw immediately.
*   **No Mock Data:** NEVER use mock data or hardcoded arrays (unless strictly building a temporary interface stub for future microservices). All data must come from real API or DB integrations. 

### **3.2 Database & Microservice Boundaries**
*   **ID-Based Referencing:** DO NOT create direct JPA `@ManyToOne` relationships across microservice boundaries. Use UUID-based cross-referencing.
*   **Multi-Tenancy Isolation:** Every request to tenant-specific data MUST extract and use the `X-Tenant-ID` header. DO NOT pass tenant IDs as URL query parameters. Spring Boot controllers should enforce this via `@RequestHeader("X-Tenant-ID")`.

### **3.3 Backend (Spring Boot 4.x / Cloud 5.x)**
*   **DTO Sync:** Never expose JPA Entities to the presentation layer. Use strict MapStruct/manual mappers.
*   **Hot-Reload Workflow:** Do not interfere with `spring-boot-devtools` dependencies. The system relies on warm restarts for rapid development.
*   **Gateway Routing:** Use Spring Boot WebFlux structures (`spring.cloud.gateway.server.webflux.routes`) to route traffic to underlying services. Ensure CORS is configured centrally at the Gateway (`allowedOriginPatterns: "*"`).

### **3.4 Global Exception Handling & Observability**
*   **Centralized Error Handling:** EVERY microservice MUST have a `@RestControllerAdvice`. Handle expected failures (like `MissingRequestHeaderException`) gracefully with 400 Bad Request, not 500 Internal Server Error.
*   **Standardized Responses:** Strictly use the 2026 standard `ProblemDetail` (RFC 7807) for REST errors.
*   **Logging:** Always log the error with its context. In a microservice ecosystem, logging without a Correlation ID / Trace ID is unacceptable.

### **3.5 Frontend (Next.js 15) & Mobile (Expo)**
*   **Expo Network Resolution:** NEVER hardcode `localhost` or `10.0.2.2` in the Expo app's Axios config. Use dynamic LAN IP resolution (via `ExpoConstants.expoGoConfig.debuggerHost`) or fallback to `.env` variables to prevent "Network Errors" on physical devices.
*   **State & Headers:** Use Zustand for `activeTenantId` and an Axios interceptor to automatically append the `X-Tenant-ID` header to all requests.
*   **UI Components:** Strictly stick to **Shadcn UI** and **Tailwind CSS**. 

### **3.6 Event-Driven Standards (Kafka)**
*   **Idempotency:** Kafka consumers must be idempotent.
*   **Resilience:** All consumers must implement `ErrorHandlingDeserializer` to prevent Poison Pill lockups.

---

## **4. AI AUTONOMY & EXECUTION PROTOCOL**

When modifying code as an AI Agent, you must strictly follow this execution loop:
1.  **Analyze Impact:** Check how a change in one microservice affects the other 8 before writing code.
2.  **Autonomous Execution:** If a build/compilation fails, retry a maximum of **3 times**.
3.  **Failure Logging:** If it still fails, log the stack trace into `ERROR_LOG.md` and move to the next phase. DO NOT get stuck in an infinite loop.
4.  **No Improvisation:** System integrity is more important than speed. Stick to the architecture. Do not redesign the wheel.