"use client";

import { useEffect, useState } from "react";
import { FolderGit2, Loader2, Plus, Sparkles, X } from "lucide-react";
import { API_BASE_URL } from "@/lib/config";
import { useAuthStore } from "@/lib/store";

export type AddRepoInput = {
  name: string;
  owner: string;
  url: string;
  defaultBranch: string;
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

const PER_PAGE = 5;
const SCROLL_THRESHOLD_PX = 120;

type AddRepoDialogProps = {
  isOpen: boolean;
  existingRepoNames: Set<string>;
  onClose: () => void;
  onAddRepo: (input: AddRepoInput) => void;
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
  const [urlSubmitStatus, setUrlSubmitStatus] = useState<"idle" | "loading" | "error">("idle");
  const [urlErrorMessage, setUrlErrorMessage] = useState("");

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

  const handleAddRepo = async (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = repoUrl.trim();
    if (!trimmed || !accessToken) {
      return;
    }
    const cleaned = trimmed
      .replace(/^https?:\/\/github\.com\//, "")
      .replace(/\.git$/, "")
      .replace(/\/$/, "");
    const [owner, name] = cleaned.split("/");
    if (!owner || !name) {
      setUrlSubmitStatus("error");
      setUrlErrorMessage("Enter a valid owner/repo or GitHub URL.");
      return;
    }

    setUrlSubmitStatus("loading");
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/repos/github/lookup?owner=${encodeURIComponent(owner)}&name=${encodeURIComponent(name)}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      if (response.status === 404) {
        setUrlSubmitStatus("error");
        setUrlErrorMessage("Repository not found on GitHub.");
        return;
      }
      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { detail?: string } | null;
        throw new Error(body?.detail ?? "Failed to look up the repository.");
      }

      const repo = (await response.json()) as GitHubRepo;
      onAddRepo({
        owner: repo.full_name.split("/")[0] ?? owner,
        name: repo.name,
        url: repo.html_url,
        defaultBranch: repo.default_branch,
      });
      setRepoUrl("");
      setUrlSubmitStatus("idle");
    } catch (err) {
      setUrlSubmitStatus("error");
      setUrlErrorMessage(err instanceof Error ? err.message : "Something went wrong.");
    }
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 p-4 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <section
        className="w-full max-w-2xl rounded-3xl border border-border bg-card p-6 shadow-2xl lg:p-8"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-foreground">Add Repository</h2>
            <p className="mt-1 text-sm text-muted-foreground">Import a repository from GitHub, then index it.</p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-3 py-1 text-xs text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5" />
              GitHub repositories
            </span>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-accent"
              aria-label="Close add repository dialog"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <form onSubmit={handleAddRepo} className="mt-5 flex items-center gap-2">
          <input
            value={repoUrl}
            onChange={(event) => {
              setRepoUrl(event.target.value);
              if (urlSubmitStatus === "error") {
                setUrlSubmitStatus("idle");
              }
            }}
            placeholder="owner/repo or GitHub URL"
            className="w-full rounded-xl border border-border bg-muted/60 px-3.5 py-2.5 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-ring focus:bg-card focus:ring-4 focus:ring-ring/10"
          />
          <button
            type="submit"
            disabled={urlSubmitStatus === "loading"}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:shadow-md active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {urlSubmitStatus === "loading" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            Add
          </button>
        </form>
        {urlSubmitStatus === "error" && (
          <p className="mt-2 text-xs text-destructive">{urlErrorMessage}</p>
        )}

        <div className="mt-6">
          <h3 className="text-sm font-semibold text-foreground">Your Repos</h3>
          <div
            onScroll={handleListScroll}
            className="mt-3 max-h-96 space-y-2 overflow-y-auto pr-1"
          >
            {status === "loading" ? (
              <div className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-muted/60 p-6 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading your GitHub repositories…
              </div>
            ) : status === "error" && repos.length === 0 ? (
              <div className="rounded-xl border border-dashed border-destructive/30 bg-destructive/10 p-6 text-center text-sm text-destructive">
                {errorMessage}
              </div>
            ) : repos.length > 0 ? (
              <>
                {repos.map((repo) => {
                  const alreadyAdded = existingRepoNames.has(repo.full_name);
                  return (
                    <div
                      key={repo.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-3.5 transition-colors hover:border-foreground/20"
                    >
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate font-repository text-sm text-foreground">
                            {repo.full_name}
                          </p>
                          {repo.private && (
                            <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                              Private
                            </span>
                          )}
                        </div>
                        <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                          <span>Branch: {repo.default_branch}</span>
                          <span>Updated {new Date(repo.updated_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        disabled={alreadyAdded}
                        onClick={() =>
                          onAddRepo({
                            owner: repo.full_name.split("/")[0] ?? repo.full_name,
                            name: repo.name,
                            url: repo.html_url,
                            defaultBranch: repo.default_branch,
                          })
                        }
                        className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
                      >
                        <FolderGit2 className="h-4 w-4" />
                        {alreadyAdded ? "Added" : "Index Repo"}
                      </button>
                    </div>
                  );
                })}

                {status === "loading-more" && (
                  <div className="flex items-center justify-center gap-2 py-3 text-xs text-muted-foreground">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Loading more…
                  </div>
                )}

                {status === "error" && (
                  <div className="rounded-xl border border-dashed border-destructive/30 bg-destructive/10 p-4 text-center text-xs text-destructive">
                    {errorMessage}
                  </div>
                )}
              </>
            ) : (
              <div className="rounded-xl border border-dashed border-border bg-muted/60 p-6 text-center text-sm text-muted-foreground">
                No repositories found on your GitHub account.
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
