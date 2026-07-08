"use client";

import { useEffect, useState } from "react";
import { Popover } from "@base-ui/react/popover";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { formatDateValue, parseDateValue } from "./mobile-order-utils";

function addCalendarMonths(date, amount) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
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

function MobileDateRangePicker({ from, to, onRangeChange }) {
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

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger className="flex h-11 w-full items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 text-left text-sm shadow-xs">
        <CalendarDays className="size-4 text-muted-foreground" />
        <span className={cn("truncate", !from && "text-muted-foreground")}>
          {rangeLabel}
        </span>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner sideOffset={6} className="z-[60]">
          <Popover.Popup className="w-[310px] rounded-xl border bg-popover p-3 text-popover-foreground shadow-md">
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
                      "flex size-9 items-center justify-center rounded-md text-sm transition-colors hover:bg-accent",
                      day.getMonth() !== visibleMonth.getMonth() &&
                        "text-muted-foreground/50",
                      isInRange && "bg-accent",
                      isSelected && "bg-primary text-primary-foreground"
                    )}
                  >
                    {day.getDate()}
                  </button>
                );
              })}
            </div>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}

function FilterField({ label, children }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      {children}
    </label>
  );
}

export function MobileFilterSheet({
  open,
  onOpenChange,
  mode = "order",
  filters,
  onApply,
  onReset,
}) {
  const [draftFilters, setDraftFilters] = useState(filters);

  useEffect(() => {
    if (open) {
      setDraftFilters(filters);
    }
  }, [filters, open]);

  const updateDraft = (key, value) => {
    setDraftFilters((current) => ({ ...current, [key]: value }));
  };

  const handleApply = () => {
    onApply(draftFilters);
    onOpenChange(false);
  };

  const handleReset = () => {
    onReset();
    onOpenChange(false);
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader>
          <DrawerTitle>Filters</DrawerTitle>
        </DrawerHeader>

        <div className="space-y-4 overflow-y-auto px-4 pb-2">
          {mode === "order" ? (
            <>
              <FilterField label="Date Range">
                <MobileDateRangePicker
                  from={draftFilters.shipment_created_from}
                  to={draftFilters.shipment_created_to}
                  onRangeChange={({ from, to }) =>
                    setDraftFilters((current) => ({
                      ...current,
                      shipment_created_from: from,
                      shipment_created_to: to,
                    }))
                  }
                />
              </FilterField>

              <FilterField label="Payment Status">
                <Select
                  value={draftFilters.payment_status || "all"}
                  onValueChange={(value) => updateDraft("payment_status", value)}
                >
                  <SelectTrigger className="h-11 w-full rounded-xl bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {filters.paymentStatusOptions?.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FilterField>

              <FilterField label="Order Status">
                <Select
                  value={draftFilters.status || "all"}
                  onValueChange={(value) => updateDraft("status", value)}
                >
                  <SelectTrigger className="h-11 w-full rounded-xl bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {filters.orderStatusOptions?.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FilterField>

              <FilterField label="Delivery Status">
                <Select
                  value={draftFilters.shipping_status || "all"}
                  onValueChange={(value) => updateDraft("shipping_status", value)}
                >
                  <SelectTrigger className="h-11 w-full rounded-xl bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {filters.shippingStatusOptions?.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FilterField>
            </>
          ) : (
            <>
              <FilterField label="Date Range">
                <MobileDateRangePicker
                  from={draftFilters.date_from}
                  to={draftFilters.date_to}
                  onRangeChange={({ from, to }) =>
                    setDraftFilters((current) => ({
                      ...current,
                      date_from: from,
                      date_to: to,
                    }))
                  }
                />
              </FilterField>

              <FilterField label="Payment Method">
                <Select
                  value={draftFilters.payment_method || "all"}
                  onValueChange={(value) => updateDraft("payment_method", value)}
                >
                  <SelectTrigger className="h-11 w-full rounded-xl bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="cod">COD</SelectItem>
                    <SelectItem value="online">Online</SelectItem>
                  </SelectContent>
                </Select>
              </FilterField>

              <FilterField label="Return Status">
                <Select
                  value={draftFilters.status || "all"}
                  onValueChange={(value) => updateDraft("status", value)}
                >
                  <SelectTrigger className="h-11 w-full rounded-xl bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {filters.returnStatusOptions?.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FilterField>
            </>
          )}
        </div>

        <DrawerFooter className="flex-row gap-2">
          <Button
            type="button"
            variant="outline"
            className="h-11 flex-1 rounded-xl"
            onClick={handleReset}
          >
            Reset
          </Button>
          <Button
            type="button"
            className="h-11 flex-1 rounded-xl"
            onClick={handleApply}
          >
            Apply
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
