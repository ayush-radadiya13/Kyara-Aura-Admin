"use client";

import { Package, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  {
    value: "orders",
    label: "Orders",
    icon: Package,
  },
  {
    value: "returns",
    label: "Return Orders",
    icon: RotateCcw,
  },
];

export function MobileAppBottomNav({ activeTab, onTabChange }) {
  return (
    <nav
      aria-label="Mobile orders navigation"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-gray-200/80 bg-white/95 px-4 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-[0_-8px_24px_rgba(15,23,42,0.08)] backdrop-blur-md"
    >
      <div className="mx-auto grid max-w-lg grid-cols-2 gap-2">
        {NAV_ITEMS.map((item) => {
          const isActive = activeTab === item.value;
          const Icon = item.icon;

          return (
            <button
              key={item.value}
              type="button"
              onClick={() => onTabChange(item.value)}
              className={cn(
                "flex min-h-[3.25rem] flex-col items-center justify-center gap-1 rounded-2xl px-3 py-2 transition-all duration-200 active:scale-[0.98]",
                isActive
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200/80"
              )}
            >
              <Icon className="size-5" />
              <span className="text-sm font-semibold">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export const MOBILE_APP_BOTTOM_NAV_OFFSET =
  "calc(4.5rem + env(safe-area-inset-bottom))";
