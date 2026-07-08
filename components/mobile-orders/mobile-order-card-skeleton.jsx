"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function MobileOrderCardSkeleton() {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-5 w-28" />
          </div>
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-4 w-28" />
        <div className="flex justify-between">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-14 rounded-full" />
        </div>
        <div className="flex justify-between">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-12" />
        </div>
      </div>
      <div className="mt-4 space-y-2 border-t border-gray-100 pt-4">
        <Skeleton className="h-11 w-full rounded-xl" />
        <Skeleton className="h-11 w-full rounded-xl" />
      </div>
    </div>
  );
}

export function MobileOrderListSkeleton({ count = 4 }) {
  return (
    <div className="space-y-3 px-4 py-4">
      {Array.from({ length: count }).map((_, index) => (
        <MobileOrderCardSkeleton key={index} />
      ))}
    </div>
  );
}
