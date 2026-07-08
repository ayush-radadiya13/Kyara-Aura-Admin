"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Download, Filter, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { BULK_LABEL_DOWNLOAD_LIMIT } from "@/components/order/order-columns";
import {
  hasOrderWaybill,
  normalizeOrderId,
  persistDownloadedLabelOrderIds,
  readDownloadedLabelOrderIds,
} from "@/components/order/order-utils";
import {
  useBulkDownloadOrderShipmentLabels,
  useDownloadOrderShipmentLabel,
} from "@/hooks/admin/module/use-orders";
import {
  ORDER_STATUS_OPTIONS,
  PAYMENT_STATUS_OPTIONS,
  SHIPPING_STATUS_OPTIONS,
  MOBILE_PAGE_SIZE,
} from "@/components/mobile-orders/mobile-order-constants";
import { MobileFilterSheet } from "@/components/mobile-orders/mobile-filter-sheet";
import { MobileAppHeader } from "@/components/mobile-orders/mobile-app-header";
import { MobileOrderListSkeleton } from "@/components/mobile-orders/mobile-order-card-skeleton";
import { getOrderCardPaymentBadge } from "@/components/mobile-orders/mobile-order-status";
import {
  getOrderDateKey,
  groupItemsByDate,
} from "@/components/mobile-orders/mobile-order-utils";
import { useInfiniteList } from "@/components/mobile-orders/use-infinite-list";
import { MobileHorizontalDateStrip } from "./mobile-horizontal-date-strip";
import { MobileSelectableOrderCard } from "./mobile-selectable-order-card";
import { MOBILE_APP_BOTTOM_NAV_OFFSET } from "./mobile-app-bottom-nav";
import { useCombinedOrders } from "./use-combined-orders";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function getDownloadableOrderIds(orders) {
  return orders
    .filter((order) => hasOrderWaybill(order))
    .map((order) => Number(order.id))
    .filter(Boolean)
    .slice(0, BULK_LABEL_DOWNLOAD_LIMIT);
}

export function MobileAppOrdersPanel() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("all");
  const [paymentStatus, setPaymentStatus] = useState("all");
  const [shippingStatus, setShippingStatus] = useState("all");
  const [shipmentCreatedFrom, setShipmentCreatedFrom] = useState("");
  const [shipmentCreatedTo, setShipmentCreatedTo] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [downloadingOrderId, setDownloadingOrderId] = useState(null);
  const [selectedOrderIds, setSelectedOrderIds] = useState([]);
  const [activeDateKey, setActiveDateKey] = useState(null);
  const [downloadedLabelOrderIds, setDownloadedLabelOrderIds] = useState(
    readDownloadedLabelOrderIds
  );

  const filters = useMemo(
    () => ({
      search: "",
      status,
      payment_status: paymentStatus,
      shipping_status: shippingStatus,
      shipment_created_from: shipmentCreatedFrom,
      shipment_created_to: shipmentCreatedTo,
    }),
    [
      paymentStatus,
      shipmentCreatedFrom,
      shipmentCreatedTo,
      shippingStatus,
      status,
    ]
  );

  const resetKey = JSON.stringify(filters);

  useEffect(() => {
    setPage(1);
    setSelectedOrderIds([]);
  }, [resetKey]);

  const { orders, totalCount, isLoading, isFetching, refetch } = useCombinedOrders(
    page,
    MOBILE_PAGE_SIZE,
    filters
  );

  const {
    accumulatedItems,
    hasMore,
    isInitialLoading,
    isLoadingMore,
  } = useInfiniteList({
    items: orders,
    totalCount,
    page,
    isLoading,
    isFetching,
    onLoadMore: () => setPage((current) => current + 1),
    resetKey,
  });

  const groups = useMemo(
    () => groupItemsByDate(accumulatedItems, getOrderDateKey),
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

  const refreshOrderData = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ["orders"] });
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

  const handleToggleSelect = useCallback((order) => {
    const orderId = Number(order?.id);
    if (!orderId || !hasOrderWaybill(order)) return;

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
      toast.error("Select at least one order to download stickers");
      return;
    }

    bulkDownloadOrderShipmentLabels(selectedOrderIds);
  }, [bulkDownloadOrderShipmentLabels, selectedOrderIds]);

  const handleDownloadSticker = useCallback(
    (order) => {
      const orderId = order?.id;
      if (!orderId) return;

      setDownloadingOrderId(orderId);
      downloadOrderShipmentLabel(orderId);
    },
    [downloadOrderShipmentLabel]
  );

  const handleViewDetails = useCallback(
    (order) => {
      const orderId = order?.id;
      if (!orderId) return;
      router.push(`/mobile-orders/${orderId}`);
    },
    [router]
  );

  const handleResetFilters = useCallback(() => {
    setStatus("all");
    setPaymentStatus("all");
    setShippingStatus("all");
    setShipmentCreatedFrom("");
    setShipmentCreatedTo("");
  }, []);

  return (
    <>
      <MobileAppHeader
        title="Orders"
        subtitle={`All payments · ${totalCount} order${totalCount === 1 ? "" : "s"}`}
        onRefresh={refreshOrderData}
        isRefreshing={isFetching && page === 1}
      />

      {isInitialLoading ? (
        <MobileOrderListSkeleton count={4} />
      ) : !groups.length ? (
        <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
          <h3 className="text-lg font-semibold text-gray-900">No Orders Found</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            COD and online orders will appear here together.
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
                  : `Showing ${activeGroup?.items.length || 0} orders`}
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
              {activeGroup?.items.map((order) => {
                const orderId = normalizeOrderId(order.id);
                const numericOrderId = Number(order.id);
                const canSelect = hasOrderWaybill(order);

                return (
                  <MobileSelectableOrderCard
                    key={order.id}
                    item={order}
                    orderNumber={order.order_number}
                    amount={order.total_amount}
                    createdAt={order.created_at}
                    statusBadges={getOrderCardPaymentBadge(order)}
                    isDownloaded={downloadedLabelOrderIds.includes(orderId)}
                    isDownloading={downloadingOrderId === order.id}
                    canDownloadSticker={canSelect}
                    isSelectable={canSelect}
                    isSelected={selectedOrderIds.includes(numericOrderId)}
                    onToggleSelect={() => handleToggleSelect(order)}
                    onView={() => handleViewDetails(order)}
                    onDownloadSticker={() => handleDownloadSticker(order)}
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
                  Load more orders
                </Button>
              </div>
            ) : null}
          </div>
        </>
      )}

      <button
        type="button"
        aria-label="Open filters"
        onClick={() => setIsFilterOpen(true)}
        className={cn(
          "fixed right-4 z-40 flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/25 transition-transform active:scale-95"
        )}
        style={{ bottom: `calc(${MOBILE_APP_BOTTOM_NAV_OFFSET} + 1rem)` }}
      >
        <Filter className="size-5" />
      </button>

      <MobileFilterSheet
        open={isFilterOpen}
        onOpenChange={setIsFilterOpen}
        mode="order"
        filters={{
          status,
          payment_status: paymentStatus,
          shipping_status: shippingStatus,
          shipment_created_from: shipmentCreatedFrom,
          shipment_created_to: shipmentCreatedTo,
          orderStatusOptions: ORDER_STATUS_OPTIONS,
          paymentStatusOptions: PAYMENT_STATUS_OPTIONS,
          shippingStatusOptions: SHIPPING_STATUS_OPTIONS,
        }}
        onApply={(nextFilters) => {
          setStatus(nextFilters.status || "all");
          setPaymentStatus(nextFilters.payment_status || "all");
          setShippingStatus(nextFilters.shipping_status || "all");
          setShipmentCreatedFrom(nextFilters.shipment_created_from || "");
          setShipmentCreatedTo(nextFilters.shipment_created_to || "");
        }}
        onReset={handleResetFilters}
      />
    </>
  );
}
