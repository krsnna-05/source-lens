import prisma from '../database/prisma';
import type { User } from '../generated/prisma/client';

export function findByGithubId(githubId: number): Promise<User | null> {
  return prisma.user.findUnique({ where: { githubId } });
}

export function findById(id: number): Promise<User | null> {
  return prisma.user.findUnique({ where: { id } });
}

export function create(data: {
  githubId: number;
  username: string;
  email: string;
  avatarUrl: string | null;
  accessToken: string;
}): Promise<User> {
  return prisma.user.create({ data });
}

export function update(
  id: number,
  data: Partial<{ username: string; email: string; avatarUrl: string | null; accessToken: string }>,
): Promise<User> {
  return prisma.user.update({ where: { id }, data });
}
