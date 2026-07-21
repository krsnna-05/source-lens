"use client";

import Link from "next/link";
import { ExternalLink, GitBranch, LogOut, ScanSearch, UserCircle2 } from "lucide-react";
import { useAuthStore } from "@/lib/store";

export function Navbar() {
  const { isLoggedIn, user, login, logout } = useAuthStore();

  const handleGitHubLogin = () => {
    login({
      name: "John Doe",
      avatar: "",
      profileUrl: "https://github.com/johndoe",
    });
  };

  return (
    <header className="pointer-events-none fixed inset-x-0 top-4 z-50 flex justify-center px-4 sm:top-6">
      <nav className="pointer-events-auto w-[min(96vw,980px)] rounded-full border border-white/45 bg-white/55 px-2 py-2 shadow-[0_10px_35px_rgba(9,9,11,0.12)] backdrop-blur-xl supports-[backdrop-filter]:bg-white/45">
        <div className="flex items-center justify-between gap-2">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 rounded-full px-3 py-2 transition-colors hover:bg-white/70"
          >
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 text-white shadow-sm">
              <ScanSearch className="h-4 w-4" />
            </span>
            <span className="font-ui text-sm font-semibold tracking-tight text-zinc-900 sm:text-base">
              SourceLens
            </span>
          </Link>

          <div className="hidden items-center gap-1 sm:flex">
            <Link
              href="/"
              className="rounded-full px-3 py-2 text-sm text-zinc-700 transition-colors hover:bg-white/70 hover:text-zinc-900"
            >
              Home
            </Link>
            <a
              href="/docs"
              className="rounded-full px-3 py-2 text-sm text-zinc-700 transition-colors hover:bg-white/70 hover:text-zinc-900"
            >
              API Docs
            </a>
          </div>

          {isLoggedIn && user ? (
            <div className="flex items-center gap-1.5">
              <a
                href={user.profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 rounded-full border border-zinc-200/80 bg-white/85 px-3 py-1.5 transition-colors hover:bg-white"
                title="Open GitHub profile"
              >
                <UserCircle2 className="h-4 w-4 text-zinc-700" />
                <span className="font-ui text-sm font-medium text-zinc-900">{user.name}</span>
                <span className="hidden max-w-[200px] truncate font-file-path text-xs text-zinc-600 md:inline">
                  {user.profileUrl}
                </span>
                <ExternalLink className="h-3.5 w-3.5 text-zinc-500" />
              </a>

              <button
                onClick={logout}
                className="inline-flex items-center gap-1 rounded-full border border-zinc-200/80 bg-white/85 px-3 py-1.5 text-sm text-zinc-700 transition-colors hover:bg-zinc-50 hover:text-zinc-900"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <button
              onClick={handleGitHubLogin}
              className="inline-flex items-center gap-2 rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-black active:translate-y-0"
            >
              <GitBranch className="h-4 w-4" />
              Login with GitHub
            </button>
          )}
        </div>
      </nav>
    </header>
  );
}
