import { authCookieKeys } from "@/constants/storage";

function canUseDom(): boolean {
  return typeof document !== "undefined";
}

function readCookie(name: string): string | null {
  if (!canUseDom()) {
    return null;
  }

  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));

  if (!match) {
    return null;
  }

  return decodeURIComponent(match.slice(name.length + 1));
}

function writeCookie(name: string, value: string, maxAgeSeconds: number): void {
  if (!canUseDom()) {
    return;
  }

  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAgeSeconds}; SameSite=Lax`;
}

function clearCookie(name: string): void {
  if (!canUseDom()) {
    return;
  }

  document.cookie = `${name}=; Max-Age=0; path=/`;
}

const DEFAULT_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export const authCookies = {
  getCsrfToken(): string | null {
    return readCookie(authCookieKeys.csrfToken);
  },

  hasSessionPresent(): boolean {
    return readCookie(authCookieKeys.sessionPresent) === "1";
  },

  hasRefreshCredentials(): boolean {
    return this.hasSessionPresent() && Boolean(this.getCsrfToken());
  },

  /**
   * Mirror session markers onto the frontend origin.
   * API Set-Cookie may land on a different port host context; these
   * readable cookies keep middleware + client gates in sync.
   */
  persistSession(csrfToken: string, maxAgeSeconds = DEFAULT_SESSION_MAX_AGE_SECONDS): void {
    const maxAge = Math.max(60, maxAgeSeconds);
    writeCookie(authCookieKeys.csrfToken, csrfToken, maxAge);
    writeCookie(authCookieKeys.sessionPresent, "1", maxAge);
  },

  clearReadable(): void {
    clearCookie(authCookieKeys.csrfToken);
    clearCookie(authCookieKeys.sessionPresent);
  },
};
