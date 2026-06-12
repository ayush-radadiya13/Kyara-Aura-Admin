"use client";

import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import {
  formatCurrency,
  formatDateTime,
  formatLabel,
  getOrderStatusClass,
  getPaymentStatusClass,
} from "./order-utils";

function DetailField({ label, value }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 break-words text-sm font-medium text-foreground">
        {value || "-"}
      </dd>
    </div>
  );
}

function DetailCard({ title, children }) {
  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader className="border-b pb-3">
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="grid gap-4 sm:grid-cols-2">{children}</dl>
      </CardContent>
    </Card>
  );
}

function AddressCard({ title, address }) {
  return (
    <DetailCard title={title}>
      <DetailField label="Name" value={address?.name} />
      <DetailField label="Email" value={address?.email} />
      <DetailField label="Phone" value={address?.phone} />
      <DetailField label="Address Line 1" value={address?.address_line_1} />
      <DetailField label="Address Line 2" value={address?.address_line_2} />
      <DetailField label="Landmark" value={address?.landmark} />
      <DetailField label="City" value={address?.city} />
      <DetailField label="State" value={address?.state} />
      <DetailField label="Country" value={address?.country} />
      <DetailField label="Postal Code" value={address?.postal_code} />
      <DetailField label="Address Type" value={formatLabel(address?.address_type)} />
    </DetailCard>
  );
}

function PricingCard({ label, value }) {
  return (
    <Card className="border-primary/10 bg-primary/5 shadow-sm">
      <CardContent>
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className="mt-2 text-xl font-semibold text-foreground">
          {formatCurrency(value)}
        </p>
      </CardContent>
    </Card>
  );
}

function ProductThumbnail({ item }) {
  const imageUrl = item?.product?.images?.[0]?.image_url;

  if (!imageUrl) {
    return (
      <div className="flex h-12 w-12 items-center justify-center rounded border bg-muted text-xs text-muted-foreground">
        No image
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
      className="h-12 w-12 rounded border object-cover"
    />
  );
}

function OrderItemsTable({ items }) {
  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader className="border-b pb-3">
        <CardTitle>Order Items</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product Image</TableHead>
                <TableHead>Product Name</TableHead>
                <TableHead>Product Slug</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Unit Price</TableHead>
                <TableHead>Total Price</TableHead>
                <TableHead>Product ID</TableHead>
                <TableHead>Created Date</TableHead>
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
                      <TableCell className="min-w-44 font-medium">
                        {item?.product_name || "-"}
                      </TableCell>
                      <TableCell className="min-w-36">
                        {item?.product_slug || "-"}
                      </TableCell>
                      <TableCell>{item?.size_text || "-"}</TableCell>
                      <TableCell>{item?.quantity ?? "-"}</TableCell>
                      <TableCell>{formatCurrency(unitPrice)}</TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(item?.total)}
                      </TableCell>
                      <TableCell>{item?.product_id ?? "-"}</TableCell>
                      <TableCell className="min-w-36">
                        {formatDateTime(item?.created_at)}
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={9} className="py-8 text-center text-muted-foreground">
                    No order items found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

function DrawerLoadingState() {
  return (
    <div className="space-y-4 p-6">
      <Skeleton className="h-28 w-full" />
      <Skeleton className="h-36 w-full" />
      <Skeleton className="h-56 w-full" />
    </div>
  );
}

export function OrderDetailsDrawer({ open, onOpenChange, order, isLoading }) {
  const orderItems = Array.isArray(order?.order_items) ? order.order_items : [];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="!w-[50vw] !max-w-[50vw] gap-0 overflow-hidden p-0"
      >
        <SheetHeader className="sticky top-0 z-10 border-b bg-background px-6 py-5 pr-14">
          <div className="flex flex-wrap items-center gap-3">
            <SheetTitle className="text-xl">
              {order?.order_number || "Order Details"}
            </SheetTitle>
            {order?.status && (
              <Badge className={getOrderStatusClass(order.status)}>
                {formatLabel(order.status)}
              </Badge>
            )}
            {order?.payment_status && (
              <Badge className={getPaymentStatusClass(order.payment_status)}>
                {formatLabel(order.payment_status)}
              </Badge>
            )}
          </div>
          <SheetDescription>
            Review customer, payment, address, and item-level order details.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto bg-muted/20 p-6">
          {isLoading && !order ? (
            <DrawerLoadingState />
          ) : (
            <div className="space-y-6">
              <div className="grid gap-4 lg:grid-cols-2">
                <DetailCard title="Customer Information">
                  <DetailField label="Customer Name" value={order?.user?.name} />
                  <DetailField label="Email" value={order?.user?.email} />
                  <DetailField label="Phone Number" value={order?.user?.phone} />
                </DetailCard>

                <DetailCard title="Order Information">
                  <DetailField label="Order Number" value={order?.order_number} />
                  <DetailField label="Checkout Type" value={formatLabel(order?.checkout_type)} />
                  <DetailField label="Order Status" value={formatLabel(order?.status)} />
                  <DetailField label="Payment Method" value={formatLabel(order?.payment_method)} />
                  <DetailField label="Payment Status" value={formatLabel(order?.payment_status)} />
                  <DetailField label="Paid At" value={formatDateTime(order?.paid_at)} />
                  <DetailField label="Order Date" value={formatDateTime(order?.created_at)} />
                </DetailCard>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <PricingCard label="Subtotal" value={order?.subtotal} />
                <PricingCard label="Tax Amount" value={order?.tax_amount} />
                <PricingCard label="Shipping Amount" value={order?.shipping_amount} />
                <PricingCard label="Total Amount" value={order?.total_amount} />
              </div>

              <OrderItemsTable items={orderItems} />

              <div className="grid gap-4 lg:grid-cols-2">
                <AddressCard title="Shipping Address" address={order?.shipping_address} />
                <AddressCard title="Billing Address" address={order?.billing_address} />
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
