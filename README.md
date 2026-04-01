# EHCIDB Frontend

Emergency Healthcare Critical Information Database — frontend application for CS5356 (Advanced Database Systems). Provides role-based access to patient medical data for patients, doctors, and administrators.

Built with Next.js 16, React 19, TypeScript, and Tailwind CSS v4. Deployed as a static export (GitHub Pages — no SSR, no API routes).

## Prerequisites

- Node.js 18 or higher
- npm

## Setup

```bash
npm install
```

## Running Locally

```bash
npm run dev
```

Opens at [http://localhost:3000](http://localhost:3000).

> **Note:** The backend API must be running for login and all data operations to work. By default the app expects the API at `http://localhost:8000/api`.

## Environment Variables

Create a `.env.local` file in the project root if you need to point at a different API server:

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
```

If this variable is not set, the app falls back to `http://localhost:8000/api`.

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server on port 3000 |
| `npm run build` | Build static export to `out/` |
| `npm start` | Serve the production build |
| `npm run lint` | Run ESLint |

## How to Log In

1. Start the backend API (`http://localhost:8000`) and run `npm run dev` to start the frontend.
2. Open [http://localhost:3000](http://localhost:3000) — you will be redirected to the login page.
3. Enter your **email** and **password**, then click **Sign In**.
4. On success you are automatically redirected to your role-specific dashboard.

### Example Accounts

All seed accounts use the password **`password123`**.

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@ehcidb.local` | `password123` |
| Doctor | `d_1@ehcidb.local` | `password123` |
| Doctor | `d_2@ehcidb.local` | `password123` |
| Patient | `p_1@ehcidb.local` | `password123` |
| Patient | `p_2@ehcidb.local` | `password123` |

> Doctor usernames follow the pattern `d_<id>` and patient usernames follow `p_<id>`. Any valid ID from the seeded data will work.

## Navigating the Dashboards

After login you land on the dashboard for your role. Each dashboard uses a **tab bar** at the top to switch between sections. The sticky top navigation bar shows your name, role badge, and a **Logout** button.

### Patient Dashboard (`/dashboard/patient`)

| Tab | What you can do |
|-----|-----------------|
| **Analytics** | View your profile summary, admission history, billing breakdown, and test results |
| **Emergency Card** | View and edit your emergency profile — allergies, conditions, medications, implanted devices, and emergency contacts |

### Doctor Dashboard (`/dashboard/doctor`)

| Tab | What you can do |
|-----|-----------------|
| **Analytics** | View KPI stat cards, admissions over time chart, conditions breakdown pie chart, test results, and a table of your admissions (click **View Card** to open a patient's emergency card) |
| **Emergency Search** | Search for patients by name or Emergency ID. Results open in a draggable popup card. Recent searches are saved for quick access |

### Admin Dashboard (`/dashboard/admin`)

| Tab | What you can do |
|-----|-----------------|
| **Analytics** | System-wide KPIs, admissions over time, admissions by type, top 10 conditions, billing by insurance, patient demographics, test results, and a recent admissions table |
| **User Management** | Paginated list of all users with an **Activate / Deactivate** toggle for each account |
| **Access Logs** | Paginated audit log of all system access events |
| **Insurance Providers** | View, add, or delete insurance providers |

## Routes Reference

| Route | Access | Description |
|-------|--------|-------------|
| `/login` | Public | Email + password login |
| `/register` | Public | New account registration |
| `/dashboard/patient` | Patient | Patient dashboard |
| `/dashboard/doctor` | Doctor | Doctor dashboard |
| `/dashboard/admin` | Admin | Admin dashboard |

## Tech Stack

- [Next.js 16](https://nextjs.org/) — React framework (static export mode)
- [React 19](https://react.dev/) — UI library
- [TypeScript 5](https://www.typescriptlang.org/) — type safety
- [Tailwind CSS v4](https://tailwindcss.com/) — utility-first styling
- [Axios](https://axios-http.com/) — HTTP client with JWT interceptors
- [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) — form handling and validation
- [Lucide React](https://lucide.dev/) — icons
