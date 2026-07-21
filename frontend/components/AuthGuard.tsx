"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, isAuthReady } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (isAuthReady && !isLoggedIn) {
      router.replace("/");
    }
  }, [isAuthReady, isLoggedIn, router]);

  if (!isAuthReady || !isLoggedIn) {
    return null;
  }

  return <>{children}</>;
}
