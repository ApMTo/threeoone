"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query/keys";
import {
  cartService,
  type AddCartItemPayload,
  type UpdateCartItemPayload,
} from "@/services/cart.service";

export function useCart(enabled = true) {
  return useQuery({
    queryKey: queryKeys.cart.current(),
    queryFn: () => cartService.get(),
    enabled,
  });
}

export function useAddCartItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AddCartItemPayload) => cartService.addItem(payload),
    onSuccess: (cart) => {
      queryClient.setQueryData(queryKeys.cart.current(), cart);
    },
  });
}

export function useUpdateCartItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itemId, payload }: { itemId: string; payload: UpdateCartItemPayload }) =>
      cartService.updateItem(itemId, payload),
    onSuccess: (cart) => {
      queryClient.setQueryData(queryKeys.cart.current(), cart);
    },
  });
}

export function useRemoveCartItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (itemId: string) => cartService.removeItem(itemId),
    onSuccess: (cart) => {
      queryClient.setQueryData(queryKeys.cart.current(), cart);
    },
  });
}

export function useClearCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => cartService.clear(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.cart.all });
    },
  });
}
