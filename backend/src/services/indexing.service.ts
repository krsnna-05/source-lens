import { simpleGit } from "simple-git";
import { promises as fs } from "fs";
import path from "path";
import prisma from "../database/prisma";

const REPOS_DIR = path.join(process.cwd(), ".repos");

export async function indexRepository(repositoryId: string) {
  try {
    // Fetch repository from database
    const repository = await prisma.repository.findUnique({
      where: { id: repositoryId },
      include: { user: true },
    });

    if (!repository) {
      throw new Error(`Repository not found: ${repositoryId}`);
    }

    // Update status to indexing
    await prisma.repository.update({
      where: { id: repositoryId },
      data: { status: "indexing" },
    });

    // Create repos directory if it doesn't exist
    await fs.mkdir(REPOS_DIR, { recursive: true });

    // Define local path for cloned repository
    const localPath = path.join(REPOS_DIR, repository.owner, repository.name);

    // Clone repository
    console.log(`Cloning repository: ${repository.url} to ${localPath}`);
    await cloneRepository(
      repository.url,
      localPath,
      repository.user.accessToken,
    );

    // Update repository with local path
    await prisma.repository.update({
      where: { id: repositoryId },
      data: {
        localPath,
        lastIndexedAt: new Date(),
      },
    });

    console.log(`Repository cloned successfully: ${repositoryId}`);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    console.error(`Error indexing repository ${repositoryId}:`, errorMessage);

    // Update repository status to failed
    await prisma.repository.update({
      where: { id: repositoryId },
      data: {
        status: "failed",
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
