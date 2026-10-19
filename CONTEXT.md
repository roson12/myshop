# Xorem Shop — Context

A single-context demo storefront. This glossary is the vocabulary to use in
code, tests, issues and documentation.

## Terms

- **Product** — a flat catalogue item with a name, slug, description, price in
  integer cents, stock count, one image path and one Category. There are no
  variants, options, discounts or multiple images.
- **Category** — a named grouping of products (`Home`, `Stationery`,
  `Bath & Body`, `Accessories`). Seeded; not editable in the admin UI.
- **Cart** — a guest-only list of `{productId, quantity}` stored in
  `localStorage`. It is not persisted on the server. The server never trusts
  cart prices or names.
- **Order** — a record created at checkout containing email, total in cents,
  status and order lines.
- **Order line** — a snapshot of one product in an order: name, image, price and
  quantity at purchase time. Snapshots survive product edits and deletion.
- **Order status** — one of `PENDING`, `PAID`, `FULFILLED`, `CANCELLED`.
  `PENDING` orders are created before payment; only payment confirmation makes
  an order `PAID` and decrements stock.
- **Demo checkout** — the default payment path used when
  `STRIPE_SECRET_KEY` is unset. It fulfills the order immediately without any
  payment provider.
- **Stripe checkout** — the optional payment path. The shopper is redirected to
  hosted Stripe Checkout; a verified `checkout.session.completed` webhook is
  the only thing that marks the order paid.
- **Admin** — an unauthenticated area at `/admin`, enabled unless
  `ADMIN_ENABLED=false`. It can create/edit/delete products and change order
  statuses.
- **Fulfillment** — the atomic operation that decrements stock for every order
  line and moves the order from `PENDING` to `PAID`. If any line cannot be
  decremented, the whole transaction rolls back and the order becomes
  `CANCELLED`.

## Invariants

- All money is stored and computed as integer cents (USD).
- The client may choose *what* and *how many*; the server decides *how much*.
- Stock never goes negative.
- Order lines never join back to live product data for display.
