"use client";

import { Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function getProductColumns(loading) {
  return (_sortAttr, _sort, _onSort, onDelete, onEdit) => [
    {
      accessorKey: "name",
      header: "Name",
      meta: { width: "20%" },
      cell: ({ row }) => (
        <span className="font-medium">{row.getValue("name")}</span>
      ),
    },
    {
      accessorKey: "slug",
      header: "Slug",
      meta: { width: "15%" },
      cell: ({ row }) => (
        <span>{row.getValue("slug") || "-"}</span>
      ),
    },
    {
      accessorKey: "price",
      header: "Price",
      meta: { width: "100px" },
      cell: ({ row }) => (
        <span>${parseFloat(row.getValue("price") || 0).toFixed(2)}</span>
      ),
    },
    {
      accessorKey: "sale_price",
      header: "Sale Price",
      meta: { width: "100px" },
      cell: ({ row }) => {
        const salePrice = row.getValue("sale_price");
        return salePrice ? <span className="text-green-600">${parseFloat(salePrice).toFixed(2)}</span> : <span>-</span>;
      },
    },
    {
      accessorKey: "stock_quantity",
      header: "Stock",
      meta: { width: "80px" },
      cell: ({ row }) => {
        const stock = row.getValue("stock_quantity");
        const trackStock = row.original.track_stock;
        if (!trackStock) return <span>-</span>;
        return (
          <Badge
            className={
              stock > 10
                ? "bg-green-100 text-green-700 hover:bg-green-100"
                : stock > 0
                ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-100"
                : "bg-red-100 text-red-700 hover:bg-red-100"
            }
          >
            {stock}
          </Badge>
        );
      },
    },
    {
      accessorKey: "category_name",
      header: "Category",
      meta: { width: "120px" },
      cell: ({ row }) => <span>{row.getValue("category_name") || "-"}</span>,
    },
    {
      accessorKey: "is_active",
      header: "Status",
      meta: { width: "100px" },
      cell: ({ row }) => {
        const status = row.getValue("is_active");
        return (
          <Badge
            className={
              status
                ? "bg-green-100 text-green-700 hover:bg-green-100"
                : "bg-red-100 text-red-700 hover:bg-red-100"
            }
          >
            {status ? "Active" : "Inactive"}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      meta: { width: "100px" },
      cell: ({ row }) => (
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="mr-1"
            onClick={() => onEdit?.(row.original)}
            disabled={loading}
          >
            <Pencil className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete?.(row.original)}
            disabled={loading}
          >
            <Trash2 className="size-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];
}
