# EHCIDB Frontend — Claude Session Notes

## Project Overview

Emergency Healthcare Critical Information Database (EHCIDB) — academic prototype for CS5356 (Advanced Database Systems). Provides emergency access to patient medical data.

- **Framework:** Next.js 16.1.6 + React 19 + TypeScript + Tailwind v4
- **Deployment:** GitHub Pages (static export — no SSR, no API routes)
- **Backend:** Django + MySQL (separate team, REST API)
- **Full plan:** `docs/FRONTEND_PLAN.md`

---

## Phase 1 — Foundation (COMPLETED)

### Changes Made

| File | Status | Notes |
|------|--------|-------|
| `next.config.ts` | Modified | Added `output: "export"`, `images: { unoptimized: true }` |
| `src/lib/utils.ts` | Created | `cn()` helper (clsx + tailwind-merge), `formatDate()`, `formatRelativeTime()` |
| `src/lib/constants.ts` | Created | `ROLES`, `ROLE_DASHBOARD`, `BLOOD_TYPES`, `LOCAL_STORAGE_KEYS` |
| `src/types/api.ts` | Created | All TypeScript types (see below) |
| `src/lib/api/client.ts` | Created | Axios instance + JWT request interceptor + 401 response interceptor |
| `src/lib/api/auth.ts` | Created | `login()`, `logout()` |
| `src/lib/api/patients.ts` | Created | Full CRUD for profile, allergies, conditions, medications, devices, contacts, insurance |
| `src/lib/api/doctors.ts` | Created | `getPatientByEmergencyId()`, `PatientEmergencyData` interface |
| `src/lib/api/admin.ts` | Created | `getUsers()`, `updateUser()`, `deactivateUser()`, `getAccessLogs()` |
| `src/lib/api/insurance.ts` | Created | `getProviders()`, `addProvider()`, `updateProvider()`, `deleteProvider()` |
| `src/contexts/AuthContext.tsx` | Created | `AuthProvider` + `AuthContext` with `setAuth`, `clearAuth`, `isLoading` |
| `src/hooks/useAuth.ts` | Created | Consumes `AuthContext`, throws if used outside provider |
| `src/hooks/useAuthGuard.ts` | Created | Redirects to `/login` if no token; redirects to correct dashboard if wrong role |
| `src/hooks/useApi.ts` | Created | Generic `{ data, loading, error, execute }` wrapper for any API function |
| `src/hooks/useRecentSearches.ts` | Created | Doctor's last 10 searches, persisted in localStorage |
| `src/app/layout.tsx` | Modified | Wrapped `{children}` with `<AuthProvider>` |

### Packages Installed

```
axios react-hook-form zod @hookform/resolvers clsx tailwind-merge lucide-react date-fns
```

### TypeScript Types (src/types/api.ts)

Key types defined — student contributed the four medical record types:

- `UserRole` — `"patient" | "doctor" | "admin"`
- `User`, `AuthResponse`
- `BloodType` — 8-value union
- `PatientProfile`
- `Severity` — `"mild" | "moderate" | "severe"` (shared by Allergy + Condition)
- `Allergy` — id, name, severity, critical_flag, notes?
- `Condition` — id, name, severity, critical_flag, notes?
- `Medication` — id, name, dosage, frequency, start_date, end_date?, notes?
- `Device` — id, name, description?, implanted_date?, notes?
- `EmergencyContact`, `InsuranceInfo`, `InsuranceProvider`
- `CoverageStatus` — `"active" | "inactive" | "pending"`
- `AccessLog`

### Auth Architecture

- `localStorage` keys: `ehcidb_token`, `ehcidb_refresh`, `ehcidb_user`, `ehcidb_recent_searches`
- `AuthContext` initializes with `isLoading: true` to prevent redirect flash before localStorage is read
- Axios response interceptor auto-redirects to `/login` on any 401
- `useAuthGuard(role?)` — call at top of each dashboard layout to enforce role access

---

## Phase 2 — Next (Auth + Navigation)

Per `docs/FRONTEND_PLAN.md` Section 11:

7. Build UI primitives: `Button`, `Input`, `Alert`, `Spinner`, `Card`, `Badge`, `Table` → `src/components/ui/`
8. Build layout components: `TopNav`, `Sidebar`, `MobileNav`, `DashboardShell` → `src/components/layout/`
9. Build login page + `LoginForm` → `src/app/login/page.tsx`
10. Implement dashboard layouts with `useAuthGuard` → `src/app/dashboard/layout.tsx` + role sub-layouts

---

## Key Decisions & Conventions

- `cn()` from `src/lib/utils.ts` — use for all conditional Tailwind classnames
- API base URL from `NEXT_PUBLIC_API_BASE_URL` env var (default: `http://localhost:8000/api`)
- Create `.env.local` with `NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api` for local dev
- No external state library — React Context + `useState` only
- `Omit<T, "id">` pattern used for POST payloads (id assigned by backend)
