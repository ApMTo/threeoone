import type { Money } from "@/types/common";

export function formatMoney(price: Money): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: price.currency || "USD",
    }).format(price.amount);
  } catch {
    return `$${price.amount.toFixed(2)}`;
  }
}
