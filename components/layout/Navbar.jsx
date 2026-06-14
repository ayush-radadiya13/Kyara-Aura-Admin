"use client";

import * as React from "react";
import {
  ArrowLeftRight,
  Moon,
  Sun,
} from "lucide-react";
import { useTheme } from "next-themes";
import { usePathname, useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import { useDirectionStore } from "@/store/use-direction-store";
import { Button, buttonVariants } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getAdminPageTitle } from "@/lib/admin-page-title";
import { useAuthStore } from "@/store/auth-store";

function subscribeToClientMount(onStoreChange) {
  const timeoutId = window.setTimeout(onStoreChange, 0);

  return () => window.clearTimeout(timeoutId);
}

function getClientMountSnapshot() {
  return true;
}

function getServerMountSnapshot() {
  return false;
}

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuthStore();
  const pageTitle = getAdminPageTitle(pathname ?? "/");
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = React.useSyncExternalStore(
    subscribeToClientMount,
    getClientMountSnapshot,
    getServerMountSnapshot
  );
  const direction = useDirectionStore((s) => s.direction);
  const toggleDirection = useDirectionStore((s) => s.toggleDirection);

  const isDark = mounted && resolvedTheme === "dark";

  const onLogout = () => {
    logout();
    router.replace("/login");
  };

  return (
    <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center gap-4 border-b border-border bg-background px-4 shadow-sm backdrop-blur-md">
      <div className="flex flex-1 items-center gap-3">
        <SidebarTrigger className="size-7" />

        <span className="min-w-0 truncate font-heading text-base font-semibold text-foreground">
          {pageTitle}
        </span>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => setTheme(isDark ? "light" : "dark")}
          aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          disabled={!mounted}
        >
          {!mounted ? (
            <Sun className="size-4 opacity-50" aria-hidden />
          ) : isDark ? (
            <Sun className="size-4" aria-hidden />
          ) : (
            <Moon className="size-4" aria-hidden />
          )}
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={toggleDirection}
          aria-label={
            direction === "rtl"
              ? "Switch to left-to-right layout"
              : "Switch to right-to-left layout"
          }
        >
          <ArrowLeftRight
            className={cn("size-4", direction === "rtl" && "rotate-180")}
            aria-hidden
          />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "gap-2 px-2")}
            aria-label="Admin account menu"
          >
            <Avatar size="sm" className="size-7">
              <AvatarFallback className="bg-primary/15 text-[0.65rem] font-medium text-primary">
                AD
              </AvatarFallback>
            </Avatar>
            <span className="hidden text-xs font-medium sm:inline">Admin</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-44">
            <DropdownMenuLabel className="font-normal">
              <span className="text-foreground">Admin</span>
              <span className="block text-muted-foreground">admin@kyaraaura.com</span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={onLogout}>
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
