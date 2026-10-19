# ADR-0001: One Next.js full-stack app

**Status:** Accepted

## Context

This is a small demo shop that should be easy to run and easy to read. A
separate API server and frontend would add a second process, a second build, and
hand-written fetch/validation code.

## Decision

Use a single Next.js App Router application with TypeScript. Server components
read Prisma directly; checkout and admin mutations are Server Actions. The only
custom HTTP route is the Stripe webhook, which needs a raw request body.

## Consequences

- One `npm run dev` / one container serves the whole app.
- No public API layer exists; other clients are out of scope.
- Server Actions must validate all client input, which they do (cart quantities
  and identity only; prices are re-read from the database).
