# Three-O-One Storefront

Production-oriented Next.js (App Router) e-commerce frontend foundation.

## Stack

- Next.js + TypeScript + Tailwind CSS
- Axios + TanStack Query (server state)
- Zustand (client UI / guest cart)
- React Hook Form + Zod
- ESLint + Prettier

## Getting started

```bash
cp .env.example .env.local
npm install
npm run dev
```

Set `NEXT_PUBLIC_API_URL` to your NestJS API base URL (for example `http://localhost:3001/api`).

## Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | ESLint |
| `npm run format` | Prettier write |
| `npm run format:check` | Prettier check |

## Architecture

```
src/
  app/           # Routes and layouts (thin)
  components/    # Shared UI + layout
  features/      # Domain modules (auth, products, cart, …)
  entities/      # Domain types
  services/      # Axios API calls (no React)
  lib/           # Axios client, Query client/keys, auth token helpers
  store/         # Zustand stores
  schemas/       # Zod schemas
  hooks/         # Shared hooks
  types/         # Shared TS types
  constants/     # Routes, endpoints, storage keys
  config/        # Env + site config
```

### Data flow

1. **UI** calls feature hooks (`useProducts`, `useLogin`, …).
2. **Hooks** use TanStack Query + `queryKeys`.
3. **Services** call the shared Axios `apiClient`.
4. **Interceptors** attach JWT (when present) and normalize errors to `ApiError`.

### Auth readiness (JWT / NestJS)

- `tokenStorage` abstracts access-token persistence.
- Axios request interceptor adds `Authorization: Bearer <token>`.
- `withCredentials: true` is enabled for cookie-based sessions.
- Services/hooks exist for login, register, logout, and current user.
- Prefer httpOnly cookies from NestJS in production; keep bearer support for SPA setups.

### Environment

- Only `NEXT_PUBLIC_*` variables are available in the browser.
- Never expose NestJS secrets (`JWT_SECRET`, DB URLs, internal API keys) to the client.

## Extending

- Add a new API resource under `src/services`.
- Add query keys in `src/lib/query/keys.ts`.
- Add feature hooks under `src/features/<domain>/hooks`.
- Keep business logic out of page components.
