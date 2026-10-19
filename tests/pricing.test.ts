import { describe, expect, it } from "vitest";
import {
  buildOrderLines,
  CartValidationError,
  orderTotalCents,
  type ProductSnapshot,
} from "../lib/pricing";

const mug: ProductSnapshot = {
  id: "p1",
  name: "Cloud Mug",
  priceCents: 1800,
  imagePath: "/products/cloud-mug.svg",
  stock: 5,
  active: true,
};

const notebook: ProductSnapshot = {
  id: "p2",
  name: "Mint Notebook",
  priceCents: 1200,
  imagePath: "/products/mint-notebook.svg",
  stock: 10,
  active: true,
};

describe("buildOrderLines", () => {
  it("uses database prices, names and images", () => {
    const lines = buildOrderLines([mug], [{ productId: "p1", quantity: 2 }]);
    expect(lines).toEqual([
      {
        productId: "p1",
        nameSnapshot: "Cloud Mug",
        imageSnapshot: "/products/cloud-mug.svg",
        priceCents: 1800,
        quantity: 2,
      },
    ]);
    expect(orderTotalCents(lines)).toBe(3600);
  });

  it("aggregates duplicate product lines", () => {
    const lines = buildOrderLines(
      [mug],
      [
        { productId: "p1", quantity: 1 },
        { productId: "p1", quantity: 2 },
      ],
    );
    expect(lines).toHaveLength(1);
    expect(lines[0].quantity).toBe(3);
  });

  it("rejects unknown or inactive products", () => {
    expect(() => buildOrderLines([], [{ productId: "missing", quantity: 1 }])).toThrow(
      CartValidationError,
    );
    expect(() =>
      buildOrderLines([{ ...mug, active: false }], [{ productId: "p1", quantity: 1 }]),
    ).toThrow(CartValidationError);
  });

  it("rejects quantities above stock", () => {
    expect(() => buildOrderLines([mug], [{ productId: "p1", quantity: 6 }])).toThrow(
      /only 5/i,
    );
  });

  it("rejects invalid quantities", () => {
    expect(() => buildOrderLines([mug], [{ productId: "p1", quantity: 0 }])).toThrow(
      CartValidationError,
    );
    expect(() => buildOrderLines([mug], [{ productId: "p1", quantity: 1.5 }])).toThrow(
      CartValidationError,
    );
  });

  it("computes the total across lines", () => {
    const lines = buildOrderLines(
      [mug, notebook],
      [
        { productId: "p1", quantity: 2 },
        { productId: "p2", quantity: 1 },
      ],
    );
    expect(orderTotalCents(lines)).toBe(1800 * 2 + 1200);
  });
});
