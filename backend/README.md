# Three-O-One Backend

Production-ready NestJS backend with Prisma 7, PostgreSQL, and Docker.

## Stack

- NestJS + TypeScript
- Prisma 7.x
- PostgreSQL
- Docker Compose
- pnpm
- class-validator / class-transformer
- ESLint + Prettier

## Requirements

- Node.js 20+
- pnpm 10+
- Docker + Docker Compose

## Installation

```bash
pnpm install
```

## Environment variables

Copy the example file and adjust values if needed:

```bash
cp .env.example .env
```

| Variable | Description | Example |
| --- | --- | --- |
| `NODE_ENV` | Runtime environment | `development` |
| `PORT` | HTTP port | `3000` |
| `POSTGRES_USER` | PostgreSQL user | `postgres` |
| `POSTGRES_PASSWORD` | PostgreSQL password | `postgres` |
| `POSTGRES_DB` | PostgreSQL database name | `app` |
| `POSTGRES_PORT` | Host port mapped to Postgres | `5432` |
| `DATABASE_URL` | Prisma connection string | `postgresql://postgres:postgres@localhost:5432/app?schema=public` |

The app validates required env vars on startup and fails fast with a clear error if something is missing or invalid.

## Start PostgreSQL

```bash
docker compose up -d
```

Check that the container is healthy:

```bash
docker compose ps
```

## Prisma

Generate the Prisma Client:

```bash
pnpm prisma:generate
```

Create and apply migrations:

```bash
pnpm prisma:migrate
```

Open Prisma Studio (optional):

```bash
pnpm prisma:studio
```

## Development

```bash
pnpm install
docker compose up -d
pnpm prisma:migrate
pnpm dev
```

API will be available at `http://localhost:3000`.

Demo users endpoints:

- `POST /users`
- `GET /users`
- `GET /users/:id`
- `PATCH /users/:id`
- `DELETE /users/:id`

## Production build

```bash
pnpm build
pnpm start:prod
```

## Main scripts

| Script | Description |
| --- | --- |
| `pnpm dev` | Start NestJS in watch mode |
| `pnpm build` | Compile TypeScript |
| `pnpm start` | Start NestJS once |
| `pnpm start:prod` | Run compiled app from `dist` |
| `pnpm lint` | Run ESLint with autofix |
| `pnpm format` | Format sources with Prettier |
| `pnpm prisma:generate` | Generate Prisma Client |
| `pnpm prisma:migrate` | Run Prisma Migrate (dev) |
| `pnpm prisma:studio` | Open Prisma Studio |

## Project structure

```text
src/
├── main.ts
├── app.module.ts
├── config/
├── database/
├── common/
│   ├── decorators/
│   ├── filters/
│   ├── guards/
│   ├── interceptors/
│   ├── pipes/
│   ├── middleware/
│   └── types/
├── generated/          # Prisma Client (generated, gitignored)
└── modules/
    └── users/
prisma/
├── schema.prisma
└── migrations/
prisma.config.ts
docker-compose.yml
Dockerfile
```

Feature modules live under `src/modules/`. Shared infrastructure stays in `config`, `database`, and `common`.

> Note: the existing `frontend/` directory is excluded from backend TypeScript/ESLint builds.
