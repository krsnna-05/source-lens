import { Request, Response } from 'express';
import { z } from 'zod';
import * as githubService from '../services/github.service';
import * as repositoryService from '../services/repository.service';
import { GitHubRepoError } from '../utils/github';
import type { Repository, RepositoryProvider } from '../generated/prisma/client';

const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  per_page: z.coerce.number().int().min(1).max(100).default(20),
});

const lookupQuerySchema = z.object({
  owner: z.string().min(1),
  name: z.string().min(1),
});

const createRepoSchema = z.object({
  name: z.string().min(1),
  owner: z.string().min(1),
  url: z.string().min(1),
  default_branch: z.string().default('main'),
  provider: z.enum(['github', 'gitlab', 'local']).default('github'),
});

function serializeGithubRepo(repo: {
  id: number;
  name: string;
  fullName: string;
  private: boolean;
  defaultBranch: string;
  updatedAt: string;
  htmlUrl: string;
}) {
  return {
    id: repo.id,
    name: repo.name,
    full_name: repo.fullName,
    private: repo.private,
    default_branch: repo.defaultBranch,
    updated_at: repo.updatedAt,
    html_url: repo.htmlUrl,
  };
}

function serializeRepository(repo: Repository) {
  return {
    id: repo.id,
    name: repo.name,
    owner: repo.owner,
    url: repo.url,
    provider: repo.provider,
    default_branch: repo.defaultBranch,
    status: repo.status,
    index_mode: repo.indexMode,
    last_indexed_at: repo.lastIndexedAt,
    last_error: repo.lastError,
    created_at: repo.createdAt,
    updated_at: repo.updatedAt,
  };
}

export async function listGithubRepos(req: Request, res: Response): Promise<void> {
  const parsed = listQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ detail: 'Invalid query parameters' });
    return;
  }
  const { page, per_page: perPage } = parsed.data;

  try {
    const result = await githubService.listUserRepos(req.user!.accessToken, page, perPage);
    res.json({
      repos: result.repos.map(serializeGithubRepo),
      has_more: result.hasMore,
      next_page: result.hasMore ? page + 1 : null,
    });
  } catch (err) {
    if (err instanceof GitHubRepoError) {
      res.status(502).json({ detail: err.message });
      return;
    }
    throw err;
  }
}

export async function lookupGithubRepo(req: Request, res: Response): Promise<void> {
  const parsed = lookupQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ detail: 'Invalid query parameters' });
    return;
  }
  const { owner, name } = parsed.data;

  try {
    const repo = await githubService.lookupRepo(req.user!.accessToken, owner, name);
    if (!repo) {
      res.status(404).json({ detail: 'Repository not found on GitHub' });
      return;
    }
    res.json(serializeGithubRepo(repo));
  } catch (err) {
    if (err instanceof GitHubRepoError) {
      res.status(502).json({ detail: err.message });
      return;
    }
    throw err;
  }
}

export async function addRepository(req: Request, res: Response): Promise<void> {
  const parsed = createRepoSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ detail: 'Invalid request body' });
    return;
  }
  const { name, owner, url, default_branch: defaultBranch, provider } = parsed.data;

  const repository = await repositoryService.getOrCreateRepository({
    userId: req.user!.id,
    name,
    owner,
    url,
    defaultBranch,
    provider: provider as RepositoryProvider,
  });

  res.status(201).json(serializeRepository(repository));
}

export async function listRepositories(req: Request, res: Response): Promise<void> {
  const repositories = await repositoryService.listUserRepositories(req.user!.id);
  res.json(repositories.map(serializeRepository));
}

const repositoryIdSchema = z.string().uuid();

export async function removeRepository(req: Request, res: Response): Promise<void> {
  const parsed = repositoryIdSchema.safeParse(req.params.id);
  if (!parsed.success) {
    res.status(400).json({ detail: 'Invalid repository id' });
    return;
  }

  const deleted = await repositoryService.deleteRepository(req.user!.id, parsed.data);
  if (!deleted) {
    res.status(404).json({ detail: 'Repository not found' });
    return;
  }
  res.status(204).send();
}
