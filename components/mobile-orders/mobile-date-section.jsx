"use client";

import { useState } from "react";
import { CalendarDays, ChevronDown, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MobileOrderCard } from "./mobile-order-card";

export function MobileDateSection({
  dateLabel,
  items,
  mode = "order",
  renderCardProps,
  onDownloadAllStickers,
  isDownloadingAll,
  defaultOpen = true,
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <section className="mb-2">
      <div className="sticky top-[132px] z-10 border-b border-gray-200/70 bg-[#f4f6f9]/95 px-4 py-3 backdrop-blur-md">
        <button
          type="button"
          onClick={() => setIsOpen((open) => !open)}
          className="flex w-full items-center justify-between gap-3 text-left"
        >
          <div>
            <div className="flex items-center gap-2">
              <CalendarDays className="size-4 text-primary" />
              <h2 className="text-sm font-semibold text-gray-900">{dateLabel}</h2>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {items.length} Order{items.length === 1 ? "" : "s"}
            </p>
          </div>
          <ChevronDown
            className={cn(
              "size-5 text-muted-foreground transition-transform duration-200",
              isOpen && "rotate-180"
            )}
          />
        </button>

        {isOpen && onDownloadAllStickers ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-3 h-9 w-full rounded-lg"
            disabled={isDownloadingAll}
            onClick={onDownloadAllStickers}
          >
            {isDownloadingAll ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Download className="size-4" />
            )}
            Download All Stickers
          </Button>
        ) : null}
      </div>

      <div
        className={cn(
          "grid gap-3 px-4 py-3 transition-all duration-200",
          isOpen ? "grid-rows-[1fr] opacity-100" : "hidden"
        )}
      >
        {items.map((item) => {
          const cardProps = renderCardProps(item);

          return (
            <MobileOrderCard
              key={cardProps.key}
              item={item}
              mode={mode}
              {...cardProps}
            />
          );
        })}
      </div>
    </section>
  );
}
