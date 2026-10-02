import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { Money } from "@/types/common";

export type LocalCartItem = {
  /** Unique line: product + size (+ color when present) */
  lineId: string;
  productId: string;
  productSlug: string;
  productName: string;
  sizeId: string;
  sizeLabel: string;
  colorId?: string;
  colorName?: string | null;
  unitPrice: Money;
  quantity: number;
  /** Units available for this size. Cart quantity cannot exceed it. */
  maxQuantity?: number;
  imageUrl?: string | null;
};

export function buildCartLineId(productId: string, sizeId: string, colorId?: string): string {
  return colorId ? `${productId}:${colorId}:${sizeId}` : `${productId}:${sizeId}`;
}

type CartState = {
  items: LocalCartItem[];
  addItem: (
    item: Omit<LocalCartItem, "quantity" | "lineId" | "maxQuantity"> & {
      quantity?: number;
      maxQuantity: number;
    },
  ) => void;
  updateQuantity: (lineId: string, quantity: number) => void;
  /** Caps each matching line to the live stock for that size. */
  applyStockLimits: (limits: Record<string, number>) => void;
  removeItem: (lineId: string) => void;
  clear: () => void;
  itemCount: () => number;
  subtotalAmount: () => number;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        const requested = Math.max(1, Math.floor(item.quantity ?? 1));
        const maxQuantity = Math.max(0, Math.floor(item.maxQuantity));
        if (maxQuantity <= 0) return;

        const lineId = buildCartLineId(item.productId, item.sizeId, item.colorId);

        set((state) => {
          const existing = state.items.find((entry) => entry.lineId === lineId);
          if (existing) {
            const quantity = Math.min(maxQuantity, existing.quantity + requested);
            return {
              items: state.items.map((entry) =>
                entry.lineId === lineId
                  ? { ...entry, ...item, lineId, quantity, maxQuantity }
                  : entry,
              ),
            };
          }

          return {
            items: [
              ...state.items,
              {
                ...item,
                lineId,
                quantity: Math.min(maxQuantity, requested),
                maxQuantity,
              },
            ],
          };
        });
      },

      updateQuantity: (lineId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(lineId);
          return;
        }

        set((state) => ({
          items: state.items.flatMap((entry) => {
            if (entry.lineId !== lineId) return [entry];

            const cap =
              typeof entry.maxQuantity === "number"
                ? Math.max(0, Math.floor(entry.maxQuantity))
                : quantity;
            const next = Math.min(Math.floor(quantity), cap);
            if (next <= 0) return [];
            return [{ ...entry, quantity: next }];
          }),
        }));
      },

      applyStockLimits: (limits) => {
        set((state) => {
          let changed = false;

          const items = state.items.flatMap((entry) => {
            if (!(entry.lineId in limits)) return [entry];

            const maxQuantity = Math.max(0, Math.floor(limits[entry.lineId] ?? 0));
            const quantity = Math.min(entry.quantity, maxQuantity);
            if (quantity <= 0) {
              changed = true;
              return [];
            }

            if (entry.quantity === quantity && entry.maxQuantity === maxQuantity) {
              return [entry];
            }

            changed = true;
            return [{ ...entry, quantity, maxQuantity }];
          });

          return changed ? { items } : state;
        });
      },

      removeItem: (lineId) => {
        set((state) => ({
          items: state.items.filter((entry) => entry.lineId !== lineId),
        }));
      },

      clear: () => set({ items: [] }),

      itemCount: () => get().items.reduce((total, item) => total + item.quantity, 0),

      subtotalAmount: () =>
        get().items.reduce((total, item) => total + item.unitPrice.amount * item.quantity, 0),
    }),
    {
      name: "three-o-one-cart",
      partialize: (state) => ({ items: state.items }),
      version: 1,
      migrate: (persisted) => {
        const state = persisted as { items?: unknown[] } | undefined;
        if (!state?.items || !Array.isArray(state.items)) {
          return { items: [] };
        }

        // Drop legacy lines that lack size / lineId so the bag stays consistent.
        const items = state.items.filter((entry): entry is LocalCartItem => {
          if (!entry || typeof entry !== "object") return false;
          const item = entry as Partial<LocalCartItem>;
          return Boolean(item.lineId && item.sizeId && item.sizeLabel && item.productId);
        });

        return { items };
      },
    },
  ),
);
