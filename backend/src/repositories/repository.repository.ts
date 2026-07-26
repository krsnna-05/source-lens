import prisma from '../database/prisma';
import type { Repository, RepositoryProvider } from '../generated/prisma/client';

export function findByUserOwnerName(
  userId: number,
  owner: string,
  name: string,
): Promise<Repository | null> {
  return prisma.repository.findFirst({ where: { userId, owner, name } });
}

export function create(data: {
  userId: number;
  name: string;
  owner: string;
  url: string;
  defaultBranch: string;
  provider: RepositoryProvider;
}): Promise<Repository> {
  return prisma.repository.create({ data });
}

export function listByUser(userId: number): Promise<Repository[]> {
  return prisma.repository.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function deleteByUserAndId(userId: number, id: string): Promise<boolean> {
  const result = await prisma.repository.deleteMany({ where: { id, userId } });
  return result.count > 0;
}
