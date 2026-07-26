"use client";

import { useEffect, useMemo, useState } from "react";
import { FolderGit2, GitBranch, Loader2, Plus, Sparkles, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AddRepoDialog, type AddRepoInput } from "@/components/dashboard/AddRepoDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { API_BASE_URL } from "@/lib/config";
import { useAuthStore } from "@/lib/store";

type RepositoryStatus = "pending" | "indexing" | "ready" | "failed";

type Repository = {
  id: string;
  name: string;
  owner: string;
  url: string;
  provider: string;
  default_branch: string;
  status: RepositoryStatus;
  index_mode: string;
  last_indexed_at: string | null;
  last_error: string | null;
  created_at: string;
  updated_at: string;
};

type FetchStatus = "loading" | "idle" | "error";

const STATUS_STYLES: Record<RepositoryStatus, { label: string; dot: string; text: string; bg: string }> = {
  pending: { label: "Pending", dot: "bg-amber-500", text: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/10" },
  indexing: { label: "Indexing", dot: "bg-blue-500", text: "text-blue-600 dark:text-blue-400", bg: "bg-blue-500/10" },
  ready: { label: "Indexed", dot: "bg-emerald-500", text: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10" },
  failed: { label: "Failed", dot: "bg-destructive", text: "text-destructive", bg: "bg-destructive/10" },
};

export default function DashboardPage() {
  const { isLoggedIn, user, accessToken } = useAuthStore();
  const [isAddRepoOpen, setIsAddRepoOpen] = useState(false);
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [reposStatus, setReposStatus] = useState<FetchStatus>("loading");
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [repoToRemove, setRepoToRemove] = useState<Repository | null>(null);

  useEffect(() => {
    if (!accessToken) {
      return;
    }
    let cancelled = false;

    (async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/repos`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (!response.ok) {
          throw new Error("Failed to load repositories.");
        }
        const data = (await response.json()) as Repository[];
        if (!cancelled) {
          setRepositories(data);
          setReposStatus("idle");
        }
      } catch {
        if (!cancelled) {
          setReposStatus("error");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [accessToken]);

  const existingRepoNames = useMemo(
    () => new Set(repositories.map((repo) => `${repo.owner}/${repo.name}`)),
    [repositories]
  );

  const handleAddRepo = async (input: AddRepoInput) => {
    if (!accessToken) {
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/api/repos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          name: input.name,
          owner: input.owner,
          url: input.url,
          default_branch: input.defaultBranch,
          provider: "github",
        }),
      });
      if (!response.ok) {
        return;
      }
      const repository = (await response.json()) as Repository;
      setRepositories((prev) =>
        prev.some((repo) => repo.id === repository.id) ? prev : [repository, ...prev]
      );
    } catch {
      // TODO: surface a toast once we have a notification system
    }
  };

  const handleConfirmRemoveRepo = async () => {
    if (!accessToken || !repoToRemove || removingId) {
      return;
    }
    const repo = repoToRemove;
    setRemovingId(repo.id);
    try {
      const response = await fetch(`${API_BASE_URL}/api/repos/${repo.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (response.ok) {
        setRepositories((prev) => prev.filter((item) => item.id !== repo.id));
      }
    } finally {
      setRemovingId(null);
      setRepoToRemove(null);
    }
  };

  return (
    <main className="mx-auto w-full max-w-7xl px-5 pb-16 pt-28 sm:px-8 sm:pt-32 lg:px-10">
      <section className="relative overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-[0_1px_2px_rgba(24,24,27,0.04),0_12px_32px_-16px_rgba(24,24,27,0.08)] lg:p-8">
        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-gradient-to-br from-indigo-500/10 to-violet-500/0 blur-2xl" />
        <div className="relative inline-flex items-center gap-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-600 dark:text-indigo-400">
          <Sparkles className="h-3.5 w-3.5" />
          Dashboard
        </div>
        <h1 className="relative mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Welcome{isLoggedIn && user ? `, ${user.name}` : ""}
        </h1>
        <p className="relative mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          Pick up where you left off, search previous conversations, or start a new chat from indexed repositories.
        </p>
      </section>

      <section className="mt-6 rounded-3xl border border-border bg-card p-6 shadow-[0_1px_2px_rgba(24,24,27,0.04),0_12px_32px_-16px_rgba(24,24,27,0.08)] lg:p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-foreground">Your Repositories</h2>
            <p className="mt-1 text-sm text-muted-foreground">Repositories you&apos;ve added. Indexing is coming soon.</p>
          </div>

          <button
            type="button"
            onClick={() => setIsAddRepoOpen(true)}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:shadow-md active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" />
            Add Repo
          </button>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {reposStatus === "loading" ? (
            <div className="col-span-full flex items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-muted/60 p-10 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading your repositories…
            </div>
          ) : reposStatus === "error" ? (
            <div className="col-span-full flex flex-col items-center gap-2 rounded-2xl border border-dashed border-destructive/30 bg-destructive/10 p-10 text-center">
              <p className="text-sm text-destructive">Couldn&apos;t load your repositories.</p>
            </div>
          ) : repositories.length > 0 ? (
            repositories.map((repo) => {
              const statusStyle = STATUS_STYLES[repo.status];
              return (
                <Card
                  key={repo.id}
                  className="group relative cursor-pointer ring-border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:ring-foreground/20"
                >
                  <button
                    type="button"
                    disabled={removingId === repo.id}
                    onClick={(event) => {
                      event.stopPropagation();
                      setRepoToRemove(repo);
                    }}
                    aria-label={`Remove ${repo.owner}/${repo.name}`}
                    className="absolute right-3 top-3 z-10 inline-flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground opacity-0 transition-all hover:bg-destructive/10 hover:text-destructive focus-visible:opacity-100 group-hover:opacity-100 disabled:opacity-100"
                  >
                    {removingId === repo.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                  </button>

                  <CardHeader className="flex-row items-start gap-3 space-y-0">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-colors group-hover:bg-indigo-600 group-hover:text-white">
                      <FolderGit2 className="h-4.5 w-4.5" />
                    </div>
                    <div className="min-w-0 flex-1 pr-6">
                      <CardTitle className="truncate font-repository text-sm">
                        {repo.owner}/{repo.name}
                      </CardTitle>
                      <span
                        className={`mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${statusStyle.bg} ${statusStyle.text}`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${statusStyle.dot}`} />
                        {statusStyle.label}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <GitBranch className="h-3.5 w-3.5" />
                      {repo.default_branch}
                    </span>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <div className="col-span-full flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border bg-muted/60 p-10 text-center">
              <FolderGit2 className="h-6 w-6 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No repositories added yet.</p>
            </div>
          )}
        </div>
      </section>

      <AddRepoDialog
        isOpen={isAddRepoOpen}
        existingRepoNames={existingRepoNames}
        onClose={() => setIsAddRepoOpen(false)}
        onAddRepo={handleAddRepo}
      />

      <AlertDialog
        open={repoToRemove !== null}
        onOpenChange={(open) => {
          if (!open && !removingId) {
            setRepoToRemove(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove repository?</AlertDialogTitle>
            <AlertDialogDescription>
              {repoToRemove
                ? `This removes ${repoToRemove.owner}/${repoToRemove.name} from SourceLens. This can’t be undone.`
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={removingId !== null}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={removingId !== null}
              onClick={() => void handleConfirmRemoveRepo()}
            >
              {removingId ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
