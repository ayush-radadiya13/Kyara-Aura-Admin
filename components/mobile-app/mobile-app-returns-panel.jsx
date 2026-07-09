"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { BULK_LABEL_DOWNLOAD_LIMIT } from "@/components/order/order-columns";
import {
  hasOrderLabelBeenDownloaded,
  hasOrderWaybill,
  normalizeOrderId,
  persistDownloadedLabelOrderIds,
  readDownloadedLabelOrderIds,
} from "@/components/order/order-utils";
import {
  useBulkDownloadOrderShipmentLabels,
  useDownloadOrderShipmentLabel,
} from "@/hooks/admin/module/use-orders";
import { MobileAppHeader } from "@/components/mobile-orders/mobile-app-header";
import { MobileOrderListSkeleton } from "@/components/mobile-orders/mobile-order-card-skeleton";
import { getReturnCardPaymentBadge } from "@/components/mobile-orders/mobile-order-status";
import {
  getReturnOrderDateKey,
  groupItemsByDate,
} from "@/components/mobile-orders/mobile-order-utils";
import { useInfiniteList } from "@/components/mobile-orders/use-infinite-list";
import { MOBILE_PAGE_SIZE } from "@/components/mobile-orders/mobile-order-constants";
import { MobileHorizontalDateStrip } from "./mobile-horizontal-date-strip";
import { MobileSelectableOrderCard } from "./mobile-selectable-order-card";
import { MOBILE_APP_BOTTOM_NAV_OFFSET } from "./mobile-app-bottom-nav";
import { useCombinedReturnOrders } from "./use-combined-orders";
import { Button } from "@/components/ui/button";

const DEFAULT_FILTERS = { search: "", status: "all" };

function getDownloadableReturnOrderIds(returnOrders) {
  return returnOrders
    .filter((item) => item.order_id && hasOrderWaybill(item))
    .map((item) => Number(item.order_id))
    .filter(Boolean)
    .slice(0, BULK_LABEL_DOWNLOAD_LIMIT);
}

export function MobileAppReturnsPanel() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [downloadingOrderId, setDownloadingOrderId] = useState(null);
  const [selectedOrderIds, setSelectedOrderIds] = useState([]);
  const [activeDateKey, setActiveDateKey] = useState(null);
  const [downloadedLabelOrderIds, setDownloadedLabelOrderIds] = useState(
    readDownloadedLabelOrderIds
  );

  const filters = DEFAULT_FILTERS;
  const resetKey = "returns";

  useEffect(() => {
    setPage(1);
    setSelectedOrderIds([]);
  }, [resetKey]);

  const { returnOrders, totalCount, isLoading, isFetching, refetch } =
    useCombinedReturnOrders(page, MOBILE_PAGE_SIZE, filters);

  const {
    accumulatedItems,
    hasMore,
    isInitialLoading,
    isLoadingMore,
  } = useInfiniteList({
    items: returnOrders,
    totalCount,
    page,
    isLoading,
    isFetching,
    onLoadMore: () => setPage((current) => current + 1),
    resetKey,
  });

  const groups = useMemo(
    () => groupItemsByDate(accumulatedItems, getReturnOrderDateKey),
    [accumulatedItems]
  );

  useEffect(() => {
    if (!groups.length) {
      setActiveDateKey(null);
      return;
    }

    if (!activeDateKey || !groups.some((group) => group.dateKey === activeDateKey)) {
      setActiveDateKey(groups[0].dateKey);
    }
  }, [activeDateKey, groups]);

  const activeGroup = useMemo(
    () => groups.find((group) => group.dateKey === activeDateKey) || null,
    [activeDateKey, groups]
  );

  const markLabelsDownloaded = useCallback((orderIds) => {
    setDownloadedLabelOrderIds((current) => {
      const next = new Set(current);

      orderIds.forEach((id) => {
        const normalizedId = normalizeOrderId(id);
        if (normalizedId) next.add(normalizedId);
      });

      const updated = [...next];
      persistDownloadedLabelOrderIds(updated);
      return updated;
    });
  }, []);

  const refreshReturnOrders = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ["return-orders"] });
    setPage(1);
    await refetch();
  }, [queryClient, refetch]);

  const { mutate: downloadOrderShipmentLabel } = useDownloadOrderShipmentLabel({
    onSuccess: ({ downloadUrl, filename }, orderId) => {
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = filename;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      document.body.appendChild(link);
      link.click();
      link.remove();
      markLabelsDownloaded([orderId]);
      toast.success("Sticker downloaded");
    },
    onError: (error) =>
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Download sticker failed"
      ),
    onSettled: () => setDownloadingOrderId(null),
  });

  const { mutate: bulkDownloadOrderShipmentLabels, isPending: isBulkDownloading } =
    useBulkDownloadOrderShipmentLabels({
      onSuccess: ({ blob, filename }, orderIds) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        markLabelsDownloaded(orderIds);
        setSelectedOrderIds([]);
        toast.success("Stickers downloaded");
      },
      onError: (error) =>
        toast.error(
          error?.response?.data?.message || "Bulk sticker download failed"
        ),
    });

  const handleToggleSelect = useCallback((returnOrder) => {
    const orderId = Number(returnOrder?.order_id);
    if (!orderId || !hasOrderWaybill(returnOrder)) return;

    setSelectedOrderIds((current) => {
      if (current.includes(orderId)) {
        return current.filter((id) => id !== orderId);
      }

      if (current.length >= BULK_LABEL_DOWNLOAD_LIMIT) {
        toast.error(
          `You can select up to ${BULK_LABEL_DOWNLOAD_LIMIT} orders at once`
        );
        return current;
      }

      return [...current, orderId];
    });
  }, []);

  const handleBulkDownload = useCallback(() => {
    if (selectedOrderIds.length === 0) {
      toast.error("Select at least one return to download stickers");
      return;
    }

    bulkDownloadOrderShipmentLabels(selectedOrderIds);
  }, [bulkDownloadOrderShipmentLabels, selectedOrderIds]);

  const handleDownloadSticker = useCallback(
    (returnOrder) => {
      const orderId = returnOrder?.order_id;
      if (!orderId) {
        toast.error("Order ID not available for sticker download");
        return;
      }

      setDownloadingOrderId(orderId);
      downloadOrderShipmentLabel(orderId);
    },
    [downloadOrderShipmentLabel]
  );

  const handleViewDetails = useCallback(
    (returnOrder) => {
      const returnRequestId = returnOrder?.return_request_id;
      if (!returnRequestId) return;
      router.push(`/mobile-orders/returns/${returnRequestId}`);
    },
    [router]
  );

  return (
    <>
      <MobileAppHeader
        title="Return Orders"
        subtitle={`All payments · ${totalCount} return${totalCount === 1 ? "" : "s"}`}
        onRefresh={refreshReturnOrders}
        isRefreshing={isFetching && page === 1}
      />

      {isInitialLoading ? (
        <MobileOrderListSkeleton count={4} />
      ) : !groups.length ? (
        <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
          <h3 className="text-lg font-semibold text-gray-900">
            No Return Orders Found
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            COD and online returns will appear here together.
          </p>
        </div>
      ) : (
        <>
          <MobileHorizontalDateStrip
            groups={groups}
            activeDateKey={activeDateKey}
            onDateChange={setActiveDateKey}
          />

          <div
            className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4"
            style={{ paddingBottom: MOBILE_APP_BOTTOM_NAV_OFFSET }}
          >
            <div className="mb-3 flex items-center justify-between gap-2">
              <p className="text-xs text-muted-foreground">
                {selectedOrderIds.length > 0
                  ? `${selectedOrderIds.length} selected`
                  : `Showing ${activeGroup?.items.length || 0} returns`}
              </p>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-9 rounded-xl"
                disabled={isBulkDownloading || selectedOrderIds.length === 0}
                onClick={handleBulkDownload}
              >
                {isBulkDownloading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Download className="size-4" />
                )}
                Download Stickers
              </Button>
            </div>

            <div className="space-y-3">
              {activeGroup?.items.map((returnOrder) => {
                const orderId = normalizeOrderId(returnOrder.order_id);
                const numericOrderId = Number(returnOrder.order_id);
                const canSelect = Boolean(returnOrder.order_id && hasOrderWaybill(returnOrder));

                return (
                  <MobileSelectableOrderCard
                    key={returnOrder.return_request_id || returnOrder.id}
                    item={returnOrder}
                    mode="return"
                    orderNumber={returnOrder.order_number}
                    amount={returnOrder.refund_amount ?? returnOrder.order_total_amount}
                    createdAt={returnOrder.requested_at}
                    statusBadges={getReturnCardPaymentBadge(returnOrder)}
                    isDownloaded={hasOrderLabelBeenDownloaded(
                      returnOrder,
                      downloadedLabelOrderIds
                    )}
                    isDownloading={downloadingOrderId === returnOrder.order_id}
                    canDownloadSticker={canSelect}
                    isSelectable={canSelect}
                    isSelected={selectedOrderIds.includes(numericOrderId)}
                    onToggleSelect={() => handleToggleSelect(returnOrder)}
                    onView={() => handleViewDetails(returnOrder)}
                    onDownloadSticker={() => handleDownloadSticker(returnOrder)}
                  />
                );
              })}
            </div>

            {hasMore ? (
              <div className="flex justify-center py-6">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-xl"
                  disabled={isLoadingMore}
                  onClick={() => setPage((current) => current + 1)}
                >
                  {isLoadingMore ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : null}
                  Load more returns
                </Button>
              </div>
            ) : null}
          </div>
        </>
      )}
    </>
  );
}
