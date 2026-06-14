"use client";

import { Ban, Loader2, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatCurrency, formatDateTime } from "./customer-utils";

export function getCustomerColumns(loading, customerActions = {}) {
  const { onBanUser, onUnbanUser, actionUserId, actionType } = customerActions;

  return () => [
    {
      accessorKey: "id",
      header: "ID",
      meta: { width: "80px" },
      cell: ({ row }) => <span>{row.getValue("id") || "-"}</span>,
    },
    {
      accessorKey: "name",
      header: "Name",
      meta: { width: "180px" },
      cell: ({ row }) => (
        <span className="font-medium">{row.getValue("name") || "-"}</span>
      ),
    },
    {
      accessorKey: "email",
      header: "Email",
      meta: { width: "230px" },
      cell: ({ row }) => <span>{row.getValue("email") || "-"}</span>,
    },
    {
      accessorKey: "phone",
      header: "Phone",
      meta: { width: "140px" },
      cell: ({ row }) => <span>{row.getValue("phone") || "-"}</span>,
    },
    {
      accessorKey: "is_banned",
      header: "Status",
      meta: { width: "120px" },
      cell: ({ row }) => {
        const isBanned = row.getValue("is_banned");

        return (
          <Badge
            className={
              isBanned
                ? "bg-red-100 text-red-700 hover:bg-red-100"
                : "bg-green-100 text-green-700 hover:bg-green-100"
            }
          >
            {isBanned ? "Banned" : "Active"}
          </Badge>
        );
      },
    },
    {
      accessorKey: "banned_until",
      header: "Banned Until",
      meta: { width: "170px" },
      cell: ({ row }) => <span>{formatDateTime(row.getValue("banned_until"))}</span>,
    },
    {
      accessorKey: "total_orders",
      header: "Orders",
      meta: { width: "100px" },
      cell: ({ row }) => <span>{row.getValue("total_orders") ?? "-"}</span>,
    },
    {
      accessorKey: "total_spent",
      header: "Total Spent",
      meta: { width: "140px" },
      cell: ({ row }) => <span>{formatCurrency(row.getValue("total_spent"))}</span>,
    },
    {
      accessorKey: "created_at",
      header: "Registered",
      meta: { width: "170px" },
      cell: ({ row }) => <span>{formatDateTime(row.getValue("created_at"))}</span>,
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      enableSorting: false,
      meta: { width: "110px" },
      cell: ({ row }) => {
        const customer = row.original;
        const userId = customer.id;
        const isBanned = Boolean(customer.is_banned);
        const isActing =
          actionUserId === userId && actionType === (isBanned ? "unban" : "ban");
        const label = isBanned ? "Unban User" : "Ban User";

        return (
          <div className="flex justify-end gap-1">
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={label}
                    onClick={() =>
                      isBanned ? onUnbanUser?.(customer) : onBanUser?.(customer)
                    }
                    disabled={loading || !userId}
                  >
                    {isActing ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : isBanned ? (
                      <ShieldCheck className="size-4 text-green-600" />
                    ) : (
                      <Ban className="size-4 text-destructive" />
                    )}
                  </Button>
                }
              />
              <TooltipContent>{label}</TooltipContent>
            </Tooltip>
          </div>
        );
      },
    },
  ];
}
