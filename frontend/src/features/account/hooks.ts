"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query/keys";
import {
  usersService,
  type CreateAddressPayload,
} from "@/services/users.service";

export function useProfile(enabled = true) {
  return useQuery({
    queryKey: queryKeys.account.profile(),
    queryFn: () => usersService.getProfile(),
    enabled,
  });
}

export function useAddresses(enabled = true) {
  return useQuery({
    queryKey: queryKeys.account.addresses(),
    queryFn: () => usersService.listAddresses(),
    enabled,
  });
}

export function useCreateAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateAddressPayload) =>
      usersService.createAddress(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.account.addresses(),
      });
    },
  });
}
