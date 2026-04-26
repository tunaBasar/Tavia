# **TAVIA_ECOSYSTEM_MASTER_PLAN.md**

## **1. MISSION**

Transform TAVIA V2 from a **single-tenant SaaS system** into a **Global Loyalty Ecosystem**.

Core shift:

* From isolated customers → **global customer pool**
* From simple tenant data → **location-aware ecosystem**
* From static loyalty → **tenant-scoped loyalty tracking**

---

## **2. NON-NEGOTIABLE RULES**

### **2.1 NO MOCK DATA (CRITICAL)**

* NEVER use mock data
* ALL data must come from real API or database
* If data is missing → handle gracefully, DO NOT fake it

---

### **2.2 AUTONOMOUS EXECUTION**

* If its neccessary to ask for approval just explain and confirm me 
* If build fails:

  * Retry max 3 times
  * If still failing → log into `ERROR_LOG.md`
* Mark completed steps with `[x]`

---

### **2.3 FULL-STACK MODIFICATION REQUIRED**

Agent MUST modify:

* Java (Spring Boot)

  * Entities
  * Repositories
  * Controllers
  * DTOs

* Frontend (Next.js)

  * Pages
  * Components
  * Zustand store
  * Zod schemas

Partial implementation is NOT acceptable.

---

### **2.4 DATABASE CONSISTENCY**

* Use existing PostgreSQL config
* DO NOT create new databases
* Use `ddl-auto: update`

---

## **3. GLOBAL DOMAIN MODEL UPDATE**

---

## **STEP 1 — CREATE GLOBAL CITY ENUM**

### **1.1 Backend (Shared Enum)**

Create a reusable enum:

```id="e1"
City
```

Values:

```id="e2"
ISTANBUL, ANKARA, IZMIR, BURSA, ANTALYA,
ADANA, KONYA, SANLIURFA, GAZIANTEP,
KOCAELI, ESKISEHIR, ISPARTA
```

---

### **1.2 Apply to Tenant**

File:

```id="e3"
tavia-tenant-service/src/main/java/.../Tenant.java
```

* Replace `location` field with `City` enum
* Use `@Enumerated(EnumType.STRING)`

---

### **1.3 Apply to Customer**

File:

```id="e4"
tavia-crm-service/src/main/java/.../Customer.java
```

* Add field:

```id="e5"
City city;
```

---

## **STEP 2 — GLOBAL CUSTOMER & TENANT LOYALTY MODEL**

---

### **2.1 Create Entity: TenantLoyalty**

Service:

```id="e6"
tavia-crm-service
```

Create:

```id="e7"
TenantLoyalty.java
```

---

### **2.2 Fields**

```id="e8"
UUID id
UUID customerId
UUID tenantId
LoyaltyLevel loyaltyLevel
BigDecimal totalSpentInThisTenant
```

---

### **2.3 LoyaltyLevel Enum**

```id="e9"
BRONZE, SILVER, GOLD, PLATINUM
```

---

### **2.4 Repository Layer**

Create:

```id="e10"
TenantLoyaltyRepository
```

Required query:

* Find by `tenantId`
* Find by `customerId + tenantId`

---

### **2.5 Database Relationship Strategy**

IMPORTANT:

* DO NOT create direct JPA relationships (no @ManyToOne)
* Use **ID-based referencing only**

Reason:

* Microservice boundaries must remain intact

---

## **STEP 3 — CRM SERVICE API UPDATE**

---

### **3.1 Modify Endpoint**

```id="e11"
GET /api/v1/crm/customers?tenantId=...
```

---

### **3.2 Behavior**

* Fetch TenantLoyalty by tenantId
* Extract customerIds
* Return ONLY matching customers

---

### **3.3 DTO Update**

Customer response MUST include:

```id="e12"
customerId
name
email
city
loyaltyLevel (from TenantLoyalty)
totalSpentInThisTenant
```

---

## **STEP 4 — TENANT SERVICE UPDATE**

---

### **4.1 Tenant Registration**

Ensure:

* `location` is required
* Must be one of City enum values

---

### **4.2 Validation**

* Reject invalid city values
* Use enum-based validation

---

## **STEP 5 — FRONTEND GLOBAL UPDATE (tavia-ui)**

---

### **5.1 Zustand Store Update**

File:

```id="e13"
store/
```

Add:

* activeTenant
* reset() method

---

### **5.2 LOGOUT IMPLEMENTATION**

Location:

* Sidebar or Header

Behavior:

* Call Zustand `reset()`
* Redirect to:

```id="e14"
/login
```

---

## **STEP 6 — REGISTER PAGE UPDATE**

---

### **6.1 Tenant Registration Form**

File:

```id="e15"
app/register/page.tsx
```

---

### **6.2 Location Field**

* Replace text input with Select

Options:

* MUST match City enum exactly

---

### **6.3 Validation**

* Use Zod schema
* Reject invalid values

---

## **STEP 7 — DASHBOARD UPDATE**

---

### **7.1 Display Tenant City**

Location:

* Header or Badge

Display:

```id="e16"
Active Tenant City: KONYA
```

---

## **STEP 8 — CUSTOMER CREATION FLOW**

---

### **8.1 Global Customer Creation**

When creating new customer:

* Assign:

```id="e17"
customer.city = activeTenant.city
```

---

### **8.2 Constraint**

* DO NOT allow undefined city
* MUST always be set

---

## **STEP 9 — API INTEGRATION (FRONTEND)**

---

### **9.1 Customer List Request**

```id="e18"
GET /api/v1/crm/customers?tenantId=<activeTenantId>
```

---

### **9.2 Remove Any Static Data**

* DELETE all mock arrays
* DELETE fake placeholders

---

## **STEP 10 — BUILD & FINALIZATION**

---

### **10.1 Frontend Build**

Run:

```id="e19"
npm run build
```

---

### **10.2 Backend Restart**

ALL services MUST be restarted:

* tenant-service
* crm-service
* gateway

---

### **10.3 Verification Checklist**

```id="e20"
[ ] City enum applied globally
[ ] Tenant location uses enum
[ ] Customer has city field
[ ] TenantLoyalty table exists
[ ] Customer filtering by tenant works
[ ] No mock data exists
[ ] UI shows tenant city
[ ] Register uses City select
[ ] Logout works
[ ] Customer creation assigns city
```

---

## **11. FAILURE HANDLING**

If any step fails:

```id="e21"
Log into ERROR_LOG.md
Skip after 3 attempts
Continue next step
```

---

## **12. STRATEGIC NOTE**

This is the point where your system either:

* Becomes a **platform**
* Or collapses under inconsistent data models

Critical risks:

* Enum mismatch between frontend/backend
* Broken tenant-customer mapping
* Accidental tight coupling

---

## **FINAL ORDER**

Follow steps sequentially.
Do not redesign.
Do not improvise.

System integrity > speed.
