"use client";

import Image from "next/image";
import { CheckCircle, Download, Eye, Loader2, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  formatCurrency,
  formatDateTime,
  formatLabel,
  getOrderStatusClass,
  getPaymentStatusClass,
} from "./order-utils";

const PENDING_ADMIN_CONFIRMATION = "pending_admin_confirmation";

function ProductImageCell({ row }) {
  const imageUrl = row.getValue("product_image_url");

  if (!imageUrl) {
    return (
      <div className="flex h-10 w-10 items-center justify-center rounded border bg-muted text-xs text-muted-foreground">
        -
      </div>
    );
  }

  return (
    <Image
      src={imageUrl}
      alt={row.original.product_name || "Product image"}
      width={40}
      height={40}
      unoptimized
      className="h-10 w-10 rounded border object-cover"
    />
  );
}

export function getOrderColumns(loading, shipmentActions = {}) {
  const {
    onConfirmOrder,
    onCancelOrder,
    onDownloadLabel,
    actionOrderId,
    actionType,
  } = shipmentActions;

  return (_sortAttr, _sort, _onSort, _onDelete, onViewDetails) => [
    {
      id: "order_id",
      header: "No.",
      accessorFn: (row) => row.order?.id ?? 0,
      meta: { width: "80px" },
      cell: ({ row }) => <span>{row.original.order?.id ?? "-"}</span>,
    },
    {
      accessorKey: "user",
      header: "Customer",
      meta: { width: "210px" },
      cell: ({ row }) => {
        const user = row.getValue("user") || {};

        return (
          <div>
            <div className="font-medium">{user.name || "-"}</div>
            <div className="text-xs text-muted-foreground">{user.email || "-"}</div>
          </div>
        );
      },
    },
    {
      accessorKey: "product_image_url",
      header: "Product Image",
      enableSorting: false,
      meta: { width: "100px" },
      cell: ProductImageCell,
    },
    {
      accessorKey: "product_name",
      header: "Product Name",
      meta: { width: "180px" },
      cell: ({ row }) => (
        <span className="font-medium">{row.getValue("product_name") || "-"}</span>
      ),
    },
    {
      accessorKey: "size_text",
      header: "Size",
      meta: { width: "120px" },
      cell: ({ row }) => <span>{row.getValue("size_text") || "-"}</span>,
    },
    {
      accessorKey: "quantity",
      header: "Quantity",
      meta: { width: "120px" },
      cell: ({ row }) => <span>{row.getValue("quantity") || "-"}</span>,
    },
    {
      accessorKey: "unit_price",
      header: "Unit Price",
      meta: { width: "120px" },
      cell: ({ row }) => (
        <span>{formatCurrency(row.getValue("unit_price"))}</span>
      ),
    },
    {
      accessorKey: "total",
      header: "Total Price",
      meta: { width: "120px" },
      cell: ({ row }) => (
        <span className="font-medium">{formatCurrency(row.getValue("total"))}</span>
      ),
    },
    {
      accessorKey: "status",
      header: "Order Status",
      meta: { width: "130px" },
      cell: ({ row }) => {
        const status = row.getValue("status");

        return (
          <Badge
            className={`${getOrderStatusClass(status)} inline-block h-auto min-h-5 w-full min-w-0 max-w-full shrink whitespace-normal break-words overflow-visible text-center leading-tight [overflow-wrap:anywhere]`}
          >
            {formatLabel(status)}
          </Badge>
        );
      },
    },
    {
      accessorKey: "payment_status",
      header: "Payment Status",
      meta: { width: "140px" },
      cell: ({ row }) => {
        const status = row.getValue("payment_status");

        return (
          <Badge className={getPaymentStatusClass(status)}>
            {formatLabel(status)}
          </Badge>
        );
      },
    },
    {
      accessorKey: "payment_method",
      header: "Payment",
      meta: { width: "110px" },
      cell: ({ row }) => <span>{formatLabel(row.getValue("payment_method"))}</span>,
    },
    {
      accessorKey: "order_created_at",
      header: "Order Date",
      meta: { width: "170px" },
      cell: ({ row }) => <span>{formatDateTime(row.getValue("order_created_at"))}</span>,
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      enableSorting: false,
      meta: { width: "180px" },
      cell: ({ row }) => {
        const order = row.original.order;
        const orderId = order?.id;
        const status = String(order?.status || row.getValue("status") || "").toLowerCase();
        const showCodActions = status === PENDING_ADMIN_CONFIRMATION;
        const isConfirming =
          actionOrderId === orderId && actionType === "confirm";
        const isCancelling =
          actionOrderId === orderId && actionType === "cancel";
        const isDownloadingLabel =
          actionOrderId === orderId && actionType === "download-label";

        return (
          <div className="flex justify-end gap-1">
            {showCodActions && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Confirm order"
                  title="Confirm Order"
                  onClick={() => onConfirmOrder?.(order)}
                  disabled={loading || !orderId}
                >
                  {isConfirming ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <CheckCircle className="size-4 text-green-600" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Cancel order"
                  title="Cancel Order"
                  onClick={() => onCancelOrder?.(order)}
                  disabled={loading || !orderId}
                >
                  {isCancelling ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <XCircle className="size-4 text-destructive" />
                  )}
                </Button>
              </>
            )}
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Download Label"
                    onClick={() => onDownloadLabel?.(order)}
                    disabled={loading || !orderId}
                  >
                    {isDownloadingLabel ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Download className="size-4" />
                    )}
                  </Button>
                }
              />
              <TooltipContent>Download Label</TooltipContent>
            </Tooltip>
            <Button
              variant="ghost"
              size="icon"
              aria-label="View details"
              title="View Details"
              onClick={() => onViewDetails?.(order)}
              disabled={loading}
            >
              <Eye className="size-4" />
            </Button>
          </div>
        );
      },
    },
  ];
}
