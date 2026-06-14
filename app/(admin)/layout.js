"use client";

import { Loader2 } from "lucide-react";
import { AdminLayoutShell } from "@/components/layout/AdminLayout";
import { useAuthGuard } from "@/hooks/use-auth-guard";

export default function AdminLayout({ children }) {
  const { isAuthenticated, isHydrated } = useAuthGuard();

  if (!isHydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <AdminLayoutShell>{children}</AdminLayoutShell>
  );
}
