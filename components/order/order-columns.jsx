"use client";

import { CheckCircle, Download, Eye, Loader2, RefreshCw, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  canRetryOrderShipment,
  formatCurrency,
  formatDateTime,
  formatLabel,
  getDeliveryStatusClass,
  getOrderDeliveryStatus,
  getOrderShipmentFailedReason,
  getOrderStatusClass,
  getPaymentStatusClass,
  hasOrderLabelBeenDownloaded,
  hasOrderWaybill,
  isOrderShipmentRetryPending,
  normalizeOrderId,
} from "./order-utils";

const PENDING_ADMIN_CONFIRMATION = "pending_admin_confirmation";
export const BULK_LABEL_DOWNLOAD_LIMIT = 30;

export function getOrderColumns(loading, shipmentActions = {}) {
  const {
    onConfirmOrder,
    onCancelOrder,
    onDownloadLabel,
    onRetryShipment,
    actionOrderId,
    actionType,
    selectedOrderIds = [],
    downloadedLabelOrderIds = [],
    onToggleOrderSelection,
    bulkSelectionLimit = BULK_LABEL_DOWNLOAD_LIMIT,
  } = shipmentActions;

  return (_sortAttr, _sort, _onSort, _onDelete, onViewDetails) => [
    {
      id: "actions",
      header: () => <div className="text-left">Action</div>,
      enableSorting: false,
      meta: { width: "210px" },
      cell: ({ row }) => {
        const order = row.original;
        const orderId = order?.id;
        const normalizedOrderId = normalizeOrderId(orderId);
        const status = String(order?.status || "").toLowerCase();
        const showCodActions = status === PENDING_ADMIN_CONFIRMATION;
        const hasWaybill = hasOrderWaybill(order);
        const isSelected = selectedOrderIds.includes(Number(orderId));
        const isConfirming =
          normalizeOrderId(actionOrderId) === normalizedOrderId &&
          actionType === "confirm";
        const isCancelling =
          normalizeOrderId(actionOrderId) === normalizedOrderId &&
          actionType === "cancel";
        const isDownloadingLabel =
          normalizeOrderId(actionOrderId) === normalizedOrderId &&
          actionType === "download-label";
        const isRetryingShipment =
          (normalizeOrderId(actionOrderId) === normalizedOrderId &&
            actionType === "retry-shipment") ||
          isOrderShipmentRetryPending(order);
        const canRetryShipment = canRetryOrderShipment(order);
        const showRetryShipment = canRetryShipment || isRetryingShipment;
        const isLabelDownloaded = hasOrderLabelBeenDownloaded(
          order,
          downloadedLabelOrderIds
        );

        return (
          <div className="flex justify-start items-center gap-1">
            {hasWaybill ? (
              <input
                type="checkbox"
                aria-label={`Select order ${order?.order_number || orderId}`}
                checked={isSelected}
                disabled={
                  loading ||
                  !orderId ||
                  (!isSelected && selectedOrderIds.length >= bulkSelectionLimit)
                }
                onChange={() => onToggleOrderSelection?.(order)}
                className="size-4 shrink-0 cursor-pointer accent-primary disabled:cursor-not-allowed disabled:opacity-50"
              />
            ) : null}
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
            {showRetryShipment ? (
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={
                        isRetryingShipment ? "Retrying shipment" : "Retry shipment"
                      }
                      onClick={() => onRetryShipment?.(order)}
                      disabled={loading || !orderId || isRetryingShipment || !canRetryShipment}
                    >
                      {isRetryingShipment ? (
                        <Loader2 className="size-4 animate-spin text-amber-600" />
                      ) : (
                        <RefreshCw className="size-4 text-amber-600" />
                      )}
                    </Button>
                  }
                />
                <TooltipContent>
                  {isRetryingShipment ? "Retrying…" : "Retry Shipment"}
                </TooltipContent>
              </Tooltip>
            ) : null}
            {hasWaybill ? (
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Download Label"
                      className={
                        isLabelDownloaded
                          ? "text-green-600 hover:text-green-600"
                          : undefined
                      }
                      onClick={() => onDownloadLabel?.(order)}
                      disabled={loading || !orderId}
                    >
                      {isDownloadingLabel ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Download
                          className={`size-4${isLabelDownloaded ? " text-green-600" : ""}`}
                        />
                      )}
                    </Button>
                  }
                />
                <TooltipContent>
                  {isLabelDownloaded ? "Label Downloaded" : "Download Label"}
                </TooltipContent>
              </Tooltip>
            ) : null}
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
        const order = row.original;
        const status = getOrderDeliveryStatus(order);
        const failedReason = getOrderShipmentFailedReason(order);
        const label = formatLabel(status);
        const badge = (
          <Badge className={getDeliveryStatusClass(status)}>
            {label}
          </Badge>
        );

        if (!failedReason) return badge;

        return (
          <Tooltip>
            <TooltipTrigger render={<span className="inline-flex">{badge}</span>} />
            <TooltipContent className="max-w-xs">{failedReason}</TooltipContent>
          </Tooltip>
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
