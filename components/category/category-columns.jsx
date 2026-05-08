"use client";

import { Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function getCategoryColumns(loading) {
  return (_sortAttr, _sort, _onSort, onDelete, onEdit) => [
    {
      accessorKey: "name",
      header: "Name",
      meta: { width: "28%" },
      cell: ({ row }) => (
        <span className="font-medium">{row.getValue("name")}</span>
      ),
    },
    {
      accessorKey: "description",
      header: "Description",
      meta: { width: "auto" },
      cell: ({ row }) => (
        <span className="text-muted-foreground">{row.getValue("description")}</span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      meta: { width: "120px" },
      cell: ({ row }) => {
        const status = row.getValue("status");
        return (
          <Badge variant={status === "active" ? "default" : "secondary"}>
            {status}
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
