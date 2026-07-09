"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { BULK_LABEL_DOWNLOAD_LIMIT } from "@/components/order/order-columns";
import { OrderDetailsDrawer } from "@/components/order/order-details-drawer";
import {
  hasOrderLabelBeenDownloaded,
  hasOrderWaybill,
  normalizeOrderId,
  persistDownloadedLabelOrderIds,
  readDownloadedLabelOrderIds,
} from "@/components/order/order-utils";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import {
  normalizeOrdersResponse,
  useBulkDownloadOrderShipmentLabels,
  useCancelOrderShipment,
  useDownloadOrderShipmentLabel,
  useOrderDetails,
  useOrders,
} from "@/hooks/admin/module/use-orders";
import { useOrderStore } from "@/store/order-store";
import {
  ORDER_STATUS_OPTIONS,
  PAYMENT_STATUS_OPTIONS,
  SHIPPING_STATUS_OPTIONS,
  MOBILE_PAGE_SIZE,
} from "./mobile-order-constants";
import { MobileFilterSheet } from "./mobile-filter-sheet";
import { MobileAppHeader } from "./mobile-app-header";
import { MobileFilterFab, MobileOrdersList } from "./mobile-orders-list";
import {
  MobilePaymentFooter,
} from "./mobile-payment-footer";
import { MobileSearchBar } from "./mobile-search-bar";
import { MobileStatusChips } from "./mobile-status-chips";
import { getOrderCardPaymentBadge } from "./mobile-order-status";
import { getOrderDateKey, groupItemsByDate } from "./mobile-order-utils";
import { useInfiniteList } from "./use-infinite-list";

const ORDER_TYPE_LABELS = {
  cod: "Cash on Delivery",
  online: "Online Payment",
};

const ORDER_FILTER_QUERY_KEYS = [
  "search",
  "status",
  "payment_status",
  "shipping_status",
  "shipment_created_from",
  "shipment_created_to",
];

function getValidOrderType(type) {
  return Object.keys(ORDER_TYPE_LABELS).includes(type) ? type : undefined;
}

function getFiltersFromSearchParams(searchParams) {
  const filters = {};

  ORDER_FILTER_QUERY_KEYS.forEach((key) => {
    const value = searchParams.get(key);
    if (value !== null) filters[key] = value;
  });

  return Object.keys(filters).length > 0 ? filters : null;
}

function getDownloadableOrderIds(orders) {
  return orders
    .filter((order) => hasOrderWaybill(order))
    .map((order) => Number(order.id))
    .filter(Boolean)
    .slice(0, BULK_LABEL_DOWNLOAD_LIMIT);
}

export function MobileOrdersPage() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const orderType = getValidOrderType(searchParams.get("type")) || "cod";
  const orderTypeLabel = ORDER_TYPE_LABELS[orderType];

  const [page, setPage] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState(null);
  const [shipmentAction, setShipmentAction] = useState(null);
  const [downloadingOrderId, setDownloadingOrderId] = useState(null);
  const [downloadingDateKey, setDownloadingDateKey] = useState(null);
  const [isDownloadingVisible, setIsDownloadingVisible] = useState(false);
  const [downloadedLabelOrderIds, setDownloadedLabelOrderIds] = useState(
    readDownloadedLabelOrderIds
  );

  const {
    orderViews,
    setSearch,
    setFilter,
    setFilters,
    resetOrderView,
  } = useOrderStore();

  const currentOrderView = orderViews[orderType] || orderViews.cod;
  const {
    search,
    status,
    payment_status,
    shipping_status,
    shipment_created_from,
    shipment_created_to,
  } = currentOrderView;

  const searchParamsKey = searchParams.toString();
  const activeChip = status || "all";

  useEffect(() => {
    const queryFilters = getFiltersFromSearchParams(searchParams);
    if (queryFilters) {
      setFilters(orderType, queryFilters);
    }
  }, [orderType, searchParamsKey, searchParams, setFilters]);

  const filters = useMemo(
    () => ({
      search,
      status,
      payment_status,
      shipping_status,
      shipment_created_from,
      shipment_created_to,
    }),
    [
      payment_status,
      search,
      shipment_created_from,
      shipment_created_to,
      shipping_status,
      status,
    ]
  );

  const resetKey = `${orderType}-${JSON.stringify(filters)}`;

  useEffect(() => {
    setPage(1);
  }, [resetKey]);

  const { data, isLoading, isFetching, refetch } = useOrders(
    page,
    MOBILE_PAGE_SIZE,
    filters,
    orderType
  );

  const orders = useMemo(() => normalizeOrdersResponse(data), [data]);
  const totalCount = data?.meta?.total ?? data?.total ?? orders.length;

  const {
    accumulatedItems,
    hasMore,
    loadMore,
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

  const {
    data: orderDetails,
    isLoading: isOrderDetailsLoading,
    isFetching: isOrderDetailsFetching,
  } = useOrderDetails(selectedOrder?.id, isDetailsOpen);

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

  const { mutate: bulkDownloadOrderShipmentLabels } =
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
        toast.success("Stickers downloaded");
      },
      onError: (error) =>
        toast.error(
          error?.response?.data?.message || "Bulk sticker download failed"
        ),
      onSettled: () => {
        setDownloadingDateKey(null);
        setIsDownloadingVisible(false);
      },
    });

  const { mutate: cancelOrderShipment, isPending: isCancellingShipment } =
    useCancelOrderShipment({
      onSuccess: async (res, orderId) => {
        toast.success(res?.message || "Order cancelled successfully");
        await queryClient.invalidateQueries({ queryKey: ["orders"] });
        if (orderId) {
          await queryClient.invalidateQueries({ queryKey: ["order", orderId] });
        }
        await refetch();
      },
      onError: (error) =>
        toast.error(error?.response?.data?.message || "Cancel order failed"),
      onSettled: () => {
        setShipmentAction(null);
        setOrderToCancel(null);
      },
    });

  const handleChipChange = useCallback(
    (value) => {
      setFilter(orderType, "status", value);
    },
    [orderType, setFilter]
  );

  const handlePaymentTypeChange = useCallback(
    (type) => {
      if (type === orderType) return;

      const params = new URLSearchParams(searchParams.toString());
      params.set("type", type);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [orderType, pathname, router, searchParams]
  );

  const handleDownloadSticker = useCallback(
    (order) => {
      const orderId = order?.id;
      if (!orderId) return;

      setDownloadingOrderId(orderId);
      downloadOrderShipmentLabel(orderId);
    },
    [downloadOrderShipmentLabel]
  );

  const handleBulkDownload = useCallback(
    (items) => {
      const orderIds = getDownloadableOrderIds(items);

      if (orderIds.length === 0) {
        toast.error("No downloadable stickers found for selected orders");
        setDownloadingDateKey(null);
        setIsDownloadingVisible(false);
        return;
      }

      bulkDownloadOrderShipmentLabels(orderIds);
    },
    [bulkDownloadOrderShipmentLabels]
  );

  const handleDownloadDateStickers = useCallback(
    (items, dateKey) => {
      setDownloadingDateKey(dateKey);
      handleBulkDownload(items);
    },
    [handleBulkDownload]
  );

  const handleDownloadAllVisibleStickers = useCallback(() => {
    setIsDownloadingVisible(true);
    handleBulkDownload(accumulatedItems);
  }, [accumulatedItems, handleBulkDownload]);

  const handleViewDetails = useCallback((order) => {
    setSelectedOrder(order);
    setIsDetailsOpen(true);
  }, []);

  const handleDetailsOpenChange = useCallback((open) => {
    setIsDetailsOpen(open);
    if (!open) setSelectedOrder(null);
  }, []);

  const handleCancelOrder = useCallback((order) => {
    setOrderToCancel(order);
  }, []);

  const handleConfirmCancelOrder = useCallback(() => {
    const orderId = orderToCancel?.id;
    if (!orderId) return;

    setShipmentAction({ orderId, type: "cancel" });
    cancelOrderShipment(orderId);
  }, [cancelOrderShipment, orderToCancel]);

  const renderCardProps = useCallback(
    (order) => {
      const isDownloaded = hasOrderLabelBeenDownloaded(
        order,
        downloadedLabelOrderIds
      );

      return {
        key: order.id,
        orderNumber: order.order_number,
        amount: order.total_amount,
        createdAt: order.created_at,
        statusBadges: getOrderCardPaymentBadge(order),
        isDownloaded,
        isDownloading: downloadingOrderId === order.id,
        canDownloadSticker: hasOrderWaybill(order),
        onView: () => handleViewDetails(order),
        onDownloadSticker: () => handleDownloadSticker(order),
      };
    },
    [
      downloadedLabelOrderIds,
      downloadingOrderId,
      handleDownloadSticker,
      handleViewDetails,
    ]
  );

  const activeOrder = orderDetails || selectedOrder;

  return (
    <div className="relative -mx-4 -mb-4 flex h-[calc(100dvh-4rem)] flex-col overflow-hidden bg-[#f4f6f9] md:hidden">
      <MobileAppHeader
        title="Orders"
        subtitle={`${orderTypeLabel} · ${totalCount} order${totalCount === 1 ? "" : "s"}`}
        onRefresh={refreshOrderData}
        isRefreshing={isFetching && page === 1}
      />

      <div className="flex min-h-0 flex-1 flex-col">
        <MobileSearchBar
          value={search}
          onChange={(value) => setSearch(orderType, value)}
          placeholder="Search by order ID, name, or phone"
        />

        <MobileStatusChips
          chips={ORDER_STATUS_OPTIONS}
          value={activeChip}
          onChange={handleChipChange}
        />

        <MobileOrdersList
          groups={groups}
          isInitialLoading={isInitialLoading}
          isLoadingMore={isLoadingMore}
          hasMore={hasMore}
          onLoadMore={loadMore}
          onRefresh={refreshOrderData}
          isRefreshing={isFetching && page === 1}
          renderCardProps={renderCardProps}
          onDownloadAllVisibleStickers={handleDownloadAllVisibleStickers}
          onDownloadDateStickers={handleDownloadDateStickers}
          isDownloadingVisible={isDownloadingVisible}
          downloadingDateKey={downloadingDateKey}
          contentClassName="pb-[calc(4.5rem+5.5rem+env(safe-area-inset-bottom))]"
        />
      </div>

      <MobilePaymentFooter
        activeType={orderType}
        onTypeChange={handlePaymentTypeChange}
      />

      <MobileFilterFab
        className="bottom-[calc(4.75rem+env(safe-area-inset-bottom))]"
        onClick={() => setIsFilterOpen(true)}
      />

      <MobileFilterSheet
        open={isFilterOpen}
        onOpenChange={setIsFilterOpen}
        mode="order"
        filters={{
          status,
          payment_status,
          shipping_status,
          shipment_created_from,
          shipment_created_to,
          orderStatusOptions: ORDER_STATUS_OPTIONS,
          paymentStatusOptions: PAYMENT_STATUS_OPTIONS,
          shippingStatusOptions: SHIPPING_STATUS_OPTIONS,
        }}
        onApply={(nextFilters) => {
          setFilters(orderType, nextFilters);
        }}
        onReset={() => resetOrderView(orderType)}
      />

      <OrderDetailsDrawer
        open={isDetailsOpen}
        onOpenChange={handleDetailsOpenChange}
        order={activeOrder}
        isLoading={isOrderDetailsLoading || isOrderDetailsFetching}
        onCancelOrder={handleCancelOrder}
        isCancelling={
          isCancellingShipment &&
          shipmentAction?.orderId === activeOrder?.id &&
          shipmentAction?.type === "cancel"
        }
      />

      <ConfirmDialog
        open={Boolean(orderToCancel)}
        onOpenChange={(open) => {
          if (!open && !isCancellingShipment) {
            setOrderToCancel(null);
          }
        }}
        title="Confirm Order Cancellation"
        message={
          orderToCancel
            ? `Are you sure you want to cancel order ${orderToCancel.order_number || orderToCancel.id}?`
            : "Are you sure you want to cancel this order?"
        }
        confirmLabel="Cancel Order"
        confirmVariant="destructive"
        loadingLabel="Cancelling..."
        isLoading={isCancellingShipment}
        onConfirm={handleConfirmCancelOrder}
      />
    </div>
  );
}
