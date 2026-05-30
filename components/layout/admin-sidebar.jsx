"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Users,
  Settings,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  UserCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";
import { create } from "zustand";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

const menuItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Category", href: "/category", icon: Settings },
  { label: "Products", href: "/product", icon: Package },
  { label: "Customers", href: "/customers", icon: Users },
  { label: "Orders", href: "/orders", icon: ShoppingBag },
  { label: "Settings", href: "/settings", icon: Settings },
];

const useSidebarStore = create((set) => ({
  isOpen: true,
  setIsOpen: (value) => set({ isOpen: value }),
}));

function SidebarHeaderSection() {
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";
  const ToggleIcon = isCollapsed ? PanelLeftOpen : PanelLeftClose;

  return (
    <SidebarHeader className="border-b border-[#FFF8EC] p-3">
      <div className="flex items-center justify-between gap-2">
        <div className="overflow-hidden transition-all duration-300">
          <h2
            className={cn(
              "truncate text-base font-semibold tracking-tight",
              isCollapsed && "text-center text-sm"
            )}
          >
            {isCollapsed ? "KA" : "Kyara Aura"}
          </h2>
          <p
            className={cn(
              "truncate text-xs text-sidebar-foreground/70 transition-all duration-300",
              isCollapsed && "max-h-0 opacity-0"
            )}
          >
            Admin Panel
          </p>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 rounded-lg"
          onClick={toggleSidebar}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <ToggleIcon className="size-4" />
        </Button>
      </div>
    </SidebarHeader>
  );
}

export function AdminSidebar({ onNavigate }) {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout); 
  const isOpen = useSidebarStore((state) => state.isOpen);
  const setIsOpen = useSidebarStore((state) => state.setIsOpen);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <SidebarProvider
      open={isOpen}
      onOpenChange={setIsOpen}
      style={{
        "--sidebar-width": "260px",
        "--sidebar-width-icon": "80px",
      }}
      className="min-h-screen"
    >
      <Sidebar
        collapsible="icon"
        className="border-r border-[#FFF8EC] bg-[#DCCCAC] transition-[width,left,right] duration-300 ease-in-out"
      >
        <SidebarHeaderSection />

        <SidebarContent>
          <SidebarGroup className="pt-3">
            <SidebarGroupLabel className="text-sidebar-foreground/70">
              Navigation
            </SidebarGroupLabel>
            <SidebarMenu className="gap-1 px-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const active =
                  pathname === item.href || pathname.startsWith(`${item.href}/`);

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      render={<Link href={item.href} onClick={onNavigate} />}
                      isActive={active}
                      tooltip={item.label}
                      className={cn(
                        "h-11 rounded-xl px-3 text-sm transition-all duration-300",
                        active
                          ? "bg-[#FFF8EC] text-sidebar-accent-foreground shadow-sm"
                          : "text-sidebar-foreground/85 hover:bg-[#FFF8EC] hover:text-sidebar-accent-foreground"
                      )}
                    >
                      <Icon className="size-4 shrink-0" />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="border-t border-[#FFF8EC] p-3">
          <div className="flex items-center gap-3 rounded-xl border border-[#FFF8EC] bg-[#FFF8EC] p-2">
            <UserCircle2 className="size-8 shrink-0 text-sidebar-foreground/80" />
            <div className="min-w-0 group-data-[collapsible=icon]:hidden">
              <p className="truncate text-sm font-medium text-sidebar-foreground">
                Admin User
              </p>
              <p className="truncate text-xs text-sidebar-foreground/70">
                admin@kyaraaura.com
              </p>
            </div>
          </div>

          <SidebarMenu className="mt-2">
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={handleLogout}
                tooltip="Logout"
                className="h-10 rounded-xl px-3 text-sidebar-foreground/85 hover:bg-destructive/15 hover:text-destructive"
              >
                <LogOut className="size-4" />
                <span>Logout</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
    </SidebarProvider>
  );
}
