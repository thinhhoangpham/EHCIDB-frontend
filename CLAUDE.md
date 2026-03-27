# EHCIDB Frontend

## Project Overview

EHCIDB Frontend — Next.js 16 + React 19 + TypeScript + Tailwind v4 SPA for the Emergency Healthcare Critical Information Database. Academic prototype for CS5356. Static export to GitHub Pages.

- **Framework:** Next.js 16.1.6 + React 19 + TypeScript + Tailwind v4
- **Deployment:** GitHub Pages (static export — no SSR, no API routes)
- **Backend:** Django + MySQL REST API (separate repo)

## Setup & Commands

- `npm install` then `npm run dev`
- `npm run build` for static export
- API base URL configured via `NEXT_PUBLIC_API_BASE_URL` (default: `http://localhost:8000/api`)

## Pages & Routes

| Route | Role | Description |
|-------|------|-------------|
| `/` | Public | Welcome/landing stub |
| `/login` | Public | Email + password login form; redirects to role dashboard on success |
| `/register` | Public | Registration form |
| `/dashboard/patient` | patient | Tabs: **Analytics** (profile summary, admission history, billing, test results pie chart), **Emergency Card** (view/edit own emergency profile — allergies, conditions, medications, devices, emergency contacts) |
| `/dashboard/doctor` | doctor | Tabs: **Analytics** (KPI stat cards, admissions over time, conditions breakdown, test results, my admissions table with View Card button), **Emergency Search** (search by name or Emergency ID, view draggable patient emergency card popup, recent searches list) |
| `/dashboard/admin` | admin | Tabs: **Analytics** (system-wide KPI cards, admissions over time, admissions by type, top 10 conditions, billing by insurance, demographics, test results, recent admissions table), **User Management** (paginated user table, activate/deactivate toggle), **Access Logs** (paginated audit log), **Insurance Providers** (list, add, delete) |

## Architecture

### API Layer (`src/lib/api/`)

| File | What it exports |
|------|-----------------|
| `client.ts` | Configured Axios instance; request interceptor attaches Bearer token; response interceptor clears auth and redirects to `/login` on 401 |
| `auth.ts` | `login()`, `logout()` |
| `emergency.ts` | All emergency-data types and API functions — patient CRUD (allergies, conditions, medications, devices, contacts), doctor search/card lookup (`searchPatients`, `getPatientEmergencyCard`), admin user/log/insurance management (`getUsers`, `updateUser`, `getAccessLogs`, `getInsuranceProviders`, `addInsuranceProvider`, `deleteInsuranceProvider`) |
| `dashboard.ts` | `getAdminDashboard()`, `getDoctorDashboard()`, `getPatientDashboard()` with full typed response interfaces (`AdminDashboard`, `DoctorDashboard`, `PatientDashboard`) |
| `patients.ts` | Legacy patient profile CRUD (predates `emergency.ts`; may overlap) |
| `doctors.ts` | Legacy doctor patient lookup (predates `emergency.ts`; may overlap) |
| `admin.ts` | Legacy admin functions (predates `emergency.ts`; may overlap) |
| `insurance.ts` | Legacy insurance provider CRUD (predates `emergency.ts`; may overlap) |

### Components

- **Layout:** `DashboardShell` (sticky top nav with EHCIDB brand, user name, role badge, logout button), `AuthPageLayout` (centered card layout for login/register)
- **Dashboard:** `StatCard` (reusable KPI card with icon, title, value, optional subtitle)
- **UI Primitives:** `Button` (variants: primary/secondary/danger/ghost; `loading` prop), `Input` (label, error), `Card`, `Alert` (variants: success/error/warning), `Spinner` (sizes: sm/md/lg)

### Hooks

| Hook | Description |
|------|-------------|
| `useAuth` | Consumes `AuthContext`; throws if used outside `AuthProvider` |
| `useAuthGuard(role?)` | Redirects to `/login` if unauthenticated; redirects to correct dashboard if wrong role; returns `{ ready, user }` |
| `useApi` | Generic `{ data, loading, error, execute }` wrapper with stale-response guard (request ID ref) |
| `useRecentSearches` | Manages doctor's last 10 patient searches; persisted to localStorage; exposes `searches`, `addSearch`, `clearSearches` |

### State Management

- `AuthContext` (`src/contexts/AuthContext.tsx`) for global auth state — `user`, `token`, `isLoading`, `setAuth`, `clearAuth`
- No external state library
- localStorage for tokens (`ehcidb_token`, `ehcidb_refresh`, `ehcidb_user`) and recent searches (`ehcidb_recent_searches`)

### Auth Flow

- JWT tokens obtained from `/api/auth/login/`
- Stored in localStorage via `LOCAL_STORAGE_KEYS` constants
- Axios request interceptor attaches `Authorization: Bearer <token>` on every request
- Axios response interceptor on 401: clears localStorage, redirects to `/login` (guarded against duplicate redirects with `isRedirecting` flag)
- `useAuthGuard` enforces role-based route protection on dashboard pages

## Key Conventions

- `cn()` (`src/lib/utils.ts`) for all conditional Tailwind classnames — wraps `clsx` + `tailwind-merge`
- `"use client"` on all interactive components (required for static export)
- recharts for data visualization (LineChart, BarChart, PieChart)
- lucide-react for icons
- Tab pattern: `useState<TabId>` for active tab, data fetched inside each tab component on mount
- `LOCAL_STORAGE_KEYS` constant used for all localStorage key strings
- `ROLE_DASHBOARD` constant maps `UserRole` to dashboard route

## Packages

| Package | Purpose |
|---------|---------|
| `next` 16.1.6 | Framework, static export |
| `react` 19.2.3 | UI |
| `typescript` ^5 | Type safety |
| `tailwindcss` ^4 | Styling |
| `axios` ^1 | HTTP client |
| `recharts` ^3 | Charts |
| `lucide-react` ^0.575 | Icons |
| `date-fns` ^4 | Date formatting |
| `clsx` + `tailwind-merge` | Class name utilities |
| `react-hook-form` + `zod` + `@hookform/resolvers` | Installed, not yet wired up in forms |
