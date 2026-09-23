import type { ApiErrorBody } from "@/types/api";

export class ApiError extends Error {
  readonly status: number;
  readonly body: ApiErrorBody | null;
  readonly code?: string;

  constructor(message: string, status: number, body: ApiErrorBody | null = null, code?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
    this.code = code;
  }
}

export function getErrorMessage(error: unknown, fallback = "Something went wrong"): string {
  if (error instanceof ApiError) {
    const { message } = error.body ?? {};
    if (Array.isArray(message)) {
      return message.join(", ");
    }
    if (typeof message === "string" && message.length > 0) {
      return message;
    }
    return error.message || fallback;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

export function isUnauthorized(error: unknown): boolean {
  return error instanceof ApiError && error.status === 401;
}
