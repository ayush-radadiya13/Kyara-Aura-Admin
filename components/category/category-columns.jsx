"use client";

import { Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function getCategoryColumns(loading) {
  return (_sortAttr, _sort, _onSort, onDelete, onEdit) => [
    {
      accessorKey: "name",
      header: "Name",
      meta: { width: "18%" },
      cell: ({ row }) => (
        <span className="font-medium">{row.getValue("name")}</span>
      ),
    },
    {
      accessorKey: "slug",
      header: "Slug",
      meta: { width: "16%" },
      cell: ({ row }) => (
        <span>{row.getValue("slug") || "-"}</span>
      ),
    },
    {
      accessorKey: "description",
      header: "Description",
      meta: { width: "auto" },
      cell: ({ row }) => (
        <span>{row.getValue("description")}</span>
      ),
    },
    {
      accessorKey: "sort_order",
      header: "Sort",
      meta: { width: "80px" },
      cell: ({ row }) => <span>{row.getValue("sort_order") ?? "-"}</span>,
    },
    {
      accessorKey: "parent_name",
      header: "Parent",
      meta: { width: "120px" },
      cell: ({ row }) => <span>{row.getValue("parent_name") || "Root"}</span>,
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
