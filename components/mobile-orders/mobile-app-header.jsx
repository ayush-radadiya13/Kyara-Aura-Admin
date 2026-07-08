"use client";

import { Package, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function MobileAppHeader({
  title = "Orders",
  subtitle,
  onRefresh,
  isRefreshing,
  className,
}) {
  return (
    <header
      className={cn(
        "shrink-0 border-b border-gray-200/80 bg-white/95 px-4 py-4 backdrop-blur-md",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Package className="size-5" />
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-gray-900">
              {title}
            </h1>
            {subtitle ? (
              <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
            ) : null}
          </div>
        </div>

        {onRefresh ? (
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-10 shrink-0 rounded-xl border-gray-200"
            onClick={onRefresh}
            disabled={isRefreshing}
            aria-label="Refresh orders"
          >
            <RotateCw
              className={cn("size-4", isRefreshing && "animate-spin")}
            />
          </Button>
        ) : null}
      </div>
    </header>
  );
}
