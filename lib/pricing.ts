export type ProductSnapshot = {
  id: string;
  name: string;
  priceCents: number;
  imagePath: string;
  stock: number;
  active: boolean;
};

export type IncomingItem = {
  productId: string;
  quantity: number;
};

export type OrderLine = {
  productId: string;
  nameSnapshot: string;
  imageSnapshot: string;
  priceCents: number;
  quantity: number;
};

export class CartValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CartValidationError";
  }
}

export function orderTotalCents(lines: OrderLine[]): number {
  return lines.reduce((sum, line) => sum + line.priceCents * line.quantity, 0);
}

/**
 * Turns client-supplied {productId, quantity} pairs into trusted order lines.
 * Prices, names and images always come from the database, never the client.
 */
export function buildOrderLines(
  products: ProductSnapshot[],
  items: IncomingItem[],
): OrderLine[] {
  const quantities = new Map<string, number>();

  for (const item of items) {
    if (typeof item.productId !== "string" || item.productId.length === 0) {
      throw new CartValidationError("Invalid cart item.");
    }
    if (!Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 99) {
      throw new CartValidationError("Invalid quantity.");
    }
    quantities.set(item.productId, (quantities.get(item.productId) ?? 0) + item.quantity);
  }

  if (quantities.size === 0) {
    throw new CartValidationError("Your cart is empty.");
  }

  const byId = new Map(products.map((product) => [product.id, product]));
  const lines: OrderLine[] = [];

  for (const [productId, quantity] of quantities) {
    const product = byId.get(productId);
    if (!product || !product.active) {
      throw new CartValidationError("An item in your cart is no longer available.");
    }
    if (product.stock < quantity) {
      throw new CartValidationError(
        `Only ${product.stock} of "${product.name}" left in stock.`,
      );
    }
    lines.push({
      productId: product.id,
      nameSnapshot: product.name,
      imageSnapshot: product.imagePath,
      priceCents: product.priceCents,
      quantity,
    });
  }

  return lines;
}
