import { describe, expect, it } from "vitest";
import {
  cartItemCount,
  cartTotalCents,
  mergeCartItem,
  parseStoredCart,
  removeCartItem,
  updateCartItemQuantity,
  type CartItem,
} from "../lib/cart";

function item(overrides: Partial<CartItem> = {}): CartItem {
  return {
    productId: "p1",
    slug: "cloud-mug",
    name: "Cloud Mug",
    priceCents: 1800,
    imagePath: "/products/cloud-mug.svg",
    quantity: 1,
    ...overrides,
  };
}

describe("cart totals", () => {
  it("sums quantities and line totals", () => {
    const items = [
      item({ quantity: 2 }),
      item({ productId: "p2", priceCents: 1200, quantity: 3 }),
    ];
    expect(cartItemCount(items)).toBe(5);
    expect(cartTotalCents(items)).toBe(1800 * 2 + 1200 * 3);
  });

  it("is zero for an empty cart", () => {
    expect(cartItemCount([])).toBe(0);
    expect(cartTotalCents([])).toBe(0);
  });
});

describe("mergeCartItem", () => {
  it("adds a new line", () => {
    expect(mergeCartItem([], item())).toHaveLength(1);
  });

  it("increments an existing product instead of duplicating it", () => {
    const merged = mergeCartItem([item({ quantity: 2 })], item({ quantity: 3 }));
    expect(merged).toHaveLength(1);
    expect(merged[0].quantity).toBe(5);
  });

  it("clamps quantities at 99", () => {
    const merged = mergeCartItem([item({ quantity: 98 })], item({ quantity: 10 }));
    expect(merged[0].quantity).toBe(99);
  });
});

describe("quantity updates", () => {
  it("removes a line when quantity drops to zero", () => {
    expect(updateCartItemQuantity([item()], "p1", 0)).toEqual([]);
  });

  it("removes a specific line", () => {
    const items = [item(), item({ productId: "p2" })];
    expect(removeCartItem(items, "p1").map((row) => row.productId)).toEqual(["p2"]);
  });
});

describe("parseStoredCart", () => {
  it("returns an empty cart for missing or malformed data", () => {
    expect(parseStoredCart(null)).toEqual([]);
    expect(parseStoredCart("not json")).toEqual([]);
    expect(parseStoredCart(JSON.stringify({ nope: true }))).toEqual([]);
  });

  it("drops invalid entries and keeps valid ones", () => {
    const stored = JSON.stringify([item(), { productId: 42 }, null]);
    const parsed = parseStoredCart(stored);
    expect(parsed).toHaveLength(1);
    expect(parsed[0].productId).toBe("p1");
  });
});
