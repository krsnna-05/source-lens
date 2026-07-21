"use client";

import { useState } from "react";
import { FolderGit2, Plus, Sparkles, X } from "lucide-react";

export type RepoItem = {
  id: string;
  name: string;
  indexed: boolean;
  branch: string;
  updatedAt: string;
};

type AddRepoDialogProps = {
  isOpen: boolean;
  unindexedRepos: RepoItem[];
  onClose: () => void;
  onAddRepo: (name: string) => void;
};

export function AddRepoDialog({
  isOpen,
  unindexedRepos,
  onClose,
  onAddRepo,
}: AddRepoDialogProps) {
  const [repoUrl, setRepoUrl] = useState("");

  if (!isOpen) {
    return null;
  }

  const handleAddRepo = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = repoUrl.trim();
    if (!trimmed) {
      return;
    }
    const name = trimmed.replace(/^https?:\/\/github\.com\//, "").replace(/\.git$/, "");
    onAddRepo(name);
    setRepoUrl("");
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/35 p-4 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <section
        className="w-full max-w-2xl rounded-3xl border border-zinc-200 bg-white p-6 shadow-2xl lg:p-8"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-zinc-900">Add Repository</h2>
            <p className="mt-1 text-sm text-zinc-600">Import a repository from GitHub, then index it.</p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs text-zinc-600">
              <Sparkles className="h-3.5 w-3.5" />
              GitHub repositories
            </span>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-zinc-200 text-zinc-600 transition-colors hover:bg-zinc-50"
              aria-label="Close add repository dialog"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <form onSubmit={handleAddRepo} className="mt-5 flex items-center gap-2">
          <input
            value={repoUrl}
            onChange={(event) => setRepoUrl(event.target.value)}
            placeholder="owner/repo or GitHub URL"
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50/60 px-3.5 py-2.5 text-sm text-zinc-900 outline-none transition-all placeholder:text-zinc-400 focus:border-indigo-300 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
          />
          <button
            type="submit"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-black hover:shadow-md active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" />
            Add
          </button>
        </form>

        <div className="mt-6">
          <h3 className="text-sm font-semibold text-zinc-900">Your Repos</h3>
          <div className="mt-3 max-h-96 space-y-2 overflow-y-auto pr-1">
            {unindexedRepos.length > 0 ? (
              unindexedRepos.map((repo) => (
                <div
                  key={repo.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-white p-3.5 transition-colors hover:border-zinc-300"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate font-repository text-sm text-zinc-800">{repo.name}</p>
                      <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-500">
                        Not indexed
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-3 text-xs text-zinc-500">
                      <span>Branch: {repo.branch}</span>
                      <span>Updated {repo.updatedAt}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-black"
                  >
                    <FolderGit2 className="h-4 w-4" />
                    Index Repo
                  </button>
                </div>
              ))
            ) : (
              <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50/60 p-6 text-center text-sm text-zinc-500">
                No repositories waiting to be indexed.
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
