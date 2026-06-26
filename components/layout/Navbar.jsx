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
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getAdminPageTitle } from "@/lib/admin-page-title";
import { useAuthStore } from "@/store/auth-store";
import { logoutService } from "@/services/auth-service";

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

  const onLogout = async () => {
    try {
      await logoutService();
    } catch {
      // Clear the session locally even if the logout request fails.
    } finally {
      logout();
      router.replace("/login");
    }
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
            <DropdownMenuGroup>
              <DropdownMenuLabel className="font-normal">
                <span className="text-foreground">Admin</span>
                <span className="block text-muted-foreground">admin@kayraaura.com</span>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuItem variant="destructive" onClick={onLogout}>
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
