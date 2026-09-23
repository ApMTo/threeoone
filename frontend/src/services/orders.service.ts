import { API_ENDPOINTS } from "@/constants/api";
import type { Order } from "@/entities/order";
import { apiClient } from "@/lib/api/client";
import type { OrderListParams } from "@/lib/query/keys";
import type { CheckoutInput } from "@/schemas/checkout.schema";
import type { PaginatedResponse } from "@/types/api";

export const ordersService = {
  async list(params: OrderListParams = {}): Promise<PaginatedResponse<Order>> {
    const { data } = await apiClient.get<PaginatedResponse<Order>>(API_ENDPOINTS.orders.root, {
      params,
    });
    return data;
  },

  async getById(id: string): Promise<Order> {
    const { data } = await apiClient.get<Order>(API_ENDPOINTS.orders.byId(id));
    return data;
  },

  async create(payload: CheckoutInput): Promise<Order> {
    const { data } = await apiClient.post<Order>(API_ENDPOINTS.orders.root, payload);
    return data;
  },
};
