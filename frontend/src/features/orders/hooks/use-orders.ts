"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys, type OrderListParams } from "@/lib/query/keys";
import type { CheckoutInput } from "@/schemas/checkout.schema";
import { ordersService } from "@/services/orders.service";

export function useOrders(params: OrderListParams = {}) {
  return useQuery({
    queryKey: queryKeys.orders.list(params),
    queryFn: () => ordersService.list(params),
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: queryKeys.orders.detail(id),
    queryFn: () => ordersService.getById(id),
    enabled: Boolean(id),
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CheckoutInput) => ordersService.create(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
      await queryClient.invalidateQueries({ queryKey: queryKeys.cart.all });
    },
  });
}
