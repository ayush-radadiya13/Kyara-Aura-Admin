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
  orders: "/orders",
  products: "/products",
  customers: "/customers",
  category: "/category",
  settings: "/settings",
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
  const [managementOpen, setManagementOpen] = React.useState(() =>
    isRouteActive(pathname, links.products) ||
    isRouteActive(pathname, links.customers) ||
    isRouteActive(pathname, links.category)
  );

  React.useEffect(() => {
    if (
      isRouteActive(pathname, links.products) ||
      isRouteActive(pathname, links.customers) ||
      isRouteActive(pathname, links.category)
    ) {
      setManagementOpen(true);
    }
  }, [pathname]);

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

      <Collapsible open={managementOpen} onOpenChange={setManagementOpen}>
        {withTooltip(
          "Management",
          <CollapsibleTrigger
            className={cn(
              "flex w-full min-w-0 items-center gap-3 rounded-md px-2 py-2 text-start text-sm font-medium outline-none transition-colors",
              "text-neutral-900 hover:bg-neutral-100/90 dark:text-sidebar-foreground dark:hover:bg-sidebar-accent/80",
              collapsed && "md:justify-center md:px-0"
            )}
          >
            <IconCircle className="bg-neutral-100 text-neutral-600 dark:bg-sidebar-accent dark:text-sidebar-foreground/80">
              <Package aria-hidden />
            </IconCircle>
            <span
              className={cn(
                "min-w-0 flex-1 truncate text-start",
                collapsed && "md:sr-only"
              )}
            >
              Management
            </span>
            <span className={cn("flex shrink-0 items-center justify-center", collapsed && "md:hidden")}>
              {managementOpen ? (
                <ChevronDown className="size-4 text-neutral-400" aria-hidden />
              ) : (
                <ChevronRight className="size-4 text-neutral-400" aria-hidden />
              )}
            </span>
          </CollapsibleTrigger>
        )}
        <CollapsibleContent className="overflow-hidden">
          <div
            className={cn(
              "ms-5 mt-1 border-s border-neutral-200 ps-3 dark:border-sidebar-border",
              collapsed && "md:ms-0 md:border-none md:ps-0"
            )}
          >
            <Link
              href={links.products}
              className={subLinkClass(isRouteActive(pathname, links.products))}
              onClick={onNavigate}
            >
              <span className="size-1.5 shrink-0 rounded-full bg-neutral-300 dark:bg-muted-foreground/40" />
              <span className="truncate">Products</span>
            </Link>
            <Link
              href={links.customers}
              className={subLinkClass(isRouteActive(pathname, links.customers))}
              onClick={onNavigate}
            >
              <Users className="size-3.5" />
              <span className="truncate">Customers</span>
            </Link>
            <Link
              href={links.category}
              className={subLinkClass(isRouteActive(pathname, links.category))}
              onClick={onNavigate}
            >
              <span className="size-1.5 shrink-0 rounded-full bg-neutral-300 dark:bg-muted-foreground/40" />
              <span className="truncate">Category</span>
            </Link>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {withTooltip(
        "Settings",
        <Link
          href={links.settings}
          className={topLinkClass(isRouteActive(pathname, links.settings))}
          onClick={onNavigate}
        >
          <IconCircle
            className={topIconWrapClass(isRouteActive(pathname, links.settings))}
          >
            <Settings aria-hidden />
          </IconCircle>
          <span className={cn("truncate", collapsed && "md:sr-only")}>
            Settings
          </span>
        </Link>
      )}
    </nav>
  );
}
