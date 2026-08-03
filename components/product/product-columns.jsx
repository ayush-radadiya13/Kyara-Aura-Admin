"use client";

import { Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

function formatNumber(value) {
  if (value === undefined || value === null || value === "") return "-";

  const numberValue = Number(value);
  if (Number.isNaN(numberValue)) return value;

  return numberValue.toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  });
}

function calculateVariantDiscount(price, mrp) {
  const numPrice = Number(price);
  const numMrp = Number(mrp);

  if (!numMrp || Number.isNaN(numMrp) || Number.isNaN(numPrice) || numMrp <= 0 || numPrice >= numMrp) {
    return "0%";
  }

  const pct = Math.round(((numMrp - numPrice) / numMrp) * 100);
  return `${pct}%`;
}

export function getProductColumns(loading) {
  return (_sortAttr, _sort, _onSort, onDelete, onEdit) => [
    {
      accessorKey: "id",
      header: "ID",
      meta: { width: "70px" },
      cell: ({ row }) => <span>{row.getValue("id") || "-"}</span>,
    },
    {
      id: "image",
      header: "Image",
      meta: { width: "150px" },
      cell: ({ row }) => {
        const image = row.original.images?.[0];

        return image ? (
          <img
            src={image}
            alt={row.original.name ? `${row.original.name} thumbnail` : "Product thumbnail"}
            className="size-14 rounded-md border object-cover"
          />
        ) : (
          <span>-</span>
        );
      },
    },
    {
      accessorKey: "name",
      header: "Name",
      meta: { width: "230px" },
      cell: ({ row }) => (
        <span className="font-medium">{row.getValue("name")}</span>
      ),
    },
    {
      id: "variants",
      header: "Variants",
      meta: { width: "390px" },
      cell: ({ row }) => {
        const variants = row.original.sizes || [];
        if (!variants.length) return <span>-</span>;

        return (
          <div className="space-y-1 text-xs">
            <div className="grid grid-cols-[1fr_42px_68px_55px_48px] gap-2 font-semibold text-muted-foreground">
              <span>Size</span>
              <span>Qty</span>
              <span>Disc. Price</span>
              <span>MRP</span>
              <span>Disc %</span>
            </div>
            {variants.map((variant, index) => (
              <div
                key={`${variant.size_text || "variant"}-${index}`}
                className="grid grid-cols-[1fr_42px_68px_55px_48px] gap-2"
              >
                <span>{variant.size_text || "-"}</span>
                <span>{formatNumber(variant.quantity)}</span>
                <span>{formatNumber(variant.price)}</span>
                <span>{formatNumber(variant.discount_price)}</span>
                <span className="font-medium text-green-700">
                  {calculateVariantDiscount(variant.price, variant.discount_price)}
                </span>
              </div>
            ))}
          </div>
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
