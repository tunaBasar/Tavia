# **TAVIA_UI_MASTER_PLAN.md**

## **1. MISSION**

Transform the existing **TAVIA V2 backend system** into a **modern, real-time, AI-driven dashboard UI**.

The UI must:

* Reflect **contextual intelligence**
* Surface **AI decisions clearly**
* Provide **controlled interaction (simulate orders)**

This is NOT a static dashboard.
This is an **operational control panel**.

---

## **2. NON-NEGOTIABLE RULES**

### **2.1 Autonomy Rules**

* Ask for terminal execution approval when necessary.
* If build fails:

  * Retry max **3 times**
  * If still failing → log into `ERROR_LOG.md` and continue
* Mark completed steps with `[x]`

---

### **2.2 Technology Constraints (STRICT)**

Use ONLY:

* Next.js (App Router)
* React 19
* TypeScript
* Tailwind CSS v4
* Shadcn UI
* TanStack Query (preferred)

DO NOT:

* Introduce Redux, Zustand, or other state managers
* Use outdated routing (Pages Router)
* Add unnecessary dependencies

---

### **2.3 API Access Rule**

ALL API calls MUST go through:

```id="p1"
http://localhost:8080
```

NO direct service calls.

---

## **3. PROJECT INITIALIZATION**

### **3.1 Create Project**

Create a new Next.js project:

* App Router enabled
* TypeScript enabled
* Tailwind CSS enabled

Project name:

```id="p2"
tavia-ui
```

---

### **3.2 Install Core Dependencies**

* Shadcn UI
* TanStack Query

Initialize Shadcn properly.

---

## **4. STEP 1 — INFRASTRUCTURE & API PROXY**

### **4.1 next.config.mjs**

Add rewrite rule:

```id="p3"
/api/:path*  →  http://localhost:8080/api/v1/:path*
```

Purpose:

* Avoid CORS issues
* Keep frontend clean

---

### **4.2 Folder Structure**

```id="p4"
app/
  layout.tsx
  page.tsx

components/
  ui/ (shadcn)
  layout/
  dashboard/

lib/
  api/
  hooks/

types/
```

---

### **4.3 API Layer**

Create a centralized API layer:

* `lib/api/client.ts`
* Use fetch or TanStack Query wrappers

DO NOT scatter API calls across components.

---

## **5. STEP 2 — GLOBAL LAYOUT ARCHITECTURE**

### **5.1 Root Layout**

File:

```id="p5"
app/layout.tsx
```

Structure:

* Sidebar (left)
* Header (top)
* Content (main)

---

### **5.2 Sidebar**

Sections:

* Overview
* Customers
* Orders
* AI Insights

Use Shadcn components:

* Sidebar
* Button
* Navigation Menu

Sidebar must be:

* Persistent
* Clean
* Minimal

---

### **5.3 Header**

Top bar includes:

* Project title: **TAVIA V2**
* Right side:

  * Live clock (auto updating)
  * Date display

Clock must update in real-time (client-side).

---

## **6. STEP 3 — OVERVIEW DASHBOARD**

### **6.1 Route**

```id="p6"
app/page.tsx
```

---

### **6.2 Layout Composition**

Grid layout:

* Top: Metrics cards
* Left/Main: Key metrics
* Right: AI Live Feed panel

---

### **6.3 Metrics Cards**

#### **Card 1 — Total Customers**

* API:

```id="p7"
GET /api/v1/crm/customers
```

* Display:

  * Total count
* Use:

  * Shadcn Card

---

#### **Card 2 — Current Context**

* API:

```id="p8"
GET /api/v1/context/{uuid}/current
```

* Display:

  * Weather
  * Active Event
  * Competitor Intensity

Example:

```id="p9"
RAINY | EXAM_WEEK | HIGH
```

---

### **6.4 AI Live Feed Panel**

Purpose:

* Show AI decision stream

For now:

* STATIC placeholder logs

Example entries:

```id="p10"
[AI] Increased Latte price by 5%
[AI] Triggered discount due to high competition
```

Design:

* Scrollable panel
* Dark/terminal-like feel
* Timestamped entries

---

### **6.5 Simulate Order Button**

Location:

* Top right of dashboard

Component:

* Shadcn Button (primary, prominent)

---

### **Behavior**

On click:

* Send POST request:

```id="p11"
POST /api/v1/orders
```

Payload:

* Mock order JSON (hardcoded)

---

### **Constraints**

* MUST NOT block UI
* Show loading state
* Show success/failure feedback

---

## **7. DATA FETCHING STRATEGY**

### **7.1 Use TanStack Query**

For:

* Customers
* Context

Benefits:

* Caching
* Refetching
* Background sync

---

### **7.2 Query Rules**

* Refetch interval allowed for context (optional)
* Avoid unnecessary re-renders

---

## **8. UI/UX PRINCIPLES**

* Minimal but informative
* No visual clutter
* Clear hierarchy
* Fast perception of system state

---

## **9. ERROR HANDLING**

If API fails:

* Show fallback UI
* Do NOT crash page

Log errors to:

```id="p12"
ERROR_LOG.md
```

---

## **10. DONE CRITERIA**

A phase is complete if:

* Page renders without error
* API data is visible
* Layout is stable
* No console errors

---

## **11. EXECUTION ORDER (CHECKLIST)**

```id="p13"
[ ] Project Initialization
[ ] Shadcn Setup
[ ] API Proxy (rewrites)
[ ] Layout निर्माण (Sidebar + Header)
[ ] Overview Page
[ ] Metrics Cards (Customers + Context)
[ ] AI Live Feed (Static)
[ ] Simulate Order Button
```

---

## **12. STRATEGIC NOTE**

This UI is not decoration.

It is:

* A **visibility layer** for intelligence
* A **control surface** for behavior
* A **translation layer** between raw data and decisions

Bad UI = invisible intelligence
Good UI = amplified system power

---

Follow the plan. Do not improvise.
