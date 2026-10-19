"use client";

import { useState } from "react";
import { useCart } from "./cart-provider";
import type { CartItem } from "@/lib/cart";

type AddToCartProps = {
  product: {
    id: string;
    slug: string;
    name: string;
    priceCents: number;
    imagePath: string;
    stock: number;
  };
  className?: string;
};

export function AddToCart({ product, className = "" }: AddToCartProps) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const soldOut = product.stock <= 0;

  function handleAdd() {
    const item: CartItem = {
      productId: product.id,
      slug: product.slug,
      name: product.name,
      priceCents: product.priceCents,
      imagePath: product.imagePath,
      quantity: 1,
    };
    addItem(item);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1500);
  }

  return (
    <button
      type="button"
      onClick={handleAdd}
      disabled={soldOut}
      className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${
        soldOut
          ? "cursor-not-allowed bg-lavender text-ink-soft"
          : "bg-blush text-white hover:bg-blush-dark"
      } ${className}`}
    >
      {soldOut ? "Sold out" : added ? "Added ✓" : "Add to cart"}
    </button>
  );
}
