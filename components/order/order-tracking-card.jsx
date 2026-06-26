"use client";

import { useState } from "react";
import {
  Bike,
  Check,
  CircleCheckBig,
  Clock,
  Copy,
  ExternalLink,
  Package,
  PackageCheck,
  PackageX,
  Truck,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  formatDateTime,
  formatLabel,
  getOrderDeliveryStatus,
  getOrderWaybill,
} from "./order-utils";

const TRACKING_STEPS = [
  { key: "pending", label: "Pending", icon: Clock },
  { key: "processing", label: "Processing", icon: Package },
  { key: "picked_up", label: "Picked Up", icon: PackageCheck },
  { key: "in_transit", label: "In Transit", icon: Truck },
  { key: "out_for_delivery", label: "Out for Delivery", icon: Bike },
  { key: "delivered", label: "Delivered", icon: CircleCheckBig },
];

const STATUS_TO_STEP = {
  // Pending
  pending: "pending",
  not_created: "pending",
  created: "pending",

  // Processing
  processing: "processing",
  confirmed: "processing",
  manifested: "processing",
  pickup_scheduled: "processing",
  pickup_pending: "processing",
  not_picked: "processing",
  scheduled: "processing",
  booked: "processing",

  // Picked Up
  picked_up: "picked_up",
  pickup_complete: "picked_up",

  // In Transit
  shipped: "in_transit",
  in_transit: "in_transit",
  bagged: "in_transit",
  dispatched: "in_transit",
  received_at_hub: "in_transit",
  shipment_received_at_facility: "in_transit",
  reached_destination_hub: "in_transit",
  arrived_at_destination_hub: "in_transit",

  // Out for Delivery
  out_for_delivery: "out_for_delivery",

  // Delivered
  delivered: "delivered",

  // Cancelled
  cancelled: "cancelled",
  shipment_cancelled: "cancelled",
};

function normalizeStatusKey(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
}

function resolveTrackingState(order) {
  const rawStatus = getOrderDeliveryStatus(order);
  const orderStatus = order?.status;
  const mappedStep =
    STATUS_TO_STEP[normalizeStatusKey(rawStatus)] ??
    STATUS_TO_STEP[normalizeStatusKey(orderStatus)];

  const isCancelled =
    normalizeStatusKey(orderStatus) === "cancelled" ||
    mappedStep === "cancelled";

  const currentKey = mappedStep && mappedStep !== "cancelled" ? mappedStep : "pending";
  const currentIndex = TRACKING_STEPS.findIndex((step) => step.key === currentKey);

  return {
    isCancelled,
    currentIndex: currentIndex < 0 ? 0 : currentIndex,
    currentKey,
    rawStatus,
  };
}

function CancelledState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
      <span className="flex size-14 items-center justify-center rounded-full bg-red-50 text-red-500">
        <PackageX className="size-7" />
      </span>
      <p className="text-base font-semibold text-red-600">
        This order has been cancelled.
      </p>
    </div>
  );
}

function TrackingTimeline({ currentIndex, currentKey }) {
  const isDelivered = currentKey === "delivered";

  return (
    <ol className="relative">
      {TRACKING_STEPS.map((step, index) => {
        const StepIcon = step.icon;
        const isLast = index === TRACKING_STEPS.length - 1;
        const isCompleted =
          index < currentIndex || (index === currentIndex && isDelivered);
        const isCurrent = index === currentIndex && !isDelivered;
        const isConnectorActive = index < currentIndex;

        return (
          <li key={step.key} className="relative flex gap-4 pb-7 last:pb-0">
            {!isLast ? (
              <span
                aria-hidden
                className={cn(
                  "absolute left-[17px] top-9 h-[calc(100%-1.75rem)] w-0.5 rounded-full",
                  isConnectorActive ? "bg-green-500" : "bg-gray-200"
                )}
              />
            ) : null}

            <span className="relative flex size-9 shrink-0 items-center justify-center">
              {isCurrent ? (
                <span
                  aria-hidden
                  className="absolute inline-flex size-9 animate-ping rounded-full bg-amber-400/40"
                />
              ) : null}
              <span
                className={cn(
                  "relative z-10 flex size-9 items-center justify-center rounded-full border-2 transition-colors",
                  isCompleted && "border-green-500 bg-green-500 text-white",
                  isCurrent &&
                    "border-amber-400 bg-amber-400 text-white shadow-sm",
                  !isCompleted &&
                    !isCurrent &&
                    "border-gray-300 bg-white text-gray-400"
                )}
              >
                <StepIcon className="size-[18px]" strokeWidth={2.2} />
                {isCompleted && !isDelivered ? (
                  <span className="absolute -bottom-0.5 -right-0.5 flex size-3.5 items-center justify-center rounded-full bg-green-600 ring-2 ring-white">
                    <Check className="size-2.5 text-white" strokeWidth={3.5} />
                  </span>
                ) : null}
              </span>
            </span>

            <div className="flex min-h-8 flex-col justify-center">
              <span
                className={cn(
                  "text-sm leading-tight",
                  isCurrent
                    ? "font-semibold text-foreground"
                    : isCompleted
                      ? "font-medium text-foreground"
                      : "text-muted-foreground"
                )}
              >
                {step.label}
              </span>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function ShipmentInfoRow({ label, value, mono = false }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <span
        className={cn(
          "text-right text-sm font-medium text-foreground [overflow-wrap:anywhere]",
          mono && "font-mono text-xs"
        )}
      >
        {value || "-"}
      </span>
    </div>
  );
}

function StatusBadge({ isCancelled, isDelivered, isCurrent, label }) {
  const tone = isCancelled
    ? "bg-red-50 text-red-600 ring-red-100"
    : isDelivered
      ? "bg-green-50 text-green-600 ring-green-100"
      : "bg-amber-50 text-amber-600 ring-amber-100";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1",
        tone
      )}
    >
      <span
        className={cn(
          "size-1.5 rounded-full",
          isCancelled
            ? "bg-red-500"
            : isDelivered
              ? "bg-green-500"
              : "bg-amber-500",
          isCurrent && !isDelivered && !isCancelled && "animate-pulse"
        )}
      />
      {label}
    </span>
  );
}

function CopyableValue({ value, label }) {
  const [copied, setCopied] = useState(false);

  if (!value) {
    return <span className="text-sm font-medium text-foreground">-</span>;
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success(`${label} copied`);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Failed to copy");
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="group inline-flex items-center gap-1.5 font-mono text-sm font-medium text-foreground transition-colors hover:text-primary"
    >
      <span className="[overflow-wrap:anywhere]">{value}</span>
      {copied ? (
        <Check className="size-3.5 text-green-500" />
      ) : (
        <Copy className="size-3.5 text-muted-foreground transition-colors group-hover:text-primary" />
      )}
    </button>
  );
}

export function OrderTrackingModal({ open, onOpenChange, order, trackingState }) {
  const resolvedState = trackingState ?? resolveTrackingState(order);
  const { isCancelled, currentIndex, currentKey, rawStatus } = resolvedState;
  const isDelivered = currentKey === "delivered";
  const trackingUrl = order?.shipment?.courier_tracking_url;
  const courier = order?.shipment?.provider;
  const trackingNumber = getOrderWaybill(order);
  const lastUpdated =
    order?.shipment?.updated_at ||
    order?.shipment?.last_status_update ||
    order?.updated_at;
  const statusLabel =
    formatLabel(rawStatus) !== "-"
      ? formatLabel(rawStatus)
      : formatLabel(currentKey);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-h-[90vh] gap-0 overflow-hidden p-0 sm:max-w-lg"
      >
        <div className="relative overflow-hidden bg-gradient-to-br from-[#1f1a17] to-[#3a2f29] px-6 pb-6 pt-7 text-white">
          <DialogClose
            aria-label="Close"
            className="absolute right-3 top-3 z-10 flex size-8 items-center justify-center rounded-full bg-white/10 text-white outline-none ring-1 ring-white/20 backdrop-blur transition-colors hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-white/60"
          >
            <X className="size-4" />
          </DialogClose>

          <div className="flex items-start gap-3 pr-10">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15 backdrop-blur">
              <Truck className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <DialogHeader className="gap-1">
                <DialogTitle className="text-lg font-semibold text-white">
                  Track Package
                </DialogTitle>
                <DialogDescription className="text-sm text-white/70">
                  {order?.order_number
                    ? `Order ${order.order_number}`
                    : "Real-time shipment status"}
                </DialogDescription>
              </DialogHeader>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <StatusBadge
              isCancelled={isCancelled}
              isDelivered={isDelivered}
              isCurrent
              label={isCancelled ? "Cancelled" : statusLabel}
            />
            {lastUpdated ? (
              <span className="inline-flex items-center gap-1.5 text-xs text-white/60">
                <Clock className="size-3.5" />
                {formatDateTime(lastUpdated)}
              </span>
            ) : null}
          </div>
        </div>

        <div className="max-h-[calc(90vh-9rem)] overflow-y-auto px-6 py-5">
          {isCancelled ? (
            <CancelledState />
          ) : (
            <>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-[#E5E7EB] bg-muted/30 p-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Courier Partner
                  </p>
                  <p className="mt-1 text-sm font-medium text-foreground">
                    {formatLabel(courier)}
                  </p>
                </div>
                <div className="rounded-xl border border-[#E5E7EB] bg-muted/30 p-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Tracking Number
                  </p>
                  <div className="mt-1">
                    <CopyableValue
                      value={trackingNumber}
                      label="Tracking number"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Shipment Progress
                </p>
                <TrackingTimeline
                  currentIndex={currentIndex}
                  currentKey={currentKey}
                />
              </div>

              {trackingUrl ? (
                <button
                  type="button"
                  onClick={() =>
                    window.open(trackingUrl, "_blank", "noopener,noreferrer")
                  }
                  className="mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-full bg-black text-sm font-medium text-white transition-opacity hover:opacity-90"
                >
                  <ExternalLink className="size-4" />
                  View on Courier Website
                </button>
              ) : null}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function OrderTrackingCard({ order }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const trackingState = resolveTrackingState(order);
  const { isCancelled, currentIndex, currentKey, rawStatus } = trackingState;
  const courier = order?.shipment?.provider;
  const trackingNumber = getOrderWaybill(order);
  const lastUpdated =
    order?.shipment?.updated_at ||
    order?.shipment?.last_status_update ||
    order?.updated_at;

  return (
    <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
      <div className="mb-5">
        <h3 className="text-lg font-semibold text-foreground">Track Order</h3>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Follow your shipment status.
        </p>
      </div>

      {isCancelled ? (
        <CancelledState />
      ) : (
        <>
          <TrackingTimeline currentIndex={currentIndex} currentKey={currentKey} />

          <div className="mt-6 divide-y divide-[#E5E7EB] border-t border-[#E5E7EB]">
            <ShipmentInfoRow
              label="Courier Partner"
              value={formatLabel(courier)}
            />
            <ShipmentInfoRow
              label="Tracking Number"
              value={trackingNumber}
              mono
            />
            <ShipmentInfoRow
              label="Current Status"
              value={formatLabel(rawStatus) || formatLabel(currentKey)}
            />
            <ShipmentInfoRow
              label="Last Updated"
              value={formatDateTime(lastUpdated)}
            />
          </div>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-full bg-black text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            <Truck className="size-4" />
            Track Package
          </button>
        </>
      )}

      <OrderTrackingModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        order={order}
        trackingState={trackingState}
      />
    </div>
  );
}
