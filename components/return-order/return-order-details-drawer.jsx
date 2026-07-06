"use client";

import { useState } from "react";
import Image from "next/image";
import {
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import {
  formatCurrency,
  formatDateTime,
  formatLabel,
  getPaymentMethodClass,
  getReturnRequestStatusClass,
  canShowPayRefundButton,
} from "./return-order-utils";
import {
  getOrderStatusClass,
  getPaymentStatusClass,
  getReturnStatusClass,
} from "@/components/order/order-utils";
import { ReturnTrackingModal } from "./return-tracking-modal";

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

function TimelineItem({ label, value, isLast = false }) {
  const hasValue = Boolean(value);

  return (
    <div className={`relative flex gap-3 ${isLast ? "" : "pb-5"}`}>
      {!isLast ? (
        <span className="absolute left-[7px] top-4 h-full w-px bg-border" />
      ) : null}
      <span
        className={`relative z-10 mt-1 size-3.5 shrink-0 rounded-full border-2 ${
          hasValue
            ? "border-primary bg-primary"
            : "border-muted-foreground/40 bg-background"
        }`}
      />
      <div className="min-w-0 flex-1 space-y-0.5">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-sm text-muted-foreground">
          {hasValue ? formatDateTime(value) : "Not yet"}
        </p>
      </div>
    </div>
  );
}

function ProductImagesGallery({ images }) {
  if (!Array.isArray(images) || images.length === 0) {
    return (
      <div className="flex items-center gap-2 rounded-md border border-dashed bg-muted/30 px-4 py-6 text-sm text-muted-foreground">
        <ImageIcon className="size-4 shrink-0" />
        No product images submitted
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {images.map((url, index) => (
        <a
          key={`${url}-${index}`}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative aspect-square overflow-hidden rounded-md border bg-muted"
        >
          <Image
            src={url}
            alt={`Return product image ${index + 1}`}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, 150px"
            unoptimized
          />
        </a>
      ))}
    </div>
  );
}

function ReturnRefundActionBar({
  returnOrder,
  onPayRefund,
  isPayingRefund,
}) {
  if (!canShowPayRefundButton(returnOrder)) return null;

  return (
    <div className="space-y-4 rounded-lg border bg-background p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Refund Amount
          </p>
          <p className="mt-1 text-lg font-semibold text-foreground">
            {formatCurrency(returnOrder.refund_amount)}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            This return is ready for refund payment.
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => onPayRefund?.(returnOrder)}
          disabled={isPayingRefund}
        >
          {isPayingRefund ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <IndianRupee className="size-4" />
          )}
          Pay Refund
        </Button>
      </div>
    </div>
  );
}

export function ReturnOrderDetailsDrawer({
  open,
  onOpenChange,
  returnOrder,
  onPayRefund,
  isPayingRefund = false,
}) {
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);

  if (!returnOrder) return null;

  const customer = returnOrder.customer || {};
  const refundDetails = returnOrder.refund_details;
  const items = Array.isArray(returnOrder.items) ? returnOrder.items : [];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="!w-[50vw] !max-w-[50vw] gap-0 overflow-hidden p-0"
      >
        <SheetHeader className="sticky top-0 z-10 space-y-3 border-b bg-background px-6 py-5 pr-14">
          <div className="flex flex-wrap items-center gap-2">
            <SheetTitle className="text-xl">
              {returnOrder.order_number || "Return Request"}
            </SheetTitle>
            <Badge className={getReturnRequestStatusClass(returnOrder.status)}>
              {formatLabel(returnOrder.status)}
            </Badge>
            {returnOrder.return_display_status ? (
              <Badge className={getReturnStatusClass(returnOrder.return_display_status)}>
                {formatLabel(returnOrder.return_display_status)}
              </Badge>
            ) : null}
          </div>
          <SheetDescription className="text-left">
            Return request submitted by the customer. Review all details below
            before processing the refund.
          </SheetDescription>
          <div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsTrackingOpen(true)}
            >
              <Truck className="size-4" />
              Track Return
            </Button>
          </div>
        </SheetHeader>

        <ReturnTrackingModal
          open={isTrackingOpen}
          onOpenChange={setIsTrackingOpen}
          returnOrder={returnOrder}
        />

        <div className="flex-1 overflow-y-auto bg-muted/20 p-6">
          <div className="space-y-5 pb-8">
          <ReturnRefundActionBar
            returnOrder={returnOrder}
            onPayRefund={onPayRefund}
            isPayingRefund={isPayingRefund}
          />
          <SectionCard title="Return Overview" icon={RotateCcw}>
            <InfoList>
              <div className="grid gap-4 sm:grid-cols-2">
                <InfoItem
                  label="Return Request ID"
                  value={returnOrder.return_request_id}
                  mono
                />
                <InfoItem label="Return Reason" value={returnOrder.reason} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <InfoItem
                  label="Refund Amount"
                  value={formatCurrency(returnOrder.refund_amount)}
                />
                <InfoItem
                  label="Refund Method"
                  value={returnOrder.refund_method ? formatLabel(returnOrder.refund_method) : null}
                />
              </div>
              <div className="flex flex-wrap gap-2">
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
            </InfoList>
          </SectionCard>

          <SectionCard title="Order Information" icon={Package}>
            <InfoList>
              <div className="grid gap-4 sm:grid-cols-2">
                <InfoItem label="Order Number" value={returnOrder.order_number} />
                <InfoItem label="Order ID" value={returnOrder.order_id} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Order Status
                  </p>
                  <Badge className={getOrderStatusClass(returnOrder.order_status)}>
                    {formatLabel(returnOrder.order_status)}
                  </Badge>
                </div>
                <div className="space-y-1.5">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Payment Status
                  </p>
                  <Badge className={getPaymentStatusClass(returnOrder.payment_status)}>
                    {formatLabel(returnOrder.payment_status)}
                  </Badge>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Payment Method
                  </p>
                  <Badge className={getPaymentMethodClass(returnOrder.payment_method)}>
                    {formatLabel(returnOrder.payment_method)}
                  </Badge>
                </div>
                <InfoItem
                  label="Order Total"
                  value={formatCurrency(returnOrder.order_total_amount)}
                />
              </div>
            </InfoList>
          </SectionCard>

          <SectionCard title="Customer Details" icon={User}>
            <InfoList>
              <div className="grid gap-4 sm:grid-cols-2">
                <InfoItem label="Name" value={customer.name} />
                <InfoItem label="Customer ID" value={customer.id} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <InfoItem label="Email" value={customer.email} />
                <InfoItem label="Phone" value={customer.phone} />
              </div>
            </InfoList>
          </SectionCard>

          <SectionCard title="Returned Items" icon={Package}>
            {items.length === 0 ? (
              <p className="text-sm text-muted-foreground">No items listed.</p>
            ) : (
              <div className="overflow-x-auto rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead className="text-center">Qty</TableHead>
                      <TableHead className="text-right">Refund</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow key={item.order_item_id || item.product_id}>
                        <TableCell>
                          <div className="space-y-0.5">
                            <p className="font-medium">{item.product_name || "-"}</p>
                            <p className="text-xs text-muted-foreground">
                              Item #{item.order_item_id} · Product #{item.product_id}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>{item.size_text || "-"}</TableCell>
                        <TableCell className="text-center">{item.quantity ?? "-"}</TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(item.refund_amount)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </SectionCard>

          {refundDetails ? (
            <SectionCard title="COD Refund Details" icon={Banknote}>
              <p className="mb-4 text-sm text-muted-foreground">
                Bank/UPI details submitted by the customer for COD refund.
              </p>
              <InfoList>
                <div className="grid gap-4 sm:grid-cols-2">
                  <InfoItem label="Full Name" value={refundDetails.full_name} />
                  <InfoItem label="Mobile" value={refundDetails.mobile} />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <InfoItem label="Email" value={refundDetails.email} />
                  <InfoItem label="UPI ID" value={refundDetails.upi_id} mono />
                </div>
              </InfoList>
            </SectionCard>
          ) : null}

          <SectionCard title="Customer Submitted Images" icon={ImageIcon}>
            <ProductImagesGallery images={returnOrder.product_images} />
          </SectionCard>

          <SectionCard title="Refund & Payment References" icon={CreditCard}>
            <InfoList>
              <div className="grid gap-4 sm:grid-cols-2">
                <InfoItem
                  label="Razorpay Refund ID"
                  value={returnOrder.razorpay_refund_id}
                  mono
                />
                <InfoItem
                  label="Razorpay Payout ID"
                  value={returnOrder.razorpay_payout_id}
                  mono
                />
              </div>
              <InfoItem
                label="UPI Transaction Reference"
                value={returnOrder.upi_transaction_reference}
                mono
              />
            </InfoList>
          </SectionCard>

          <SectionCard title="Return Timeline" icon={CalendarClock}>
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
          </SectionCard>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
