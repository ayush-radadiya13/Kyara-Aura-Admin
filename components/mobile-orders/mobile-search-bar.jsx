"use client";

import { Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function MobileSearchBar({ value, onChange, placeholder = "Search orders..." }) {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (localValue !== value) {
        onChange(localValue);
      }
    }, 400);

    return () => window.clearTimeout(timer);
  }, [localValue, onChange, value]);

  return (
    <div className="sticky top-0 z-30 border-b border-gray-200/80 bg-white/95 px-4 py-3 backdrop-blur-md">
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={localValue}
          onChange={(event) => setLocalValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              onChange(localValue);
            }
          }}
          placeholder={placeholder}
          className={cn(
            "h-11 rounded-2xl border-gray-200/80 bg-white pl-10 pr-10 text-base shadow-sm ring-1 ring-black/[0.03]"
          )}
        />
        {localValue ? (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => {
              setLocalValue("");
              onChange("");
            }}
            className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full p-1 text-muted-foreground transition-colors hover:bg-gray-100"
          >
            <X className="size-4" />
          </button>
        ) : null}
      </div>
    </div>
  );
}
