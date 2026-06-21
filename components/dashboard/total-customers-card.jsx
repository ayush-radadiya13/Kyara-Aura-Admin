"use client";

import { ArrowDownRight, ArrowUpRight, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useTotalCustomers } from "@/hooks/admin/module/use-dashboard";
import { formatNumber, unwrapDashboardData } from "@/lib/dashboard-utils";
import { cn } from "@/lib/utils";

export function TotalCustomersCard() {
  const { data, isLoading, isError } = useTotalCustomers();
  const stats = unwrapDashboardData(data) ?? {};

  const total = Number(stats.total ?? 0);
  const thisMonth = Number(stats.this_month ?? 0);
  const lastMonth = Number(stats.last_month ?? 0);
  const monthChange = thisMonth - lastMonth;
  const isPositive = monthChange >= 0;

  return (
    <Card className="panel-shadow rounded-2xl border-border/70 transition-all duration-300 hover:-translate-y-0.5">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Total Customers
        </CardTitle>
        <div className="rounded-full bg-secondary/40 p-2 text-primary">
          <Users className="size-4" />
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-4 w-40" />
          </div>
        ) : isError ? (
          <p className="text-sm text-muted-foreground">Failed to load customer stats.</p>
        ) : (
          <>
            <p className="text-3xl font-semibold tracking-tight">{formatNumber(total)}</p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-muted/50 px-3 py-2">
                <p className="text-xs text-muted-foreground">This month</p>
                <p className="text-lg font-semibold">{formatNumber(thisMonth)}</p>
              </div>
              <div className="rounded-xl bg-muted/50 px-3 py-2">
                <p className="text-xs text-muted-foreground">Last month</p>
                <p className="text-lg font-semibold">{formatNumber(lastMonth)}</p>
              </div>
            </div>
            <div
              className={cn(
                "mt-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium",
                isPositive
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              )}
            >
              {isPositive ? (
                <ArrowUpRight className="size-3.5" />
              ) : (
                <ArrowDownRight className="size-3.5" />
              )}
              {isPositive ? "+" : ""}
              {formatNumber(monthChange)} vs last month
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
