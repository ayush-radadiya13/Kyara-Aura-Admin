"use client";

import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/store/use-sidebar-store";
import { SidebarNav } from "./sidebar-nav";

export function Sidebar() {
  const isCollapsed = useSidebarStore((s) => s.isCollapsed);

  return (
    <aside
      className={cn(
        "relative z-30 hidden min-h-svh shrink-0 flex-col self-stretch overflow-hidden border-e border-neutral-200/90 bg-white shadow-[0_4px_28px_rgba(15,23,42,0.07)] md:flex dark:border-sidebar-border dark:bg-sidebar dark:shadow-none",
        "transition-[width] duration-200 ease-in-out",
        isCollapsed ? "md:w-[4.75rem]" : "md:w-[17.5rem]"
      )}
    >
      <div
        className={cn(
          "flex shrink-0 items-center gap-2 px-4 pt-5 pb-3",
          isCollapsed ? "flex-col justify-center gap-3" : "justify-between"
        )}
      >
        <div
          className={cn(
            "flex min-w-0 items-center gap-2.5",
            isCollapsed && "flex-col"
          )}
        >
          <span
            className={cn(
              "font-heading text-lg font-bold tracking-tight text-primary dark:text-sidebar-foreground",
              isCollapsed && "md:sr-only"
            )}
          >
            KYARA AURA
          </span>
        </div>
      </div>

      <SidebarNav collapsed={isCollapsed} enableTooltips />
    </aside>
  );
}
