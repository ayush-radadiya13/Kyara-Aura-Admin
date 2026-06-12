"use client";

import Image from "next/image";
import { Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  formatCurrency,
  formatDateTime,
  formatLabel,
  getOrderStatusClass,
  getPaymentStatusClass,
} from "./order-utils";

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

export function getOrderColumns(loading) {
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
          <Badge className={getOrderStatusClass(status)}>
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
      meta: { width: "110px" },
      cell: ({ row }) => (
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="icon"
            aria-label="View details"
            title="View Details"
            onClick={() => onViewDetails?.(row.original.order)}
            disabled={loading}
          >
            <Eye className="size-4" />
          </Button>
        </div>
      ),
    },
  ];
}
