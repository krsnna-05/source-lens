"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, LogOut, ScanSearch, User, UserCircle2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { API_BASE_URL } from "@/lib/config";
import { useAuthStore } from "@/lib/store";

export function Navbar() {
  const { isLoggedIn, user, logout } = useAuthStore();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const router = useRouter();

  const handleGitHubLogin = () => {
    setIsProfileMenuOpen(false);
    window.location.href = `${API_BASE_URL}/api/auth/github/login`;
  };

  const handleLogout = () => {
    logout();
    setIsProfileMenuOpen(false);
    void fetch(`${API_BASE_URL}/api/auth/logout`, {
      method: "POST",
      credentials: "include",
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

          {isLoggedIn && user ? (
            <DropdownMenu open={isProfileMenuOpen} onOpenChange={setIsProfileMenuOpen}>
              <DropdownMenuTrigger className="inline-flex items-center gap-2 rounded-full border border-zinc-200/80 bg-white/85 px-3 py-1.5 transition-colors hover:bg-white focus:outline-none">
                {user.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.avatar} alt={user.name} className="h-5 w-5 rounded-full" />
                ) : (
                  <UserCircle2 className="h-4 w-4 text-zinc-700" />
                )}
                <span className="font-ui text-sm font-medium text-zinc-900">{user.name}</span>
                <ChevronDown className="h-4 w-4 text-zinc-500" />
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                sideOffset={10}
                className="w-64 rounded-2xl border border-zinc-300 bg-white/95 p-2 text-zinc-900 shadow-[0_16px_40px_rgba(9,9,11,0.14)] ring-0 backdrop-blur-xl"
              >
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="px-2.5 pb-1 pt-1 text-zinc-500">Account</DropdownMenuLabel>

                  <div className="mb-1 rounded-xl border border-zinc-200 bg-white px-3 py-2.5">
                    <div className="flex items-center gap-2.5">
                      <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-zinc-100">
                        {user.avatar ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={user.avatar} alt={user.name} className="h-8 w-8" />
                        ) : (
                          <UserCircle2 className="h-5 w-5 text-zinc-600" />
                        )}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-ui text-sm font-medium text-zinc-900">{user.name}</p>
                        <p className="font-ui text-xs text-zinc-500">GitHub connected</p>
                      </div>
                    </div>
                  </div>

                  <DropdownMenuItem
                    className="rounded-sm px-3 py-2 font-ui text-zinc-800 hover:bg-zinc-500/10 hover:text-zinc-900"
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      router.push("/dashboard");
                    }}
                  >
                    <User className="h-4 w-4 text-zinc-600" />
                    Profile
                  </DropdownMenuItem>
                </DropdownMenuGroup>

                <DropdownMenuSeparator className="mx-0 my-1 bg-zinc-200" />

                <DropdownMenuGroup>
                  <DropdownMenuItem
                    variant="destructive"
                    className="rounded-sm px-3 py-2 font-ui hover:bg-red-500/10 hover:text-red-500"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <button
              onClick={handleGitHubLogin}
              className="inline-flex items-center gap-2 rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-black active:translate-y-0"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                <path d="M12 .5C5.649.5.5 5.649.5 12a11.5 11.5 0 0 0 7.863 10.907c.575.106.787-.25.787-.556 0-.275-.01-1.004-.016-1.971-3.2.695-3.877-1.542-3.877-1.542-.524-1.33-1.28-1.684-1.28-1.684-1.046-.715.08-.7.08-.7 1.157.082 1.765 1.188 1.765 1.188 1.029 1.764 2.699 1.255 3.357.96.104-.745.403-1.255.732-1.543-2.554-.29-5.238-1.277-5.238-5.684 0-1.256.448-2.283 1.182-3.087-.118-.29-.512-1.456.112-3.036 0 0 .965-.309 3.164 1.18a10.97 10.97 0 0 1 5.76 0c2.198-1.489 3.162-1.18 3.162-1.18.625 1.58.232 2.746.114 3.036.736.804 1.18 1.83 1.18 3.087 0 4.418-2.688 5.39-5.25 5.675.414.357.783 1.06.783 2.136 0 1.542-.014 2.786-.014 3.166 0 .309.208.668.794.555A11.502 11.502 0 0 0 23.5 12C23.5 5.649 18.351.5 12 .5Z" />
              </svg>
              Login with GitHub
            </button>
          )}
        </div>
      </nav>
    </header>
  );
}
