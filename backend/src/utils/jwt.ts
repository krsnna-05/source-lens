import jwt from 'jsonwebtoken';
import config from '../config/config';

export class InvalidTokenError extends Error {}

type TokenType = 'access' | 'refresh';

interface TokenPayload {
  sub: string;
  type: TokenType;
  iat: number;
  exp: number;
}

function createToken(userId: number, type: TokenType, expiresInSeconds: number): string {
  return jwt.sign({ sub: String(userId), type }, config.jwt.secret, {
    algorithm: config.jwt.algorithm,
    expiresIn: expiresInSeconds,
  });
}

export function createAccessToken(userId: number): string {
  return createToken(userId, 'access', config.jwt.accessExpirationHours * 60 * 60);
}

export function createRefreshToken(userId: number): string {
  return createToken(userId, 'refresh', config.jwt.refreshExpirationDays * 24 * 60 * 60);
}

export function decodeToken(token: string): TokenPayload {
  try {
    return jwt.verify(token, config.jwt.secret, {
      algorithms: [config.jwt.algorithm],
    }) as TokenPayload;
  } catch (err) {
    throw new InvalidTokenError((err as Error).message);
  }
}
