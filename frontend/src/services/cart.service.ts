import { API_ENDPOINTS } from "@/constants/api";
import { apiClient } from "@/lib/api/client";
import type { ID, Money } from "@/types/common";

export type CartItem = {
  id: ID;
  productId: ID;
  productName: string;
  productSlug: string;
  quantity: number;
  unitPrice: Money;
  imageUrl?: string | null;
};

export type Cart = {
  id: ID;
  items: CartItem[];
  subtotal: Money;
  itemCount: number;
};

export type AddCartItemPayload = {
  productId: string;
  quantity: number;
};

export type UpdateCartItemPayload = {
  quantity: number;
};

export const cartService = {
  async get(): Promise<Cart> {
    const { data } = await apiClient.get<Cart>(API_ENDPOINTS.cart.root);
    return data;
  },

  async addItem(payload: AddCartItemPayload): Promise<Cart> {
    const { data } = await apiClient.post<Cart>(API_ENDPOINTS.cart.items, payload);
    return data;
  },

  async updateItem(itemId: string, payload: UpdateCartItemPayload): Promise<Cart> {
    const { data } = await apiClient.patch<Cart>(API_ENDPOINTS.cart.item(itemId), payload);
    return data;
  },

  async removeItem(itemId: string): Promise<Cart> {
    const { data } = await apiClient.delete<Cart>(API_ENDPOINTS.cart.item(itemId));
    return data;
  },

  async clear(): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.cart.root);
  },
};
