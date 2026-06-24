"use client";

import Image from "next/image";
import { Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function getCategoryColumns(loading, offset = 0) {
  return (_sortAttr, _sort, _onSort, onDelete, onEdit) => [
    {
      accessorKey: "id",
      header: "ID",
      meta: { width: "70px" },
      cell: ({ row }) => <span>{offset + row.index + 1}</span>,
    },
    {
      accessorKey: "image_url",
      header: "Image",
      meta: { width: "90px" },
      cell: ({ row }) => {
        const image = row.getValue("image_url");
        return image ? (
          <Image
            src={image}
            alt={row.original.name || "Category image"}
            width={40}
            height={40}
            unoptimized
            className="h-10 w-10 rounded border object-cover"
          />
        ) : (
          <span className="text-muted-foreground">-</span>
        );
      },
    },
    {
      accessorKey: "name",
      header: "Name",
      meta: { width: "auto" },
      cell: ({ row }) => (
        <span className="font-medium">{row.getValue("name")}</span>
      ),
    },
    {
      accessorKey: "is_active",
      header: "Status",
      meta: { width: "120px" },
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
