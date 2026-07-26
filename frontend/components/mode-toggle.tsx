"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ModeToggle() {
  const { setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card/85 text-foreground transition-colors hover:bg-accent focus:outline-none">
        <Sun className="h-4 w-4 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
        <Moon className="absolute h-4 w-4 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
        <span className="sr-only">Toggle theme</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={10}
        className="w-36 rounded-2xl border border-border bg-card/95 p-2 text-foreground shadow-[0_16px_40px_rgba(9,9,11,0.14)] ring-0 backdrop-blur-xl"
      >
        <DropdownMenuItem
          className="rounded-sm px-3 py-2 font-ui text-foreground hover:bg-accent"
          onClick={() => setTheme("light")}
        >
          Light
        </DropdownMenuItem>
        <DropdownMenuItem
          className="rounded-sm px-3 py-2 font-ui text-foreground hover:bg-accent"
          onClick={() => setTheme("dark")}
        >
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem
          className="rounded-sm px-3 py-2 font-ui text-foreground hover:bg-accent"
          onClick={() => setTheme("system")}
        >
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
