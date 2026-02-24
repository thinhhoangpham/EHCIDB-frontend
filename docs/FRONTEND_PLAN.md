# EHCIDB Frontend Implementation Plan

## Context

The Emergency Healthcare Critical Information Database (EHCIDB) is an academic prototype for an Advanced Database Systems course (CS5356). It provides instant, secure access to life-saving patient data during emergencies when patients are unconscious or unable to communicate. The backend (Python/Django + MySQL) is being built separately by another team member. This plan covers the complete frontend built on the existing Next.js 16 + React 19 + Tailwind v4 + TypeScript starter.

**Key constraint:** The app deploys to GitHub Pages as a static export — no server-side rendering, no Next.js API routes. All data fetching is client-side via REST calls to the Django backend.

---

## 1. Required Pages & Purposes

| Route | Role | Purpose |
|---|---|---|
| `/` | Public | Landing page — redirects to `/login` or appropriate dashboard |
| `/login` | Public | Unified login form (email + password). On success, routes to role dashboard |
| `/dashboard/patient` | Patient | Emergency info summary table (read-only view of own data) |
| `/dashboard/patient/edit` | Patient | Multi-section form to edit profile, blood type, emergency contact |
| `/dashboard/patient/allergies` | Patient | Manage allergies (list + add/remove) |
| `/dashboard/patient/conditions` | Patient | Manage medical conditions |
| `/dashboard/patient/medications` | Patient | Manage medications |
| `/dashboard/patient/devices` | Patient | Manage implanted devices |
| `/dashboard/patient/emergency-contacts` | Patient | Manage emergency contacts |
| `/dashboard/patient/insurance` | Patient | View/edit insurance information |
| `/dashboard/doctor` | Doctor | Search bar (by Emergency ID) + recent searches table |
| `/dashboard/doctor/patient/[emergencyId]` | Doctor | Read-only emergency card showing all critical patient data |
| `/dashboard/admin` | Admin | Tabbed view: User Management + Access Logs |
| `/dashboard/admin/users` | Admin | Full user list with deactivate/edit actions |
| `/dashboard/admin/users/[userId]/edit` | Admin | Edit user role/status |
| `/dashboard/admin/insurance-providers` | Admin | Manage insurance provider master list |

---

## 2. Page Layouts (Mobile-First)

### Global Shell
```
┌─────────────────────────────────────────┐
│  [Logo] EHCIDB     [Role Badge] [Logout]│  ← TopNav (sticky)
├────────┬────────────────────────────────┤
│ Nav    │                                │  ← Sidebar (desktop only)
│ Links  │     Page Content               │
│        │                                │
│        │                                │
└────────┴────────────────────────────────┘

Mobile: Sidebar collapses to hamburger menu drawer
```

### Login Page
```
┌─────────────────────────┐
│       EHCIDB Logo       │
│                         │
│   ┌─────────────────┐   │
│   │ Email           │   │
│   ├─────────────────┤   │
│   │ Password        │   │
│   ├─────────────────┤   │
│   │   [ Login ]     │   │
│   └─────────────────┘   │
│                         │
│  [Demo: Patient|Doctor| │  ← Demo mode only
│         Admin]          │
└─────────────────────────┘
```

### Patient Dashboard
```
┌─────────────────────────────────────┐
│ Welcome, Aiden Smith                │
│ Update your emergency medical info  │
├──────────────────┬──────────────────┤
│ Parameter        │ Value            │
├──────────────────┼──────────────────┤
│ Emergency ID     │ EHC1001          │
│ Blood Type       │ O+               │
│ Allergies        │ Penicillin (Sev) │
│ Conditions       │ Diabetes (Crit)  │
│ Medications      │ Metformin 500mg  │
│ Devices          │ Pacemaker        │
│ Emergency Contact│ John Smith       │
├──────────────────┴──────────────────┤
│         [ Edit Information ]        │
└─────────────────────────────────────┘
```

### Doctor Dashboard
```
┌─────────────────────────────────────┐
│ Search by Emergency ID              │
│ ┌──────────────────────┐ [Search]   │
│ └──────────────────────┘            │
├─────────────────────────────────────┤
│ Recent Searches                     │
│ ID      │ Name    │ Blood │ Action  │
│ EHC1003 │ Liam J  │ B+    │ [View]  │
│ EHC1005 │ Ethan G │ O-    │ [View]  │
└─────────────────────────────────────┘
```

### Doctor → Patient Emergency Card
```
┌─────────────────────────────────────┐
│ ⚠ CRITICAL CONDITIONS PRESENT      │  ← Red banner if critical_flag
├─────────────────────────────────────┤
│ Patient: Aiden Smith    ID: EHC1001 │
│ Blood Type: [O+]                    │
├──────────────────┬──────────────────┤
│ ALLERGIES        │ CONDITIONS       │
│ • Penicillin     │ • Diabetes       │
│   [SEVERE]       │   [CRITICAL]     │
├──────────────────┼──────────────────┤
│ MEDICATIONS      │ DEVICES          │
│ • Metformin      │ • Pacemaker      │
│   500mg          │                  │
├──────────────────┴──────────────────┤
│ Emergency Contact: John Smith       │
│ Insurance: BlueCross — Active       │
├─────────────────────────────────────┤
│              [ Print ]              │
└─────────────────────────────────────┘
```

### Admin Dashboard
```
┌─────────────────────────────────────┐
│ [User Management] [Access Logs]     │  ← Tabs
├─────────────────────────────────────┤
│ User Management                     │
│ ID   │ Name    │ Role   │ Status │Act│
│ U001 │ Dr. N   │ Doctor │ Active │[E]│
│ U002 │ Aiden   │ Patient│ Active │[D]│
├─────────────────────────────────────┤
│ Access Logs          Updated: 10s   │
│ Timestamp      │ User    │ Action   │
│ 2026-01-01 12h │ Dr. N   │ View P   │
└─────────────────────────────────────┘
```

---

## 3. Core UI Components

### Primitives (`src/components/ui/`)
- **Button** — primary, secondary, danger, ghost variants; loading state
- **Input** — text input with label, error message, icon slot
- **Select** — dropdown for blood type, severity, role, plan type
- **Badge** — color-coded pills for blood type, severity, critical flag, coverage status
- **Spinner** — loading indicator
- **Modal** — generic dialog (confirm deactivation, delete confirmation)
- **Alert** — success/error/warning banners
- **Table** — reusable sortable table with column definitions
- **Card** — content card with header slot
- **EmptyState** — zero-data placeholder with icon + message
- **Skeleton** — animated placeholder for loading states

### Layout (`src/components/layout/`)
- **TopNav** — logo + role badge + user name + logout
- **Sidebar** — desktop nav links scoped to current role
- **MobileNav** — hamburger drawer for mobile
- **DashboardShell** — composes TopNav + Sidebar + main content area
- **PageHeader** — page title + optional action button

### Role-Specific Components
- **Patient:** `EmergencyInfoTable`, `AllergyList`, `ConditionList`, `MedicationList`, `DeviceList`, `EmergencyContactList`, `InsuranceCard`, `PatientEditForm`
- **Doctor:** `PatientSearchBar`, `RecentSearchesTable`, `PatientEmergencyCard`, `CriticalBadge`
- **Admin:** `UserManagementTable`, `AccessLogTable`, `InsuranceProviderTable`, `UserEditModal`
- **Auth:** `LoginForm`, `RoleGuard`

---

## 4. Technology Stack

### Already Installed
| Technology | Version | Role |
|---|---|---|
| Next.js | 16.1.6 | Framework (App Router, static export) |
| React | 19.2.3 | UI library |
| TypeScript | ^5 | Type safety |
| Tailwind CSS | v4 | Utility-first styling |

### To Install
| Package | Purpose | Justification |
|---|---|---|
| `axios` | HTTP client | Interceptors for JWT attachment + 401 handling; cleaner than raw fetch |
| `react-hook-form` | Form state management | Performant, minimal re-renders for patient edit forms |
| `zod` | Schema validation | Type-safe validation shared between forms and API responses |
| `@hookform/resolvers` | Zod-to-form bridge | Connects Zod schemas to react-hook-form |
| `clsx` | Conditional classnames | Clean conditional class composition |
| `tailwind-merge` | Class conflict resolution | Prevents Tailwind class conflicts in component variants |
| `lucide-react` | Icons | Search, edit, shield, alert, menu icons |
| `date-fns` | Date formatting | Format access log timestamps (lightweight, tree-shakeable) |

### Not Adding (and why)
| Avoided | Reason |
|---|---|
| Redux / Zustand | Overkill for 3-role prototype with minimal shared state |
| NextAuth.js | Requires server-side API routes — incompatible with static export |
| React Query / SWR | Custom `useApi` hook is sufficient for this scope |
| Prisma / Drizzle | Database is managed by backend team (Django + MySQL) |

---

## 5. Database Connection Architecture

```
┌──────────────────────┐         ┌──────────────────────┐         ┌──────────┐
│  Next.js Static SPA  │  HTTPS  │  Django/Flask REST    │  ORM    │  MySQL   │
│  (GitHub Pages)      │ ──────> │  API Server           │ ──────> │  Database │
│                      │  JWT    │                       │         │          │
└──────────────────────┘         └──────────────────────┘         └──────────┘
```

### API Client (`src/lib/api/client.ts`)
- Axios instance with `baseURL` from `NEXT_PUBLIC_API_BASE_URL` env var
- **Request interceptor:** attaches `Authorization: Bearer <token>` from localStorage
- **Response interceptor:** on 401, clears stored auth and redirects to `/login`

### API Modules (one per domain)
- `src/lib/api/auth.ts` — `login()`, `logout()`
- `src/lib/api/patients.ts` — `getMyProfile()`, `updateProfile()`, CRUD for allergies/conditions/medications/devices/contacts/insurance
- `src/lib/api/doctors.ts` — `getPatientByEmergencyId()`
- `src/lib/api/admin.ts` — `getUsers()`, `updateUser()`, `deactivateUser()`, `getAccessLogs()`
- `src/lib/api/insurance.ts` — `getProviders()`, `addProvider()`, `updateProvider()`

### Expected API Endpoints (coordinate with backend team)
```
POST   /api/auth/login/
POST   /api/auth/logout/
GET    /api/patients/me/
PATCH  /api/patients/me/
GET    /api/patients/me/allergies/
POST   /api/patients/me/allergies/
DELETE /api/patients/me/allergies/:id/
GET    /api/patients/me/conditions/
POST   /api/patients/me/conditions/
DELETE /api/patients/me/conditions/:id/
GET    /api/patients/me/medications/
POST   /api/patients/me/medications/
DELETE /api/patients/me/medications/:id/
GET    /api/patients/me/devices/
POST   /api/patients/me/devices/
DELETE /api/patients/me/devices/:id/
GET    /api/patients/me/emergency-contacts/
POST   /api/patients/me/emergency-contacts/
PATCH  /api/patients/me/emergency-contacts/:id/
DELETE /api/patients/me/emergency-contacts/:id/
GET    /api/patients/me/insurance/
PATCH  /api/patients/me/insurance/
GET    /api/patients/emergency/:emergencyId/          (doctor access)
GET    /api/admin/users/
PATCH  /api/admin/users/:id/
GET    /api/admin/access-logs/
GET    /api/admin/insurance-providers/
POST   /api/admin/insurance-providers/
PATCH  /api/admin/insurance-providers/:id/
DELETE /api/admin/insurance-providers/:id/
```

### CORS Requirement
Backend must set `Access-Control-Allow-Origin` to the GitHub Pages domain. This is the backend team's responsibility but should be coordinated early.

---

## 6. Authentication & Authorization Flow

### Login Flow
1. User submits email + password on `/login`
2. `POST /api/auth/login/` returns `{ access_token, refresh_token, user: { id, name, role } }`
3. Frontend stores in `localStorage`: token, refresh token, user object
4. Frontend reads `user.role` and redirects to `/dashboard/{role}`

### Route Protection
- `AuthContext` (React Context) wraps the root layout, initializes from localStorage on mount
- `dashboard/layout.tsx` checks for valid token; no token → redirect to `/login`
- Each role sub-layout (`patient/layout.tsx`, `doctor/layout.tsx`, `admin/layout.tsx`) verifies the user's role matches; mismatch → redirect to correct dashboard
- A loading skeleton is shown during the auth check to prevent flash of protected content

### Token Storage
- `localStorage` keys: `ehcidb_token`, `ehcidb_refresh`, `ehcidb_user`
- Acceptable for academic prototype; production would use HttpOnly cookies

### Access Control Rules (enforced by backend, reflected in UI)
| Role | Can Access |
|---|---|
| Patient | Own profile, own medical records (CRUD), own insurance (CRUD) |
| Doctor | Search patients by Emergency ID (read-only), limited insurance view |
| Admin | All users (manage), access logs (read), insurance providers (CRUD) |

---

## 7. State Management Strategy

**Approach: React Context + local component state. No external state library.**

| State | Location |
|---|---|
| Authenticated user + token | `AuthContext` (single global context) |
| Patient profile data | `useState` in patient pages, fetched on mount |
| Doctor search results | `useState` in doctor pages |
| Doctor recent searches | `localStorage` via `useRecentSearches` hook (persists across sessions) |
| Admin user list + access logs | `useState` in admin pages |
| Form state | `react-hook-form` (component-scoped) |
| Loading/error per API call | `useApi` custom hook wrapping each call |

### Custom Hooks
- `useAuth()` — read/write user + token from context
- `useAuthGuard(role)` — checks role, redirects if mismatch, returns `ready` boolean
- `useApi(apiFn)` — returns `{ data, loading, error, execute }` wrapping any API function
- `useRecentSearches()` — manages doctor's last 10 lookups in localStorage

---

## 8. Directory Structure

```
src/
├── app/
│   ├── globals.css                         # Tailwind v4 + design tokens
│   ├── layout.tsx                          # Root layout + AuthProvider
│   ├── page.tsx                            # Landing → redirect
│   ├── not-found.tsx                       # 404
│   ├── login/page.tsx
│   └── dashboard/
│       ├── layout.tsx                      # DashboardShell + auth guard
│       ├── patient/
│       │   ├── layout.tsx                  # Patient role guard
│       │   ├── page.tsx                    # Emergency info summary
│       │   ├── edit/page.tsx
│       │   ├── allergies/page.tsx
│       │   ├── conditions/page.tsx
│       │   ├── medications/page.tsx
│       │   ├── devices/page.tsx
│       │   ├── emergency-contacts/page.tsx
│       │   └── insurance/page.tsx
│       ├── doctor/
│       │   ├── layout.tsx                  # Doctor role guard
│       │   ├── page.tsx                    # Search + recent searches
│       │   └── patient/[emergencyId]/page.tsx
│       └── admin/
│           ├── layout.tsx                  # Admin role guard
│           ├── page.tsx                    # User management + logs
│           ├── users/page.tsx
│           ├── users/[userId]/edit/page.tsx
│           └── insurance-providers/
│               ├── page.tsx
│               ├── new/page.tsx
│               └── [providerId]/edit/page.tsx
├── components/
│   ├── ui/         (Button, Input, Select, Badge, Spinner, Modal, Alert, Table, Card, EmptyState, Skeleton)
│   ├── layout/     (TopNav, Sidebar, MobileNav, DashboardShell, PageHeader)
│   ├── auth/       (LoginForm, RoleGuard)
│   ├── patient/    (EmergencyInfoTable, AllergyList, ConditionList, MedicationList, DeviceList, EmergencyContactList, InsuranceCard, PatientEditForm)
│   ├── doctor/     (PatientSearchBar, RecentSearchesTable, PatientEmergencyCard, CriticalBadge)
│   └── admin/      (UserManagementTable, AccessLogTable, InsuranceProviderTable, UserEditModal)
├── contexts/
│   └── AuthContext.tsx
├── hooks/
│   ├── useAuth.ts
│   ├── useAuthGuard.ts
│   ├── useApi.ts
│   └── useRecentSearches.ts
├── lib/
│   ├── api/
│   │   ├── client.ts       # Axios instance + interceptors
│   │   ├── auth.ts
│   │   ├── patients.ts
│   │   ├── doctors.ts
│   │   ├── admin.ts
│   │   └── insurance.ts
│   ├── constants.ts         # Role enum, blood type options, API URL
│   └── utils.ts             # cn() classname helper, formatDate
└── types/
    ├── api.ts               # User, Patient, Doctor, Hospital, etc.
    ├── auth.ts              # JWTPayload, AuthState, UserRole
    └── forms.ts             # Zod schemas for forms
```

---

## 9. Config Changes Required

### `next.config.ts`
```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
};

export default nextConfig;
```
Note: The GitHub Actions `configure-pages` action auto-injects `basePath` for Pages deployment.

### `.env.local` (create, gitignored)
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
```

### `.env.example` (create, committed)
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
```

---

## 10. Suggested Improvements & Nice-to-Have Features

### High Value / Low Effort
1. **Demo Mode login** — env flag `NEXT_PUBLIC_DEMO_MODE=true` shows three pre-filled login buttons ("Login as Patient / Doctor / Admin") for smooth grading demos
2. **Critical Condition alert banner** — red pulsing banner on doctor's patient view when any condition has `critical_flag = true`
3. **Recent Searches persistence** — doctor's last 10 lookups stored in localStorage, survive page refresh
4. **Skeleton loading states** — animated grey placeholder rows on all tables while fetching
5. **Blood type color badges** — color-coded badges (red for negative types, green for positive)

### Medium Effort / High Demo Impact
6. **Emergency ID QR Code** — patient dashboard displays a QR code of their Emergency ID (using `qrcode.react`), scannable by doctors
7. **Print-optimized emergency card** — "Print" button with `@media print` CSS showing only critical fields on one page
8. **Form validation with real-time feedback** — Zod + react-hook-form inline errors as user types
9. **API connection status indicator** — green/red dot in TopNav checking `GET /health/` every 60s
10. **Access log auto-refresh** — admin log table polls every 30s with "Last updated: Xs ago" counter

---

## 11. Implementation Sequence

### Phase 1 — Foundation ✅ COMPLETE
1. ✅ Update `next.config.ts` with `output: 'export'`
2. ✅ Install packages: `axios`, `react-hook-form`, `zod`, `@hookform/resolvers`, `clsx`, `tailwind-merge`, `lucide-react`, `date-fns`
3. ✅ Create TypeScript types (`src/types/api.ts`) — `auth.ts` and `forms.ts` deferred to Phase 2
4. ✅ Create API client + modules (`src/lib/api/client.ts`, `auth.ts`, `patients.ts`, `doctors.ts`, `admin.ts`, `insurance.ts`)
5. ✅ Create `AuthContext` + wrap root layout + create hooks (`useAuth`, `useAuthGuard`, `useApi`, `useRecentSearches`)
6. ✅ Create `src/lib/utils.ts` with `cn()`, `formatDate()`, `formatRelativeTime()`
7. ✅ Create `src/lib/constants.ts` with `ROLES`, `ROLE_DASHBOARD`, `BLOOD_TYPES`, `LOCAL_STORAGE_KEYS`

### Phase 2 — Auth + Navigation
7. Build UI primitives (Button, Input, Alert, Spinner, Card, Badge, Table)
8. Build layout components (TopNav, Sidebar, MobileNav, DashboardShell)
9. Build login page + LoginForm
10. Implement `useAuthGuard` + role-specific dashboard layouts

### Phase 3 — Patient Dashboard
11. Build EmergencyInfoTable (patient home view)
12. Build each list component (allergies, conditions, medications, devices, contacts)
13. Build PatientEditForm with Zod validation
14. Build insurance management page

### Phase 4 — Doctor Dashboard
15. Build PatientSearchBar + RecentSearchesTable
16. Build PatientEmergencyCard with CriticalBadge
17. Wire up emergency ID search API

### Phase 5 — Admin Dashboard
18. Build UserManagementTable with deactivate/edit
19. Build AccessLogTable with auto-refresh
20. Build Insurance Provider CRUD pages

### Phase 6 — Polish
21. Add skeleton loading states to all tables
22. Add demo mode login buttons
23. Add print stylesheet for doctor view
24. Final responsive/mobile testing

---

## 12. Verification Plan

### Local Development
1. Run `npm run dev` and verify all routes render without errors
2. Test login flow with mock API or demo mode
3. Verify role-based redirects (patient can't access `/dashboard/admin`, etc.)
4. Test all CRUD operations on patient data forms
5. Test doctor search by Emergency ID
6. Test admin user management + access log display
7. Test responsive layouts at 375px (mobile), 768px (tablet), 1280px (desktop)

### Build Verification
8. Run `npm run build` — confirm static export succeeds with no errors
9. Run `npm run lint` — zero warnings/errors
10. Verify `out/` directory contains all expected HTML files

### Integration Testing (when backend is ready)
11. Point `NEXT_PUBLIC_API_BASE_URL` to Django dev server
12. Test full login → dashboard → CRUD → logout cycle for each role
13. Verify CORS headers work between frontend and backend origins
14. Test 401 handling (expired token → automatic redirect to login)

### Deployment
15. Push to `main` → verify GitHub Actions builds and deploys successfully
16. Verify live GitHub Pages site loads and routes work correctly
