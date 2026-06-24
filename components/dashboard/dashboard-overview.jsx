"use client";

import { RefreshCw } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { GenderDistributionChart } from "@/components/dashboard/gender-distribution-chart";
import { MonthlySalesChart } from "@/components/dashboard/monthly-sales-chart";
import { PaymentMethodChart } from "@/components/dashboard/payment-method-chart";
import { TopProductsChart } from "@/components/dashboard/top-products-chart";
import { TotalCustomersCard } from "@/components/dashboard/total-customers-card";
import { MonthlyOrderStatusChart } from "@/components/dashboard/monthly-order-status-chart";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";

export function DashboardOverview() {
  const queryClient = useQueryClient();

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["dashboard"] });
  };

  return (
    <section>
      <PageHeader
        title="Dashboard"
        description="Track your platform performance and business activity."
        action={
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="size-4" />
            Refresh
          </Button>
        }
      />

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-stretch">
          <div className="flex min-w-0 flex-1">
            <TotalCustomersCard />
          </div>
          <div className="min-w-0 flex-1">
            <PaymentMethodChart />
          </div>
        </div>
        <MonthlySalesChart />
      </div>

      <div className="mt-4">
        <MonthlyOrderStatusChart />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <TopProductsChart />
        <GenderDistributionChart />
      </div>
    </section>
  );
}
