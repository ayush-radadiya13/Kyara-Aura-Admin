"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CreditCard,
  FileText,
  Loader2,
  MapPin,
  Package,
  Truck,
  User,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { OrderTrackingModal } from "@/components/order/order-tracking-card";
import {
  formatCurrency,
  formatDateTime,
  formatLabel,
  getDeliveryStatusClass,
  getOrderDeliveryStatus,
  getOrderStatusClass,
  getPaymentStatusClass,
  getReturnDisplayStatus,
  getReturnStatusClass,
} from "@/components/order/order-utils";
import {
  useCancelOrderShipment,
  useOrderDetails,
} from "@/hooks/admin/module/use-orders";
import { customAxios } from "@/utils/api";
import { cn } from "@/lib/utils";

function getCancellationReason(order) {
  if (!order || order?.status !== "cancelled") return null;

  const notes = typeof order?.notes === "string" ? order.notes.trim() : "";
  if (!notes) return null;

  const match = notes.match(/cancellation reason\s*:?\s*(.*)/is);
  const reason = (match?.[1] ?? notes).trim();

  return reason || null;
}

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

function SummaryLine({ label, value, highlight = false, discount = false }) {
  const numericValue = Number(value ?? 0);
  const isDiscount = discount && numericValue > 0;

  return (
    <div className="flex items-center justify-between gap-3 py-1.5 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span
        className={cn(
          "font-medium",
          highlight && "text-base font-semibold text-gray-900",
          isDiscount && "text-green-600"
        )}
      >
        {isDiscount ? `-${formatCurrency(numericValue)}` : formatCurrency(value)}
      </span>
    </div>
  );
}

function MobileOrderItemCard({ item }) {
  const imageUrl = item?.product?.images?.[0]?.image_url;
  const unitPrice = item?.price ?? item?.size_price;

  return (
    <div className="flex gap-3 rounded-xl border border-gray-100 bg-gray-50/80 p-3">
      <div className="relative size-16 shrink-0 overflow-hidden rounded-xl border bg-white">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={item?.product_name || "Product"}
            fill
            unoptimized
            className="object-cover"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-[10px] text-muted-foreground">
            No image
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 text-sm font-semibold text-gray-900">
          {item?.product_name || "-"}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {item?.size_text ? `Size ${item.size_text}` : "Size -"} · Qty{" "}
          {item?.quantity ?? "-"}
        </p>
        <div className="mt-2 flex items-center justify-between gap-2">
          <span className="text-xs text-muted-foreground">
            {formatCurrency(unitPrice)} each
          </span>
          <span className="text-sm font-semibold text-gray-900">
            {formatCurrency(item?.total)}
          </span>
        </div>
      </div>
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

export function MobileOrderDetailsView({ orderId }) {
  const router = useRouter();
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [isDownloadingInvoice, setIsDownloadingInvoice] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const { data: order, isLoading, isFetching, refetch } = useOrderDetails(
    orderId,
    Boolean(orderId)
  );

  const { mutate: cancelOrderShipment, isPending: isCancelling } =
    useCancelOrderShipment({
      onSuccess: async (res) => {
        toast.success(res?.message || "Order cancelled successfully");
        setShowCancelDialog(false);
        await refetch();
      },
      onError: (error) =>
        toast.error(error?.response?.data?.message || "Cancel order failed"),
    });

  const orderItems = Array.isArray(order?.order_items) ? order.order_items : [];
  const returnDisplayStatus = getReturnDisplayStatus(order);
  const deliveryStatus = getOrderDeliveryStatus(order);
  const cancellationReason = getCancellationReason(order);

  const discountRows = [
    {
      label: "Buy 2 Get 1 Discount",
      value: order?.buy_two_get_one_discount_amount,
    },
    {
      label: "First Order Discount",
      value: order?.first_order_discount_amount,
    },
    {
      label: "Online Payment Discount",
      value: order?.online_payment_discount_amount,
    },
    {
      label: order?.scratch_coupon_code
        ? `Coupon (${order.scratch_coupon_code})`
        : "Coupon Discount",
      value: order?.discount_amount,
    },
  ].filter((row) => Number(row.value) > 0);

  const address = order?.shipping_address;
  const addressLines = [
    address?.address_line_1,
    address?.address_line_2,
    address?.landmark,
    [address?.city, address?.state, address?.postal_code].filter(Boolean).join(", "),
    address?.country,
  ].filter(Boolean);

  const handleDownloadInvoice = async () => {
    const invoiceUrl = order?.invoice_download_url;
    if (!invoiceUrl) return;

    setIsDownloadingInvoice(true);

    try {
      const res = await customAxios.get(invoiceUrl, { responseType: "blob" });
      const disposition = res.headers?.["content-disposition"] || "";
      const filenameMatch = disposition.match(
        /filename\*?=(?:UTF-8'')?["']?([^"';]+)["']?/i
      );
      const filename = filenameMatch?.[1]
        ? decodeURIComponent(filenameMatch[1])
        : `invoice-${order?.order_number || order?.id}.pdf`;

      const url = window.URL.createObjectURL(res.data);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Invoice downloaded");
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Invoice download failed"
      );
    } finally {
      setIsDownloadingInvoice(false);
    }
  };

  const loading = (isLoading || isFetching) && !order;

  return (
    <div className="relative -mx-4 -mt-4 -mb-4 h-[calc(100dvh-4rem)] overflow-y-auto overscroll-y-contain bg-[#f4f6f9] [-webkit-overflow-scrolling:touch]">
      <header className="sticky top-0 z-30 border-b border-gray-200/80 bg-white/95 px-4 py-3 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-10 shrink-0 rounded-xl"
            onClick={() => router.push("/mobile-orders")}
            aria-label="Back to orders"
          >
            <ArrowLeft className="size-4" />
          </Button>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-base font-semibold text-gray-900">
              Order Details
            </h1>
            <p className="truncate text-xs text-muted-foreground">
              {order?.order_number ? `#${order.order_number}` : "Loading..."}
            </p>
          </div>
        </div>
      </header>

      {loading ? (
        <DetailsSkeleton />
      ) : !order ? (
        <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
          <h3 className="text-lg font-semibold text-gray-900">Order not found</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            This order may have been removed or the link is invalid.
          </p>
          <Button asChild className="mt-6 rounded-xl">
            <Link href="/mobile-orders">Back to orders</Link>
          </Button>
        </div>
      ) : (
        <div className="px-4 py-4 pb-10">
          <div className="space-y-4">
            <section className="rounded-2xl border border-gray-200/80 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Order total
                  </p>
                  <p className="mt-1 text-2xl font-bold text-gray-900">
                    {formatCurrency(order.total_amount)}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Placed {formatDateTime(order.created_at)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">
                    {orderItems.length} item{orderItems.length === 1 ? "" : "s"}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-1.5">
                {order?.status ? (
                  <Badge className={getOrderStatusClass(order.status)}>
                    {formatLabel(order.status)}
                  </Badge>
                ) : null}
                {order?.payment_status ? (
                  <Badge className={getPaymentStatusClass(order.payment_status)}>
                    {formatLabel(order.payment_status)}
                  </Badge>
                ) : null}
                {deliveryStatus ? (
                  <Badge className={getDeliveryStatusClass(deliveryStatus)}>
                    {formatLabel(deliveryStatus)}
                  </Badge>
                ) : null}
                {returnDisplayStatus ? (
                  <Badge className={getReturnStatusClass(returnDisplayStatus)}>
                    {formatLabel(returnDisplayStatus)}
                  </Badge>
                ) : null}
              </div>
            </section>

            <div className="grid grid-cols-3 gap-2">
              <Button
                type="button"
                variant="outline"
                className="h-auto flex-col gap-1 rounded-xl py-3"
                onClick={() => setIsTrackingOpen(true)}
              >
                <Truck className="size-4" />
                <span className="text-xs">Track</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-auto flex-col gap-1 rounded-xl py-3"
                disabled={!order?.invoice_download_url || isDownloadingInvoice}
                onClick={handleDownloadInvoice}
              >
                {isDownloadingInvoice ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <FileText className="size-4" />
                )}
                <span className="text-xs">Invoice</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-auto flex-col gap-1 rounded-xl border-destructive/30 py-3 text-destructive hover:bg-destructive/5 hover:text-destructive"
                disabled={!order?.can_be_cancelled || isCancelling}
                onClick={() => setShowCancelDialog(true)}
              >
                {isCancelling ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <XCircle className="size-4" />
                )}
                <span className="text-xs">Cancel</span>
              </Button>
            </div>

            {cancellationReason ? (
              <section className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4">
                <div className="flex items-center gap-2 text-destructive">
                  <XCircle className="size-4" />
                  <h2 className="text-sm font-semibold">Cancellation Reason</h2>
                </div>
                <p className="mt-2 text-sm text-gray-900">{cancellationReason}</p>
              </section>
            ) : null}

            <MobileSection title={`Items (${orderItems.length})`} icon={Package}>
              <div className="space-y-3">
                {orderItems.length > 0 ? (
                  orderItems.map((item) => (
                    <MobileOrderItemCard
                      key={item?.id ?? `${item?.product_id}-${item?.created_at}`}
                      item={item}
                    />
                  ))
                ) : (
                  <p className="py-4 text-center text-sm text-muted-foreground">
                    No order items found.
                  </p>
                )}
              </div>
            </MobileSection>

            <MobileSection title="Customer" icon={User}>
              <div className="divide-y divide-gray-100">
                <DetailRow label="Name" value={order?.user?.name} />
                <DetailRow label="Phone" value={order?.user?.phone} />
                <DetailRow label="Email" value={order?.user?.email} />
              </div>
            </MobileSection>

            <MobileSection title="Delivery Address" icon={MapPin}>
              <div className="space-y-3">
                <div>
                  <p className="font-semibold text-gray-900">
                    {address?.name || "-"}
                  </p>
                  {address?.address_type ? (
                    <Badge variant="secondary" className="mt-2 text-xs capitalize">
                      {formatLabel(address.address_type)}
                    </Badge>
                  ) : null}
                </div>
                <div className="space-y-1 text-sm text-muted-foreground">
                  {addressLines.length > 0
                    ? addressLines.map((line) => <p key={line}>{line}</p>)
                    : "-"}
                </div>
                <div className="divide-y divide-gray-100 border-t border-gray-100 pt-2">
                  <DetailRow label="Phone" value={address?.phone} />
                  <DetailRow label="Email" value={address?.email} />
                </div>
              </div>
            </MobileSection>

            <MobileSection title="Payment Summary" icon={CreditCard}>
              <div className="divide-y divide-gray-100">
                <DetailRow
                  label="Payment Method"
                  value={formatLabel(order?.payment_method)}
                />
                <DetailRow
                  label="Payment Status"
                  value={formatLabel(order?.payment_status)}
                />
                <DetailRow label="Paid At" value={formatDateTime(order?.paid_at)} />
                <DetailRow
                  label="Checkout Type"
                  value={formatLabel(order?.checkout_type)}
                />
              </div>

              {order?.razorpay_payment_id || order?.razorpay_order_id ? (
                <div className="mt-3 divide-y divide-gray-100 border-t border-gray-100 pt-2">
                  {order?.razorpay_order_id ? (
                    <DetailRow
                      label="Razorpay Order"
                      value={order.razorpay_order_id}
                      mono
                    />
                  ) : null}
                  {order?.razorpay_payment_id ? (
                    <DetailRow
                      label="Razorpay Payment"
                      value={order.razorpay_payment_id}
                      mono
                    />
                  ) : null}
                </div>
              ) : null}

              <div className="mt-4 space-y-1 border-t border-gray-100 pt-4">
                <SummaryLine label="Subtotal" value={order?.subtotal} />
                <SummaryLine label="Tax" value={order?.tax_amount} />
                <SummaryLine label="Shipping" value={order?.shipping_amount} />
                {Number(order?.cod_charge) > 0 ? (
                  <SummaryLine label="COD Charge" value={order?.cod_charge} />
                ) : null}
                {discountRows.map((row) => (
                  <SummaryLine
                    key={row.label}
                    label={row.label}
                    value={row.value}
                    discount
                  />
                ))}
                <div className="border-t border-dashed border-gray-200 pt-3">
                  <SummaryLine
                    label="Total Amount"
                    value={order?.total_amount}
                    highlight
                  />
                </div>
              </div>
            </MobileSection>

            <MobileSection title="Shipping Info" icon={Truck}>
              <div className="divide-y divide-gray-100">
                <DetailRow
                  label="Delivery Status"
                  value={formatLabel(deliveryStatus)}
                />
                <DetailRow
                  label="Delivered At"
                  value={formatDateTime(order?.delivered_at)}
                />
                <DetailRow label="Waybill" value={order?.shipment?.waybill} mono />
                <DetailRow
                  label="Courier"
                  value={formatLabel(order?.shipment?.provider)}
                />
              </div>
            </MobileSection>
          </div>
        </div>
      )}

      <OrderTrackingModal
        open={isTrackingOpen}
        onOpenChange={setIsTrackingOpen}
        order={order}
      />

      <ConfirmDialog
        open={showCancelDialog}
        onOpenChange={(open) => {
          if (!open && !isCancelling) setShowCancelDialog(false);
        }}
        title="Confirm Order Cancellation"
        message={
          order
            ? `Are you sure you want to cancel order ${order.order_number || order.id}?`
            : "Are you sure you want to cancel this order?"
        }
        confirmLabel="Cancel Order"
        confirmVariant="destructive"
        loadingLabel="Cancelling..."
        isLoading={isCancelling}
        onConfirm={() => {
          if (!order?.id) return;
          cancelOrderShipment(order.id);
        }}
      />
    </div>
  );
}
