export const AUTH_COOKIE = {
  sessionId: 'session_id',
  csrfToken: 'csrf_token',
  sessionPresent: 'session_present',
} as const;

export const CSRF_HEADER = 'x-csrf-token';

export const PENDING_REGISTRATION_TTL_SECONDS = 60 * 60 * 24;

export type SessionRecord = {
  userId: string;
  refreshTokenHash: string;
  csrfToken: string;
  createdAt: string;
};

export type PendingRegistration = {
  email: string;
  fullName: string;
  dateOfBirth: string;
  passwordHash: string;
  createdAt: string;
};

export function sessionKey(sessionId: string): string {
  return `session:${sessionId}`;
}

export function pendingRegistrationKey(token: string): string {
  return `pending:reg:${token}`;
}

export function pendingEmailKey(email: string): string {
  return `pending:email:${email.toLowerCase()}`;
}
