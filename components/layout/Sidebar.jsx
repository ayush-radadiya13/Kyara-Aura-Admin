"use client";

import Image from "next/image";

import { cn } from "@/lib/utils";
import { useDirectionStore } from "@/store/use-direction-store";
import {
  Sidebar as SidebarRoot,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";
import { SidebarNav } from "./sidebar-nav";

export function Sidebar() {
  const direction = useDirectionStore((s) => s.direction);
  const { isMobile, setOpenMobile, state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <SidebarRoot
      side={direction === "rtl" ? "right" : "left"}
      collapsible="icon"
      className={cn(
        "border-sidebar-border bg-sidebar text-sidebar-foreground",
        "[&_[data-slot=sidebar-inner]]:bg-sidebar"
      )}
    >
      <SidebarHeader
        className={cn(
          "shrink-0 justify-center overflow-hidden border-b border-sidebar-border",
          isCollapsed ? "h-12 p-1" : "h-16 px-3 py-2"
        )}
      >
        <Image
          src="/assets/ka-logo.png"
          alt="Kayra Aura"
          width={1064}
          height={200}
          priority
          className={cn(
            "h-full w-full",
            isCollapsed
              ? "object-cover object-center"
              : "object-contain object-center"
          )}
        />
      </SidebarHeader>

      <SidebarContent>
        <SidebarNav
          enableTooltips
          onNavigate={() => {
            if (isMobile) {
              setOpenMobile(false);
            }
          }}
        />
      </SidebarContent>

      <SidebarSeparator />

      <SidebarFooter className="p-2">
        <div className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-accent text-xs font-semibold text-sidebar-accent-foreground">
            AD
          </span>
          <div className="min-w-0 group-data-[collapsible=icon]:hidden">
            <p className="truncate font-medium leading-none">Admin</p>
            <p className="mt-1 truncate text-xs leading-none text-sidebar-foreground/70">
              admin@kayraaura.com
            </p>
          </div>
        </div>
      </SidebarFooter>

      <SidebarRail />
    </SidebarRoot>
  );
}
