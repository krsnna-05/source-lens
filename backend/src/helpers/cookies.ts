import { Response } from 'express';
import config from '../config/config';
import { createRefreshToken } from '../utils/jwt';

export const OAUTH_STATE_COOKIE = 'oauth_state';
export const REFRESH_TOKEN_COOKIE = 'refresh_token';

const isProduction = config.nodeEnv === 'production';

export function setOauthStateCookie(res: Response, state: string): void {
  res.cookie(OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    maxAge: 600 * 1000,
  });
}

export function clearOauthStateCookie(res: Response): void {
  res.clearCookie(OAUTH_STATE_COOKIE);
}

export function setRefreshCookie(res: Response, userId: number): void {
  res.cookie(REFRESH_TOKEN_COOKIE, createRefreshToken(userId), {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    maxAge: config.jwt.refreshExpirationDays * 24 * 60 * 60 * 1000,
    path: '/api/auth',
  });
}

export function clearRefreshCookie(res: Response): void {
  res.clearCookie(REFRESH_TOKEN_COOKIE, { path: '/api/auth' });
}
