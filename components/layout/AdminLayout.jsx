"use client";

import { SidebarProvider } from "@/components/ui/sidebar";
import { useDirectionStore } from "@/store/use-direction-store";
import { useSidebarStore } from "@/store/use-sidebar-store";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";

export function AdminLayoutShell({ children }) {
  const direction = useDirectionStore((s) => s.direction);
  const isCollapsed = useSidebarStore((s) => s.isCollapsed);
  const setCollapsed = useSidebarStore((s) => s.setCollapsed);

  return (
    <SidebarProvider
      dir={direction}
      open={!isCollapsed}
      onOpenChange={(open) => setCollapsed(!open)}
      style={{
        "--sidebar-width": "16rem",
        "--sidebar-width-icon": "3rem",
      }}
      
      className="fixed inset-0 h-svh overflow-hidden bg-background"
    >
      <Sidebar />

      <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col">
        <Navbar />
        <main className="min-h-0 flex-1 overflow-y-auto bg-primary/10 p-4">{children}</main>
      </div>
    </SidebarProvider>
  );
}
