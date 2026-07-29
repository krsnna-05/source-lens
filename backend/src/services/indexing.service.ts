import { simpleGit } from "simple-git";
import { promises as fs } from "fs";
import path from "path";
import prisma from "../database/prisma";
import { scanDirectory } from "../utils/file-scanner";
import { PROGRESS_STAGES } from "../utils/progress";

const REPOS_DIR = path.join(process.cwd(), ".repos");

async function updateProgress(
  repositoryId: string,
  status: keyof typeof PROGRESS_STAGES,
) {
  const stage = PROGRESS_STAGES[status];
  await prisma.repository.update({
    where: { id: repositoryId },
    data: { status: stage.status, progress: stage.progress },
  });
}

export async function indexRepository(repositoryId: string) {
  try {
    const repository = await prisma.repository.findUnique({
      where: { id: repositoryId },
      include: { user: true },
    });

    if (!repository) {
      throw new Error(`Repository not found: ${repositoryId}`);
    }

    await updateProgress(repositoryId, "cloning");
    console.log(`[${repositoryId}] Status: cloning (10%)`);

    await fs.mkdir(REPOS_DIR, { recursive: true });
    const localPath = path.join(REPOS_DIR, repository.owner, repository.name);

    await cloneRepository(
      repository.url,
      localPath,
      repository.user.accessToken,
    );

    await prisma.repository.update({
      where: { id: repositoryId },
      data: { localPath },
    });

    await updateProgress(repositoryId, "scanning");
    console.log(`[${repositoryId}] Status: scanning (25%)`);

    const { files, count } = await scanRepository(localPath);
    console.log(`[${repositoryId}] Found ${count} source files`);

    await updateProgress(repositoryId, "parsing");
    console.log(`[${repositoryId}] Status: parsing (45%)`);

    await updateProgress(repositoryId, "chunking");
    console.log(`[${repositoryId}] Status: chunking (60%)`);

    await updateProgress(repositoryId, "embedding");
    console.log(`[${repositoryId}] Status: embedding (85%)`);

    await updateProgress(repositoryId, "storing");
    console.log(`[${repositoryId}] Status: storing (95%)`);

    await updateProgress(repositoryId, "ready");
    console.log(`[${repositoryId}] Status: ready (100%)`);

    await prisma.repository.update({
      where: { id: repositoryId },
      data: { lastIndexedAt: new Date() },
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    console.error(`[${repositoryId}] Error:`, errorMessage);

    await prisma.repository.update({
      where: { id: repositoryId },
      data: {
        status: "failed",
        progress: 0,
        lastError: errorMessage,
      },
    });

    throw error;
  }
}

async function cloneRepository(
  url: string,
  localPath: string,
  accessToken: string,
): Promise<void> {
  const git = simpleGit();

  // Use access token for authentication
  const authenticatedUrl = url.replace(
    "https://github.com/",
    `https://x-access-token:${accessToken}@github.com/`,
  );

  await git.clone(authenticatedUrl, localPath, ["--depth", "1"]);
}

export async function scanRepository(
  localPath: string,
): Promise<{ files: string[]; count: number }> {
  console.log(`Scanning repository at: ${localPath}`);
  const files = await scanDirectory(localPath);
  console.log(`Found ${files.length} source files to index`);
  return { files, count: files.length };
}
