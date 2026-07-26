import crypto from 'crypto';
import { Request, Response } from 'express';
import { z } from 'zod';
import * as authService from '../services/auth.service';
import { InvalidTokenError, createAccessToken, decodeToken } from '../utils/jwt';
import * as userRepository from '../repositories/user.repository';
import {
  OAUTH_STATE_COOKIE,
  REFRESH_TOKEN_COOKIE,
  clearOauthStateCookie,
  clearRefreshCookie,
  setOauthStateCookie,
  setRefreshCookie,
} from '../helpers/cookies';
import type { User } from '../generated/prisma/client';

const callbackSchema = z.object({
  code: z.string().min(1),
  state: z.string().min(1),
});

function serializeUser(user: User) {
  return {
    id: user.id,
    github_id: user.githubId,
    username: user.username,
    email: user.email,
    avatar_url: user.avatarUrl,
    created_at: user.createdAt,
    updated_at: user.updatedAt,
  };
}

export function githubLogin(_req: Request, res: Response): void {
  const state = crypto.randomBytes(24).toString('base64url');
  setOauthStateCookie(res, state);
  res.redirect(307, authService.buildLoginRedirectUrl(state));
}

export async function githubCallback(req: Request, res: Response): Promise<void> {
  const parsed = callbackSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ detail: 'Invalid request body' });
    return;
  }
  const { code, state } = parsed.data;

  const cookieState = req.cookies?.[OAUTH_STATE_COOKIE];
  clearOauthStateCookie(res);

  if (!cookieState || cookieState !== state) {
    res.status(400).json({ detail: 'Invalid or expired OAuth state' });
    return;
  }

  try {
    const user = await authService.completeGithubLogin(code);
    setRefreshCookie(res, user.id);
    res.json({
      access_token: createAccessToken(user.id),
      token_type: 'bearer',
      user: serializeUser(user),
    });
  } catch (err) {
    res.status(400).json({ detail: (err as Error).message });
  }
}

export function logout(_req: Request, res: Response): void {
  clearRefreshCookie(res);
  res.status(204).send();
}

export async function refresh(req: Request, res: Response): Promise<void> {
  const refreshCookie = req.cookies?.[REFRESH_TOKEN_COOKIE];
  if (!refreshCookie) {
    res.status(401).json({ detail: 'No active session' });
    return;
  }

  let payload;
  try {
    payload = decodeToken(refreshCookie);
  } catch (err) {
    if (err instanceof InvalidTokenError) {
      clearRefreshCookie(res);
      res.status(401).json({ detail: 'Session expired, please sign in again' });
      return;
    }
    throw err;
  }

  if (payload.type !== 'refresh') {
    clearRefreshCookie(res);
    res.status(401).json({ detail: 'Invalid session token' });
    return;
  }

  const user = await userRepository.findById(Number(payload.sub));
  if (!user) {
    clearRefreshCookie(res);
    res.status(401).json({ detail: 'Account no longer exists' });
    return;
  }

  setRefreshCookie(res, user.id);
  res.json({
    access_token: createAccessToken(user.id),
    token_type: 'bearer',
    user: serializeUser(user),
  });
}
