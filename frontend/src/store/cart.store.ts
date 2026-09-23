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
  imageUrl?: string | null;
};

export function buildCartLineId(productId: string, sizeId: string, colorId?: string): string {
  return colorId ? `${productId}:${colorId}:${sizeId}` : `${productId}:${sizeId}`;
}

type CartState = {
  items: LocalCartItem[];
  addItem: (item: Omit<LocalCartItem, "quantity" | "lineId"> & { quantity?: number }) => void;
  updateQuantity: (lineId: string, quantity: number) => void;
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
        const quantity = item.quantity ?? 1;
        const lineId = buildCartLineId(item.productId, item.sizeId, item.colorId);

        set((state) => {
          const existing = state.items.find((entry) => entry.lineId === lineId);
          if (existing) {
            return {
              items: state.items.map((entry) =>
                entry.lineId === lineId
                  ? { ...entry, quantity: entry.quantity + quantity }
                  : entry,
              ),
            };
          }

          return {
            items: [...state.items, { ...item, lineId, quantity }],
          };
        });
      },

      updateQuantity: (lineId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(lineId);
          return;
        }

        set((state) => ({
          items: state.items.map((entry) =>
            entry.lineId === lineId ? { ...entry, quantity } : entry,
          ),
        }));
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
