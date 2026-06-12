"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronDown,
  ChevronRight,
  LayoutDashboard,
  Package,
  Settings,
  ShoppingBag,
  Users,
} from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const links = {
  dashboard: "/dashboard",
  category: "/category",
  products: "/product",
  customers: "/customers",
  orders: "/orders",
  settings: "/settings",
  settingsBanner: "/settings/banner",
};

function isRouteActive(pathname, href) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function IconCircle({ className, children }) {
  return (
    <span
      className={cn(
        "flex size-7 shrink-0 items-center justify-center rounded-full [&_svg]:size-4",
        className
      )}
    >
      {children}
    </span>
  );
}

export function SidebarNav({
  collapsed,
  enableTooltips,
  onNavigate,
  className,
}) {
  const pathname = usePathname();
  const settingsActive = isRouteActive(pathname, links.settings);
  const [settingsOpen, setSettingsOpen] = React.useState(settingsActive);
  const effectiveSettingsOpen = settingsActive || settingsOpen;

  function withTooltip(label, node) {
    if (!enableTooltips || !collapsed) return node;
    return (
      <Tooltip>
        <TooltipTrigger render={node} />
        <TooltipContent side="inline-end">{label}</TooltipContent>
      </Tooltip>
    );
  }

  const topLinkClass = (active) =>
    cn(
      "flex w-full min-w-0 items-center gap-3 rounded-md px-2 py-2 text-sm font-medium transition-colors outline-none",
      active
        ? "bg-primary/80 text-white"
        : "text-neutral-900 hover:bg-neutral-100/90 dark:text-sidebar-foreground dark:hover:bg-sidebar-accent/80",
      collapsed
        ? "md:h-10 md:w-10 md:justify-center md:rounded-full md:p-0"
        : "w-full min-w-0 rounded-md px-2 py-2"
    );

  const topIconWrapClass = (active) =>
    cn(
      active
        ? "bg-white text-neutral-900 shadow-sm"
        : "bg-neutral-100 text-neutral-600 dark:bg-sidebar-accent dark:text-sidebar-foreground/80"
    );

  const subLinkClass = (active) =>
    cn(
      "relative-ms-px flex items-center gap-2.5 border-s-2 border-transparent py-2 pe-2 ps-3 text-sm transition-colors",
      active
        ? "border-primary font-semibold text-neutral-900 dark:text-sidebar-foreground"
        : "font-medium text-neutral-600 hover:text-neutral-900 dark:text-muted-foreground dark:hover:text-sidebar-foreground",
      collapsed && "md:hidden"
    );

  return (
    <nav
      className={cn(
        "flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto px-3 pb-2",
        className
      )}
      aria-label="Admin"
    >
      <p
        className={cn(
          "px-3 pb-2 pt-1 text-xs font-medium text-muted-foreground",
          collapsed && "md:sr-only"
        )}
      >
        Home
      </p>

      {withTooltip(
        "Dashboard",
        <Link
          href={links.dashboard}
          className={topLinkClass(isRouteActive(pathname, links.dashboard))}
          onClick={onNavigate}
        >
          <IconCircle
            className={topIconWrapClass(isRouteActive(pathname, links.dashboard))}
          >
            <LayoutDashboard aria-hidden />
          </IconCircle>
          <span className={cn("truncate", collapsed && "md:sr-only")}>
            Dashboard
          </span>
        </Link>
      )}

      {withTooltip(
        "Orders",
        <Link
          href={links.orders}
          className={topLinkClass(isRouteActive(pathname, links.orders))}
          onClick={onNavigate}
        >
          <IconCircle
            className={topIconWrapClass(isRouteActive(pathname, links.orders))}
          >
            <ShoppingBag aria-hidden />
          </IconCircle>
          <span className={cn("truncate", collapsed && "md:sr-only")}>
            Orders
          </span>
        </Link>
      )}

      {withTooltip(
        "Products",
        <Link
          href={links.products}
          className={topLinkClass(isRouteActive(pathname, links.products))}
          onClick={onNavigate}
        >
          <IconCircle
            className={topIconWrapClass(isRouteActive(pathname, links.products))}
          >
            <Package aria-hidden />
          </IconCircle>
          <span className={cn("truncate", collapsed && "md:sr-only")}>
            Products
          </span>
        </Link>
      )}

      {withTooltip(
        "Customers",
        <Link
          href={links.customers}
          className={topLinkClass(isRouteActive(pathname, links.customers))}
          onClick={onNavigate}
        >
          <IconCircle
            className={topIconWrapClass(isRouteActive(pathname, links.customers))}
          >
            <Users aria-hidden />
          </IconCircle>
          <span className={cn("truncate", collapsed && "md:sr-only")}>
            Customers
          </span>
        </Link>
      )}

      {withTooltip(
        "Category",
        <Link
          href={links.category}
          className={topLinkClass(isRouteActive(pathname, links.category))}
          onClick={onNavigate}
        >
          <IconCircle
            className={topIconWrapClass(isRouteActive(pathname, links.category))}
          >
            <Package aria-hidden />
          </IconCircle>
          <span className={cn("truncate", collapsed && "md:sr-only")}>
            Category
          </span>
        </Link>
      )}

      {collapsed ? (
        withTooltip(
          "Settings",
          <Link
            href={links.settings}
            className={topLinkClass(settingsActive)}
            onClick={onNavigate}
          >
            <IconCircle className={topIconWrapClass(settingsActive)}>
              <Settings aria-hidden />
            </IconCircle>
            <span className="md:sr-only">Settings</span>
          </Link>
        )
      ) : (
        <Collapsible open={effectiveSettingsOpen} onOpenChange={setSettingsOpen}>
          <CollapsibleTrigger className={topLinkClass(settingsActive)}>
            <IconCircle className={topIconWrapClass(settingsActive)}>
              <Settings aria-hidden />
            </IconCircle>
            <span className="truncate">Settings</span>
            {effectiveSettingsOpen ? (
              <ChevronDown className="ms-auto size-4" aria-hidden />
            ) : (
              <ChevronRight className="ms-auto size-4" aria-hidden />
            )}
          </CollapsibleTrigger>
          <CollapsibleContent className="ms-6 mt-1 border-s border-neutral-200 ps-2 dark:border-sidebar-border">
            <Link
              href={links.settingsBanner}
              className={subLinkClass(pathname === links.settingsBanner)}
              onClick={onNavigate}
            >
              Banner
            </Link>
          </CollapsibleContent>
        </Collapsible>
      )}
    </nav>
  );
}
