"use client";

import { RefreshCw } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { GenderDistributionChart } from "@/components/dashboard/gender-distribution-chart";
import { MonthlySalesChart } from "@/components/dashboard/monthly-sales-chart";
import { PaymentMethodChart } from "@/components/dashboard/payment-method-chart";
import { TopProductsChart } from "@/components/dashboard/top-products-chart";
import { TotalCustomersCard } from "@/components/dashboard/total-customers-card";
import { WeeklyOrderStatusChart } from "@/components/dashboard/weekly-order-status-chart";
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

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <TotalCustomersCard />
        <MonthlySalesChart />
        <PaymentMethodChart />
      </div>

      <div className="mt-4">
        <WeeklyOrderStatusChart />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <TopProductsChart />
        <GenderDistributionChart />
      </div>
    </section>
  );
}
