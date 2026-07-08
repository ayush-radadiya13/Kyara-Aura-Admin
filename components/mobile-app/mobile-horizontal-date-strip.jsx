"use client";

import { useCallback, useEffect, useRef } from "react";
import { CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";

export function MobileHorizontalDateStrip({
  groups,
  activeDateKey,
  onDateChange,
}) {
  const stripRef = useRef(null);

  useEffect(() => {
    if (!activeDateKey || !stripRef.current) return;

    const activeButton = stripRef.current.querySelector(
      `[data-date-key="${activeDateKey}"]`
    );

    activeButton?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [activeDateKey]);

  const handleSelect = useCallback(
    (dateKey) => {
      onDateChange(dateKey);
    },
    [onDateChange]
  );

  if (!groups.length) return null;

  return (
    <div className="shrink-0 border-b border-gray-200/80 bg-white/95 backdrop-blur-md">
      <div className="flex items-center gap-2 px-4 py-2">
        <CalendarDays className="size-4 shrink-0 text-primary" />
        <span className="text-xs font-medium text-muted-foreground">
          Select date
        </span>
      </div>
      <div
        ref={stripRef}
        className="flex gap-2 overflow-x-auto px-4 pb-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {groups.map((group) => {
          const isActive = group.dateKey === activeDateKey;

          return (
            <button
              key={group.dateKey}
              type="button"
              data-date-key={group.dateKey}
              onClick={() => handleSelect(group.dateKey)}
              className={cn(
                "flex min-w-[7.5rem] shrink-0 flex-col items-start rounded-2xl border px-3 py-2.5 text-left transition-all duration-200 active:scale-[0.98]",
                isActive
                  ? "border-primary bg-primary text-primary-foreground shadow-md shadow-primary/20"
                  : "border-gray-200 bg-white text-gray-900 shadow-sm"
              )}
            >
              <span className="text-sm font-semibold leading-tight">
                {group.dateLabel}
              </span>
              <span
                className={cn(
                  "mt-1 text-[11px]",
                  isActive ? "text-primary-foreground/80" : "text-muted-foreground"
                )}
              >
                {group.items.length} order{group.items.length === 1 ? "" : "s"}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
