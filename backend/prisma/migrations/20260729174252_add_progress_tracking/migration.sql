-- AlterEnum
ALTER TYPE "repository_status" ADD VALUE 'cloning';
ALTER TYPE "repository_status" ADD VALUE 'scanning';
ALTER TYPE "repository_status" ADD VALUE 'parsing';
ALTER TYPE "repository_status" ADD VALUE 'chunking';
ALTER TYPE "repository_status" ADD VALUE 'embedding';
ALTER TYPE "repository_status" ADD VALUE 'storing';

-- AlterTable
ALTER TABLE "repositories" ADD COLUMN "progress" INTEGER NOT NULL DEFAULT 0;
