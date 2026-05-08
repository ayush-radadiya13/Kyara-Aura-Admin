"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useDirectionStore } from "@/store/use-direction-store";
import { useSidebarStore } from "@/store/use-sidebar-store";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";
import { SidebarNav } from "./sidebar-nav";

export function AdminLayoutShell({ children }) {
  const direction = useDirectionStore((s) => s.direction);
  const isMobileOpen = useSidebarStore((s) => s.isMobileOpen);
  const setMobileOpen = useSidebarStore((s) => s.setMobileOpen);

  const sheetSide = direction === "rtl" ? "right" : "left";

  return (
    <div dir={direction} className="flex h-svh w-full overflow-hidden bg-background">
      <Sidebar />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <Navbar />
        <main className="min-h-0 flex-1 overflow-y-auto p-4">{children}</main>
      </div>

      <Sheet open={isMobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent
          side={sheetSide}
          className="flex w-[min(100%,20rem)] flex-col gap-0 border-neutral-200/90 bg-white p-0 text-sidebar-foreground md:hidden dark:border-sidebar-border dark:bg-sidebar"
        >
          <SheetHeader className="border-b border-neutral-100 px-4 py-3 text-start dark:border-sidebar-border">
            <SheetTitle className="font-heading text-neutral-900 dark:text-sidebar-foreground">
              Menu
            </SheetTitle>
          </SheetHeader>
          <SidebarNav
            collapsed={false}
            enableTooltips={false}
            onNavigate={() => setMobileOpen(false)}
            className="min-h-0 flex-1 px-1"
          />
        </SheetContent>
      </Sheet>
    </div>
  );
}
