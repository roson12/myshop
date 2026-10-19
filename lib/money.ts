const formatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export function formatMoney(cents: number): string {
  return formatter.format(cents / 100);
}

export function dollarsToCents(input: string): number {
  const dollars = Number.parseFloat(input);
  if (!Number.isFinite(dollars) || dollars < 0) {
    throw new Error("Price must be a positive number.");
  }
  return Math.round(dollars * 100);
}
