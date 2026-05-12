<div align="center">

# TAVIA V2

### Global Loyalty Ecosystem & Autonomous Smart Cafe Platform

A multi-tenant SaaS platform combining **AI-powered profit optimization**, **Gemini-driven customer experience**, and **IoT autonomous machine execution** into a single, event-driven microservice ecosystem.

![Java](https://img.shields.io/badge/Java-21-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-4.0.6-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)
![Spring Cloud](https://img.shields.io/badge/Spring_Cloud-2025.1.1-6DB33F?style=for-the-badge&logo=spring&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![Expo](https://img.shields.io/badge/Expo-54-000020?style=for-the-badge&logo=expo&logoColor=white)
![Kafka](https://img.shields.io/badge/Kafka-7.4.0-231F20?style=for-the-badge&logo=apachekafka&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-7-DC382D?style=for-the-badge&logo=redis&logoColor=white)

</div>

---

## Product Vision — Hybrid Multi-Agent Architecture

TAVIA V2 operates under strict hardware constraints (16 GB RAM, 4 GB VRAM) which **forbid local LLMs**. Instead, a hybrid multi-agent strategy delivers world-class autonomy:

| Pillar | Agent | Technology | Purpose |
|--------|-------|------------|---------|
| **Tenant Profit Optimization** | Tabular ML Agent | Scikit-Learn / XGBoost via `tavia-ml-engine` (Python/FastAPI, ~200 MB RAM) + gRPC bridge | Dynamic pricing, demand forecasting, predictive maintenance scoring |
| **Customer Experience** | NLP / Chatbot Agent | Gemini API (Cloud LLM) via `GeminiApiClient` | Context-aware discovery, personalized coupons, loyalty rewards, customer support chat |
| **IoT Autonomous Execution** | Autonomous Command Center | Kafka event-driven + Redis Feature Store + `PredictiveMaintenanceScheduler` | Machine telemetry, order execution, `SCHEDULE_MAINTENANCE` commands when failure probability > 90% |

---

## Architecture Diagram

```mermaid
graph TB
    %% ── Entry Points ──────────────────────────────
    WebUI["<b>Tenant Dashboard</b><br/>Next.js 16 · Shadcn · Tailwind v4"]
    MobileUI["<b>Customer Mobile</b><br/>Expo 54 · React Native"]
    Simulator["<b>Traffic Simulator</b><br/>OpenFeign · SSE Dashboard"]

    WebUI --> GW
    MobileUI --> GW
    Simulator --> GW

    %% ── Infrastructure Layer ──────────────────────
    subgraph INFRA ["Infrastructure"]
        direction LR
        CFG["tavia-config-service<br/><i>:8888 · Native Profile</i>"]
        EUR["tavia-discovery-service<br/><i>:8761 · Eureka</i>"]
    end

    GW["<b>tavia-api-gateway</b><br/><i>:8080 · WebFlux · CORS · lb:// routes</i>"]

    CFG -. "YAML config" .-> GW
    CFG -. "YAML config" .-> EUR
    GW -. "service lookup" .-> EUR

    %% ── Core Domain Services ──────────────────────
    subgraph CORE ["Core Domain Services"]
        direction TB
        TNT["<b>tenant-service</b><br/><i>:8081</i><br/>Cafe registration & login"]
        CRM["<b>crm-service</b><br/><i>:8086</i><br/>Global customers · Tenant loyalty"]
        ORD["<b>order-service</b><br/><i>:8082</i><br/>Final-product orders"]
        INV["<b>inventory-service</b><br/><i>:8083</i><br/>Raw-material stock"]
        CAT["<b>catalog-service</b><br/><i>:8084</i><br/>Recipe / BOM bridge"]
        CTX["<b>context-service</b><br/><i>:8087</i><br/>Weather · Events · Competition"]
        IOT["<b>iot-service</b><br/><i>:8088</i><br/>Machines · Telemetry · Tasks"]
        SUP["<b>supply-service</b><br/><i>:8090</i><br/>Vendor integrations"]
    end

    subgraph AI_LAYER ["AI & Analytics"]
        direction TB
        AIS["<b>ai-service</b><br/><i>:8089</i><br/>Rule Engine · Chat · Maintenance"]
        REDIS[("Redis<br/><i>Feature Store</i>")]
        GEMINI(["Gemini API<br/><i>Cloud LLM</i>"])
        MLENG(["tavia-ml-engine<br/><i>gRPC stub</i>"])
    end

    GW --> TNT & CRM & ORD & INV & CAT & CTX & IOT & AIS

    %% ── Sync Order Flow ───────────────────────────
    ORD -- "GET customer" --> CRM
    ORD -- "GET context" --> CTX
    ORD -- "GET /resolve" --> CAT
    ORD -- "POST /deduct" --> INV
    ORD -- "POST loyalty/adjust" --> CRM

    %% ── Kafka Event Bus ───────────────────────────
    subgraph KAFKA ["Kafka Event Bus"]
        direction LR
        K1[/"<b>order-events</b>"/]
        K2[/"<b>ai-commands</b>"/]
        K3[/"<b>iot-telemetry-events</b>"/]
        K4[/"<b>iot-consumption-events</b>"/]
    end

    ORD -- "publish" --> K1
    K1 -- "audit consume" --> INV
    K1 -- "analytics consume" --> AIS

    AIS -- "publish" --> K2
    K2 -- "SCHEDULE_MAINTENANCE" --> IOT

    IOT -- "publish" --> K3
    IOT -- "publish" --> K4
    K3 -- "consume" --> AIS

    %% ── AI Connections ────────────────────────────
    AIS <--> REDIS
    AIS -- "REST · composite prompt" --> GEMINI
    AIS -. "gRPC predict" .-> MLENG

    %% ── Data Layer ────────────────────────────────
    PG[("PostgreSQL 15<br/><i>tavia_db · Flyway</i>")]
    TNT & CRM & ORD & INV & CAT & IOT & AIS --> PG

    %% ── Styling ───────────────────────────────────
    classDef infra fill:#1a1a2e,stroke:#e94560,color:#fff
    classDef core fill:#16213e,stroke:#0f3460,color:#eee
    classDef kafka fill:#0d1117,stroke:#f0a500,color:#f0a500
    classDef ai fill:#1b1b2f,stroke:#1faa59,color:#e8e8e8
    classDef ext fill:#2d2d2d,stroke:#888,color:#ccc,stroke-dasharray:5 5
    classDef db fill:#0f3460,stroke:#533483,color:#fff

    class CFG,EUR,GW infra
    class TNT,CRM,ORD,INV,CAT,CTX,IOT,SUP core
    class K1,K2,K3,K4 kafka
    class AIS,REDIS ai
    class GEMINI,MLENG ext
    class PG db
```

---

## Core Modules & Tech Stack

### Backend Backbone
| Layer | Technology | Version |
|-------|------------|---------|
| **JVM** | Java (Temurin Toolchain) | **21** |
| **Framework** | Spring Boot | **4.0.6** |
| **Cloud** | Spring Cloud | **2025.1.1** |
| **Gateway** | Spring Cloud Gateway (WebFlux) | 2025.1.1 |
| **Persistence** | Spring Data JPA + Hibernate | Boot 4.x aligned |
| **Migrations** | Flyway Core + PostgreSQL | **12.5.0** |
| **Validation** | Jakarta Validation | 4.0.6 |
| **Mapping** | MapStruct | **1.5.5.Final** |
| **Messaging** | Spring Kafka | 4.0.6 |
| **Cache** | Spring Data Redis | 4.0.6 |
| **Feign** | Spring Cloud OpenFeign | 2025.1.1 |
| **OpenAPI** | springdoc-openapi (WebMVC) | **3.0.3** |
| **Build** | Gradle (Groovy DSL) + Wrapper | — |

### Infrastructure (Docker Compose)
| Component | Image | Port | Memory Limit |
|-----------|-------|------|--------------|
| **PostgreSQL** | `postgres:15-alpine` | 5432 | 256 MB |
| **Kafka** | `confluentinc/cp-kafka:7.4.0` | 9092 | 512 MB |
| **Zookeeper** | `confluentinc/cp-zookeeper:7.4.0` | 2181 | 128 MB |
| **Redis** | `redis:7-alpine` | 6379 | 64 MB |
| **pgAdmin** | `dpage/pgadmin4` | 5050 | — |

### Tenant Operational Dashboard (`tavia-ui`)
| Layer | Technology | Version |
|-------|------------|---------|
| **Framework** | Next.js (App Router) | **16.2.4** |
| **React** | React + React DOM | **19.2.4** |
| **Styling** | Tailwind CSS (oklch) | **v4** |
| **UI Kit** | Shadcn UI | **4.5.0** |
| **State** | Zustand (persisted) + React Query | 5.0.12 / 5.100.5 |
| **Forms** | React Hook Form + Zod | — |
| **Toasts** | sonner | 2.0.7 |
| **Icons** | lucide-react | 1.11.0 |

### Customer Mobile App (`tavia-customer-ui`)
| Layer | Technology | Version |
|-------|------------|---------|
| **Runtime** | Expo (New Architecture) | **~54.0.33** |
| **Router** | expo-router (typed routes) | **~6.0.23** |
| **React** | React Native | **0.81.5** |
| **HTTP** | Axios | **1.15.2** |
| **State** | Zustand + AsyncStorage | 5.0.12 |
| **Forms** | React Hook Form + Zod | 7.74.0 / 4.4.1 |
| **Animations** | react-native-reanimated | ~4.1.1 |

---

## Service Directory & Ports

| Service | Port | Description |
|---------|------|-------------|
| `tavia-config-service` | **8888** | Spring Cloud Config Server (Native profile, serves `/configurations/`) |
| `tavia-discovery-service` | **8761** | Eureka Server — central service registry |
| `tavia-api-gateway` | **8080** | WebFlux reactive gateway — single public entry point |
| `tavia-tenant-service` | **8081** | Cafe operator registration, login, status management |
| `tavia-order-service` | **8082** | Final-product order processing, enrichment, Kafka publishing |
| `tavia-inventory-service` | **8083** | Raw-material stock tracking (DDD: never tracks final products) |
| `tavia-catalog-service` | **8084** | Recipe / BOM bridge — resolves products into raw ingredients |
| `tavia-crm-service` | **8086** | Global customer identity, tenant-scoped loyalty, auth |
| `tavia-context-service` | **8087** | Environmental context provider (weather, events, competition) |
| `tavia-iot-service` | **8088** | Machine registry, telemetry ingestion, task management |
| `tavia-ai-service` | **8089** | AI analytics, Gemini chat, rule engine, predictive maintenance |
| `tavia-supply-service` | **8090** | External vendor integrations (skeleton) |
| `tavia-traffic-simulator` | **8095** | Closed-loop load generator with SSE dashboard |

---

## Kafka Topic Map

| Topic | Producer | Consumer(s) | Purpose |
|-------|----------|-------------|---------|
| `order-events` | `tavia-order-service` | `tavia-inventory-service`, `tavia-ai-service` | Enriched order event with `deductions[]` |
| `ai-commands` | `tavia-ai-service` | `tavia-iot-service` | Predictive maintenance commands (`SCHEDULE_MAINTENANCE`) |
| `iot-telemetry-events` | `tavia-iot-service` | `tavia-ai-service` | Machine telemetry → Redis Feature Store |
| `iot-consumption-events` | `tavia-iot-service` | — | Raw material consumption from machines |
| `context-events` | — | — | Reserved for environmental context updates |

---

## Getting Started

### Prerequisites
- **Docker & Docker Compose** — for PostgreSQL, Kafka, Zookeeper, Redis, pgAdmin
- **Java 21** (Temurin) — JVM toolchain for all backend services
- **Node.js 20+** — for Next.js and Expo frontends
- **Expo CLI** — for mobile development (`npx expo`)

### Step 1 — Infrastructure

Start the containerized infrastructure:

```bash
docker-compose up -d
```

### Step 2 — Export JVM Memory Constraints

All backend services **must** run with constrained JVM memory to prevent OOM on a 16 GB host running 12+ services:

```bash
export JAVA_TOOL_OPTIONS="-Xms64m -Xmx128m -XX:MaxMetaspaceSize=128m -XX:+UseSerialGC -XX:+TieredCompilation -XX:TieredStopAtLevel=1"
```

### Step 3 — Boot the Backend (Strict Order)

Services must boot in the correct dependency order. Use the provided orchestration script:

```bash
./tavia.sh start
```

The boot sequence follows these phases:

| Phase | Services | Rationale |
|-------|----------|-----------|
| **Phase 0 — Infrastructure** | `tavia-config-service` → `tavia-discovery-service` | Config must be available before any service boots; Eureka registers all others |
| **Phase 1 — Core Data** | `tavia-tenant-service` → `tavia-inventory-service` → `tavia-catalog-service` | Foundational data stores needed by operational services |
| **Phase 2 — Operations** | `tavia-crm-service` → `tavia-order-service` → `tavia-iot-service` → `tavia-supply-service` | Business logic services that depend on Phase 1 |
| **Phase 3 — Analytics** | `tavia-context-service` → `tavia-ai-service` | AI and context enrichment rely on operational services |
| **Phase 4 — Gateway** | `tavia-api-gateway` | Routes are resolved via Eureka; all backends must be registered first |
| **Phase 5 — Simulation** | `tavia-traffic-simulator` | Load generator assumes the full ecosystem is online |

### Step 4 — Tenant Dashboard (Web)

```bash
cd tavia-ui
npm install
npm run dev
```

The Next.js dev server rewrites `/api/:path*` → `http://localhost:8080/api/v1/:path*` through the gateway.

### Step 5 — Customer Mobile App

```bash
cd tavia-customer-ui
npm install
npx expo start
```

> **Note:** Axios base URL is resolved dynamically from `EXPO_PUBLIC_API_URL` → device script URL → `debuggerHost` → `localhost:8080`. Never hardcode IPs.

---

## Key Domain Invariants

- **Global Customer / Local Loyalty** — The `customers` table has **no `tenant_id`**. Loyalty is scoped per-tenant via `tenant_loyalty(customer_id, tenant_id)`.
- **Recipe-Based Production** — `inventory-service` tracks only raw materials. `order-service` processes final products. `catalog-service` is the BOM bridge between them.
- **12-City Enum** — Only `ISTANBUL, ANKARA, IZMIR, BURSA, ANTALYA, ADANA, KONYA, SANLIURFA, GAZIANTEP, KOCAELI, ESKISEHIR, ISPARTA`. Enforced as Java enums and TypeScript enums/unions globally.
- **X-Tenant-ID Header** — Every tenant-scoped request carries `X-Tenant-ID` as a UUID header. Never a query parameter.
- **RFC 7807 ProblemDetail** — All error responses use `ProblemDetail` with `traceId`, `timestamp`, and typed `https://tavia.com/errors/*` URIs.

---

<div align="center">
<sub>Built with precision for the 2026 autonomous cafe era.</sub>
</div>
