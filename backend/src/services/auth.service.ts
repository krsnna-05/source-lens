import * as github from '../utils/github';
import * as userService from './user.service';
import type { User } from '../generated/prisma/client';

export function buildLoginRedirectUrl(state: string): string {
  return github.buildGithubAuthorizeUrl(state);
}

export async function completeGithubLogin(code: string): Promise<User> {
  const githubAccessToken = await github.exchangeCodeForToken(code);
  const profile = await github.fetchGithubProfile(githubAccessToken);
  return userService.upsertGithubUser(profile, githubAccessToken);
}
