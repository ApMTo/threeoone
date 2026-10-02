"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query/keys";
import {
  toChangePasswordApiPayload,
  toUpdateProfileApiPayload,
  type ChangePasswordInput,
  type UpdateProfileInput,
} from "@/schemas/account.schema";
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

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateProfileInput) =>
      usersService.updateProfile(toUpdateProfileApiPayload(payload)),
    onSuccess: async (user) => {
      queryClient.setQueryData(queryKeys.auth.me(), user);
      queryClient.setQueryData(queryKeys.account.profile(), user);
      await queryClient.invalidateQueries({ queryKey: queryKeys.auth.me() });
      await queryClient.invalidateQueries({ queryKey: queryKeys.account.profile() });
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (payload: ChangePasswordInput) =>
      usersService.changePassword(toChangePasswordApiPayload(payload)),
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
