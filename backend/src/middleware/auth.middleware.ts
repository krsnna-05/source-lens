import { NextFunction, Request, Response } from 'express';
import prisma from '../database/prisma';
import { InvalidTokenError, decodeToken } from '../utils/jwt';
import type { User } from '../generated/prisma/client';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ detail: 'Missing bearer token' });
    return;
  }

  const token = header.slice('Bearer '.length);

  let payload;
  try {
    payload = decodeToken(token);
  } catch (err) {
    if (err instanceof InvalidTokenError) {
      res.status(401).json({ detail: 'Invalid or expired token' });
      return;
    }
    throw err;
  }

  if (payload.type !== 'access') {
    res.status(401).json({ detail: 'Invalid token type' });
    return;
  }

  const user = await prisma.user.findUnique({ where: { id: Number(payload.sub) } });
  if (!user) {
    res.status(401).json({ detail: 'User not found' });
    return;
  }

  req.user = user;
  next();
}
