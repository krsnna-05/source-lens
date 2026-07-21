"use client";

import { useMemo, useState } from "react";
import {
  CheckCircle2,
  FolderGit2,
  MessageCircle,
  MessageSquareText,
  Plus,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { useAuthStore } from "@/lib/store";

type Repo = {
  id: string;
  name: string;
  indexed: boolean;
  branch: string;
  updatedAt: string;
};

type Conversation = {
  id: string;
  repoName: string;
  title: string;
  updatedAt: string;
  messageCount: number;
};

const githubRepos: Repo[] = [
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
  const [search, setSearch] = useState("");
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);

  const indexedRepos = githubRepos.filter((repo) => repo.indexed);
  const unindexedRepos = githubRepos.filter((repo) => !repo.indexed);

  const filteredConversations = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) {
      return conversationsData;
    }

    return conversationsData.filter(
      (item) => item.title.toLowerCase().includes(term) || item.repoName.toLowerCase().includes(term)
    );
  }, [search]);

  const conversationCount = conversationsData.length;
  const chatsCount = conversationsData.reduce((acc, item) => acc + item.messageCount, 0);

  return (
    <main className="mx-auto w-full max-w-7xl px-5 pb-16 pt-28 sm:px-8 sm:pt-32 lg:px-10">
      <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm lg:p-8">
        <p className="text-sm text-zinc-500">Dashboard</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
          Welcome{isLoggedIn && user ? `, ${user.name}` : ""}
        </h1>
        <p className="mt-3 max-w-3xl text-sm text-zinc-600 sm:text-base">
          Pick up where you left off, search previous conversations, or start a new chat from indexed repositories.
        </p>
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-2">
        <article className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-zinc-800">
            <MessageSquareText className="h-4 w-4" />
            <h2 className="text-sm font-medium">Conversations</h2>
          </div>
          <p className="mt-2 text-2xl font-semibold text-zinc-900">{conversationCount}</p>
          <p className="text-sm text-zinc-600">Total conversation threads</p>
        </article>

        <article className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-zinc-800">
            <MessageCircle className="h-4 w-4" />
            <h2 className="text-sm font-medium">Chats</h2>
          </div>
          <p className="mt-2 text-2xl font-semibold text-zinc-900">{chatsCount}</p>
          <p className="text-sm text-zinc-600">Total chat messages</p>
        </article>
      </section>

      <section className="mt-6 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm lg:p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-zinc-900">Conversations</h2>
            <p className="mt-1 text-sm text-zinc-600">
              Title is generated from the first question, similar to ChatGPT.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsNewChatOpen(true)}
            className="inline-flex items-center gap-2 rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-black"
          >
            <Plus className="h-4 w-4" />
            New Chat
          </button>
        </div>

        <div className="mt-4">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search conversation titles..."
              className="w-full rounded-xl border border-zinc-200 bg-white py-2.5 pl-9 pr-3 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-400"
            />
          </label>
        </div>

        <div className="mt-4 grid gap-2">
          {filteredConversations.length > 0 ? (
            filteredConversations.map((conversation) => (
              <button
                key={conversation.id}
                type="button"
                className="group flex w-full items-center justify-between rounded-xl border border-zinc-200 bg-white px-4 py-3 text-left transition-colors hover:bg-zinc-50"
              >
                <div className="min-w-0">
                  <p className="truncate font-ui text-sm font-medium text-zinc-900">{conversation.title}</p>
                  <p className="mt-0.5 truncate font-repository text-xs text-zinc-500">{conversation.repoName}</p>
                </div>
                <span className="ml-4 shrink-0 text-xs text-zinc-500">{conversation.updatedAt}</span>
              </button>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-6 text-sm text-zinc-600">
              No conversations found for this search.
            </div>
          )}
        </div>
      </section>

      {isNewChatOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/35 p-4 backdrop-blur-[2px]"
          onClick={() => setIsNewChatOpen(false)}
        >
          <section
            className="w-full max-w-5xl rounded-3xl border border-zinc-200 bg-white p-6 shadow-2xl lg:p-8"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-zinc-900">Start New Chat</h2>
                <p className="mt-1 text-sm text-zinc-600">Select an indexed repository first, or index a new one from GitHub.</p>
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs text-zinc-600">
                  <Sparkles className="h-3.5 w-3.5" />
                  GitHub repositories
                </span>
                <button
                  type="button"
                  onClick={() => setIsNewChatOpen(false)}
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
      )}
    </main>
  );
}
