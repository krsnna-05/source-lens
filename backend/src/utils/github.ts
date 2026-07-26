import config from '../config/config';

const GITHUB_AUTHORIZE_URL = 'https://github.com/login/oauth/authorize';
const GITHUB_TOKEN_URL = 'https://github.com/login/oauth/access_token';
const GITHUB_USER_URL = 'https://api.github.com/user';
const GITHUB_USER_EMAILS_URL = 'https://api.github.com/user/emails';
const GITHUB_USER_REPOS_URL = 'https://api.github.com/user/repos';
const GITHUB_REPO_URL = (owner: string, name: string) =>
  `https://api.github.com/repos/${owner}/${name}`;

// read:user + user:email cover profile/email; repo is required to read commits
// from both public and private repositories.
const GITHUB_OAUTH_SCOPES = 'read:user user:email repo';

export class GitHubOAuthError extends Error {}
export class GitHubRepoError extends Error {}

export interface GitHubProfile {
  githubId: number;
  username: string;
  email: string;
  avatarUrl: string | null;
}

export interface GitHubRepo {
  id: number;
  name: string;
  fullName: string;
  private: boolean;
  defaultBranch: string;
  updatedAt: string;
  htmlUrl: string;
}

export interface GitHubRepoPage {
  repos: GitHubRepo[];
  hasMore: boolean;
}

export function buildGithubAuthorizeUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: config.github.clientId,
    redirect_uri: config.github.redirectUri,
    scope: GITHUB_OAUTH_SCOPES,
    state,
    allow_signup: 'true',
  });
  return `${GITHUB_AUTHORIZE_URL}?${params.toString()}`;
}

export async function exchangeCodeForToken(code: string): Promise<string> {
  let response: Response;
  try {
    response = await fetch(GITHUB_TOKEN_URL, {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: config.github.clientId,
        client_secret: config.github.clientSecret,
        code,
        redirect_uri: config.github.redirectUri,
      }),
    });
  } catch (err) {
    throw new GitHubOAuthError('Could not reach GitHub to exchange the code');
  }

  if (!response.ok) {
    throw new GitHubOAuthError('GitHub token exchange request failed');
  }

  const payload = (await response.json()) as Record<string, unknown>;
  if (payload.error) {
    // e.g. bad_verification_code (invalid/expired/already-used code)
    throw new GitHubOAuthError((payload.error_description as string) || (payload.error as string));
  }

  const accessToken = payload.access_token;
  if (!accessToken || typeof accessToken !== 'string') {
    throw new GitHubOAuthError('GitHub did not return an access token');
  }
  return accessToken;
}

function pickVerifiedEmail(
  emails: Array<{ email: string; primary: boolean; verified: boolean }>,
): string | null {
  const primary = emails.find((e) => e.primary && e.verified);
  if (primary) return primary.email;
  const verified = emails.find((e) => e.verified);
  return verified ? verified.email : null;
}

export async function fetchGithubProfile(accessToken: string): Promise<GitHubProfile> {
  const headers = {
    Authorization: `Bearer ${accessToken}`,
    Accept: 'application/vnd.github+json',
  };

  let user: Record<string, unknown>;
  let email: string | null;
  try {
    const userResponse = await fetch(GITHUB_USER_URL, { headers });
    if (!userResponse.ok) {
      throw new GitHubOAuthError('Failed to fetch GitHub user profile');
    }
    user = await userResponse.json();

    email = (user.email as string) || null;
    if (!email) {
      const emailsResponse = await fetch(GITHUB_USER_EMAILS_URL, { headers });
      if (emailsResponse.ok) {
        email = pickVerifiedEmail(await emailsResponse.json());
      }
    }
  } catch (err) {
    if (err instanceof GitHubOAuthError) throw err;
    throw new GitHubOAuthError('Could not reach GitHub to fetch the profile');
  }

  if (!email) {
    throw new GitHubOAuthError('GitHub account has no verified email address');
  }

  return {
    githubId: user.id as number,
    username: user.login as string,
    email,
    avatarUrl: (user.avatar_url as string) || null,
  };
}

function toGithubRepo(item: Record<string, unknown>): GitHubRepo {
  return {
    id: item.id as number,
    name: item.name as string,
    fullName: item.full_name as string,
    private: item.private as boolean,
    defaultBranch: item.default_branch as string,
    updatedAt: item.updated_at as string,
    htmlUrl: item.html_url as string,
  };
}

export async function listUserReposPage(
  accessToken: string,
  page: number,
  perPage: number,
): Promise<GitHubRepoPage> {
  const headers = {
    Authorization: `Bearer ${accessToken}`,
    Accept: 'application/vnd.github+json',
  };

  const params = new URLSearchParams({
    per_page: String(perPage),
    page: String(page),
    sort: 'updated',
    affiliation: 'owner,collaborator,organization_member',
  });

  let response: Response;
  try {
    response = await fetch(`${GITHUB_USER_REPOS_URL}?${params.toString()}`, { headers });
  } catch (err) {
    throw new GitHubRepoError('Could not reach GitHub to list repositories');
  }

  if (!response.ok) {
    throw new GitHubRepoError('Failed to fetch repositories from GitHub');
  }

  const batch = (await response.json()) as Record<string, unknown>[];
  const linkHeader = response.headers.get('link') || '';

  return {
    repos: batch.map(toGithubRepo),
    hasMore: linkHeader.includes('rel="next"'),
  };
}

export async function getRepo(
  accessToken: string,
  owner: string,
  name: string,
): Promise<GitHubRepo | null> {
  const headers = {
    Authorization: `Bearer ${accessToken}`,
    Accept: 'application/vnd.github+json',
  };

  let response: Response;
  try {
    response = await fetch(GITHUB_REPO_URL(owner, name), { headers });
  } catch (err) {
    throw new GitHubRepoError('Could not reach GitHub to look up the repository');
  }

  if (response.status === 404) return null;
  if (!response.ok) {
    throw new GitHubRepoError('Failed to fetch the repository from GitHub');
  }

  return toGithubRepo(await response.json());
}
