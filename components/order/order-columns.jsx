"use client";

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
  getDeliveryStatusClass,
  getOrderDeliveryStatus,
  getOrderStatusClass,
  getPaymentStatusClass,
} from "./order-utils";

const PENDING_ADMIN_CONFIRMATION = "pending_admin_confirmation";

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
      id: "actions",
      header: () => <div className="text-left">Action</div>,
      enableSorting: false,
      meta: { width: "180px" },
      cell: ({ row }) => {
        const order = row.original;
        const orderId = order?.id;
        const status = String(order?.status || "").toLowerCase();
        const showCodActions = status === PENDING_ADMIN_CONFIRMATION;
        const isConfirming =
          actionOrderId === orderId && actionType === "confirm";
        const isCancelling =
          actionOrderId === orderId && actionType === "cancel";
        const isDownloadingLabel =
          actionOrderId === orderId && actionType === "download-label";

        return (
          <div className="flex justify-start gap-1">
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
    {
      accessorKey: "order_number",
      header: "Order No.",
      meta: { width: "170px" },
      cell: ({ row }) => (
        <span className="font-medium">{row.getValue("order_number") || "-"}</span>
      ),
    },
    {
      accessorKey: "user",
      header: "Customer Name",
      meta: { width: "180px" },
      cell: ({ row }) => {
        const user = row.getValue("user") || {};

        return <span className="font-medium">{user.name || "-"}</span>;
      },
    },
    {
      id: "shipping_name",
      header: "Shipping Name",
      meta: { width: "180px" },
      accessorFn: (row) => row?.shipping_address?.name ?? "",
      cell: ({ row }) => (
        <span>{row.original?.shipping_address?.name || "-"}</span>
      ),
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
      id: "delivery_status",
      header: "Delivery Status",
      meta: { width: "150px" },
      accessorFn: (row) => getOrderDeliveryStatus(row),
      cell: ({ row }) => {
        const status = getOrderDeliveryStatus(row.original);

        return (
          <Badge className={getDeliveryStatusClass(status)}>
            {formatLabel(status)}
          </Badge>
        );
      },
    },
    {
      accessorKey: "total_amount",
      header: "Total Amount",
      meta: { width: "130px" },
      cell: ({ row }) => (
        <span className="font-medium">
          {formatCurrency(row.getValue("total_amount"))}
        </span>
      ),
    },
    {
      accessorKey: "created_at",
      header: "Order Date",
      meta: { width: "170px" },
      cell: ({ row }) => <span>{formatDateTime(row.getValue("created_at"))}</span>,
    },
  ];
}
