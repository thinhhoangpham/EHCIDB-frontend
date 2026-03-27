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

## User Roles & Routes

After login, users are redirected to their role-specific dashboard automatically.

| Route | Description |
|-------|-------------|
| `/login` | Login page (email + password) |
| `/register` | New account registration |
| `/dashboard/patient` | Patient — view and manage personal health records |
| `/dashboard/doctor` | Doctor — look up patients by emergency ID |
| `/dashboard/admin` | Admin — user management and access logs |

## Tech Stack

- [Next.js 16](https://nextjs.org/) — React framework (static export mode)
- [React 19](https://react.dev/) — UI library
- [TypeScript 5](https://www.typescriptlang.org/) — type safety
- [Tailwind CSS v4](https://tailwindcss.com/) — utility-first styling
- [Axios](https://axios-http.com/) — HTTP client with JWT interceptors
- [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) — form handling and validation
- [Lucide React](https://lucide.dev/) — icons
