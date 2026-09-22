import { CookieOptions, Response } from 'express';
import { AppConfigService } from '../../config/config.service';
import { AUTH_COOKIE } from './auth.constants';

export function buildAuthCookieOptions(
  config: AppConfigService,
  maxAgeMs: number,
  httpOnly: boolean,
): CookieOptions {
  const options: CookieOptions = {
    httpOnly,
    secure: config.isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: maxAgeMs,
  };

  if (config.cookieDomain) {
    options.domain = config.cookieDomain;
  }

  return options;
}

export function setAuthCookies(
  res: Response,
  config: AppConfigService,
  sessionId: string,
  csrfToken: string,
): void {
  const maxAgeMs = config.jwtRefreshExpiresInSeconds * 1000;

  res.cookie(
    AUTH_COOKIE.sessionId,
    sessionId,
    buildAuthCookieOptions(config, maxAgeMs, true),
  );
  res.cookie(
    AUTH_COOKIE.csrfToken,
    csrfToken,
    buildAuthCookieOptions(config, maxAgeMs, false),
  );
  // Readable marker so the browser can detect a session without exposing session_id.
  res.cookie(
    AUTH_COOKIE.sessionPresent,
    '1',
    buildAuthCookieOptions(config, maxAgeMs, false),
  );
}

export function clearAuthCookies(res: Response, config: AppConfigService): void {
  res.clearCookie(AUTH_COOKIE.sessionId, buildAuthCookieOptions(config, 0, true));
  res.clearCookie(AUTH_COOKIE.csrfToken, buildAuthCookieOptions(config, 0, false));
  res.clearCookie(AUTH_COOKIE.sessionPresent, buildAuthCookieOptions(config, 0, false));
}
