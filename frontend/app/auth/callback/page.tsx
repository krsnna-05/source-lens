"use client";

import { use, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Loader2 } from "lucide-react";
import { API_BASE_URL } from "@/lib/config";
import { useAuthStore } from "@/lib/store";

type GitHubCallbackUser = {
  id: number;
  github_id: number;
  username: string;
  email: string;
  avatar_url: string | null;
};

type GitHubCallbackResponse = {
  access_token: string;
  token_type: string;
  user: GitHubCallbackUser;
};

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default function AuthCallbackPage(props: PageProps<"/auth/callback">) {
  const searchParams = use(props.searchParams);
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) {
      return;
    }
    hasRun.current = true;

    const oauthError = firstParam(searchParams.error);
    if (oauthError) {
      setErrorMessage(
        firstParam(searchParams.error_description) ??
          "GitHub authorization was cancelled or denied."
      );
      return;
    }

    const code = firstParam(searchParams.code);
    const state = firstParam(searchParams.state);
    if (!code || !state) {
      setErrorMessage("Missing authorization code or state from GitHub.");
      return;
    }

    (async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/github/callback`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code, state }),
        });

        if (!response.ok) {
          const body = (await response.json().catch(() => null)) as { detail?: string } | null;
          throw new Error(body?.detail ?? "Failed to complete GitHub sign-in.");
        }

        const data = (await response.json()) as GitHubCallbackResponse;
        login(
          {
            name: data.user.username,
            avatar: data.user.avatar_url ?? "",
            profileUrl: `https://github.com/${data.user.username}`,
          },
          data.access_token
        );
        router.replace("/dashboard");
      } catch (err) {
        setErrorMessage(err instanceof Error ? err.message : "Something went wrong.");
      }
    })();
  }, [searchParams, login, router]);

  if (errorMessage) {
    return (
      <main className="mx-auto flex min-h-[70vh] w-full max-w-md flex-col items-center justify-center gap-4 px-5 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h1 className="text-lg font-semibold text-zinc-900">Sign-in failed</h1>
        <p className="text-sm text-zinc-500">{errorMessage}</p>
        <button
          type="button"
          onClick={() => router.replace("/")}
          className="mt-2 inline-flex items-center gap-2 rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-black"
        >
          Back to home
        </button>
      </main>
    );
  }

  return (
    <main className="flex min-h-[70vh] w-full flex-col items-center justify-center gap-3">
      <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
      <p className="text-sm text-zinc-500">Finishing sign-in with GitHub…</p>
    </main>
  );
}
