"use client";

import { useState } from "react";
import Image from "next/image";
import {
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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { customAxios } from "@/utils/api";
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
} from "./order-utils";

function InfoItem({ label, value, mono = false }) {
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p
        className={`text-sm font-medium text-foreground break-words [overflow-wrap:anywhere] ${
          mono ? "font-mono text-xs leading-relaxed" : ""
        }`}
      >
        {value || "-"}
      </p>
    </div>
  );
}

function InfoList({ children, className = "" }) {
  return <div className={`space-y-4 ${className}`}>{children}</div>;
}

function SectionCard({ title, icon: Icon, children, className = "" }) {
  return (
    <Card className={`border-border/70 shadow-sm ${className}`}>
      <CardHeader className="border-b pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          {Icon ? <Icon className="size-4 text-muted-foreground" /> : null}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">{children}</CardContent>
    </Card>
  );
}

function SummaryRow({ label, value, highlight = false, discount = false }) {
  const numericValue = Number(value ?? 0);
  const isDiscount = discount && numericValue > 0;

  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span
        className={`font-medium ${
          highlight
            ? "text-base text-foreground"
            : isDiscount
              ? "text-green-600"
              : "text-foreground"
        }`}
      >
        {isDiscount ? `-${formatCurrency(numericValue)}` : formatCurrency(value)}
      </span>
    </div>
  );
}

function ShippingAddressCard({ address }) {
  const addressLines = [
    address?.address_line_1,
    address?.address_line_2,
    address?.landmark,
    [address?.city, address?.state, address?.postal_code].filter(Boolean).join(", "),
    address?.country,
  ].filter(Boolean);

  return (
    <SectionCard title="Shipping Address" icon={MapPin}>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-semibold text-foreground">
            {address?.name || "-"}
          </p>
          {address?.address_type ? (
            <Badge variant="secondary" className="text-xs capitalize">
              {formatLabel(address.address_type)}
            </Badge>
          ) : null}
        </div>

        <div className="space-y-1 text-sm text-muted-foreground">
          {addressLines.length > 0 ? (
            addressLines.map((line) => <p key={line}>{line}</p>)
          ) : (
            <p>-</p>
          )}
        </div>

        <Separator />

        <InfoList>
          <InfoItem label="Phone" value={address?.phone} />
          <InfoItem label="Email" value={address?.email} />
        </InfoList>
      </div>
    </SectionCard>
  );
}

function PaymentSummaryCard({ order }) {
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

  return (
    <SectionCard title="Payment Summary" icon={CreditCard}>
      <div className="space-y-5">
        <InfoList>
          <InfoItem
            label="Payment Method"
            value={formatLabel(order?.payment_method)}
          />
          <InfoItem
            label="Payment Status"
            value={formatLabel(order?.payment_status)}
          />
          <InfoItem label="Paid At" value={formatDateTime(order?.paid_at)} />
          <InfoItem
            label="Checkout Type"
            value={formatLabel(order?.checkout_type)}
          />
        </InfoList>

        {order?.razorpay_payment_id || order?.razorpay_order_id ? (
          <>
            <Separator />
            <InfoList>
              {order?.razorpay_order_id ? (
                <InfoItem
                  label="Razorpay Order ID"
                  value={order.razorpay_order_id}
                  mono
                />
              ) : null}
              {order?.razorpay_payment_id ? (
                <InfoItem
                  label="Razorpay Payment ID"
                  value={order.razorpay_payment_id}
                  mono
                />
              ) : null}
            </InfoList>
          </>
        ) : null}

        <Separator />

        <div className="space-y-3">
          <SummaryRow label="Subtotal" value={order?.subtotal} />
          <SummaryRow label="Tax" value={order?.tax_amount} />
          <SummaryRow label="Shipping" value={order?.shipping_amount} />
          {Number(order?.cod_charge) > 0 ? (
            <SummaryRow label="COD Charge" value={order?.cod_charge} />
          ) : null}
          {discountRows.map((row) => (
            <SummaryRow
              key={row.label}
              label={row.label}
              value={row.value}
              discount
            />
          ))}
          {Number(order?.discount_percent) > 0 ? (
            <p className="text-xs text-muted-foreground">
              Total discount applied: {order.discount_percent}%
            </p>
          ) : null}
        </div>

        <Separator />

        <SummaryRow
          label="Total Amount"
          value={order?.total_amount}
          highlight
        />
      </div>
    </SectionCard>
  );
}

function ProductThumbnail({ item }) {
  const imageUrl = item?.product?.images?.[0]?.image_url;

  if (!imageUrl) {
    return (
      <div className="flex h-12 w-12 items-center justify-center rounded-md border bg-muted text-xs text-muted-foreground">
        N/A
      </div>
    );
  }

  return (
    <Image
      src={imageUrl}
      alt={item?.product_name || "Product image"}
      width={48}
      height={48}
      unoptimized
      className="h-12 w-12 rounded-md border object-cover"
    />
  );
}

function OrderItemsTable({ items }) {
  return (
    <SectionCard title="Order Items" icon={Package}>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Image</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Size</TableHead>
              <TableHead className="text-right">Qty</TableHead>
              <TableHead className="text-right">Unit Price</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length > 0 ? (
              items.map((item) => {
                const unitPrice = item?.price ?? item?.size_price;

                return (
                  <TableRow key={item?.id ?? `${item?.product_id}-${item?.created_at}`}>
                    <TableCell>
                      <ProductThumbnail item={item} />
                    </TableCell>
                    <TableCell className="min-w-40 font-medium">
                      {item?.product_name || "-"}
                    </TableCell>
                    <TableCell>{item?.size_text || "-"}</TableCell>
                    <TableCell className="text-right">
                      {item?.quantity ?? "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(unitPrice)}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(item?.total)}
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-8 text-center text-muted-foreground"
                >
                  No order items found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </SectionCard>
  );
}

function DrawerLoadingState() {
  return (
    <div className="space-y-4 p-6">
      <Skeleton className="h-20 w-full" />
      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-36 w-full" />
        <Skeleton className="h-36 w-full" />
      </div>
      <Skeleton className="h-56 w-full" />
      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    </div>
  );
}

function OrderActionBar({
  order,
  onCancelOrder,
  isCancelling,
  onDownloadInvoice,
  isDownloadingInvoice,
}) {
  const trackingUrl = order?.shipment?.courier_tracking_url;
  const canTrack = Boolean(trackingUrl);
  const canDownloadInvoice = Boolean(order?.invoice_download_url);
  const canCancel = Boolean(order?.can_be_cancelled);

  return (
    <div className="space-y-4 rounded-lg border bg-background p-4 shadow-sm">
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Order ID
        </p>
        <p className="mt-1 break-words text-lg font-semibold text-foreground [overflow-wrap:anywhere]">
          {order?.order_number || "-"}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onDownloadInvoice}
          disabled={!canDownloadInvoice || isDownloadingInvoice}
        >
          {isDownloadingInvoice ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <FileText className="size-4" />
          )}
          Download Invoice
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            if (trackingUrl) {
              window.open(trackingUrl, "_blank", "noopener,noreferrer");
            }
          }}
          disabled={!canTrack}
        >
          <Truck className="size-4" />
          Track Order
        </Button>

        <Button
          variant="destructive"
          size="sm"
          onClick={() => onCancelOrder?.(order)}
          disabled={!canCancel || isCancelling}
        >
          {isCancelling ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <XCircle className="size-4" />
          )}
          Cancel Order
        </Button>
      </div>
    </div>
  );
}

export function OrderDetailsDrawer({
  open,
  onOpenChange,
  order,
  isLoading,
  onCancelOrder,
  isCancelling = false,
}) {
  const [isDownloadingInvoice, setIsDownloadingInvoice] = useState(false);
  const orderItems = Array.isArray(order?.order_items) ? order.order_items : [];
  const returnDisplayStatus = getReturnDisplayStatus(order);
  const deliveryStatus = getOrderDeliveryStatus(order);

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

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="!w-[50vw] !max-w-[50vw] gap-0 overflow-hidden p-0"
      >
        <SheetHeader className="sticky top-0 z-10 border-b bg-background px-6 py-5 pr-14">
          <div className="flex flex-wrap items-center gap-2">
            <SheetTitle className="text-xl">Order Details</SheetTitle>
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
          <SheetDescription>
            {order?.created_at
              ? `Placed on ${formatDateTime(order.created_at)}`
              : "Review customer, shipping, payment, and item details."}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto bg-muted/20 p-6">
          {isLoading && !order ? (
            <DrawerLoadingState />
          ) : (
            <div className="space-y-6">
              <OrderActionBar
                order={order}
                onCancelOrder={onCancelOrder}
                isCancelling={isCancelling}
                onDownloadInvoice={handleDownloadInvoice}
                isDownloadingInvoice={isDownloadingInvoice}
              />

              <div className="grid gap-4 lg:grid-cols-2">
                <SectionCard title="Customer Information" icon={User}>
                  <InfoList>
                    <InfoItem label="Name" value={order?.user?.name} />
                    <InfoItem label="Phone" value={order?.user?.phone} />
                    <InfoItem label="Email" value={order?.user?.email} />
                  </InfoList>
                </SectionCard>

                <SectionCard title="Order Information" icon={Package}>
                  <InfoList>
                    <InfoItem
                      label="Order Status"
                      value={formatLabel(order?.status)}
                    />
                    <InfoItem
                      label="Checkout Type"
                      value={formatLabel(order?.checkout_type)}
                    />
                    <InfoItem
                      label="Order Date"
                      value={formatDateTime(order?.created_at)}
                    />
                    <InfoItem
                      label="Delivered At"
                      value={formatDateTime(order?.delivered_at)}
                    />
                    {order?.shipment?.waybill ? (
                      <InfoItem
                        label="Waybill"
                        value={order.shipment.waybill}
                        mono
                      />
                    ) : null}
                    {order?.shipment?.provider ? (
                      <InfoItem
                        label="Courier"
                        value={formatLabel(order.shipment.provider)}
                      />
                    ) : null}
                  </InfoList>
                </SectionCard>
              </div>

              <OrderItemsTable items={orderItems} />

              <div className="grid gap-4 lg:grid-cols-2">
                <ShippingAddressCard address={order?.shipping_address} />
                <PaymentSummaryCard order={order} />
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
