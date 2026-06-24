"use client";

import { Eye, IndianRupee, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  canShowPayRefundButton,
  formatCurrency,
  formatDateTime,
  formatLabel,
  getPaymentMethodClass,
  getReturnItemSummary,
  getReturnRequestStatusClass,
} from "./return-order-utils";

export function getReturnOrderColumns(loading, actions = {}) {
  const { onPayRefund, payingReturnRequestId } = actions;

  return (_sortAttr, _sort, _onSort, _onDelete, onViewDetails) => [
    {
      id: "actions",
      header: () => <div className="text-left">Action</div>,
      enableSorting: false,
      meta: { width: "130px" },
      cell: ({ row }) => {
        const returnOrder = row.original;
        const showPayRefund = canShowPayRefundButton(returnOrder);
        const isPaying =
          payingReturnRequestId === returnOrder.return_request_id;

        return (
          <div className="flex justify-start items-center gap-1">
            {showPayRefund ? (
              <Button
                variant="ghost"
                size="icon"
                aria-label="Pay refund"
                title="Pay Refund"
                onClick={() => onPayRefund?.(returnOrder)}
                disabled={loading || isPaying}
              >
                {isPaying ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <IndianRupee className="size-4 text-green-600" />
                )}
              </Button>
            ) : null}
            <Button
              variant="ghost"
              size="icon"
              aria-label="View return details"
              title="View Details"
              onClick={() => onViewDetails?.(returnOrder)}
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
      meta: { width: "160px" },
      cell: ({ row }) => (
        <span className="font-medium">{row.getValue("order_number") || "-"}</span>
      ),
    },
    {
      id: "customer_name",
      header: "Customer",
      meta: { width: "170px" },
      accessorFn: (row) => row?.customer?.name ?? "",
      cell: ({ row }) => (
        <span className="font-medium">{row.original?.customer?.name || "-"}</span>
      ),
    },
    {
      accessorKey: "payment_method",
      header: "Payment",
      meta: { width: "110px" },
      cell: ({ row }) => {
        const method = row.getValue("payment_method");

        return (
          <Badge className={getPaymentMethodClass(method)}>
            {formatLabel(method)}
          </Badge>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Return Status",
      meta: { width: "150px" },
      cell: ({ row }) => {
        const status = row.getValue("status");

        return (
          <Badge
            className={`${getReturnRequestStatusClass(status)} inline-block h-auto min-h-5 w-full min-w-0 max-w-full shrink whitespace-normal break-words overflow-visible text-center leading-tight [overflow-wrap:anywhere]`}
          >
            {formatLabel(status)}
          </Badge>
        );
      },
    },
    {
      id: "items_summary",
      header: "Items",
      meta: { width: "200px" },
      accessorFn: (row) => getReturnItemSummary(row?.items),
      cell: ({ row }) => (
        <span className="text-sm">{getReturnItemSummary(row.original?.items)}</span>
      ),
    },
    {
      accessorKey: "reason",
      header: "Reason",
      meta: { width: "180px" },
      cell: ({ row }) => (
        <span className="line-clamp-2 text-sm">{row.getValue("reason") || "-"}</span>
      ),
    },
    {
      accessorKey: "refund_amount",
      header: "Refund Amount",
      meta: { width: "130px" },
      cell: ({ row }) => (
        <span className="font-medium">
          {formatCurrency(row.getValue("refund_amount"))}
        </span>
      ),
    },
    {
      accessorKey: "is_partial",
      header: "Type",
      meta: { width: "100px" },
      cell: ({ row }) => {
        const isPartial = row.getValue("is_partial");

        return (
          <Badge
            className={
              isPartial
                ? "bg-amber-100 text-amber-700 hover:bg-amber-100"
                : "bg-slate-100 text-slate-700 hover:bg-slate-100"
            }
          >
            {isPartial ? "Partial" : "Full"}
          </Badge>
        );
      },
    },
    {
      accessorKey: "requested_at",
      header: "Requested",
      meta: { width: "160px" },
      cell: ({ row }) => <span>{formatDateTime(row.getValue("requested_at"))}</span>,
    },
  ];
}
