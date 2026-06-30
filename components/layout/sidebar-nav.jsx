"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  BadgePercent,
  ChevronDown,
  ChevronRight,
  FolderTree,
  LayoutDashboard,
  Package,
  RotateCcw,
  Settings,
  ShoppingBag,
  Star,
  Users,
} from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";

const links = {
  dashboard: "/dashboard",
  category: "/category",
  products: "/product",
  customers: "/customers",
  orders: "/orders",
  returnOrders: "/return-orders",
  promoCode: "/promo-code",
  reviews: "/reviews",
  settings: "/settings",
  settingsWeb: "/settings/web-settings",
  settingsBanner: "/settings/banner",
  settingsSizes: "/settings/sizes",
};

const orderTypeLinks = [
  { label: "Cash on Delivery", href: "/orders?type=cod", type: "cod" },
  { label: "Online Payment", href: "/orders?type=online", type: "online" },
];

const returnOrderTypeLinks = [
  { label: "Cash on Delivery", href: "/return-orders?type=cod", type: "cod" },
  { label: "Online Payment", href: "/return-orders?type=online", type: "online" },
];

function isRouteActive(pathname, href) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SidebarNav({
  enableTooltips,
  onNavigate,
  className,
}) {
  const { isMobile, state } = useSidebar();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const orderType = searchParams.get("type");
  const collapsed = !isMobile && state === "collapsed";
  const ordersActive = isRouteActive(pathname, links.orders);
  const returnOrdersActive = isRouteActive(pathname, links.returnOrders);
  const settingsActive = isRouteActive(pathname, links.settings);
  const [ordersOpen, setOrdersOpen] = React.useState(ordersActive);
  const [returnOrdersOpen, setReturnOrdersOpen] = React.useState(returnOrdersActive);
  const [settingsOpen, setSettingsOpen] = React.useState(settingsActive);
  const effectiveOrdersOpen = ordersActive || ordersOpen;
  const effectiveReturnOrdersOpen = returnOrdersActive || returnOrdersOpen;
  const effectiveSettingsOpen = settingsActive || settingsOpen;

  const topButtonClass = (active) =>
    cn(
      "min-w-0 justify-start gap-2 rounded-md text-sm transition-[background-color,color,box-shadow,transform]",
      "hover:translate-x-0.5 data-active:shadow-sm",
      "group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-2!",
      active
        ? "bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-active:bg-sidebar-accent data-active:text-sidebar-accent-foreground"
        : "text-sidebar-foreground/85 hover:bg-sidebar-accent/80 hover:text-sidebar-accent-foreground",
      collapsed
        ? "md:size-8 md:justify-center md:p-2"
        : "h-8 w-full px-2"
    );

  const subLinkClass = (active) =>
    cn(
      "relative -ms-px h-7 justify-start gap-2 rounded-md border-s-2 border-transparent bg-transparent px-2 text-sm transition-colors hover:bg-sidebar-accent/70",
      active
        ? "border-sidebar-primary bg-sidebar-accent text-sidebar-accent-foreground hover:text-sidebar-accent-foreground data-active:bg-sidebar-accent data-active:text-sidebar-accent-foreground"
        : "font-medium text-sidebar-foreground/70 hover:text-sidebar-accent-foreground"
    );

  return (
    <SidebarGroup
      className={cn(
        "min-h-0 flex-1 px-2 py-2",
        className
      )}
      aria-label="Admin"
    >
      <SidebarGroupLabel
        className={cn(
          "text-sidebar-foreground/70",
          collapsed && "sr-only"
        )}
      >
        Navigation
      </SidebarGroupLabel>

      <SidebarMenu className="gap-1">
        <SidebarMenuItem>
          <SidebarMenuButton
            render={<Link href={links.dashboard} onClick={onNavigate} />}
            isActive={isRouteActive(pathname, links.dashboard)}
            tooltip={enableTooltips ? "Dashboard" : undefined}
            className={topButtonClass(isRouteActive(pathname, links.dashboard))}
          >
            <LayoutDashboard aria-hidden />
            <span className={cn("truncate", collapsed && "sr-only")}>
              Dashboard
            </span>
          </SidebarMenuButton>
        </SidebarMenuItem>

        <SidebarMenuItem>
          <SidebarMenuButton
            render={<Link href={links.category} onClick={onNavigate} />}
            isActive={isRouteActive(pathname, links.category)}
            tooltip={enableTooltips ? "Category" : undefined}
            className={topButtonClass(isRouteActive(pathname, links.category))}
          >
            <FolderTree aria-hidden />
            <span className={cn("truncate", collapsed && "sr-only")}>
              Category
            </span>
          </SidebarMenuButton>
        </SidebarMenuItem>

        <SidebarMenuItem>
          <SidebarMenuButton
            render={<Link href={links.products} onClick={onNavigate} />}
            isActive={isRouteActive(pathname, links.products)}
            tooltip={enableTooltips ? "Products" : undefined}
            className={topButtonClass(isRouteActive(pathname, links.products))}
          >
            <Package aria-hidden />
            <span className={cn("truncate", collapsed && "sr-only")}>
              Products
            </span>
          </SidebarMenuButton>
        </SidebarMenuItem>

        <SidebarMenuItem>
          <SidebarMenuButton
            render={<Link href={links.customers} onClick={onNavigate} />}
            isActive={isRouteActive(pathname, links.customers)}
            tooltip={enableTooltips ? "Customers" : undefined}
            className={topButtonClass(isRouteActive(pathname, links.customers))}
          >
            <Users aria-hidden />
            <span className={cn("truncate", collapsed && "sr-only")}>
              Customers
            </span>
          </SidebarMenuButton>
        </SidebarMenuItem>

        <SidebarMenuItem>
          {collapsed ? (
            <SidebarMenuButton
              render={<Link href={links.orders} onClick={onNavigate} />}
              isActive={ordersActive}
              tooltip={enableTooltips ? "Orders" : undefined}
              className={topButtonClass(ordersActive)}
            >
              <ShoppingBag aria-hidden />
              <span className="sr-only">Orders</span>
            </SidebarMenuButton>
          ) : (
            <Collapsible open={effectiveOrdersOpen} onOpenChange={setOrdersOpen}>
              <CollapsibleTrigger
                render={
                  <SidebarMenuButton
                    isActive={ordersActive}
                    className={topButtonClass(ordersActive)}
                  >
                    <ShoppingBag aria-hidden />
                    <span className="truncate">Orders</span>
                    {effectiveOrdersOpen ? (
                      <ChevronDown className="ms-auto size-4" aria-hidden />
                    ) : (
                      <ChevronRight className="ms-auto size-4" aria-hidden />
                    )}
                  </SidebarMenuButton>
                }
              />
              <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
                <SidebarMenuSub className="mx-3.5 mt-1 gap-1 border-sidebar-border px-2.5 py-0.5">
                  {orderTypeLinks.map((item) => (
                    <SidebarMenuSubItem key={item.type}>
                      <SidebarMenuSubButton
                        render={<Link href={item.href} onClick={onNavigate} />}
                        isActive={ordersActive && orderType === item.type}
                        className={subLinkClass(ordersActive && orderType === item.type)}
                      >
                        <span>{item.label}</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </CollapsibleContent>
            </Collapsible>
          )}
        </SidebarMenuItem>

        <SidebarMenuItem>
          {collapsed ? (
            <SidebarMenuButton
              render={<Link href={`${links.returnOrders}?type=online`} onClick={onNavigate} />}
              isActive={returnOrdersActive}
              tooltip={enableTooltips ? "Return Orders" : undefined}
              className={topButtonClass(returnOrdersActive)}
            >
              <RotateCcw aria-hidden />
              <span className="sr-only">Return Orders</span>
            </SidebarMenuButton>
          ) : (
            <Collapsible open={effectiveReturnOrdersOpen} onOpenChange={setReturnOrdersOpen}>
              <CollapsibleTrigger
                render={
                  <SidebarMenuButton
                    isActive={returnOrdersActive}
                    className={topButtonClass(returnOrdersActive)}
                  >
                    <RotateCcw aria-hidden />
                    <span className="truncate">Return Orders</span>
                    {effectiveReturnOrdersOpen ? (
                      <ChevronDown className="ms-auto size-4" aria-hidden />
                    ) : (
                      <ChevronRight className="ms-auto size-4" aria-hidden />
                    )}
                  </SidebarMenuButton>
                }
              />
              <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
                <SidebarMenuSub className="mx-3.5 mt-1 gap-1 border-sidebar-border px-2.5 py-0.5">
                  {returnOrderTypeLinks.map((item) => (
                    <SidebarMenuSubItem key={item.type}>
                      <SidebarMenuSubButton
                        render={<Link href={item.href} onClick={onNavigate} />}
                        isActive={returnOrdersActive && orderType === item.type}
                        className={subLinkClass(returnOrdersActive && orderType === item.type)}
                      >
                        <span>{item.label}</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </CollapsibleContent>
            </Collapsible>
          )}
        </SidebarMenuItem>

        <SidebarMenuItem>
          <SidebarMenuButton
            render={<Link href={links.promoCode} onClick={onNavigate} />}
            isActive={isRouteActive(pathname, links.promoCode)}
            tooltip={enableTooltips ? "Promo Code" : undefined}
            className={topButtonClass(isRouteActive(pathname, links.promoCode))}
          >
            <BadgePercent aria-hidden />
            <span className={cn("truncate", collapsed && "sr-only")}>
              Promo Code
            </span>
          </SidebarMenuButton>
        </SidebarMenuItem>

        <SidebarMenuItem>
          <SidebarMenuButton
            render={<Link href={links.reviews} onClick={onNavigate} />}
            isActive={isRouteActive(pathname, links.reviews)}
            tooltip={enableTooltips ? "Reviews" : undefined}
            className={topButtonClass(isRouteActive(pathname, links.reviews))}
          >
            <Star aria-hidden />
            <span className={cn("truncate", collapsed && "sr-only")}>
              Reviews
            </span>
          </SidebarMenuButton>
        </SidebarMenuItem>

        <SidebarMenuItem>
          {collapsed ? (
            <SidebarMenuButton
              render={<Link href={links.settings} onClick={onNavigate} />}
              isActive={settingsActive}
              tooltip={enableTooltips ? "Settings" : undefined}
              className={topButtonClass(settingsActive)}
            >
              <Settings aria-hidden />
              <span className="sr-only">Settings</span>
            </SidebarMenuButton>
          ) : (
            <Collapsible open={effectiveSettingsOpen} onOpenChange={setSettingsOpen}>
              <CollapsibleTrigger
                render={
                  <SidebarMenuButton
                    isActive={settingsActive}
                    className={topButtonClass(settingsActive)}
                  >
                    <Settings aria-hidden />
                    <span className="truncate">Settings</span>
                    {effectiveSettingsOpen ? (
                      <ChevronDown className="ms-auto size-4" aria-hidden />
                    ) : (
                      <ChevronRight className="ms-auto size-4" aria-hidden />
                    )}
                  </SidebarMenuButton>
                }
              />
              <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
                <SidebarMenuSub className="mx-3.5 mt-1 gap-1 border-sidebar-border px-2.5 py-0.5">
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton
                      render={<Link href={links.settingsWeb} onClick={onNavigate} />}
                      isActive={pathname === links.settingsWeb}
                      className={subLinkClass(pathname === links.settingsWeb)}
                    >
                      <span>Web Settings</span>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton
                      render={<Link href={links.settingsBanner} onClick={onNavigate} />}
                      isActive={pathname === links.settingsBanner}
                      className={subLinkClass(pathname === links.settingsBanner)}
                    >
                      <span>Banner</span>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton
                      render={<Link href={links.settingsSizes} onClick={onNavigate} />}
                      isActive={pathname === links.settingsSizes}
                      className={subLinkClass(pathname === links.settingsSizes)}
                    >
                      <span>Sizes</span>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                </SidebarMenuSub>
              </CollapsibleContent>
            </Collapsible>
          )}
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}
