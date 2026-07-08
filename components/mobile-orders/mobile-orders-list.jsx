"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Download, Filter, Loader2, PackageOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MobileDateSection } from "./mobile-date-section";
import { MobileOrderListSkeleton } from "./mobile-order-card-skeleton";

export function MobileOrdersList({
  groups,
  mode = "order",
  isInitialLoading,
  isLoadingMore,
  hasMore,
  onLoadMore,
  onRefresh,
  isRefreshing,
  renderCardProps,
  onDownloadAllVisibleStickers,
  onDownloadDateStickers,
  isDownloadingVisible,
  downloadingDateKey,
  contentClassName,
  emptyTitle = "No Orders Found",
  emptyDescription = "Try adjusting your search or filters.",
}) {
  const loadMoreRef = useRef(null);
  const containerRef = useRef(null);
  const [pullDistance, setPullDistance] = useState(0);
  const touchStartY = useRef(0);
  const isPulling = useRef(false);

  useEffect(() => {
    const node = loadMoreRef.current;
    if (!node || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          onLoadMore();
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, onLoadMore, groups.length]);

  const handleTouchStart = useCallback((event) => {
    const container = containerRef.current;
    if (!container || container.scrollTop > 0) return;

    touchStartY.current = event.touches[0].clientY;
    isPulling.current = true;
  }, []);

  const handleTouchMove = useCallback((event) => {
    if (!isPulling.current || isRefreshing) return;

    const distance = Math.max(0, event.touches[0].clientY - touchStartY.current);
    setPullDistance(Math.min(distance, 80));
  }, [isRefreshing]);

  const handleTouchEnd = useCallback(() => {
    if (!isPulling.current) return;

    isPulling.current = false;

    if (pullDistance >= 60) {
      onRefresh();
    }

    setPullDistance(0);
  }, [onRefresh, pullDistance]);

  if (isInitialLoading) {
    return <MobileOrderListSkeleton count={5} />;
  }

  if (!groups.length) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center px-6 py-16 text-center">
        <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-gray-100">
          <PackageOpen className="size-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">{emptyTitle}</h3>
        <p className="mt-2 max-w-xs text-sm text-muted-foreground">
          {emptyDescription}
        </p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative min-h-0 flex-1 overflow-y-auto overscroll-contain",
        contentClassName
      )}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className={cn(
          "flex items-center justify-center overflow-hidden text-xs text-muted-foreground transition-all duration-200",
          pullDistance > 0 || isRefreshing ? "opacity-100" : "h-0 opacity-0"
        )}
        style={{ height: isRefreshing ? 48 : pullDistance }}
      >
        {isRefreshing ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <span>Pull to refresh</span>
        )}
      </div>

      <div className="px-4 pb-3">
        <Button
          type="button"
          variant="outline"
          className="h-11 w-full rounded-xl border-primary/20 bg-primary/5"
          disabled={isDownloadingVisible}
          onClick={onDownloadAllVisibleStickers}
        >
          {isDownloadingVisible ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Download className="size-4" />
          )}
          Download All Visible Stickers
        </Button>
      </div>

      {groups.map((group) => (
        <MobileDateSection
          key={group.dateKey}
          dateLabel={group.dateLabel}
          items={group.items}
          mode={mode}
          renderCardProps={renderCardProps}
          onDownloadAllStickers={
            onDownloadDateStickers
              ? () => onDownloadDateStickers(group.items, group.dateKey)
              : undefined
          }
          isDownloadingAll={downloadingDateKey === group.dateKey}
        />
      ))}

      <div ref={loadMoreRef} className="flex justify-center px-4 py-6">
        {isLoadingMore ? (
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        ) : hasMore ? (
          <span className="text-xs text-muted-foreground">Loading more...</span>
        ) : (
          <span className="text-xs text-muted-foreground">You&apos;re all caught up</span>
        )}
      </div>
    </div>
  );
}

export function MobileFilterFab({ onClick, className }) {
  return (
    <button
      type="button"
      aria-label="Open filters"
      onClick={onClick}
      className={cn(
        "fixed right-4 z-40 flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/25 transition-transform active:scale-95",
        className
      )}
    >
      <Filter className="size-5" />
    </button>
  );
}
