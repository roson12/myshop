export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  priceCents: number;
  imagePath: string;
  quantity: number;
};

export const EMPTY_CART: CartItem[] = [];
export const MAX_QUANTITY = 99;

export function clampQuantity(quantity: number): number {
  if (!Number.isFinite(quantity)) return 1;
  return Math.max(1, Math.min(MAX_QUANTITY, Math.trunc(quantity)));
}

export function cartItemCount(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

export function cartTotalCents(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.priceCents * item.quantity, 0);
}

export function mergeCartItem(items: CartItem[], incoming: CartItem): CartItem[] {
  const existing = items.find((item) => item.productId === incoming.productId);
  if (!existing) {
    return [...items, { ...incoming, quantity: clampQuantity(incoming.quantity) }];
  }
  return items.map((item) =>
    item.productId === incoming.productId
      ? { ...item, quantity: clampQuantity(item.quantity + incoming.quantity) }
      : item,
  );
}

export function updateCartItemQuantity(
  items: CartItem[],
  productId: string,
  quantity: number,
): CartItem[] {
  if (quantity <= 0) return removeCartItem(items, productId);
  return items.map((item) =>
    item.productId === productId ? { ...item, quantity: clampQuantity(quantity) } : item,
  );
}

export function removeCartItem(items: CartItem[], productId: string): CartItem[] {
  return items.filter((item) => item.productId !== productId);
}

function isCartItem(value: unknown): value is CartItem {
  if (typeof value !== "object" || value === null) return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.productId === "string" &&
    typeof item.slug === "string" &&
    typeof item.name === "string" &&
    typeof item.priceCents === "number" &&
    Number.isInteger(item.priceCents) &&
    typeof item.imagePath === "string" &&
    typeof item.quantity === "number" &&
    Number.isInteger(item.quantity) &&
    item.quantity > 0
  );
}

export function parseStoredCart(value: string | null): CartItem[] {
  if (!value) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isCartItem).map((item) => ({
      ...item,
      quantity: clampQuantity(item.quantity),
    }));
  } catch {
    return [];
  }
}
