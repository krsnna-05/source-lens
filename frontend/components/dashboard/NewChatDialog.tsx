"use client";

import { CheckCircle2, FolderGit2, Sparkles, X } from "lucide-react";

export type RepoItem = {
  id: string;
  name: string;
  indexed: boolean;
  branch: string;
  updatedAt: string;
};

type NewChatDialogProps = {
  isOpen: boolean;
  indexedRepos: RepoItem[];
  unindexedRepos: RepoItem[];
  onClose: () => void;
};

export function NewChatDialog({
  isOpen,
  indexedRepos,
  unindexedRepos,
  onClose,
}: NewChatDialogProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/35 p-4 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <section
        className="w-full max-w-5xl rounded-3xl border border-zinc-200 bg-white p-6 shadow-2xl lg:p-8"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-zinc-900">Start New Chat</h2>
            <p className="mt-1 text-sm text-zinc-600">
              Select an indexed repository first, or index a new one from GitHub.
            </p>
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
              aria-label="Close new chat dialog"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="mt-5 grid gap-6 lg:grid-cols-2">
          <div>
            <h3 className="text-sm font-semibold text-zinc-900">Indexed Repositories</h3>
            <p className="mt-1 text-sm text-zinc-600">Ready to chat immediately.</p>

            <div className="mt-3 max-h-[26rem] space-y-2 overflow-y-auto pr-1">
              {indexedRepos.map((repo) => (
                <div key={repo.id} className="rounded-xl border border-zinc-200 bg-white p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-repository text-sm text-zinc-800">{repo.name}</p>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-xs text-emerald-700">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Indexed
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs text-zinc-500">
                    <span>Branch: {repo.branch}</span>
                    <span>Updated {repo.updatedAt}</span>
                  </div>
                  <button
                    type="button"
                    className="mt-3 rounded-lg border border-zinc-300 px-3 py-1.5 text-sm text-zinc-800 transition-colors hover:bg-zinc-50"
                  >
                    Start Chat
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-zinc-900">Index New Repository</h3>
            <p className="mt-1 text-sm text-zinc-600">GitHub repos not indexed yet.</p>

            <div className="mt-3 max-h-[26rem] space-y-2 overflow-y-auto pr-1">
              {unindexedRepos.map((repo) => (
                <div key={repo.id} className="rounded-xl border border-zinc-200 bg-white p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-repository text-sm text-zinc-800">{repo.name}</p>
                    <span className="text-xs text-zinc-500">Not indexed</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs text-zinc-500">
                    <span>Branch: {repo.branch}</span>
                    <span>Updated {repo.updatedAt}</span>
                  </div>
                  <button
                    type="button"
                    className="mt-3 inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-3 py-1.5 text-sm text-white transition-colors hover:bg-black"
                  >
                    <FolderGit2 className="h-4 w-4" />
                    Index Repo
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
