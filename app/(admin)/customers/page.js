"use client";

import { useCallback, useMemo, useState } from "react";
import { Popover } from "@base-ui/react/popover";
import {
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  RotateCw,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { DataTableWrapper } from "@/components/common/datatable/data-table-wrapper";
import { getCustomerColumns } from "@/components/customer/customer-columns";
import { normalizeCustomersResponse } from "@/components/customer/customer-utils";
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
  useBanCustomer,
  useCustomers,
  useUnbanCustomer,
} from "@/hooks/admin/module/use-customers";
import { cn } from "@/lib/utils";
import { useCustomerStore } from "@/store/customer-store";

const DEFAULT_BANNED_UNTIL = "2026-12-31 23:59:59";
const ORDER_RANGE_OPTIONS = [
  { label: "1 - 10", value: "1-10", min: "1", max: "10" },
  { label: "11 - 25", value: "11-25", min: "11", max: "25" },
  { label: "25 - 50", value: "25-50", min: "25", max: "50" },
  { label: "50 - 100", value: "50-100", min: "50", max: "100" },
];

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

function RegisterDateRangePicker({ from, to, onRangeChange }) {
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
      <span className="text-xs font-medium text-muted-foreground">Register Date</span>
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
                  onClick={() => setVisibleMonth((month) => addCalendarMonths(month, -1))}
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
                  onClick={() => setVisibleMonth((month) => addCalendarMonths(month, 1))}
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
                        isSelected && "bg-primary text-primary-foreground hover:bg-primary"
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

export default function CustomersPage() {
  const queryClient = useQueryClient();
  const [customerAction, setCustomerAction] = useState(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const {
    search,
    is_banned,
    registered_from,
    registered_to,
    order_range,
    min_orders,
    max_orders,
    offset,
    limit,
    setSearch,
    setFilter,
    setFilters,
    setPagination,
    resetFilters,
  } = useCustomerStore();

  const page = Math.floor(offset / limit) + 1;
  const filters = useMemo(
    () => ({
      search,
      is_banned: is_banned === "all" ? "" : is_banned,
      registered_from,
      registered_to,
      min_orders,
      max_orders,
    }),
    [
      is_banned,
      max_orders,
      min_orders,
      registered_from,
      registered_to,
      search,
    ]
  );

  const { data, isLoading, isFetching, refetch } = useCustomers(page, limit, filters);
  const customers = useMemo(() => normalizeCustomersResponse(data), [data]);
  const totalCount = data?.meta?.total ?? data?.total ?? customers.length;

  const refreshCustomers = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ["customers"] });
    await refetch();
  }, [queryClient, refetch]);

  const { mutate: banCustomer, isPending: isBanningCustomer } = useBanCustomer({
    onSuccess: async (res) => {
      toast.success(res?.message || "User banned successfully");
      await refreshCustomers();
    },
    onError: (error) =>
      toast.error(error?.response?.data?.message || "Ban user failed"),
    onSettled: () => setCustomerAction(null),
  });

  const { mutate: unbanCustomer, isPending: isUnbanningCustomer } = useUnbanCustomer({
    onSuccess: async (res) => {
      toast.success(res?.message || "User unbanned successfully");
      await refreshCustomers();
    },
    onError: (error) =>
      toast.error(error?.response?.data?.message || "Unban user failed"),
    onSettled: () => setCustomerAction(null),
  });

  const handleBanUser = useCallback(
    (customer) => {
      const userId = customer?.id;
      if (!userId) return;

      setCustomerAction({ userId, type: "ban" });
      banCustomer({ userId, banned_until: DEFAULT_BANNED_UNTIL });
    },
    [banCustomer]
  );

  const handleUnbanUser = useCallback(
    (customer) => {
      const userId = customer?.id;
      if (!userId) return;

      setCustomerAction({ userId, type: "unban" });
      unbanCustomer(userId);
    },
    [unbanCustomer]
  );

  const tableLoading = isLoading || isFetching;
  const actionLoading = isBanningCustomer || isUnbanningCustomer;
  const getColumns = useMemo(
    () =>
      getCustomerColumns(tableLoading || actionLoading, {
        onBanUser: handleBanUser,
        onUnbanUser: handleUnbanUser,
        actionUserId: customerAction?.userId,
        actionType: customerAction?.type,
      }),
    [
      actionLoading,
      customerAction?.type,
      customerAction?.userId,
      handleBanUser,
      handleUnbanUser,
      tableLoading,
    ]
  );

  const hasFilters = Boolean(
    search.trim() ||
      is_banned !== "all" ||
      registered_from ||
      registered_to ||
      order_range !== "all" ||
      min_orders ||
      max_orders
  );

  const handleOrderRangeChange = useCallback(
    (value) => {
      const selectedRange = ORDER_RANGE_OPTIONS.find((range) => range.value === value);

      setFilters({
        order_range: value,
        min_orders: selectedRange?.min || "",
        max_orders: selectedRange?.max || "",
      });
    },
    [setFilters]
  );

  return (
    <section>
      <PageHeader
        title="Customers"
        description="View and manage your customer records."
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
            aria-expanded={filtersOpen}
            onClick={() => setFiltersOpen((open) => !open)}
          >
            <ChevronDown
              className={cn(
                "size-4 transition-transform",
                filtersOpen && "rotate-180"
              )}
            />
            Customer Filters
          </button>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={resetFilters}>
              Reset Filters
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFiltersOpen((open) => !open)}
            >
              {filtersOpen ? "Hide" : "Show"}
            </Button>
          </div>
        </div>

        {filtersOpen ? (
          <div className="flex flex-wrap items-end gap-3 border-t p-4">
            <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
              Ban Status
              <Select
                value={is_banned}
                onValueChange={(value) => setFilter("is_banned", value)}
              >
                <SelectTrigger className="w-[150px] bg-white">
                  <SelectValue placeholder="All users" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="0">Active</SelectItem>
                  <SelectItem value="1">Banned</SelectItem>
                </SelectContent>
              </Select>
            </label>

            <RegisterDateRangePicker
              from={registered_from}
              to={registered_to}
              onRangeChange={({ from, to }) =>
                setFilters({
                  registered_from: from,
                  registered_to: to,
                })
              }
            />

            <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
              Orders
              <Select value={order_range} onValueChange={handleOrderRangeChange}>
                <SelectTrigger className="w-[150px] bg-white">
                  <SelectValue placeholder="All orders" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {ORDER_RANGE_OPTIONS.map((range) => (
                    <SelectItem key={range.value} value={range.value}>
                      {range.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </label>
          </div>
        ) : null}
      </div>

      {!tableLoading && customers.length === 0 && !hasFilters ? (
        <EmptyState
          title="No customers yet"
          description="Customer records will appear here once available."
        />
      ) : (
        <DataTableWrapper
          offset={offset}
          limit={limit}
          total={totalCount}
          search={search}
          data={customers}
          isLoading={tableLoading}
          getColumns={getColumns}
          onSearchAction={setSearch}
          onPageChangeAction={(newOffset, newLimit) => {
            setPagination({ offset: newOffset, limit: newLimit });
          }}
        />
      )}
    </section>
  );
}
