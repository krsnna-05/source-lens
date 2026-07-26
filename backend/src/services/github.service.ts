import * as github from '../utils/github';
import type { GitHubRepo, GitHubRepoPage } from '../utils/github';

export function listUserRepos(accessToken: string, page: number, perPage: number): Promise<GitHubRepoPage> {
  return github.listUserReposPage(accessToken, page, perPage);
}

export function lookupRepo(accessToken: string, owner: string, name: string): Promise<GitHubRepo | null> {
  return github.getRepo(accessToken, owner, name);
}

export { GitHubRepoError } from '../utils/github';
