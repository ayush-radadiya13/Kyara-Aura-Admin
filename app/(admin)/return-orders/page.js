"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ChevronDown, RotateCw } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { DataTableWrapper } from "@/components/common/datatable/data-table-wrapper";
import { getReturnOrderColumns } from "@/components/return-order/return-order-columns";
import { ReturnOrderDetailsDrawer } from "@/components/return-order/return-order-details-drawer";
import { formatCurrency } from "@/components/return-order/return-order-utils";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
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
  normalizeReturnOrdersResponse,
  usePayReturnRefund,
  useReturnOrders,
} from "@/hooks/admin/module/use-return-orders";
import { cn } from "@/lib/utils";
import { useReturnOrderStore } from "@/store/return-order-store";

const RETURN_TYPE_LABELS = {
  cod: "Cash on Delivery",
  online: "Online Payment",
};

const RETURN_FILTER_QUERY_KEYS = ["search", "status"];

import { RETURN_STATUS_OPTIONS } from "@/components/return-order/return-filter-options";

function getValidReturnType(type) {
  return Object.keys(RETURN_TYPE_LABELS).includes(type) ? type : undefined;
}

function getFiltersFromSearchParams(searchParams) {
  const filters = {};

  RETURN_FILTER_QUERY_KEYS.forEach((key) => {
    const value = searchParams.get(key);
    if (value !== null) filters[key] = value;
  });

  const perPage = Number(searchParams.get("per_page"));
  if (Number.isFinite(perPage) && perPage > 0) {
    filters.limit = perPage;
  }

  return Object.keys(filters).length > 0 ? filters : null;
}

function FilterSelect({ label, value, onChange, options }) {
  return (
    <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
      {label}
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-[180px] bg-white">
          <SelectValue placeholder={`All ${label.toLowerCase()}`} />
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

export default function ReturnOrdersPage() {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const returnType = getValidReturnType(searchParams.get("type"));
  const returnTypeLabel = returnType ? RETURN_TYPE_LABELS[returnType] : null;
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [selectedReturnOrder, setSelectedReturnOrder] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [returnOrderToPay, setReturnOrderToPay] = useState(null);

  const {
    returnOrderViews,
    setSearch,
    setFilter,
    setFilters,
    setPagination,
    resetReturnOrderView,
  } = useReturnOrderStore();

  const activeView = returnOrderViews[returnType] || returnOrderViews.online;
  const { search, status, offset, limit } = activeView;

  const searchParamsKey = searchParams.toString();

  useEffect(() => {
    if (!returnType) return;

    const urlFilters = getFiltersFromSearchParams(searchParams);
    if (urlFilters) {
      setFilters(returnType, urlFilters);
    }
  }, [returnType, searchParamsKey, searchParams, setFilters]);

  const page = Math.floor(offset / limit) + 1;
  const filters = useMemo(
    () => ({
      search,
      status,
    }),
    [search, status]
  );

  const { data, isLoading, isFetching, refetch } = useReturnOrders(
    page,
    limit,
    filters,
    returnType
  );

  const returnOrders = useMemo(
    () => normalizeReturnOrdersResponse(data),
    [data]
  );
  const totalCount = data?.meta?.total ?? data?.total ?? returnOrders.length;

  const refreshReturnOrders = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ["return-orders"] });
    await refetch();
  }, [queryClient, refetch]);

  const { mutate: payReturnRefund, isPending: isPayingRefund } = usePayReturnRefund({
    onSuccess: async (res) => {
      toast.success(res?.message || "Refund payment processed successfully");
      await refreshReturnOrders();
    },
    onError: (error) =>
      toast.error(error?.response?.data?.message || "Refund payment failed"),
    onSettled: () => setReturnOrderToPay(null),
  });

  const handleViewDetails = useCallback((returnOrder) => {
    setSelectedReturnOrder(returnOrder);
    setIsDetailsOpen(true);
  }, []);

  const handleDetailsOpenChange = useCallback((open) => {
    setIsDetailsOpen(open);

    if (!open) {
      setSelectedReturnOrder(null);
    }
  }, []);

  const handlePayRefund = useCallback((returnOrder) => {
    setReturnOrderToPay(returnOrder);
  }, []);

  const handleConfirmPayRefund = useCallback(() => {
    const orderId = returnOrderToPay?.order_id;
    const returnRequestId = returnOrderToPay?.return_request_id;
    const isCod =
      String(returnOrderToPay?.payment_method || "").toLowerCase() === "cod";
    const upiTransactionReference = returnOrderToPay?.refund_details?.upi_id;

    if (!orderId || !returnRequestId) {
      toast.error("Missing order or return request details");
      return;
    }

    if (isCod && !upiTransactionReference) {
      toast.error("Missing UPI ID for COD refund");
      return;
    }

    payReturnRefund({
      orderId,
      returnRequestId,
      ...(isCod ? { upiTransactionReference } : {}),
    });
  }, [payReturnRefund, returnOrderToPay]);

  const activeReturnOrder = useMemo(() => {
    if (!selectedReturnOrder) return null;

    return (
      returnOrders.find(
        (item) => item.return_request_id === selectedReturnOrder.return_request_id
      ) || selectedReturnOrder
    );
  }, [returnOrders, selectedReturnOrder]);

  const tableLoading = isLoading || isFetching;
  const hasFilters = Boolean(search.trim() || status !== "all");

  const getColumns = useMemo(
    () =>
      getReturnOrderColumns(tableLoading || isPayingRefund, {
        onPayRefund: handlePayRefund,
        payingReturnRequestId: isPayingRefund
          ? returnOrderToPay?.return_request_id
          : null,
        returnType,
      }),
    [
      handlePayRefund,
      isPayingRefund,
      returnOrderToPay?.return_request_id,
      returnType,
      tableLoading,
    ]
  );

  if (!returnType) {
    return (
      <section>
        <PageHeader
          title="Return Orders"
          description="Select a return type from the sidebar to view return requests."
        />
        <EmptyState
          title="Choose a return type"
          description="Open Cash on Delivery or Online Payment returns from the sidebar menu."
        />
      </section>
    );
  }

  return (
    <section>
      <PageHeader
        title={returnTypeLabel ? `${returnTypeLabel} Returns` : "Return Orders"}
        description={
          returnTypeLabel
            ? `Review and manage ${returnTypeLabel.toLowerCase()} return requests.`
            : "Review and manage customer return requests."
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
            {returnTypeLabel} Return Filters
          </button>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => resetReturnOrderView(returnType)}
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
              label="Return Status"
              value={status}
              onChange={(value) => setFilter(returnType, "status", value)}
              options={RETURN_STATUS_OPTIONS}
            />
          </div>
        ) : null}
      </div>

      {!tableLoading && returnOrders.length === 0 && !hasFilters ? (
        <EmptyState
          title="No return requests yet"
          description="Customer return requests will appear here once submitted."
        />
      ) : (
        <DataTableWrapper
          offset={offset}
          limit={limit}
          total={totalCount}
          search={search}
          data={returnOrders}
          isLoading={tableLoading}
          getColumns={getColumns}
          onSearchAction={(value) => setSearch(returnType, value)}
          onPageChangeAction={(newOffset, newLimit) => {
            setPagination(returnType, { offset: newOffset, limit: newLimit });
          }}
          onEditAction={handleViewDetails}
        />
      )}

      <ReturnOrderDetailsDrawer
        open={isDetailsOpen}
        onOpenChange={handleDetailsOpenChange}
        returnOrder={activeReturnOrder}
        onPayRefund={handlePayRefund}
        isPayingRefund={isPayingRefund}
      />

      <ConfirmDialog
        open={Boolean(returnOrderToPay)}
        onOpenChange={(open) => {
          if (!open && !isPayingRefund) {
            setReturnOrderToPay(null);
          }
        }}
        title="Confirm Refund Payment"
        message={
          returnOrderToPay
            ? `Are you sure you want to pay ${formatCurrency(returnOrderToPay.refund_amount)} refund for order ${returnOrderToPay.order_number || returnOrderToPay.order_id}?`
            : "Are you sure you want to process this refund?"
        }
        confirmLabel="Pay Refund"
        confirmVariant="default"
        loadingLabel="Processing..."
        isLoading={isPayingRefund}
        onConfirm={handleConfirmPayRefund}
      />
    </section>
  );
}
