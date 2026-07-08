"use client";

import { CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/components/order/order-utils";
import { cn } from "@/lib/utils";
import { MobileStatusBadgeGroup } from "./mobile-status-badge";
import {
  formatMobileTime,
  getCustomerName,
  getCustomerPhone,
  getProductCount,
} from "./mobile-order-utils";

export function MobileOrderCard({
  item,
  mode = "order",
  statusBadges = [],
  amount,
  createdAt,
  orderNumber,
  isDownloaded,
  isDownloading,
  canDownloadSticker,
  onView,
  onDownloadSticker,
  className,
}) {
  const productCount = getProductCount(item, mode);

  return (
    <article
      className={cn(
        "animate-in fade-in-0 slide-in-from-bottom-2 rounded-2xl border border-gray-200/80 bg-white p-4 shadow-sm ring-1 ring-black/[0.02] transition-all duration-200 active:scale-[0.995]",
        className
      )}
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Order
            </p>
            <h3 className="text-base font-semibold text-gray-900">
              #{orderNumber || "-"}
            </h3>
          </div>
          <MobileStatusBadgeGroup badges={statusBadges} className="max-w-[55%]" />
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

      <div className="mt-4 space-y-2 border-t border-gray-100 pt-4">
        <Button
          type="button"
          className="h-11 w-full rounded-xl"
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
              className="h-11 w-full rounded-xl border-green-200 bg-green-50 text-green-700"
            >
              <CheckCircle className="size-4" />
              Sticker Downloaded
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              className="h-11 w-full rounded-xl"
              disabled={isDownloading}
              onClick={onDownloadSticker}
            >
              {isDownloading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : null}
              Download Sticker
            </Button>
          )
        ) : null}
      </div>
    </article>
  );
}
