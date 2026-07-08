"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const DESKTOP_STATUS_BADGE_CLASS =
  "inline-block h-auto min-h-5 w-full min-w-0 max-w-full shrink whitespace-normal break-words overflow-visible text-center leading-tight [overflow-wrap:anywhere]";

export function MobileStatusBadge({ className, label }) {
  if (!label || label === "-") return null;

  return (
    <Badge className={cn(DESKTOP_STATUS_BADGE_CLASS, className)}>{label}</Badge>
  );
}

export function MobileStatusBadgeGroup({ badges, className }) {
  const visibleBadges = badges.filter(
    (badge) => badge?.label && badge.label !== "-"
  );

  if (visibleBadges.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap justify-end gap-1", className)}>
      {visibleBadges.map((badge) => (
        <MobileStatusBadge
          key={`${badge.label}-${badge.className}`}
          className={badge.className}
          label={badge.label}
        />
      ))}
    </div>
  );
}
