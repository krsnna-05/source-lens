"use client";

import {
  ArrowUpRight,
  BrainCircuit,
  DatabaseZap,
  FolderGit2,
  GitBranch,
  MessageSquareQuote,
  ScanSearch,
  SearchCode,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useAuthStore } from "@/lib/store";

const creator = {
  name: "Krishna Gavali",
  github: "https://github.com/krishangavali",
  linkedin: "https://www.linkedin.com/in/krishangavali/",
};

const howItWorksSteps = [
  {
    title: "Connect GitHub",
    description:
      "Authenticate once and select repositories you want SourceLens to understand.",
    icon: GitBranch,
  },
  {
    title: "Index & Parse",
    description:
      "SourceLens clones and parses files, then builds semantic chunks with metadata.",
    icon: FolderGit2,
  },
  {
    title: "Embed & Store",
    description:
      "Embeddings are generated and stored in pgvector for fast semantic retrieval.",
    icon: DatabaseZap,
  },
  {
    title: "Ask & Explore",
    description:
      "Ask natural-language questions and get source-backed answers with context.",
    icon: MessageSquareQuote,
  },
];

export default function Home() {
  const { isLoggedIn, user, login } = useAuthStore();

  const handleLogin = () => {
    login({
      name: "John Doe",
      avatar: "",
      profileUrl: "https://github.com/johndoe",
    });
  };

  return (
    <main className="mx-auto w-full max-w-7xl px-5 pb-16 pt-28 sm:px-8 sm:pt-32 lg:px-10">
      <section className="grid gap-6 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm lg:grid-cols-[1.2fr_1fr] lg:p-8">
        <div className="flex flex-col justify-between gap-8">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs text-zinc-600">
              <ScanSearch className="h-3.5 w-3.5" />
              SourceLens · Repository Intelligence
            </div>

            <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-[1.05] tracking-tight text-zinc-900 sm:text-5xl lg:text-6xl">
              Understand any codebase
              <span className="block text-zinc-500">in minutes, not days.</span>
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-relaxed text-zinc-600 sm:text-lg">
              AI-powered analysis for repositories: semantic search, architecture understanding,
              and source-backed answers across your project.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {isLoggedIn && user ? (
              <a
                href={user.profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-900 shadow-sm transition-colors hover:bg-zinc-50"
              >
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-zinc-900 text-white">
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </span>
                Go to Profile
              </a>
            ) : (
              <button
                type="button"
                onClick={handleLogin}
                className="inline-flex items-center gap-2 rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-black"
              >
                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                  <path d="M12 .5C5.649.5.5 5.649.5 12a11.5 11.5 0 0 0 7.863 10.907c.575.106.787-.25.787-.556 0-.275-.01-1.004-.016-1.971-3.2.695-3.877-1.542-3.877-1.542-.524-1.33-1.28-1.684-1.28-1.684-1.046-.715.08-.7.08-.7 1.157.082 1.765 1.188 1.765 1.188 1.029 1.764 2.699 1.255 3.357.96.104-.745.403-1.255.732-1.543-2.554-.29-5.238-1.277-5.238-5.684 0-1.256.448-2.283 1.182-3.087-.118-.29-.512-1.456.112-3.036 0 0 .965-.309 3.164 1.18a10.97 10.97 0 0 1 5.76 0c2.198-1.489 3.162-1.18 3.162-1.18.625 1.58.232 2.746.114 3.036.736.804 1.18 1.83 1.18 3.087 0 4.418-2.688 5.39-5.25 5.675.414.357.783 1.06.783 2.136 0 1.542-.014 2.786-.014 3.166 0 .309.208.668.794.555A11.502 11.502 0 0 0 23.5 12C23.5 5.649 18.351.5 12 .5Z" />
                </svg>
                Login with GitHub
              </button>
            )}
          </div>
        </div>

        <div className="grid gap-3">
          <div className="rounded-2xl border border-zinc-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <p className="font-repository text-sm text-zinc-700">repo: acme/payment-service</p>
              <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs text-emerald-700">indexed</span>
            </div>
            <div className="mt-3 grid gap-2">
              <div className="rounded-lg bg-zinc-50 px-3 py-2 font-search-result text-xs text-zinc-600">
                auth/jwt.py → verify_token()
              </div>
              <div className="rounded-lg bg-zinc-50 px-3 py-2 font-search-result text-xs text-zinc-600">
                api/middleware.ts → requireUser()
              </div>
              <div className="rounded-lg bg-zinc-50 px-3 py-2 font-search-result text-xs text-zinc-600">
                db/engine.py → init_connection_pool()
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-4">
            <p className="mb-2 text-xs uppercase tracking-wide text-zinc-500">Ask SourceLens</p>
            <p className="rounded-lg bg-zinc-950 px-3 py-2 font-code-viewer text-sm text-zinc-100">
              &quot;Where does JWT verification happen and what claims are required?&quot;
            </p>
            <p className="mt-2 text-sm text-zinc-600">
              Finds relevant code, explains flow, and cites exact file paths.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-8 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm lg:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs text-zinc-600">
              <Sparkles className="h-3.5 w-3.5" />
              How it works
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">
              From repository URL to reliable answers
            </h2>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs text-zinc-600">
            <ShieldCheck className="h-3.5 w-3.5" />
            Source-backed responses
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {howItWorksSteps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <article key={step.title} className="rounded-2xl border border-zinc-200 bg-white p-4">
                <div className="flex items-center justify-between">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-900 text-white">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="font-file-path text-xs text-zinc-400">0{idx + 1}</span>
                </div>

                <h3 className="mt-4 text-base font-semibold text-zinc-900">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-600">{step.description}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-zinc-200 bg-white p-4">
          <div className="flex items-center gap-2 text-zinc-800">
            <SearchCode className="h-4 w-4" />
            <p className="text-sm font-medium">Semantic Search</p>
          </div>
          <p className="mt-2 text-sm text-zinc-600">Find intent, not just keyword matches.</p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-4">
          <div className="flex items-center gap-2 text-zinc-800">
            <BrainCircuit className="h-4 w-4" />
            <p className="text-sm font-medium">RAG Answers</p>
          </div>
          <p className="mt-2 text-sm text-zinc-600">Grounded responses with code citations.</p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-4">
          <div className="flex items-center gap-2 text-zinc-800">
            <FolderGit2 className="h-4 w-4" />
            <p className="text-sm font-medium">Repo Aware</p>
          </div>
          <p className="mt-2 text-sm text-zinc-600">Understand architecture across files and services.</p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-4">
          <div className="flex items-center gap-2 text-zinc-800">
            <DatabaseZap className="h-4 w-4" />
            <p className="text-sm font-medium">Fast Retrieval</p>
          </div>
          <p className="mt-2 text-sm text-zinc-600">Optimized vector indexing for quick lookup.</p>
        </div>
      </section>

      <footer className="mt-8 rounded-3xl border border-zinc-200 bg-white px-5 py-5 shadow-sm sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-ui text-sm text-zinc-600">
            Built by <span className="font-semibold text-zinc-900">{creator.name}</span>
          </p>

          <div className="flex items-center gap-2">
            <a
              href={creator.github}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-700 transition-colors hover:bg-zinc-50 hover:text-zinc-900"
              aria-label="Krishan Gavali GitHub"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                <path d="M12 .5C5.649.5.5 5.649.5 12a11.5 11.5 0 0 0 7.863 10.907c.575.106.787-.25.787-.556 0-.275-.01-1.004-.016-1.971-3.2.695-3.877-1.542-3.877-1.542-.524-1.33-1.28-1.684-1.28-1.684-1.046-.715.08-.7.08-.7 1.157.082 1.765 1.188 1.765 1.188 1.029 1.764 2.699 1.255 3.357.96.104-.745.403-1.255.732-1.543-2.554-.29-5.238-1.277-5.238-5.684 0-1.256.448-2.283 1.182-3.087-.118-.29-.512-1.456.112-3.036 0 0 .965-.309 3.164 1.18a10.97 10.97 0 0 1 5.76 0c2.198-1.489 3.162-1.18 3.162-1.18.625 1.58.232 2.746.114 3.036.736.804 1.18 1.83 1.18 3.087 0 4.418-2.688 5.39-5.25 5.675.414.357.783 1.06.783 2.136 0 1.542-.014 2.786-.014 3.166 0 .309.208.668.794.555A11.502 11.502 0 0 0 23.5 12C23.5 5.649 18.351.5 12 .5Z" />
              </svg>
              GitHub
            </a>

            <a
              href={creator.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-700 transition-colors hover:bg-zinc-50 hover:text-zinc-900"
              aria-label="Krishan Gavali LinkedIn"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                <path d="M4.98 3.5C4.98 4.88 3.86 6 2.48 6S0 4.88 0 3.5 1.12 1 2.5 1 5 2.12 5 3.5ZM.5 8h4V24h-4V8Zm7 0h3.84v2.18h.05c.53-1 1.84-2.18 3.79-2.18 4.05 0 4.8 2.67 4.8 6.15V24h-4v-7.13c0-1.7-.03-3.88-2.36-3.88-2.36 0-2.72 1.84-2.72 3.75V24h-4V8Z" />
              </svg>
              LinkedIn
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
