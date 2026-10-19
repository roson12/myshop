# Xorem Shop

A small e-commerce demo: pastel storefront, guest cart, checkout, and a tiny
admin area. Built with Next.js (App Router, TypeScript), Tailwind CSS, Prisma 7
and PostgreSQL. The whole thing runs from one `docker compose up`.

## Quick start

```bash
docker compose up --build
```

Wait for the first build (a few minutes), then open:

- Storefront: http://localhost:3000
- Admin: http://localhost:3000/admin
- Health of the database: `docker compose ps`

The app container applies migrations and seeds 10 demo products on startup.
Seeding is idempotent, so restarts are safe.

**No Stripe account is needed.** When `STRIPE_SECRET_KEY` is empty — the default —
checkout runs in demo mode: the order is placed, stock is decremented, and you
are taken to the order page. No card, no network, no money.

Stop with `Ctrl+C`, or run detached with `docker compose up -d --build`.
Reset the database completely with `docker compose down -v`.

## Optional: real Stripe test-mode checkout

1. Copy your test key into the environment used by Compose (for example, create
   a `.env` next to `compose.yaml` with `STRIPE_SECRET_KEY=sk_test_...`).
2. Run the Stripe CLI and forward webhooks:

   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```

3. Put the printed `whsec_...` value in `STRIPE_WEBHOOK_SECRET` and restart.

Checkout then redirects to hosted Stripe Checkout. The order stays `PENDING`
until the `checkout.session.completed` webhook marks it `PAID` and decrements
stock. Use test card `4242 4242 4242 4242`, any future date, any CVC.

## Run the app on the host instead

Useful if you want faster hot reload:

```bash
cp .env.example .env
docker compose up -d db
npm install
npm run db:generate
npm run db:deploy
npm run db:seed
npm run dev
```

## Tests and checks

```bash
npm test          # pure logic tests (cart, pricing, stock validation inputs)
npm run typecheck
```

## How it is put together

```
app/                    Next.js routes (storefront, cart, orders, admin, webhook)
components/             Cart provider, add-to-cart, product form, header
lib/cart.ts             Pure localStorage cart logic (tested)
lib/pricing.ts          Trusted order-line building from DB products (tested)
lib/orders.ts           Order creation, stock decrement, payment fulfillment
lib/db.ts               Prisma client with the pg driver adapter
prisma/schema.prisma    Category, Product, Order, OrderItem
prisma/seed.ts          Pastel demo catalogue
public/products/        Local SVG product art
```

### Decisions that keep it simple

- Prices are integer cents everywhere; Stripe gets `unit_amount` directly.
- The client only sends `{productId, quantity}`. Names, images and prices are
  always re-read from the database at checkout.
- Order lines snapshot name/image/price, so editing or deleting a product never
  rewrites history.
- The cart lives in `localStorage`; there are no customer accounts.
- `/admin` has no login. Set `ADMIN_ENABLED=false` to make it return 404.
- Stock is decremented atomically at payment fulfillment; an oversold order is
  marked `CANCELLED` instead of going negative.

More detail: `CONTEXT.md` and `docs/adr/`.
