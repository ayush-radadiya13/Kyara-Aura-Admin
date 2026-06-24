"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useMonthlySales } from "@/hooks/admin/module/use-dashboard";
import {
  DashboardChartCard,
  DashboardEmptyState,
} from "@/components/dashboard/dashboard-chart-card";
import {
  formatCurrency,
  formatNumber,
  unwrapDashboardData,
} from "@/lib/dashboard-utils";

function SalesTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  const sales = payload.find((item) => item.dataKey === "total_sales");
  const orders = payload.find((item) => item.dataKey === "order_count");

  return (
    <div className="rounded-lg border border-border/80 bg-card px-3 py-2 text-xs shadow-md">
      <p className="mb-1 font-medium">{label}</p>
      <p className="text-muted-foreground">
        Sales: {formatCurrency(sales?.value ?? 0)}
      </p>
      <p className="text-muted-foreground">
        Orders: {formatNumber(orders?.value ?? 0)}
      </p>
    </div>
  );
}

export function MonthlySalesChart() {
  const { data, isLoading, isError } = useMonthlySales();
  const chartData = unwrapDashboardData(data) ?? [];
  const hasData = chartData.some(
    (item) => Number(item?.total_sales ?? 0) > 0 || Number(item?.order_count ?? 0) > 0
  );

  return (
    <DashboardChartCard
      title="Monthly Sales"
      description="Revenue and orders over the last 12 months"
      isLoading={isLoading}
      isError={isError}
    >
      {!hasData ? (
        <DashboardEmptyState message="No sales recorded in the last 12 months." />
      ) : (
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 8, right: 8, left: 4, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                interval="preserveStartEnd"
              />
              <YAxis
                yAxisId="sales"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                tickFormatter={(value) => formatCurrency(value)}
                width={80}
              />
              <YAxis
                yAxisId="orders"
                orientation="right"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                width={36}
              />
              <Tooltip content={<SalesTooltip />} />
              <Bar
                yAxisId="sales"
                dataKey="total_sales"
                name="Sales"
                fill="var(--chart-1)"
                radius={[6, 6, 0, 0]}
                maxBarSize={36}
              />
              <Bar
                yAxisId="orders"
                dataKey="order_count"
                name="Orders"
                fill="var(--chart-2)"
                radius={[6, 6, 0, 0]}
                maxBarSize={36}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </DashboardChartCard>
  );
}
