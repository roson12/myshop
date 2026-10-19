"use client";

import Link from "next/link";
import { useCart } from "./cart-provider";
import { cartItemCount } from "@/lib/cart";

export function SiteHeader() {
  const { items, loaded } = useCart();
  const count = loaded ? cartItemCount(items) : 0;

  return (
    <header className="sticky top-0 z-10 border-b border-lavender-deep/40 bg-cream/85 backdrop-blur">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          <span className="mr-2 inline-block h-3 w-3 rounded-full bg-blush" />
          Xorem Shop
        </Link>
        <nav className="flex items-center gap-5 text-sm font-medium">
          <Link href="/" className="hover:text-blush-dark">
            Shop
          </Link>
          <Link
            href="/cart"
            className="rounded-full bg-white px-4 py-2 shadow-sm ring-1 ring-lavender-deep/40 hover:bg-lavender/50"
          >
            Cart
            {count > 0 ? (
              <span className="ml-2 rounded-full bg-blush px-2 py-0.5 text-xs text-white">
                {count}
              </span>
            ) : null}
          </Link>
        </nav>
      </div>
    </header>
  );
}
