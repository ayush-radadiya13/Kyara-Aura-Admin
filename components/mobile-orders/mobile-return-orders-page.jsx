"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
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
  normalizeReturnOrdersResponse,
  useReturnOrders,
} from "@/hooks/admin/module/use-return-orders";
import {
  useBulkDownloadOrderShipmentLabels,
  useDownloadOrderShipmentLabel,
} from "@/hooks/admin/module/use-orders";
import { useReturnOrderStore } from "@/store/return-order-store";
import {
  MOBILE_PAGE_SIZE,
  RETURN_STATUS_OPTIONS,
} from "./mobile-order-constants";
import { MobileFilterSheet } from "./mobile-filter-sheet";
import { MobileFilterFab, MobileOrdersList } from "./mobile-orders-list";
import { MobileSearchBar } from "./mobile-search-bar";
import { MobileStatusChips } from "./mobile-status-chips";
import { getReturnCardPaymentBadge } from "./mobile-order-status";
import {
  getReturnOrderDateKey,
  groupItemsByDate,
  parseOrderDate,
} from "./mobile-order-utils";
import { useInfiniteList } from "./use-infinite-list";

const RETURN_TYPE_LABELS = {
  cod: "Cash on Delivery",
  online: "Online Payment",
};

const RETURN_FILTER_QUERY_KEYS = ["search", "status"];

function getValidReturnType(type) {
  return Object.keys(RETURN_TYPE_LABELS).includes(type) ? type : undefined;
}

function getFiltersFromSearchParams(searchParams) {
  const filters = {};

  RETURN_FILTER_QUERY_KEYS.forEach((key) => {
    const value = searchParams.get(key);
    if (value !== null) filters[key] = value;
  });

  return Object.keys(filters).length > 0 ? filters : null;
}

function getDownloadableReturnOrderIds(returnOrders) {
  return returnOrders
    .filter((item) => item.order_id && hasOrderWaybill(item))
    .map((item) => Number(item.order_id))
    .filter(Boolean)
    .slice(0, BULK_LABEL_DOWNLOAD_LIMIT);
}

function applyClientReturnFilters(items, clientFilters) {
  const { date_from, date_to, payment_method } = clientFilters;
  const fromDate = date_from ? parseOrderDate(`${date_from}T00:00:00`) : null;
  const toDate = date_to ? parseOrderDate(`${date_to}T23:59:59`) : null;

  return items.filter((item) => {
    if (payment_method && payment_method !== "all") {
      const method = String(item.payment_method || "").toLowerCase();
      if (method !== payment_method) return false;
    }

    if (fromDate || toDate) {
      const requestedAt = parseOrderDate(item.requested_at);
      if (!requestedAt) return false;
      if (fromDate && requestedAt < fromDate) return false;
      if (toDate && requestedAt > toDate) return false;
    }

    return true;
  });
}

export function MobileReturnOrdersPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const returnType = getValidReturnType(searchParams.get("type"));
  const returnTypeLabel = returnType ? RETURN_TYPE_LABELS[returnType] : null;

  const [page, setPage] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [downloadingOrderId, setDownloadingOrderId] = useState(null);
  const [downloadingDateKey, setDownloadingDateKey] = useState(null);
  const [isDownloadingVisible, setIsDownloadingVisible] = useState(false);
  const [clientFilters, setClientFilters] = useState({
    date_from: "",
    date_to: "",
    payment_method: "all",
  });
  const [downloadedLabelOrderIds, setDownloadedLabelOrderIds] = useState(
    readDownloadedLabelOrderIds
  );

  const {
    returnOrderViews,
    setSearch,
    setFilter,
    setFilters,
    resetReturnOrderView,
  } = useReturnOrderStore();

  const activeView = returnOrderViews[returnType] || returnOrderViews.online;
  const { search, status } = activeView;
  const searchParamsKey = searchParams.toString();
  const activeChip = status || "all";

  useEffect(() => {
    if (!returnType) return;

    const urlFilters = getFiltersFromSearchParams(searchParams);
    if (urlFilters) {
      setFilters(returnType, urlFilters);
    }
  }, [returnType, searchParamsKey, searchParams, setFilters]);

  const filters = useMemo(
    () => ({
      search,
      status,
    }),
    [search, status]
  );

  const resetKey = `${returnType}-${JSON.stringify(filters)}`;

  useEffect(() => {
    setPage(1);
  }, [resetKey]);

  const { data, isLoading, isFetching, refetch } = useReturnOrders(
    page,
    MOBILE_PAGE_SIZE,
    filters,
    returnType
  );

  const returnOrders = useMemo(
    () => normalizeReturnOrdersResponse(data),
    [data]
  );
  const totalCount = data?.meta?.total ?? data?.total ?? returnOrders.length;

  const {
    accumulatedItems,
    hasMore,
    loadMore,
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

  const filteredItems = useMemo(
    () => applyClientReturnFilters(accumulatedItems, clientFilters),
    [accumulatedItems, clientFilters]
  );

  const groups = useMemo(
    () => groupItemsByDate(filteredItems, getReturnOrderDateKey),
    [filteredItems]
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

  const handleChipChange = useCallback(
    (value) => {
      setFilter(returnType, "status", value);
    },
    [returnType, setFilter]
  );

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

  const handleBulkDownload = useCallback(
    (items) => {
      const orderIds = getDownloadableReturnOrderIds(items);

      if (orderIds.length === 0) {
        toast.error("No downloadable stickers found for selected returns");
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
    handleBulkDownload(filteredItems);
  }, [filteredItems, handleBulkDownload]);

  const handleViewDetails = useCallback(
    (returnOrder) => {
      const returnRequestId = returnOrder?.return_request_id;
      if (!returnRequestId) return;
      router.push(`/mobile-orders/returns/${returnRequestId}`);
    },
    [router]
  );

  const renderCardProps = useCallback(
    (returnOrder) => {
      const isDownloaded = hasOrderLabelBeenDownloaded(
        returnOrder,
        downloadedLabelOrderIds
      );

      return {
        key: returnOrder.return_request_id || returnOrder.id,
        orderNumber: returnOrder.order_number,
        amount: returnOrder.refund_amount ?? returnOrder.order_total_amount,
        createdAt: returnOrder.requested_at,
        statusBadges: getReturnCardPaymentBadge(returnOrder),
        isDownloaded,
        isDownloading: downloadingOrderId === returnOrder.order_id,
        canDownloadSticker: Boolean(returnOrder.order_id && hasOrderWaybill(returnOrder)),
        onView: () => handleViewDetails(returnOrder),
        onDownloadSticker: () => handleDownloadSticker(returnOrder),
      };
    },
    [
      downloadedLabelOrderIds,
      downloadingOrderId,
      handleDownloadSticker,
      handleViewDetails,
    ]
  );

  if (!returnType) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center px-6 py-16 text-center md:hidden">
        <h3 className="text-lg font-semibold text-gray-900">Choose a return type</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Open Cash on Delivery or Online Payment returns from the sidebar menu.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100dvh-4rem)] flex-col bg-gray-50 md:hidden">
      <div className="border-b border-gray-200 bg-white px-4 py-3">
        <h1 className="text-lg font-semibold text-gray-900">
          {returnTypeLabel} Returns
        </h1>
        <p className="text-xs text-muted-foreground">
          Browse and manage return orders on mobile
        </p>
      </div>

      <MobileSearchBar
        value={search}
        onChange={(value) => setSearch(returnType, value)}
        placeholder="Search by order ID, name, or phone"
      />

      <MobileStatusChips
        chips={RETURN_STATUS_OPTIONS}
        value={activeChip}
        onChange={handleChipChange}
      />

      <MobileOrdersList
        mode="return"
        groups={groups}
        isInitialLoading={isInitialLoading}
        isLoadingMore={isLoadingMore}
        hasMore={hasMore}
        onLoadMore={loadMore}
        onRefresh={refreshReturnOrders}
        isRefreshing={isFetching && page === 1}
        renderCardProps={renderCardProps}
        onDownloadAllVisibleStickers={handleDownloadAllVisibleStickers}
        onDownloadDateStickers={handleDownloadDateStickers}
        isDownloadingVisible={isDownloadingVisible}
        downloadingDateKey={downloadingDateKey}
        emptyTitle="No Return Orders Found"
        emptyDescription="Try adjusting your search or filters."
      />

      <MobileFilterFab onClick={() => setIsFilterOpen(true)} />

      <MobileFilterSheet
        open={isFilterOpen}
        onOpenChange={setIsFilterOpen}
        mode="return"
        filters={{
          status,
          date_from: clientFilters.date_from,
          date_to: clientFilters.date_to,
          payment_method: clientFilters.payment_method,
          returnStatusOptions: RETURN_STATUS_OPTIONS,
        }}
        onApply={(nextFilters) => {
          setFilter(returnType, "status", nextFilters.status || "all");
          setClientFilters({
            date_from: nextFilters.date_from || "",
            date_to: nextFilters.date_to || "",
            payment_method: nextFilters.payment_method || "all",
          });
        }}
        onReset={() => {
          resetReturnOrderView(returnType);
          setClientFilters({
            date_from: "",
            date_to: "",
            payment_method: "all",
          });
        }}
      />
    </div>
  );
}
