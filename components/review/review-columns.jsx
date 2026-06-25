"use client";

import { Loader2, Star } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

function RatingStars({ rating }) {
  const value = Number(rating) || 0;

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center">
        {Array.from({ length: 5 }).map((_, index) => (
          <Star
            key={index}
            className={cn(
              "size-4",
              index < value
                ? "fill-amber-400 text-amber-400"
                : "text-muted-foreground/30"
            )}
          />
        ))}
      </div>
      <span className="text-sm text-muted-foreground">{value}</span>
    </div>
  );
}

export function getReviewColumns(loading, reviewActions = {}) {
  const { onToggleVisibility, actionReviewId } = reviewActions;

  return () => [
    {
      accessorKey: "id",
      header: "ID",
      meta: { width: "80px" },
      cell: ({ row }) => <span>{row.original.id ?? "-"}</span>,
    },
    {
      accessorKey: "customer_name",
      header: "Customer Name",
      meta: { width: "200px" },
      cell: ({ row }) => (
        <span className="font-medium">{row.original.customer_name || "-"}</span>
      ),
    },
    {
      accessorKey: "product_name",
      header: "Product Name",
      meta: { width: "220px" },
      cell: ({ row }) => <span>{row.original.product_name || "-"}</span>,
    },
    {
      accessorKey: "rating",
      header: "Rating",
      meta: { width: "150px" },
      cell: ({ row }) => <RatingStars rating={row.original.rating} />,
    },
    {
      accessorKey: "review",
      header: "Description",
      meta: { width: "280px" },
      enableSorting: false,
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.review || "-"}
        </span>
      ),
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      enableSorting: false,
      meta: { width: "140px" },
      cell: ({ row }) => {
        const review = row.original;
        const reviewId = review.id;
        const isActing = actionReviewId === reviewId;

        return (
          <div className="flex items-center justify-end gap-2">
            {isActing ? (
              <Loader2 className="size-4 animate-spin text-muted-foreground" />
            ) : null}
            <Switch
              checked={Boolean(review.on_web_show)}
              onCheckedChange={(checked) =>
                onToggleVisibility?.(review, checked)
              }
              disabled={loading || !reviewId}
              aria-label="Show review on website"
            />
          </div>
        );
      },
    },
  ];
}
