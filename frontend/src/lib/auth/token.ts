import { storageKeys } from "@/constants/storage";

type TokenListener = (accessToken: string | null) => void;

let memoryAccessToken: string | null = null;
const listeners = new Set<TokenListener>();

function canUseDom(): boolean {
  return typeof window !== "undefined";
}

export const tokenStorage = {
  getAccessToken(): string | null {
    if (memoryAccessToken) {
      return memoryAccessToken;
    }

    if (!canUseDom()) {
      return null;
    }

    return window.localStorage.getItem(storageKeys.accessToken);
  },

  setAccessToken(token: string | null): void {
    memoryAccessToken = token;

    if (canUseDom()) {
      if (token) {
        window.localStorage.setItem(storageKeys.accessToken, token);
      } else {
        window.localStorage.removeItem(storageKeys.accessToken);
      }
    }

    listeners.forEach((listener) => listener(token));
  },

  clear(): void {
    this.setAccessToken(null);
  },

  subscribe(listener: TokenListener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};
