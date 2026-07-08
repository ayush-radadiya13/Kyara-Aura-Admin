"use client";

import { CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/components/order/order-utils";
import { cn } from "@/lib/utils";
import { MobileStatusBadgeGroup } from "@/components/mobile-orders/mobile-status-badge";
import {
  formatMobileTime,
  getCustomerName,
  getCustomerPhone,
  getProductCount,
} from "@/components/mobile-orders/mobile-order-utils";

export function MobileSelectableOrderCard({
  item,
  mode = "order",
  statusBadges = [],
  amount,
  createdAt,
  orderNumber,
  isDownloaded,
  isDownloading,
  canDownloadSticker,
  isSelectable = false,
  isSelected = false,
  onToggleSelect,
  onView,
  onDownloadSticker,
  className,
}) {
  const productCount = getProductCount(item, mode);

  return (
    <article
      className={cn(
        "rounded-2xl border bg-white p-4 shadow-sm ring-1 ring-black/[0.02] transition-all duration-200",
        isSelected ? "border-primary/40 ring-primary/20" : "border-gray-200/80",
        className
      )}
    >
      <div className="flex items-start gap-3">
        {isSelectable ? (
          <label className="mt-1 flex shrink-0 cursor-pointer items-center">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={onToggleSelect}
              className="size-5 cursor-pointer rounded-md border-gray-300 accent-primary"
              aria-label={`Select order ${orderNumber}`}
            />
          </label>
        ) : null}

        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Order
              </p>
              <h3 className="text-base font-semibold text-gray-900">
                #{orderNumber || "-"}
              </h3>
            </div>
            <MobileStatusBadgeGroup
              badges={statusBadges}
              className="max-w-[40%]"
              large
            />
          </div>

          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-900">
              {getCustomerName(item, mode)}
            </p>
            <p className="text-sm text-muted-foreground">
              {getCustomerPhone(item, mode)}
            </p>
          </div>

          <div className="flex items-center justify-between gap-3">
            <p className="text-lg font-semibold text-gray-900">
              {formatCurrency(amount)}
            </p>
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {productCount} Product{productCount === 1 ? "" : "s"}
            </span>
            <span>{formatMobileTime(createdAt)}</span>
          </div>
        </div>
      </div>

      <div className="mt-4 flex gap-2 border-t border-gray-100 pt-4">
        <Button
          type="button"
          className="h-11 min-w-0 flex-1 rounded-xl"
          onClick={onView}
        >
          View Details
        </Button>

        {canDownloadSticker !== false ? (
          isDownloaded ? (
            <Button
              type="button"
              variant="outline"
              disabled
              className="h-11 min-w-0 flex-1 rounded-xl border-green-200 bg-green-50 px-2 text-green-700"
            >
              <CheckCircle className="size-4 shrink-0" />
              <span className="truncate text-xs sm:text-sm">Downloaded</span>
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              className="h-11 min-w-0 flex-1 rounded-xl px-2"
              disabled={isDownloading}
              onClick={onDownloadSticker}
            >
              {isDownloading ? (
                <Loader2 className="size-4 shrink-0 animate-spin" />
              ) : null}
              <span className="truncate text-xs sm:text-sm">Download Sticker</span>
            </Button>
          )
        ) : null}
      </div>
    </article>
  );
}
