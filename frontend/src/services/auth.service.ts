import type { User } from "@/entities/user";
import { API_ENDPOINTS } from "@/constants/api";
import { apiClient } from "@/lib/api/client";
import { authCookies } from "@/lib/auth/cookies";
import { tokenStorage } from "@/lib/auth/token";
import type { LoginInput, RegisterApiPayload } from "@/schemas/auth.schema";

export type AuthResponse = {
  user: User;
  accessToken: string;
  sessionId: string;
  csrfToken: string;
};

export type RegisterPendingResponse = {
  message: string;
  email: string;
};

export type RegisterPayload = RegisterApiPayload;

function persistAuthSession(data: AuthResponse): void {
  tokenStorage.setAccessToken(data.accessToken);
  authCookies.persistSession(data.csrfToken);
}

export const authService = {
  async login(payload: LoginInput): Promise<AuthResponse> {
    const { data } = await apiClient.post<AuthResponse>(API_ENDPOINTS.auth.login, payload, {
      skipAuth: true,
    });

    persistAuthSession(data);
    return data;
  },

  async register(payload: RegisterPayload): Promise<RegisterPendingResponse> {
    const { data } = await apiClient.post<RegisterPendingResponse>(
      API_ENDPOINTS.auth.register,
      payload,
      { skipAuth: true },
    );
    return data;
  },

  async confirmEmail(token: string): Promise<AuthResponse> {
    const { data } = await apiClient.post<AuthResponse>(
      API_ENDPOINTS.auth.confirm,
      { token },
      { skipAuth: true },
    );

    persistAuthSession(data);
    return data;
  },

  async forgotPassword(email: string): Promise<{ message: string }> {
    const { data } = await apiClient.post<{ message: string }>(
      API_ENDPOINTS.auth.forgotPassword,
      { email },
      { skipAuth: true },
    );
    return data;
  },

  async resetPassword(token: string, password: string): Promise<{ message: string }> {
    const { data } = await apiClient.post<{ message: string }>(
      API_ENDPOINTS.auth.resetPassword,
      { token, password },
      { skipAuth: true },
    );
    return data;
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post(API_ENDPOINTS.auth.logout, undefined, { skipAuth: true });
    } finally {
      tokenStorage.clear();
      authCookies.clearReadable();
    }
  },

  async me(): Promise<User> {
    const { data } = await apiClient.get<User>(API_ENDPOINTS.auth.me);
    return data;
  },

  async refresh(): Promise<AuthResponse> {
    const csrfToken = authCookies.getCsrfToken();
    const { data } = await apiClient.post<AuthResponse>(
      API_ENDPOINTS.auth.refresh,
      undefined,
      {
        skipAuth: true,
        headers: csrfToken ? { "X-CSRF-Token": csrfToken } : undefined,
      },
    );

    persistAuthSession(data);
    return data;
  },
};
