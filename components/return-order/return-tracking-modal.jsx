"use client";

import {
  Check,
  CircleCheckBig,
  Clock,
  PackageCheck,
  RotateCcw,
  Truck,
  Warehouse,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { formatDateTime } from "@/components/order/order-utils";
import { RETURN_TRACKING_LABELS, getReturnTrackingStepIndex } from "./return-order-utils";

const RETURN_TRACKING_STEPS = [
  { key: "return_requested", label: RETURN_TRACKING_LABELS[0], icon: RotateCcw },
  { key: "picked_up", label: RETURN_TRACKING_LABELS[1], icon: PackageCheck },
  { key: "in_transit", label: RETURN_TRACKING_LABELS[2], icon: Truck },
  { key: "out_for_delivery", label: RETURN_TRACKING_LABELS[3], icon: Warehouse },
  { key: "delivered", label: RETURN_TRACKING_LABELS[4], icon: CircleCheckBig },
];

function ReturnTrackingTimeline({ currentIndex }) {
  const isCompleted = currentIndex === RETURN_TRACKING_STEPS.length - 1;

  return (
    <ol className="relative">
      {RETURN_TRACKING_STEPS.map((step, index) => {
        const StepIcon = step.icon;
        const isLast = index === RETURN_TRACKING_STEPS.length - 1;
        const stepIsCompleted =
          index < currentIndex || (index === currentIndex && isCompleted);
        const stepIsCurrent = index === currentIndex && !isCompleted;
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
              {stepIsCurrent ? (
                <span
                  aria-hidden
                  className="absolute inline-flex size-9 animate-ping rounded-full bg-amber-400/40"
                />
              ) : null}
              <span
                className={cn(
                  "relative z-10 flex size-9 items-center justify-center rounded-full border-2 transition-colors",
                  stepIsCompleted && "border-green-500 bg-green-500 text-white",
                  stepIsCurrent &&
                    "border-amber-400 bg-amber-400 text-white shadow-sm",
                  !stepIsCompleted &&
                    !stepIsCurrent &&
                    "border-gray-300 bg-white text-gray-400"
                )}
              >
                <StepIcon className="size-[18px]" strokeWidth={2.2} />
                {stepIsCompleted && !isCompleted ? (
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
                  stepIsCurrent
                    ? "font-semibold text-foreground"
                    : stepIsCompleted
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

function ReturnStatusBadge({ isCompleted, label }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1",
        isCompleted
          ? "bg-green-50 text-green-600 ring-green-100"
          : "bg-amber-50 text-amber-600 ring-amber-100"
      )}
    >
      <span
        className={cn(
          "size-1.5 rounded-full",
          isCompleted ? "bg-green-500" : "bg-amber-500 animate-pulse"
        )}
      />
      {label}
    </span>
  );
}

export function ReturnTrackingModal({ open, onOpenChange, returnOrder }) {
  const rawIndex = getReturnTrackingStepIndex(returnOrder);
  const currentIndex = rawIndex < 0 ? 0 : rawIndex;
  const isCompleted = currentIndex === RETURN_TRACKING_STEPS.length - 1;
  const statusLabel = RETURN_TRACKING_STEPS[currentIndex].label;

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
              <RotateCcw className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <DialogHeader className="gap-1">
                <DialogTitle className="text-lg font-semibold text-white">
                  Track Return
                </DialogTitle>
                <DialogDescription className="text-sm text-white/70">
                  {returnOrder?.order_number
                    ? `Order ${returnOrder.order_number}`
                    : "Real-time return status"}
                </DialogDescription>
              </DialogHeader>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <ReturnStatusBadge isCompleted={isCompleted} label={statusLabel} />
            {returnOrder?.requested_at ? (
              <span className="inline-flex items-center gap-1.5 text-xs text-white/60">
                <Clock className="size-3.5" />
                Requested {formatDateTime(returnOrder.requested_at)}
              </span>
            ) : null}
          </div>
        </div>

        <div className="max-h-[calc(90vh-9rem)] overflow-y-auto px-6 py-5">
          <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Return Progress
          </p>
          <ReturnTrackingTimeline currentIndex={currentIndex} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
