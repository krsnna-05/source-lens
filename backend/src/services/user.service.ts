import prisma from '../database/prisma';
import type { GitHubProfile } from '../utils/github';
import type { User } from '../generated/prisma/client';

export function findById(id: number): Promise<User | null> {
  return prisma.user.findUnique({ where: { id } });
}

export async function upsertGithubUser(profile: GitHubProfile, accessToken: string): Promise<User> {
  const existing = await prisma.user.findUnique({ where: { githubId: profile.githubId } });

  if (!existing) {
    return prisma.user.create({
      data: {
        githubId: profile.githubId,
        username: profile.username,
        email: profile.email,
        avatarUrl: profile.avatarUrl,
        accessToken,
      },
    });
  }

  return prisma.user.update({
    where: { id: existing.id },
    data: {
      username: profile.username,
      email: profile.email,
      avatarUrl: profile.avatarUrl,
      accessToken,
    },
  });
}
