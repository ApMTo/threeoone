import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { routes } from "@/constants/routes";
import { authCookieKeys } from "@/constants/storage";

const PROTECTED_PREFIXES = ["/account", "/checkout", "/orders", "/admin"];

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

function clearAuthCookies(response: NextResponse): void {
  response.cookies.set(authCookieKeys.sessionId, "", {
    httpOnly: true,
    path: "/",
    maxAge: 0,
  });
  response.cookies.set(authCookieKeys.csrfToken, "", {
    httpOnly: false,
    path: "/",
    maxAge: 0,
  });
  response.cookies.set(authCookieKeys.sessionPresent, "", {
    httpOnly: false,
    path: "/",
    maxAge: 0,
  });
}

function hasSessionMarker(request: NextRequest): boolean {
  const sessionId = request.cookies.get(authCookieKeys.sessionId)?.value;
  const csrfToken = request.cookies.get(authCookieKeys.csrfToken)?.value;
  const sessionPresent = request.cookies.get(authCookieKeys.sessionPresent)?.value;

  // Prefer full session cookie pair from API; fall back to client-mirrored markers.
  if (sessionId && csrfToken) {
    return true;
  }

  return sessionPresent === "1" && Boolean(csrfToken);
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!isProtectedPath(pathname)) {
    return NextResponse.next();
  }

  if (hasSessionMarker(request)) {
    return NextResponse.next();
  }

  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = routes.login;
  loginUrl.searchParams.set("next", pathname);

  const response = NextResponse.redirect(loginUrl);
  clearAuthCookies(response);
  return response;
}

export const config = {
  matcher: [
    "/account",
    "/account/:path*",
    "/checkout",
    "/checkout/:path*",
    "/orders",
    "/orders/:path*",
    "/admin",
    "/admin/:path*",
  ],
};
