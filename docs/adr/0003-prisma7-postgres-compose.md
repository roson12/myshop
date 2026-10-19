# ADR-0003: Prisma 7 with the pg driver adapter, Postgres in Compose

**Status:** Accepted

## Context

Prisma 7 no longer ships a Rust query engine by default and requires driver
adapters for runtime database access. The database should be one command away.

## Decision

- Prisma ORM 7 with the `prisma-client` generator writing TypeScript into
  `lib/generated/prisma`, and `@prisma/adapter-pg` at runtime.
- Connection URLs for CLI commands live in `prisma.config.ts`, not in
  `schema.prisma`.
- PostgreSQL 17 runs in Compose with a named volume and healthcheck; the app
  container waits for it, runs `prisma migrate deploy`, seeds idempotently, then
  starts Next.js.

## Consequences

- The generated client is git-ignored and regenerated in the Docker entrypoint.
- `prisma.config.ts` falls back to a local URL so `prisma generate` works during
  image builds where no database is reachable.
- The client is a dev server in the container (bind-mounted source), not a
  production image. A multi-stage production build is out of scope for the demo.
