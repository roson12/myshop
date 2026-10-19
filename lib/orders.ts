import { prisma } from "./db";
import {
  buildOrderLines,
  CartValidationError,
  orderTotalCents,
} from "./pricing";
import { getStripe } from "./stripe";

export type OrderStatus = "PENDING" | "PAID" | "FULFILLED" | "CANCELLED";

export type PlaceOrderResult = { url: string } | { error: string };

type IncomingItem = { productId: string; quantity: number };

class OutOfStockError extends Error {}

function validEmail(value: unknown): string {
  if (typeof value !== "string") return "";
  const trimmed = value.trim();
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(trimmed) ? trimmed : "";
}

function baseUrl(): string {
  return (process.env.APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

function readItems(raw: unknown): IncomingItem[] | null {
  if (!Array.isArray(raw)) return null;
  const items: IncomingItem[] = [];
  for (const candidate of raw) {
    if (typeof candidate !== "object" || candidate === null) return null;
    const item = candidate as Record<string, unknown>;
    if (typeof item.productId !== "string") return null;
    if (typeof item.quantity !== "number") return null;
    items.push({ productId: item.productId, quantity: item.quantity });
  }
  return items;
}

/**
 * Creates an order. With Stripe configured it returns a hosted Checkout URL;
 * otherwise it immediately fulfills the order (demo checkout).
 * Prices and stock are always re-read from the database.
 */
export async function placeOrder(
  rawItems: unknown,
  rawEmail: unknown,
): Promise<PlaceOrderResult> {
  const items = readItems(rawItems);
  if (!items || items.length === 0) return { error: "Your cart is empty." };

  const products = await prisma.product.findMany({
    where: { id: { in: [...new Set(items.map((item) => item.productId))] } },
  });

  let lines;
  try {
    lines = buildOrderLines(products, items);
  } catch (error) {
    if (error instanceof CartValidationError) return { error: error.message };
    throw error;
  }

  const email = validEmail(rawEmail);

  const order = await prisma.order.create({
    data: {
      email,
      totalCents: orderTotalCents(lines),
      items: { create: lines },
    },
  });

  const stripe = getStripe();

  if (stripe) {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lines.map((line) => ({
        quantity: line.quantity,
        price_data: {
          currency: "usd",
          unit_amount: line.priceCents,
          product_data: { name: line.nameSnapshot },
        },
      })),
      customer_email: email || undefined,
      success_url: `${baseUrl()}/orders/${order.id}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl()}/cart`,
      metadata: { orderId: order.id },
      shipping_address_collection: {
        allowed_countries: ["US", "CA", "GB", "DE", "FR", "NL", "AU"],
      },
    });

    if (!session.url) {
      await prisma.order.update({
        where: { id: order.id },
        data: { status: "CANCELLED" },
      });
      return { error: "Stripe did not return a checkout URL." };
    }

    await prisma.order.update({
      where: { id: order.id },
      data: { stripeSessionId: session.id },
    });

    return { url: session.url };
  }

  const status = await fulfillOrder(order.id);
  if (status === "CANCELLED") {
    return { error: "Those items just sold out. Please adjust your cart." };
  }

  return { url: `/orders/${order.id}` };
}

/**
 * Marks a PENDING order PAID and decrements stock atomically.
 * Safe to call twice (webhook retries): non-pending orders are returned as-is.
 */
export async function fulfillOrder(
  orderId: string,
  stripeSessionId?: string,
): Promise<OrderStatus> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });

  if (!order) return "CANCELLED";
  if (order.status !== "PENDING") return order.status;

  try {
    await prisma.$transaction(async (tx) => {
      for (const item of order.items) {
        if (!item.productId) continue;
        const updated = await tx.product.updateMany({
          where: { id: item.productId, stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity } },
        });
        if (updated.count !== 1) throw new OutOfStockError();
      }

      await tx.order.update({
        where: { id: orderId },
        data: {
          status: "PAID",
          ...(stripeSessionId ? { stripeSessionId } : {}),
        },
      });
    });
  } catch (error) {
    if (error instanceof OutOfStockError) {
      await prisma.order.update({
        where: { id: orderId },
        data: { status: "CANCELLED" },
      });
      return "CANCELLED";
    }
    throw error;
  }

  return "PAID";
}

export async function cancelOrder(orderId: string): Promise<void> {
  await prisma.order.updateMany({
    where: { id: orderId, status: "PENDING" },
    data: { status: "CANCELLED" },
  });
}
