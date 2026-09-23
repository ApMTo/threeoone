"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { CreateProductInput } from "@/entities/product";
import { queryKeys, type ProductListParams } from "@/lib/query/keys";
import { productsService } from "@/services/products.service";

export function useProducts(params: ProductListParams = {}) {
  return useQuery({
    queryKey: queryKeys.products.list(params),
    queryFn: () => productsService.list(params),
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: queryKeys.products.detail(id),
    queryFn: () => productsService.getById(id),
    enabled: Boolean(id),
  });
}

export function useProductBySlug(slug: string) {
  return useQuery({
    queryKey: queryKeys.products.detailBySlug(slug),
    queryFn: () => productsService.getBySlug(slug),
    enabled: Boolean(slug),
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateProductInput) => productsService.create(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
    },
  });
}
