/** Client-side storage keys. Refresh stays server-side in Redis. */
export const storageKeys = {
  accessToken: "three_o_one_access_token",
} as const;

/**
 * Client can only read non-httpOnly cookies.
 * session_id is httpOnly (sent automatically with credentials).
 * We expose a readable marker so the 401 interceptor can mirror middleware checks.
 */
export const authCookieKeys = {
  sessionId: "session_id",
  csrfToken: "csrf_token",
  sessionPresent: "session_present",
} as const;
