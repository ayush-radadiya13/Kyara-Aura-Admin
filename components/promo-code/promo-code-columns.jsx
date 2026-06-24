"use client";

import { Badge } from "@/components/ui/badge";
import {
  formatCurrency,
  formatDateTime,
} from "@/components/promo-code/promo-code-utils";

export function getPromoCodeColumns() {
  return () => [
    {
      accessorKey: "id",
      header: "ID",
      meta: { width: "70px" },
      cell: ({ row }) => <span>{row.getValue("id") ?? "-"}</span>,
    },
    {
      accessorKey: "code",
      header: "Code",
      meta: { width: "140px" },
      cell: ({ row }) => (
        <span className="font-medium uppercase">{row.getValue("code") || "-"}</span>
      ),
    },
    {
      accessorKey: "discount_percent",
      header: "Discount %",
      meta: { width: "120px" },
      cell: ({ row }) => {
        const value = row.getValue("discount_percent");
        return <span>{value !== null && value !== undefined ? `${value}%` : "-"}</span>;
      },
    },
    {
      accessorKey: "discount_amount",
      header: "Discount Amount",
      meta: { width: "150px" },
      cell: ({ row }) => <span>{formatCurrency(row.getValue("discount_amount"))}</span>,
    },
    {
      accessorKey: "is_redeemed",
      header: "Redeemed",
      meta: { width: "120px" },
      cell: ({ row }) => {
        const status = row.getValue("is_redeemed");

        return (
          <Badge
            className={
              status
                ? "bg-green-100 text-green-700 hover:bg-green-100"
                : "bg-red-100 text-red-700 hover:bg-red-100"
            }
          >
            {status ? "Yes" : "No"}
          </Badge>
        );
      },
    },
    {
      accessorKey: "redeemed_at",
      header: "Redeemed At",
      meta: { width: "180px" },
      cell: ({ row }) => <span>{formatDateTime(row.getValue("redeemed_at"))}</span>,
    },
    {
      accessorKey: "created_at",
      header: "Created At",
      meta: { width: "180px" },
      cell: ({ row }) => <span>{formatDateTime(row.getValue("created_at"))}</span>,
    },
  ];
}
