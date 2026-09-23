import axios, {
  type AxiosError,
  type InternalAxiosRequestConfig,
} from "axios";

import { env } from "@/config/env";
import { API_ENDPOINTS } from "@/constants/api";
import { routes } from "@/constants/routes";
import { ApiError } from "@/lib/api/errors";
import { authCookies } from "@/lib/auth/cookies";
import { tokenStorage } from "@/lib/auth/token";
import type { ApiErrorBody } from "@/types/api";

declare module "axios" {
  export interface AxiosRequestConfig {
    skipAuth?: boolean;
    _retry?: boolean;
  }
}

type RefreshResponse = {
  accessToken: string;
};

export const apiClient = axios.create({
  baseURL: env.NEXT_PUBLIC_API_URL,
  timeout: 30_000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true,
});

let refreshPromise: Promise<string> | null = null;

function redirectToLogin(): void {
  tokenStorage.clear();
  authCookies.clearReadable();

  if (typeof window !== "undefined" && window.location.pathname !== routes.login) {
    window.location.assign(routes.login);
  }
}

async function refreshAccessToken(): Promise<string> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      if (!authCookies.hasRefreshCredentials()) {
        throw new Error("Missing session credentials");
      }

      const csrfToken = authCookies.getCsrfToken();
      const { data } = await apiClient.post<RefreshResponse>(
        API_ENDPOINTS.auth.refresh,
        undefined,
        {
          skipAuth: true,
          headers: csrfToken ? { "X-CSRF-Token": csrfToken } : undefined,
        },
      );

      tokenStorage.setAccessToken(data.accessToken);
      return data.accessToken;
    })().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (config.skipAuth) {
    return config;
  }

  const token = tokenStorage.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  const csrfToken = authCookies.getCsrfToken();
  if (csrfToken) {
    config.headers["X-CSRF-Token"] = csrfToken;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorBody>) => {
    const originalRequest = error.config;

    if (error.response) {
      const { status, data } = error.response;
      const message =
        (Array.isArray(data?.message) ? data.message.join(", ") : data?.message) ||
        error.message ||
        "Request failed";

      const isRefreshCall = originalRequest?.url?.includes(API_ENDPOINTS.auth.refresh);

      if (
        status === 401 &&
        originalRequest &&
        !originalRequest.skipAuth &&
        !originalRequest._retry &&
        !isRefreshCall
      ) {
        if (!authCookies.hasRefreshCredentials()) {
          redirectToLogin();
          return Promise.reject(new ApiError(message, status, data ?? null));
        }

        originalRequest._retry = true;

        try {
          const accessToken = await refreshAccessToken();
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return apiClient(originalRequest);
        } catch {
          redirectToLogin();
          return Promise.reject(new ApiError(message, status, data ?? null));
        }
      }

      return Promise.reject(new ApiError(message, status, data ?? null));
    }

    if (error.request) {
      return Promise.reject(
        new ApiError("Network error. Please check your connection.", 0, null, "NETWORK_ERROR"),
      );
    }

    return Promise.reject(new ApiError(error.message || "Unexpected error", 0, null));
  },
);
