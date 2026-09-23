import { API_ENDPOINTS } from "@/constants/api";
import { apiClient } from "@/lib/api/client";
import type { ID, Money } from "@/types/common";

export type ShippingMethod = {
  id: ID;
  name: string;
  description?: string | null;
  price: Money;
  estimatedDaysMin: number;
  estimatedDaysMax: number;
};

export type ShippingQuotePayload = {
  country: string;
  postalCode: string;
  subtotalAmount: number;
};

export const shippingService = {
  async listMethods(): Promise<ShippingMethod[]> {
    const { data } = await apiClient.get<ShippingMethod[]>(API_ENDPOINTS.shipping.methods);
    return data;
  },

  async quote(payload: ShippingQuotePayload): Promise<ShippingMethod[]> {
    const { data } = await apiClient.post<ShippingMethod[]>(API_ENDPOINTS.shipping.quote, payload);
    return data;
  },
};
