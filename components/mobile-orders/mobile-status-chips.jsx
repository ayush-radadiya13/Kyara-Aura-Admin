"use client";

import { cn } from "@/lib/utils";

export function MobileStatusChips({ chips, value, onChange }) {
  return (
    <div className="sticky top-[68px] z-20 border-b border-gray-200/60 bg-white/90 backdrop-blur-md">
      <div className="flex gap-2 overflow-x-auto px-4 py-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {chips.map((chip) => {
          const isActive = value === chip.value;

          return (
            <button
              key={`${chip.value}-${chip.label}`}
              type="button"
              onClick={() => onChange(chip.value)}
              className={cn(
                "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all active:scale-95",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
              )}
            >
              {chip.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
