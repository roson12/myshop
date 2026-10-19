"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useCart } from "./cart-provider";
import { checkoutAction } from "@/app/actions/checkout";
import { formatMoney } from "@/lib/money";

export function CartView() {
  const { items, loaded, totalCents, setQuantity, removeItem, clearCart } = useCart();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleCheckout() {
    setError(null);
    startTransition(async () => {
      const result = await checkoutAction(
        items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
        email,
      );
      if ("error" in result) {
        setError(result.error);
        return;
      }
      clearCart();
      window.location.assign(result.url);
    });
  }

  if (!loaded) {
    return <p className="text-ink-soft">Loading your cart…</p>;
  }

  if (items.length === 0) {
    return (
      <div className="rounded-3xl bg-white p-10 text-center ring-1 ring-lavender-deep/30">
        <h1 className="text-2xl font-semibold">Your cart is empty</h1>
        <p className="mt-2 text-ink-soft">Go pick something soft and nice.</p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-full bg-blush px-6 py-2.5 text-sm font-semibold text-white hover:bg-blush-dark"
        >
          Browse the shop
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Your cart</h1>

      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.productId}
            className="flex flex-wrap items-center gap-4 rounded-2xl bg-white p-4 ring-1 ring-lavender-deep/30"
          >
            <div className="h-16 w-16 overflow-hidden rounded-xl bg-lavender/40">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.imagePath}
                alt={item.name}
                className="h-full w-full object-cover"
              />
            </div>

            <div className="min-w-32 flex-1">
              <Link
                href={`/products/${item.slug}`}
                className="font-semibold hover:text-blush-dark"
              >
                {item.name}
              </Link>
              <p className="text-sm text-ink-soft">{formatMoney(item.priceCents)} each</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setQuantity(item.productId, item.quantity - 1)}
                className="h-8 w-8 rounded-full bg-lavender text-lg leading-none hover:bg-lavender-deep"
                aria-label={`Decrease quantity of ${item.name}`}
              >
                −
              </button>
              <span className="w-6 text-center font-medium">{item.quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity(item.productId, item.quantity + 1)}
                className="h-8 w-8 rounded-full bg-lavender text-lg leading-none hover:bg-lavender-deep"
                aria-label={`Increase quantity of ${item.name}`}
              >
                +
              </button>
            </div>

            <p className="w-20 text-right font-semibold">
              {formatMoney(item.priceCents * item.quantity)}
            </p>

            <button
              type="button"
              onClick={() => removeItem(item.productId)}
              className="text-sm text-ink-soft underline hover:text-ink"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="rounded-3xl bg-white p-6 ring-1 ring-lavender-deep/30">
        <div className="flex items-center justify-between text-lg font-semibold">
          <span>Total</span>
          <span>{formatMoney(totalCents)}</span>
        </div>
        <p className="mt-1 text-sm text-ink-soft">Shipping is free in this demo.</p>

        <label className="mt-5 block text-sm font-medium">
          Email (optional — used for the order confirmation)
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            className="mt-1 w-full rounded-xl border border-lavender-deep/50 bg-cream px-4 py-2.5 text-sm outline-none focus:border-blush"
          />
        </label>

        {error ? (
          <p className="mt-4 rounded-xl bg-peach px-4 py-3 text-sm text-ink">{error}</p>
        ) : null}

        <button
          type="button"
          onClick={handleCheckout}
          disabled={pending}
          className="mt-5 w-full rounded-full bg-blush px-6 py-3 text-sm font-semibold text-white transition hover:bg-blush-dark disabled:cursor-wait disabled:opacity-70"
        >
          {pending ? "Placing order…" : "Checkout"}
        </button>

        <p className="mt-3 text-center text-xs text-ink-soft">
          Demo mode: no card is requested and no money moves. Add Stripe keys to
          use real Stripe test checkout.
        </p>
      </div>
    </div>
  );
}
