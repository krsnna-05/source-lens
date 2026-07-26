import prisma from "../database/prisma";
import type {
  Repository,
  RepositoryProvider,
} from "../generated/prisma/client";

export async function getOrCreateRepository(params: {
  userId: number;
  name: string;
  owner: string;
  url: string;
  defaultBranch: string;
  provider: RepositoryProvider;
}): Promise<Repository> {
  const existing = await prisma.repository.findFirst({
    where: { userId: params.userId, owner: params.owner, name: params.name },
  });
  if (existing) return existing;

  return prisma.repository.create({ data: params });
}

export function listUserRepositories(userId: number): Promise<Repository[]> {
  return prisma.repository.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

export async function deleteRepository(
  userId: number,
  repositoryId: string,
): Promise<boolean> {
  const result = await prisma.repository.deleteMany({
    where: { id: repositoryId, userId },
  });
  return result.count > 0;
}
