import * as userRepository from '../repositories/user.repository';
import type { GitHubProfile } from '../utils/github';
import type { User } from '../generated/prisma/client';

export async function upsertGithubUser(profile: GitHubProfile, accessToken: string): Promise<User> {
  const existing = await userRepository.findByGithubId(profile.githubId);

  if (!existing) {
    return userRepository.create({
      githubId: profile.githubId,
      username: profile.username,
      email: profile.email,
      avatarUrl: profile.avatarUrl,
      accessToken,
    });
  }

  return userRepository.update(existing.id, {
    username: profile.username,
    email: profile.email,
    avatarUrl: profile.avatarUrl,
    accessToken,
  });
}
