"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Banknote,
  CalendarClock,
  CreditCard,
  ImageIcon,
  IndianRupee,
  Loader2,
  Package,
  RotateCcw,
  Truck,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import {
  getOrderStatusClass,
  getPaymentStatusClass,
  getReturnStatusClass,
} from "@/components/order/order-utils";
import { ReturnTrackingModal } from "@/components/return-order/return-tracking-modal";
import {
  canShowPayRefundButton,
  formatCurrency,
  formatDateTime,
  formatLabel,
  getPaymentMethodClass,
  getReturnRequestStatusClass,
} from "@/components/return-order/return-order-utils";
import {
  usePayReturnRefund,
  useReturnOrderDetails,
} from "@/hooks/admin/module/use-return-orders";
import { cn } from "@/lib/utils";

function MobileSection({ title, icon: Icon, children, className }) {
  return (
    <section
      className={cn(
        "overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm",
        className
      )}
    >
      <div className="flex items-center gap-2 border-b border-gray-100 px-4 py-3">
        {Icon ? <Icon className="size-4 text-primary" /> : null}
        <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}

function DetailRow({ label, value, mono = false }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2">
      <span className="shrink-0 text-sm text-muted-foreground">{label}</span>
      <span
        className={cn(
          "text-right text-sm font-medium text-gray-900 break-words [overflow-wrap:anywhere]",
          mono && "font-mono text-xs"
        )}
      >
        {value || "-"}
      </span>
    </div>
  );
}

function TimelineItem({ label, value, isLast = false }) {
  const hasValue = Boolean(value);

  return (
    <div className={cn("relative flex gap-3", !isLast && "pb-5")}>
      {!isLast ? (
        <span className="absolute left-[7px] top-4 h-full w-px bg-border" />
      ) : null}
      <span
        className={cn(
          "relative z-10 mt-1 size-3.5 shrink-0 rounded-full border-2",
          hasValue
            ? "border-primary bg-primary"
            : "border-muted-foreground/40 bg-background"
        )}
      />
      <div className="min-w-0 flex-1 space-y-0.5">
        <p className="text-sm font-medium text-gray-900">{label}</p>
        <p className="text-sm text-muted-foreground">
          {hasValue ? formatDateTime(value) : "Not yet"}
        </p>
      </div>
    </div>
  );
}

function MobileReturnItemCard({ item }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50/80 p-3">
      <p className="text-sm font-semibold text-gray-900">
        {item.product_name || "-"}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        Item #{item.order_item_id} · Product #{item.product_id}
      </p>
      <div className="mt-2 flex items-center justify-between gap-2 text-sm">
        <span className="text-muted-foreground">
          {item.size_text ? `Size ${item.size_text}` : "Size -"} · Qty{" "}
          {item.quantity ?? "-"}
        </span>
        <span className="font-semibold text-gray-900">
          {formatCurrency(item.refund_amount)}
        </span>
      </div>
    </div>
  );
}

function ProductImagesGallery({ images }) {
  if (!Array.isArray(images) || images.length === 0) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-dashed bg-gray-50 px-4 py-6 text-sm text-muted-foreground">
        <ImageIcon className="size-4 shrink-0" />
        No product images submitted
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {images.map((url, index) => (
        <a
          key={`${url}-${index}`}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative aspect-square overflow-hidden rounded-xl border bg-muted"
        >
          <Image
            src={url}
            alt={`Return product image ${index + 1}`}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="50vw"
            unoptimized
          />
        </a>
      ))}
    </div>
  );
}

function DetailsSkeleton() {
  return (
    <div className="space-y-4 p-4">
      <Skeleton className="h-36 w-full rounded-2xl" />
      <Skeleton className="h-24 w-full rounded-2xl" />
      <Skeleton className="h-48 w-full rounded-2xl" />
      <Skeleton className="h-40 w-full rounded-2xl" />
    </div>
  );
}

export function MobileReturnOrderDetailsView({
  returnRequestId,
  backHref = "/mobile-orders?tab=returns",
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [returnOrderToPay, setReturnOrderToPay] = useState(null);

  const {
    data: returnOrder,
    isLoading,
    isFetching,
    refetch,
    isError,
  } = useReturnOrderDetails(returnRequestId);

  const { mutate: payReturnRefund, isPending: isPayingRefund } = usePayReturnRefund({
    onSuccess: async (res) => {
      toast.success(res?.message || "Refund payment processed successfully");
      await queryClient.invalidateQueries({ queryKey: ["return-orders"] });
      await refetch();
    },
    onError: (error) =>
      toast.error(error?.response?.data?.message || "Refund payment failed"),
    onSettled: () => setReturnOrderToPay(null),
  });

  const customer = returnOrder?.customer || {};
  const refundDetails = returnOrder?.refund_details;
  const items = Array.isArray(returnOrder?.items) ? returnOrder.items : [];
  const loading = (isLoading || isFetching) && !returnOrder;

  return (
    <div className="relative -mx-4 -mt-4 -mb-4 h-[calc(100dvh-4rem)] overflow-y-auto overscroll-y-contain bg-[#f4f6f9] [-webkit-overflow-scrolling:touch]">
      <header className="sticky top-0 z-30 border-b border-gray-200/80 bg-white/95 px-4 py-3 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-10 shrink-0 rounded-xl"
            onClick={() => router.push(backHref)}
            aria-label="Back to return orders"
          >
            <ArrowLeft className="size-4" />
          </Button>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-base font-semibold text-gray-900">
              Return Details
            </h1>
            <p className="truncate text-xs text-muted-foreground">
              {returnOrder?.order_number
                ? `#${returnOrder.order_number}`
                : "Loading..."}
            </p>
          </div>
        </div>
      </header>

      {loading ? (
        <DetailsSkeleton />
      ) : isError || !returnOrder ? (
        <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
          <h3 className="text-lg font-semibold text-gray-900">
            Return order not found
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            This return may have been removed or the link is invalid.
          </p>
          <Button asChild className="mt-6 rounded-xl">
            <Link href={backHref}>Back to returns</Link>
          </Button>
        </div>
      ) : (
        <div className="px-4 py-4 pb-10">
          <div className="space-y-4">
            <section className="rounded-2xl border border-gray-200/80 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Refund amount
                  </p>
                  <p className="mt-1 text-2xl font-bold text-gray-900">
                    {formatCurrency(returnOrder.refund_amount)}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Requested {formatDateTime(returnOrder.requested_at)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">
                    {items.length} item{items.length === 1 ? "" : "s"}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-1.5">
                {returnOrder.status ? (
                  <Badge className={getReturnRequestStatusClass(returnOrder.status)}>
                    {formatLabel(returnOrder.status)}
                  </Badge>
                ) : null}
                {returnOrder.return_display_status ? (
                  <Badge
                    className={getReturnStatusClass(returnOrder.return_display_status)}
                  >
                    {formatLabel(returnOrder.return_display_status)}
                  </Badge>
                ) : null}
                {canShowPayRefundButton(returnOrder) ? (
                  <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                    Ready to Pay Refund
                  </Badge>
                ) : null}
                {returnOrder.cod_refund_requires_upi_reference ? (
                  <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">
                    UPI Reference Required
                  </Badge>
                ) : null}
              </div>
            </section>

            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant="outline"
                className="h-auto flex-col gap-1 rounded-xl py-3"
                onClick={() => setIsTrackingOpen(true)}
              >
                <Truck className="size-4" />
                <span className="text-xs">Track Return</span>
              </Button>
              {canShowPayRefundButton(returnOrder) ? (
                <Button
                  type="button"
                  className="h-auto flex-col gap-1 rounded-xl py-3"
                  disabled={isPayingRefund}
                  onClick={() => setReturnOrderToPay(returnOrder)}
                >
                  {isPayingRefund ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <IndianRupee className="size-4" />
                  )}
                  <span className="text-xs">Pay Refund</span>
                </Button>
              ) : null}
            </div>

            <MobileSection title="Return Overview" icon={RotateCcw}>
              <div className="divide-y divide-gray-100">
                <DetailRow
                  label="Return Request ID"
                  value={returnOrder.return_request_id}
                  mono
                />
                <DetailRow label="Return Reason" value={returnOrder.reason} />
                <DetailRow
                  label="Refund Method"
                  value={
                    returnOrder.refund_method
                      ? formatLabel(returnOrder.refund_method)
                      : null
                  }
                />
              </div>
            </MobileSection>

            <MobileSection title="Order Information" icon={Package}>
              <div className="divide-y divide-gray-100">
                <DetailRow label="Order Number" value={returnOrder.order_number} />
                <DetailRow label="Order ID" value={returnOrder.order_id} />
                <DetailRow
                  label="Order Total"
                  value={formatCurrency(returnOrder.order_total_amount)}
                />
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5 border-t border-gray-100 pt-3">
                {returnOrder.order_status ? (
                  <Badge className={getOrderStatusClass(returnOrder.order_status)}>
                    {formatLabel(returnOrder.order_status)}
                  </Badge>
                ) : null}
                {returnOrder.payment_status ? (
                  <Badge className={getPaymentStatusClass(returnOrder.payment_status)}>
                    {formatLabel(returnOrder.payment_status)}
                  </Badge>
                ) : null}
                {returnOrder.payment_method ? (
                  <Badge className={getPaymentMethodClass(returnOrder.payment_method)}>
                    {formatLabel(returnOrder.payment_method)}
                  </Badge>
                ) : null}
              </div>
            </MobileSection>

            <MobileSection title="Customer" icon={User}>
              <div className="divide-y divide-gray-100">
                <DetailRow label="Name" value={customer.name} />
                <DetailRow label="Customer ID" value={customer.id} />
                <DetailRow label="Email" value={customer.email} />
                <DetailRow label="Phone" value={customer.phone} />
              </div>
            </MobileSection>

            <MobileSection title={`Returned Items (${items.length})`} icon={Package}>
              <div className="space-y-3">
                {items.length > 0 ? (
                  items.map((item) => (
                    <MobileReturnItemCard
                      key={item.order_item_id || item.product_id}
                      item={item}
                    />
                  ))
                ) : (
                  <p className="py-4 text-center text-sm text-muted-foreground">
                    No items listed.
                  </p>
                )}
              </div>
            </MobileSection>

            {refundDetails ? (
              <MobileSection title="COD Refund Details" icon={Banknote}>
                <p className="mb-3 text-sm text-muted-foreground">
                  Bank/UPI details submitted by the customer for COD refund.
                </p>
                <div className="divide-y divide-gray-100">
                  <DetailRow label="Full Name" value={refundDetails.full_name} />
                  <DetailRow label="Mobile" value={refundDetails.mobile} />
                  <DetailRow label="Email" value={refundDetails.email} />
                  <DetailRow label="UPI ID" value={refundDetails.upi_id} mono />
                </div>
              </MobileSection>
            ) : null}

            <MobileSection title="Customer Submitted Images" icon={ImageIcon}>
              <ProductImagesGallery images={returnOrder.product_images} />
            </MobileSection>

            <MobileSection title="Refund & Payment References" icon={CreditCard}>
              <div className="divide-y divide-gray-100">
                <DetailRow
                  label="Razorpay Refund ID"
                  value={returnOrder.razorpay_refund_id}
                  mono
                />
                <DetailRow
                  label="Razorpay Payout ID"
                  value={returnOrder.razorpay_payout_id}
                  mono
                />
                <DetailRow
                  label="UPI Transaction Reference"
                  value={returnOrder.upi_transaction_reference}
                  mono
                />
              </div>
            </MobileSection>

            <MobileSection title="Return Timeline" icon={CalendarClock}>
              <div className="pt-1">
                <TimelineItem label="Requested" value={returnOrder.requested_at} />
                <TimelineItem label="Received" value={returnOrder.received_at} />
                <TimelineItem label="Refunded" value={returnOrder.refunded_at} />
                <TimelineItem
                  label="Completed"
                  value={returnOrder.completed_at}
                  isLast
                />
              </div>
            </MobileSection>
          </div>
        </div>
      )}

      <ReturnTrackingModal
        open={isTrackingOpen}
        onOpenChange={setIsTrackingOpen}
        returnOrder={returnOrder}
      />

      <ConfirmDialog
        open={Boolean(returnOrderToPay)}
        onOpenChange={(open) => {
          if (!open && !isPayingRefund) setReturnOrderToPay(null);
        }}
        title="Confirm Refund Payment"
        message={
          returnOrderToPay
            ? `Are you sure you want to pay ${formatCurrency(returnOrderToPay.refund_amount)} refund for order ${returnOrderToPay.order_number || returnOrderToPay.order_id}?`
            : "Are you sure you want to process this refund?"
        }
        confirmLabel="Pay Refund"
        loadingLabel="Processing..."
        isLoading={isPayingRefund}
        onConfirm={() => {
          const orderId = returnOrderToPay?.order_id;
          const returnRequestId = returnOrderToPay?.return_request_id;
          const isCod =
            String(returnOrderToPay?.payment_method || "").toLowerCase() ===
            "cod";
          const upiTransactionReference =
            returnOrderToPay?.refund_details?.upi_id;

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
        }}
      />
    </div>
  );
}
