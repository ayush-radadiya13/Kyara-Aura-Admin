"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const DESKTOP_STATUS_BADGE_CLASS =
  "inline-block h-auto min-h-5 w-full min-w-0 max-w-full shrink whitespace-normal break-words overflow-visible text-center leading-tight [overflow-wrap:anywhere]";

export function MobileStatusBadge({ className, label, large = false }) {
  if (!label || label === "-") return null;

  return (
    <Badge
      className={cn(
        DESKTOP_STATUS_BADGE_CLASS,
        large && "min-h-8 px-3.5 py-1.5 text-sm font-semibold tracking-wide",
        className
      )}
    >
      {label}
    </Badge>
  );
}

export function MobileStatusBadgeGroup({ badges, className, large = false }) {
  const visibleBadges = badges.filter(
    (badge) => badge?.label && badge.label !== "-"
  );

  if (visibleBadges.length === 0) return null;

  return (
    <div className={cn("flex flex-col items-end gap-1", className)}>
      {visibleBadges.map((badge) => (
        <MobileStatusBadge
          key={`${badge.label}-${badge.className}`}
          className={badge.className}
          label={badge.label}
          large={large}
        />
      ))}
    </div>
  );
}
