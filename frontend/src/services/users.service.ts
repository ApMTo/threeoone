import { API_ENDPOINTS } from "@/constants/api";
import type { ShippingAddress } from "@/entities/order";
import type { User } from "@/entities/user";
import { apiClient } from "@/lib/api/client";
import type { ID } from "@/types/common";

export type UserAddress = ShippingAddress & {
  id: ID;
  isDefault: boolean;
};

export type CreateAddressPayload = ShippingAddress & {
  company?: string;
  isDefault?: boolean;
};

export type UpdateProfilePayload = {
  fullName?: string;
  dateOfBirth?: string;
};

export const usersService = {
  async getProfile(): Promise<User> {
    const { data } = await apiClient.get<User>(API_ENDPOINTS.users.me);
    return data;
  },

  async updateProfile(payload: UpdateProfilePayload): Promise<User> {
    const { data } = await apiClient.patch<User>(API_ENDPOINTS.users.me, payload);
    return data;
  },

  async listAddresses(): Promise<UserAddress[]> {
    const { data } = await apiClient.get<UserAddress[]>(API_ENDPOINTS.users.addresses);
    return data;
  },

  async createAddress(payload: CreateAddressPayload): Promise<UserAddress> {
    const { data } = await apiClient.post<UserAddress>(
      API_ENDPOINTS.users.addresses,
      payload,
    );
    return data;
  },
};
