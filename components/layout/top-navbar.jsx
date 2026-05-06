"use client";

import { LogOut, Menu } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth-store";

export function TopNavbar({ onMenuClick }) {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const onLogout = () => {
    logout();
    toast.success("Logged out successfully");
    router.replace("/login");
  };

  return (
    <header className="sticky top-0 z-20 border-b border-border/80 bg-white/70 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between gap-4 px-4 md:px-6">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            className="md:hidden"
            onClick={onMenuClick}
          >
            <Menu className="size-4" />
          </Button>
          <div>
            <p className="text-sm text-muted-foreground">Welcome back,</p>
            <h1 className="text-base font-semibold">{user?.name || "Admin"}</h1>
          </div>
        </div>

        <Button
          variant="outline"
          className="rounded-xl bg-white"
          onClick={onLogout}
        >
          <LogOut className="mr-2 size-4" />
          Logout
        </Button>
      </div>
    </header>
  );
}
