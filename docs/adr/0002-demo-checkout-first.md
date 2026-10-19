# ADR-0002: Demo checkout first, Stripe optional

**Status:** Accepted

## Context

The brief asked for a Stripe test-mode checkout, but also for an app that can be
run and tested immediately without extra setup. Requiring API keys and a webhook
forwarder to place a first order would make the demo fragile.

## Decision

`STRIPE_SECRET_KEY` is optional. When it is unset, checkout fulfills the order
in-process (demo checkout). When it is set, checkout creates a hosted Stripe
Checkout Session and only the verified webhook fulfills the order.

Both paths share the same order creation and atomic stock-decrement code.

## Consequences

- `docker compose up` produces a working shop with zero external accounts.
- The success page is never proof of payment; the order status is authoritative.
- With Stripe enabled, local testing needs the Stripe CLI to forward webhooks.
- Real deployments must set the keys; demo checkout is not a payment system.
