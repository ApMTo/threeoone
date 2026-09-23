"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { CreateCategoryInput } from "@/entities/category";
import { queryKeys } from "@/lib/query/keys";
import { categoriesService } from "@/services/categories.service";

export function useCategories(rootsOnly = false) {
  return useQuery({
    queryKey: [...queryKeys.categories.list(), { rootsOnly }] as const,
    queryFn: () => categoriesService.list(rootsOnly),
  });
}

export function useCategory(id: string) {
  return useQuery({
    queryKey: queryKeys.categories.detail(id),
    queryFn: () => categoriesService.getById(id),
    enabled: Boolean(id),
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateCategoryInput) => categoriesService.create(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
    },
  });
}
