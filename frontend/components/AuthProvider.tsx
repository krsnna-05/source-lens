"use client";

import { useEffect, useRef } from "react";
import { API_BASE_URL } from "@/lib/config";
import { useAuthStore } from "@/lib/store";

type RefreshResponse = {
  access_token: string;
  user: {
    username: string;
    avatar_url: string | null;
  };
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const login = useAuthStore((state) => state.login);
  const setAuthReady = useAuthStore((state) => state.setAuthReady);
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) {
      return;
    }
    hasRun.current = true;

    (async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
          method: "POST",
          credentials: "include",
        });

        if (!response.ok) {
          setAuthReady();
          return;
        }

        const data = (await response.json()) as RefreshResponse;
        login(
          {
            name: data.user.username,
            avatar: data.user.avatar_url ?? "",
            profileUrl: `https://github.com/${data.user.username}`,
          },
          data.access_token
        );
      } catch {
        setAuthReady();
      }
    })();
  }, [login, setAuthReady]);

  return <>{children}</>;
}
