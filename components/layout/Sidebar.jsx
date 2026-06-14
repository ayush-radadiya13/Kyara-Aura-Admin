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
  const { isMobile, setOpenMobile } = useSidebar();

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
        className="h-14 shrink-0 justify-center overflow-hidden border-b border-sidebar-border p-0"
      >
        <Image
          src="/assets/ka-bg.png"
          alt="Kyara Aura"
          width={1024}
          height={683}
          priority
          className="h-full w-full object-contain object-center"
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
              admin@kyaraaura.com
            </p>
          </div>
        </div>
      </SidebarFooter>

      <SidebarRail />
    </SidebarRoot>
  );
}
