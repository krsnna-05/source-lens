-- CreateEnum
CREATE TYPE "repository_provider" AS ENUM ('github', 'gitlab', 'local');

-- CreateEnum
CREATE TYPE "repository_status" AS ENUM ('pending', 'indexing', 'ready', 'failed');

-- CreateEnum
CREATE TYPE "index_mode" AS ENUM ('manual', 'auto');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "github_id" INTEGER NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "avatar_url" TEXT,
    "access_token" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "repositories" (
    "id" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "owner" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "provider" "repository_provider" NOT NULL DEFAULT 'github',
    "default_branch" TEXT NOT NULL DEFAULT 'main',
    "local_path" TEXT,
    "latest_remote_commit" TEXT,
    "last_indexed_commit" TEXT,
    "status" "repository_status" NOT NULL DEFAULT 'pending',
    "index_mode" "index_mode" NOT NULL DEFAULT 'manual',
    "last_indexed_at" TIMESTAMP(3),
    "last_error" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "repositories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "indexed_files" (
    "id" TEXT NOT NULL,
    "repository_id" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "blob_sha" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "size_bytes" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "indexed_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "indexed_files_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_github_id_key" ON "users"("github_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "repositories_user_id_owner_name_key" ON "repositories"("user_id", "owner", "name");

-- AddForeignKey
ALTER TABLE "repositories" ADD CONSTRAINT "repositories_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "indexed_files" ADD CONSTRAINT "indexed_files_repository_id_fkey" FOREIGN KEY ("repository_id") REFERENCES "repositories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
