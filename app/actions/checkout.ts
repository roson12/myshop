"use server";

import { placeOrder, type PlaceOrderResult } from "@/lib/orders";

export async function checkoutAction(
  items: { productId: string; quantity: number }[],
  email: string,
): Promise<PlaceOrderResult> {
  try {
    return await placeOrder(items, email);
  } catch (error) {
    console.error("Checkout failed", error);
    return { error: "Something went wrong while placing your order." };
  }
}
