import * as repoRepository from '../repositories/repository.repository';
import type { Repository, RepositoryProvider } from '../generated/prisma/client';

export async function getOrCreateRepository(params: {
  userId: number;
  name: string;
  owner: string;
  url: string;
  defaultBranch: string;
  provider: RepositoryProvider;
}): Promise<Repository> {
  const existing = await repoRepository.findByUserOwnerName(params.userId, params.owner, params.name);
  if (existing) return existing;

  return repoRepository.create(params);
}

export function listUserRepositories(userId: number): Promise<Repository[]> {
  return repoRepository.listByUser(userId);
}

export function deleteRepository(userId: number, repositoryId: string): Promise<boolean> {
  return repoRepository.deleteByUserAndId(userId, repositoryId);
}
