"use client";

import { useEffect, useState } from "react";
import { FolderGit2, Loader2, Plus, Sparkles, X } from "lucide-react";
import { API_BASE_URL } from "@/lib/config";
import { useAuthStore } from "@/lib/store";

export type RepoItem = {
  id: string;
  name: string;
  indexed: boolean;
  branch: string;
  updatedAt: string;
};

type GitHubRepo = {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  default_branch: string;
  updated_at: string;
  html_url: string;
};

type GitHubRepoPage = {
  repos: GitHubRepo[];
  has_more: boolean;
  next_page: number | null;
};

type FetchStatus = "idle" | "loading" | "loading-more" | "error";

const PER_PAGE = 20;
const SCROLL_THRESHOLD_PX = 120;

type AddRepoDialogProps = {
  isOpen: boolean;
  existingRepoNames: Set<string>;
  onClose: () => void;
  onAddRepo: (name: string) => void;
};

export function AddRepoDialog({
  isOpen,
  existingRepoNames,
  onClose,
  onAddRepo,
}: AddRepoDialogProps) {
  const accessToken = useAuthStore((state) => state.accessToken);
  const [repoUrl, setRepoUrl] = useState("");
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [status, setStatus] = useState<FetchStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchPage = async (pageToFetch: number, replace: boolean) => {
    if (!accessToken) {
      return;
    }
    setStatus(replace ? "loading" : "loading-more");
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/repos/github?page=${pageToFetch}&per_page=${PER_PAGE}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { detail?: string } | null;
        throw new Error(body?.detail ?? "Failed to load your GitHub repositories.");
      }

      const data = (await response.json()) as GitHubRepoPage;
      setRepos((prev) => (replace ? data.repos : [...prev, ...data.repos]));
      setHasMore(data.has_more);
      setPage(pageToFetch);
      setStatus("idle");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong.");
      setStatus("error");
    }
  };

  useEffect(() => {
    if (!isOpen || !accessToken) {
      return;
    }
    setHasMore(true);
    void fetchPage(1, true);
    // Only re-fetch when the dialog opens or the token changes, not on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, accessToken]);

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

  const handleListScroll = (event: React.UIEvent<HTMLDivElement>) => {
    if (!hasMore || status === "loading" || status === "loading-more") {
      return;
    }
    const el = event.currentTarget;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < SCROLL_THRESHOLD_PX;
    if (nearBottom) {
      void fetchPage(page + 1, false);
    }
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
          <div
            onScroll={handleListScroll}
            className="mt-3 max-h-96 space-y-2 overflow-y-auto pr-1"
          >
            {status === "loading" ? (
              <div className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-300 bg-zinc-50/60 p-6 text-sm text-zinc-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading your GitHub repositories…
              </div>
            ) : status === "error" && repos.length === 0 ? (
              <div className="rounded-xl border border-dashed border-red-300 bg-red-50/60 p-6 text-center text-sm text-red-600">
                {errorMessage}
              </div>
            ) : repos.length > 0 ? (
              <>
                {repos.map((repo) => {
                  const alreadyAdded = existingRepoNames.has(repo.full_name);
                  return (
                    <div
                      key={repo.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-white p-3.5 transition-colors hover:border-zinc-300"
                    >
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate font-repository text-sm text-zinc-800">
                            {repo.full_name}
                          </p>
                          {repo.private && (
                            <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-500">
                              Private
                            </span>
                          )}
                        </div>
                        <div className="mt-1 flex items-center gap-3 text-xs text-zinc-500">
                          <span>Branch: {repo.default_branch}</span>
                          <span>Updated {new Date(repo.updated_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        disabled={alreadyAdded}
                        onClick={() => onAddRepo(repo.full_name)}
                        className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:text-zinc-400"
                      >
                        <FolderGit2 className="h-4 w-4" />
                        {alreadyAdded ? "Added" : "Index Repo"}
                      </button>
                    </div>
                  );
                })}

                {status === "loading-more" && (
                  <div className="flex items-center justify-center gap-2 py-3 text-xs text-zinc-500">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Loading more…
                  </div>
                )}

                {status === "error" && (
                  <div className="rounded-xl border border-dashed border-red-300 bg-red-50/60 p-4 text-center text-xs text-red-600">
                    {errorMessage}
                  </div>
                )}
              </>
            ) : (
              <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50/60 p-6 text-center text-sm text-zinc-500">
                No repositories found on your GitHub account.
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
