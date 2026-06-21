"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Popover } from "@base-ui/react/popover";
import { useSearchParams } from "next/navigation";
import {
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Loader2,
  RotateCw,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { DataTableWrapper } from "@/components/common/datatable/data-table-wrapper";
import { getOrderColumns, BULK_LABEL_DOWNLOAD_LIMIT } from "@/components/order/order-columns";
import { OrderDetailsDrawer } from "@/components/order/order-details-drawer";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  normalizeOrdersResponse,
  useCancelOrderShipment,
  useCreateOrderShipment,
  useBulkDownloadOrderShipmentLabels,
  useDownloadOrderShipmentLabel,
  useOrderDetails,
  useOrders,
} from "@/hooks/admin/module/use-orders";
import { cn } from "@/lib/utils";
import { useOrderStore } from "@/store/order-store";

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

const ORDER_STATUS_OPTIONS = [
  { value: "all", label: "All" },
  { value: "pending_admin_confirmation", label: "Pending Admin Confirmation" },
  { value: "processing", label: "Processing" },
  { value: "confirmed", label: "Confirmed" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

const PAYMENT_STATUS_OPTIONS = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "paid", label: "Paid" },
  { value: "failed", label: "Failed" },
  { value: "refunded", label: "Refunded" },
];

const SHIPPING_STATUS_OPTIONS = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "manifested", label: "Manifested" },
  { value: "pickup_scheduled", label: "Pickup Scheduled" },
  { value: "in_transit", label: "In Transit" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
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

  const perPage = Number(searchParams.get("per_page"));
  if (Number.isFinite(perPage) && perPage > 0) {
    filters.limit = perPage;
  }

  return Object.keys(filters).length > 0 ? filters : null;
}

function addCalendarMonths(date, amount) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

function parseDateValue(value) {
  if (!value) return null;

  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatDateValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatDateLabel(value) {
  const date = parseDateValue(value);
  return date
    ? new Intl.DateTimeFormat("en", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(date)
    : "";
}

function formatMonthLabel(date) {
  return new Intl.DateTimeFormat("en", {
    month: "long",
    year: "numeric",
  }).format(date);
}

function getMonthDays(date) {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  start.setDate(start.getDate() - start.getDay());

  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  end.setDate(end.getDate() + (6 - end.getDay()));

  const days = [];
  const current = new Date(start);

  while (current <= end) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  return days;
}

function isSameCalendarDay(date, otherDate) {
  return (
    date.getFullYear() === otherDate.getFullYear() &&
    date.getMonth() === otherDate.getMonth() &&
    date.getDate() === otherDate.getDate()
  );
}

function isInCalendarRange(date, startDate, endDate) {
  const time = date.getTime();
  const start = Math.min(startDate.getTime(), endDate.getTime());
  const end = Math.max(startDate.getTime(), endDate.getTime());

  return time >= start && time <= end;
}

function FilterSelect({ label, value, onChange, options }) {
  return (
    <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
      {label}
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-[190px] bg-white">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </label>
  );
}

function ShipmentDateRangePicker({ from, to, onRangeChange }) {
  const [open, setOpen] = useState(false);
  const fromDate = parseDateValue(from);
  const toDate = parseDateValue(to);
  const [visibleMonth, setVisibleMonth] = useState(fromDate || new Date());
  const calendarDays = getMonthDays(visibleMonth);
  const weekDays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
  const rangeLabel =
    from && to
      ? `${formatDateLabel(from)} - ${formatDateLabel(to)}`
      : from
        ? `${formatDateLabel(from)} - Select to date`
        : "Select date range";

  const updateRange = (nextFrom, nextTo) => {
    onRangeChange({
      from: nextFrom ? formatDateValue(nextFrom) : "",
      to: nextTo ? formatDateValue(nextTo) : "",
    });
  };

  const handleDaySelect = (day) => {
    if (!fromDate || toDate) {
      updateRange(day, null);
      return;
    }

    if (day < fromDate) {
      updateRange(day, fromDate);
      setOpen(false);
      return;
    }

    updateRange(fromDate, day);
    setOpen(false);
  };

  const clearRange = () => {
    updateRange(null, null);
    setOpen(false);
  };

  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-medium text-muted-foreground">
        Shipment Created
      </span>
      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Trigger className="flex h-10 min-w-[260px] items-center gap-2 rounded-md border bg-white px-3 text-left text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50">
          <CalendarDays className="size-4 text-muted-foreground" />
          <span className={cn("truncate", !from && "text-muted-foreground")}>
            {rangeLabel}
          </span>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Positioner sideOffset={6} className="z-50">
            <Popover.Popup
              initialFocus={false}
              className="w-[310px] rounded-lg border bg-popover p-3 text-popover-foreground shadow-md outline-none"
            >
              <div className="mb-3 flex items-center justify-between">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="size-8"
                  onClick={() =>
                    setVisibleMonth((month) => addCalendarMonths(month, -1))
                  }
                >
                  <ChevronLeft className="size-4" />
                </Button>
                <div className="text-sm font-semibold">
                  {formatMonthLabel(visibleMonth)}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="size-8"
                  onClick={() =>
                    setVisibleMonth((month) => addCalendarMonths(month, 1))
                  }
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>

              <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">
                {weekDays.map((day) => (
                  <div key={day} className="py-1">
                    {day}
                  </div>
                ))}
              </div>
              <div className="mt-1 grid grid-cols-7 gap-1">
                {calendarDays.map((day) => {
                  const isSelected =
                    (fromDate && isSameCalendarDay(day, fromDate)) ||
                    (toDate && isSameCalendarDay(day, toDate));
                  const isInRange =
                    fromDate &&
                    toDate &&
                    isInCalendarRange(day, fromDate, toDate);

                  return (
                    <button
                      key={day.toISOString()}
                      type="button"
                      onClick={() => handleDaySelect(day)}
                      className={cn(
                        "flex size-9 items-center justify-center rounded-md text-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        day.getMonth() !== visibleMonth.getMonth() &&
                          "text-muted-foreground/50",
                        isInRange && "bg-accent text-accent-foreground",
                        isSelected &&
                          "bg-primary text-primary-foreground hover:bg-primary"
                      )}
                    >
                      {day.getDate()}
                    </button>
                  );
                })}
              </div>

              <div className="mt-3 flex items-center justify-between border-t pt-3">
                <div className="text-xs text-muted-foreground">
                  {from ? `From ${formatDateLabel(from)}` : "Select a from date"}
                  {to ? ` to ${formatDateLabel(to)}` : ""}
                </div>
                <Button type="button" variant="outline" size="sm" onClick={clearRange}>
                  Clear
                </Button>
              </div>
            </Popover.Popup>
          </Popover.Positioner>
        </Popover.Portal>
      </Popover.Root>
    </div>
  );
}

export default function OrdersPage() {
  const queryClient = useQueryClient();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [shipmentAction, setShipmentAction] = useState(null);
  const [selectedOrderIds, setSelectedOrderIds] = useState([]);
  const searchParams = useSearchParams();
  const {
    orderViews,
    setSearch,
    setFilter,
    setFilters,
    setPagination,
    resetOrderView,
  } = useOrderStore();

  const orderType = getValidOrderType(searchParams.get("type")) || "cod";
  const orderTypeLabel = ORDER_TYPE_LABELS[orderType];
  const currentOrderView = orderViews[orderType] || orderViews.cod;
  const {
    search,
    status,
    payment_status,
    shipping_status,
    shipment_created_from,
    shipment_created_to,
    offset,
    limit,
  } = currentOrderView;
  const page = Math.floor(offset / limit) + 1;

  const searchParamsKey = searchParams.toString();

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

  const { data, isLoading, isFetching, refetch } = useOrders(
    page,
    limit,
    filters,
    orderType
  );

  const orders = useMemo(() => normalizeOrdersResponse(data), [data]);
  const totalCount = data?.meta?.total ?? data?.total ?? orders.length;

  const {
    data: orderDetails,
    isLoading: isOrderDetailsLoading,
    isFetching: isOrderDetailsFetching,
  } = useOrderDetails(selectedOrder?.id, isDetailsOpen);

  const refreshOrderData = useCallback(
    async (orderId) => {
      await queryClient.invalidateQueries({ queryKey: ["orders"] });

      if (orderId) {
        await queryClient.invalidateQueries({ queryKey: ["order", orderId] });
      }

      await refetch();
    },
    [queryClient, refetch]
  );

  const { mutate: createOrderShipment, isPending: isCreatingShipment } =
    useCreateOrderShipment({
      onSuccess: async (res, orderId) => {
        toast.success(res?.message || "Order confirmed successfully");
        await refreshOrderData(orderId);
      },
      onError: (error) =>
        toast.error(error?.response?.data?.message || "Confirm order failed"),
      onSettled: () => setShipmentAction(null),
    });

  const { mutate: cancelOrderShipment, isPending: isCancellingShipment } =
    useCancelOrderShipment({
      onSuccess: async (res, orderId) => {
        toast.success(res?.message || "Order cancelled successfully");
        await refreshOrderData(orderId);
      },
      onError: (error) =>
        toast.error(error?.response?.data?.message || "Cancel order failed"),
      onSettled: () => setShipmentAction(null),
    });

  const { mutate: downloadOrderShipmentLabel, isPending: isDownloadingLabel } =
    useDownloadOrderShipmentLabel({
      onSuccess: ({ blob, filename }) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      },
      onError: (error) =>
        toast.error(error?.response?.data?.message || "Download label failed"),
      onSettled: () => setShipmentAction(null),
    });

  const {
    mutate: bulkDownloadOrderShipmentLabels,
    isPending: isBulkDownloadingLabels,
  } = useBulkDownloadOrderShipmentLabels({
    onSuccess: ({ blob, filename }) => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Shipment labels downloaded");
      setSelectedOrderIds([]);
    },
    onError: (error) =>
      toast.error(
        error?.response?.data?.message || "Bulk label download failed"
      ),
  });

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setIsDetailsOpen(true);
  };

  const handleConfirmOrder = useCallback(
    (order) => {
      const orderId = order?.id;
      if (!orderId) return;

      setShipmentAction({ orderId, type: "confirm" });
      createOrderShipment(orderId);
    },
    [createOrderShipment]
  );

  const handleCancelOrder = useCallback(
    (order) => {
      const orderId = order?.id;
      if (!orderId) return;

      setShipmentAction({ orderId, type: "cancel" });
      cancelOrderShipment(orderId);
    },
    [cancelOrderShipment]
  );

  const handleDownloadLabel = useCallback(
    (order) => {
      const orderId = order?.id;
      if (!orderId) return;

      setShipmentAction({ orderId, type: "download-label" });
      downloadOrderShipmentLabel(orderId);
    },
    [downloadOrderShipmentLabel]
  );

  const handleToggleOrderSelection = useCallback((order) => {
    const orderId = Number(order?.id);
    if (!orderId) return;

    setSelectedOrderIds((current) => {
      if (current.includes(orderId)) {
        return current.filter((id) => id !== orderId);
      }

      if (current.length >= BULK_LABEL_DOWNLOAD_LIMIT) {
        toast.error(`You can select up to ${BULK_LABEL_DOWNLOAD_LIMIT} orders at once`);
        return current;
      }

      return [...current, orderId];
    });
  }, []);

  const handleBulkDownloadLabels = useCallback(() => {
    if (selectedOrderIds.length === 0) {
      toast.error("Select at least one order to download labels");
      return;
    }

    bulkDownloadOrderShipmentLabels(selectedOrderIds);
  }, [bulkDownloadOrderShipmentLabels, selectedOrderIds]);

  useEffect(() => {
    setSelectedOrderIds([]);
  }, [offset, limit, orderType, searchParamsKey]);

  const handleDetailsOpenChange = (open) => {
    setIsDetailsOpen(open);

    if (!open) {
      setSelectedOrder(null);
    }
  };

  const tableLoading = isLoading || isFetching;
  const actionLoading =
    isCreatingShipment ||
    isCancellingShipment ||
    isDownloadingLabel ||
    isBulkDownloadingLabels;
  const hasFilters = Boolean(
    search.trim() ||
      status !== "all" ||
      payment_status !== "all" ||
      shipping_status !== "all" ||
      shipment_created_from ||
      shipment_created_to
  );
  const getColumns = useMemo(
    () =>
      getOrderColumns(tableLoading || actionLoading, {
        onConfirmOrder: handleConfirmOrder,
        onCancelOrder: handleCancelOrder,
        onDownloadLabel: handleDownloadLabel,
        actionOrderId: shipmentAction?.orderId,
        actionType: shipmentAction?.type,
        selectedOrderIds,
        onToggleOrderSelection: handleToggleOrderSelection,
        bulkSelectionLimit: BULK_LABEL_DOWNLOAD_LIMIT,
      }),
    [
      actionLoading,
      handleCancelOrder,
      handleConfirmOrder,
      handleDownloadLabel,
      handleToggleOrderSelection,
      selectedOrderIds,
      shipmentAction?.orderId,
      shipmentAction?.type,
      tableLoading,
    ]
  );
  const activeOrder = orderDetails || selectedOrder;

  return (
    <section>
      <PageHeader
        title={orderTypeLabel ? `${orderTypeLabel} Orders` : "Orders"}
        description={
          orderTypeLabel
            ? `Track and manage ${orderTypeLabel.toLowerCase()} orders.`
            : "Track and manage customer order activity."
        }
        action={
          <Button variant="outline" size="icon" onClick={() => refetch()}>
            <RotateCw className="size-4" />
          </Button>
        }
      />

      <div className="mb-4 rounded-md border bg-white">
        <div className="flex items-center justify-between gap-3 p-2">
          <button
            type="button"
            className="flex items-center gap-2 text-sm font-semibold"
            aria-expanded={isFiltersOpen}
            onClick={() => setIsFiltersOpen((open) => !open)}
          >
            <ChevronDown
              className={cn(
                "size-4 transition-transform",
                isFiltersOpen && "rotate-180"
              )}
            />
            {orderTypeLabel} Filters
          </button>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => resetOrderView(orderType)}
            >
              Reset Filters
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFiltersOpen((open) => !open)}
            >
              {isFiltersOpen ? "Hide" : "Show"}
            </Button>
          </div>
        </div>

        {isFiltersOpen ? (
          <div className="flex flex-wrap items-end gap-3 border-t p-4">
            <FilterSelect
              label="Order Status"
              value={status}
              onChange={(value) => setFilter(orderType, "status", value)}
              options={ORDER_STATUS_OPTIONS}
            />
            <FilterSelect
              label="Payment Status"
              value={payment_status}
              onChange={(value) => setFilter(orderType, "payment_status", value)}
              options={PAYMENT_STATUS_OPTIONS}
            />
            <FilterSelect
              label="Shipping Status"
              value={shipping_status}
              onChange={(value) => setFilter(orderType, "shipping_status", value)}
              options={SHIPPING_STATUS_OPTIONS}
            />
            <ShipmentDateRangePicker
              from={shipment_created_from}
              to={shipment_created_to}
              onRangeChange={({ from, to }) =>
                setFilters(orderType, {
                  shipment_created_from: from,
                  shipment_created_to: to,
                })
              }
            />
          </div>
        ) : null}
      </div>

      {!tableLoading && orders.length === 0 && !hasFilters ? (
        <EmptyState
          title="No orders yet"
          description="Customer orders will appear here once available."
        />
      ) : (
        <>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3 px-1">
            <p className="text-sm text-muted-foreground">
              {selectedOrderIds.length > 0
                ? `${selectedOrderIds.length} of ${BULK_LABEL_DOWNLOAD_LIMIT} orders selected`
                : `Select orders with waybill to download up to ${BULK_LABEL_DOWNLOAD_LIMIT} labels at once`}
            </p>
            <Button
              onClick={handleBulkDownloadLabels}
              disabled={
                tableLoading ||
                isBulkDownloadingLabels ||
                selectedOrderIds.length === 0
              }
            >
              {isBulkDownloadingLabels ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Download className="size-4" />
              )}
              Download Stickers
              {selectedOrderIds.length > 0 ? ` (${selectedOrderIds.length})` : ""}
            </Button>
          </div>
          <DataTableWrapper
          offset={offset}
          limit={limit}
          total={totalCount}
          search={search}
          data={orders}
          isLoading={tableLoading}
          getColumns={getColumns}
          onSearchAction={(value) => setSearch(orderType, value)}
          onPageChangeAction={(newOffset, newLimit) => {
            setPagination(orderType, { offset: newOffset, limit: newLimit });
          }}
          onEditAction={handleViewDetails}
        />
        </>
      )}

      <OrderDetailsDrawer
        open={isDetailsOpen}
        onOpenChange={handleDetailsOpenChange}
        order={activeOrder}
        isLoading={isOrderDetailsLoading || isOrderDetailsFetching}
      />
    </section>
  );
}
