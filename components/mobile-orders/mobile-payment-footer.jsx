"use client";

import { Banknote, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";

export const MOBILE_PAYMENT_FOOTER_HEIGHT = "4.5rem";

const PAYMENT_TABS = [
  {
    value: "cod",
    label: "COD",
    description: "Cash on Delivery",
    icon: Banknote,
  },
  {
    value: "online",
    label: "Online Payment",
    description: "Prepaid orders",
    icon: CreditCard,
  },
];

export function MobilePaymentFooter({ activeType, onTypeChange }) {
  return (
    <nav
      aria-label="Payment method"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-gray-200/80 bg-white/95 px-3 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-[0_-8px_24px_rgba(15,23,42,0.08)] backdrop-blur-md md:hidden"
    >
      <div className="mx-auto grid max-w-lg grid-cols-2 gap-2">
        {PAYMENT_TABS.map((tab) => {
          const isActive = activeType === tab.value;
          const Icon = tab.icon;

          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => onTypeChange(tab.value)}
              className={cn(
                "flex min-h-[3.25rem] flex-col items-center justify-center gap-0.5 rounded-2xl px-3 py-2 text-center transition-all duration-200 active:scale-[0.98]",
                isActive
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200/80"
              )}
            >
              <span className="flex items-center gap-1.5 text-sm font-semibold">
                <Icon className="size-4 shrink-0" />
                {tab.label}
              </span>
              <span
                className={cn(
                  "text-[10px] leading-tight",
                  isActive ? "text-primary-foreground/80" : "text-muted-foreground"
                )}
              >
                {tab.description}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
