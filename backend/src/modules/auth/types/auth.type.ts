export type AuthUser = {
  id: string;
  email: string;
  fullName: string;
  dateOfBirth: string;
  role: 'customer' | 'admin';
  createdAt: string;
  updatedAt: string;
};

export type AuthResult = {
  user: AuthUser;
  accessToken: string;
  sessionId: string;
  csrfToken: string;
};

export type AuthResponseBody = {
  user: AuthUser;
  accessToken: string;
  sessionId: string;
  csrfToken: string;
};

export type RegisterPendingResponse = {
  message: string;
  email: string;
};
