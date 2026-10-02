import { API_ENDPOINTS } from "@/constants/api";
import type { CreateOrderResult, Order, OrderStatus } from "@/entities/order";
import { apiClient } from "@/lib/api/client";
import type { OrderListParams } from "@/lib/query/keys";
import type { CreateOrderInput } from "@/schemas/checkout.schema";
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

  async create(
    payload: CreateOrderInput,
    idempotencyKey?: string,
  ): Promise<CreateOrderResult> {
    const { data } = await apiClient.post<CreateOrderResult>(
      API_ENDPOINTS.orders.root,
      payload,
      idempotencyKey
        ? { headers: { "Idempotency-Key": idempotencyKey } }
        : undefined,
    );
    return data;
  },

  async confirmPayment(id: string): Promise<Order> {
    const { data } = await apiClient.post<Order>(
      API_ENDPOINTS.orders.confirmPayment(id),
    );
    return data;
  },

  async updateStatus(id: string, status: OrderStatus): Promise<Order> {
    const { data } = await apiClient.patch<Order>(API_ENDPOINTS.orders.updateStatus(id), {
      status,
    });
    return data;
  },
};
