"use client";

import { useMemo, useState } from "react";
import { FolderGit2, GitBranch, MessageSquareText, Plus, Sparkles } from "lucide-react";
import { AddRepoDialog, type RepoItem } from "@/components/dashboard/AddRepoDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/lib/store";

type Conversation = {
  id: string;
  repoName: string;
  title: string;
  updatedAt: string;
  messageCount: number;
};

const initialGithubRepos: RepoItem[] = [
  {
    id: "r1",
    name: "acme/payment-service",
    indexed: true,
    branch: "main",
    updatedAt: "2h ago",
  },
  {
    id: "r2",
    name: "acme/auth-service",
    indexed: true,
    branch: "main",
    updatedAt: "5h ago",
  },
  {
    id: "r3",
    name: "acme/web-portal",
    indexed: false,
    branch: "develop",
    updatedAt: "1d ago",
  },
  {
    id: "r4",
    name: "acme/internal-tools",
    indexed: false,
    branch: "main",
    updatedAt: "3d ago",
  },
];

const conversationsData: Conversation[] = [
  {
    id: "c1",
    repoName: "acme/payment-service",
    title: "How does JWT verification flow work?",
    updatedAt: "8m ago",
    messageCount: 14,
  },
  {
    id: "c2",
    repoName: "acme/auth-service",
    title: "Where is refresh token rotation implemented?",
    updatedAt: "34m ago",
    messageCount: 9,
  },
  {
    id: "c3",
    repoName: "acme/payment-service",
    title: "Explain webhook retry strategy",
    updatedAt: "2h ago",
    messageCount: 6,
  },
];

export default function DashboardPage() {
  const { isLoggedIn, user } = useAuthStore();
  const [isAddRepoOpen, setIsAddRepoOpen] = useState(false);
  const [githubRepos, setGithubRepos] = useState<RepoItem[]>(initialGithubRepos);

  const indexedRepos = githubRepos.filter((repo) => repo.indexed);

  const existingRepoNames = useMemo(
    () => new Set(githubRepos.map((repo) => repo.name)),
    [githubRepos]
  );

  const handleAddRepo = (name: string) => {
    setGithubRepos((prev) => [
      {
        id: `r${Date.now()}`,
        name,
        indexed: false,
        branch: "main",
        updatedAt: "just now",
      },
      ...prev,
    ]);
  };

  const conversationCountByRepo = useMemo(() => {
    const counts = new Map<string, number>();
    for (const conversation of conversationsData) {
      counts.set(conversation.repoName, (counts.get(conversation.repoName) ?? 0) + 1);
    }
    return counts;
  }, []);

  return (
    <main className="mx-auto w-full max-w-7xl px-5 pb-16 pt-28 sm:px-8 sm:pt-32 lg:px-10">
      <section className="relative overflow-hidden rounded-3xl border border-zinc-200 bg-white p-6 shadow-[0_1px_2px_rgba(24,24,27,0.04),0_12px_32px_-16px_rgba(24,24,27,0.08)] lg:p-8">
        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-gradient-to-br from-indigo-500/10 to-violet-500/0 blur-2xl" />
        <div className="relative inline-flex items-center gap-1.5 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
          <Sparkles className="h-3.5 w-3.5" />
          Dashboard
        </div>
        <h1 className="relative mt-3 text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
          Welcome{isLoggedIn && user ? `, ${user.name}` : ""}
        </h1>
        <p className="relative mt-3 max-w-3xl text-sm leading-relaxed text-zinc-500 sm:text-base">
          Pick up where you left off, search previous conversations, or start a new chat from indexed repositories.
        </p>
      </section>

      <section className="mt-6 rounded-3xl border border-zinc-200 bg-white p-6 shadow-[0_1px_2px_rgba(24,24,27,0.04),0_12px_32px_-16px_rgba(24,24,27,0.08)] lg:p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-zinc-900">Indexed Repositories</h2>
            <p className="mt-1 text-sm text-zinc-500">Start a chat with any repository that has been indexed.</p>
          </div>

          <button
            type="button"
            onClick={() => setIsAddRepoOpen(true)}
            className="inline-flex items-center gap-2 rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-black hover:shadow-md active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" />
            Add Repo
          </button>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {indexedRepos.length > 0 ? (
            indexedRepos.map((repo) => (
              <Card
                key={repo.id}
                className="group cursor-pointer ring-zinc-200 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:ring-zinc-300"
              >
                <CardHeader className="flex-row items-start gap-3 space-y-0">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-900 text-white transition-colors group-hover:bg-indigo-600">
                    <FolderGit2 className="h-4.5 w-4.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <CardTitle className="truncate font-repository text-sm">{repo.name}</CardTitle>
                    <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      Indexed
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="flex items-center justify-between border-t border-zinc-100 pt-3 text-xs text-zinc-500">
                  <span className="inline-flex items-center gap-1.5">
                    <GitBranch className="h-3.5 w-3.5" />
                    {repo.branch}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <MessageSquareText className="h-3.5 w-3.5" />
                    {conversationCountByRepo.get(repo.name) ?? 0} chats
                  </span>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center gap-2 rounded-2xl border border-dashed border-zinc-300 bg-zinc-50/60 p-10 text-center">
              <FolderGit2 className="h-6 w-6 text-zinc-400" />
              <p className="text-sm text-zinc-500">No indexed repositories yet.</p>
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
    </main>
  );
}
