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
import { useTopProducts } from "@/hooks/admin/module/use-dashboard";
import {
  DashboardChartCard,
  DashboardEmptyState,
} from "@/components/dashboard/dashboard-chart-card";
import { formatNumber, unwrapDashboardData } from "@/lib/dashboard-utils";

function TopProductsTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;

  const item = payload[0]?.payload;
  if (!item) return null;

  return (
    <div className="rounded-lg border border-border/80 bg-card px-3 py-2 text-xs shadow-md">
      <p className="font-medium">{item.product_name}</p>
      <p className="text-muted-foreground">
        Quantity sold: {formatNumber(item.quantity_sold)}
      </p>
    </div>
  );
}

export function TopProductsChart() {
  const { data, isLoading, isError } = useTopProducts();
  const chartData = (unwrapDashboardData(data) ?? []).map((item, index) => ({
    ...item,
    product_name: item?.product_name ?? item?.name ?? `Product ${index + 1}`,
    quantity_sold: Number(item?.quantity_sold ?? item?.quantity ?? 0),
    short_name:
      (item?.product_name ?? item?.name ?? `Product ${index + 1}`).length > 22
        ? `${String(item?.product_name ?? item?.name).slice(0, 22)}...`
        : item?.product_name ?? item?.name ?? `Product ${index + 1}`,
  }));
  const hasData = chartData.some((item) => item.quantity_sold > 0);

  return (
    <DashboardChartCard
      title="Top Products"
      description="Top 5 products by quantity sold"
      isLoading={isLoading}
      isError={isError}
    >
      {!hasData ? (
        <DashboardEmptyState message="No product sales data available yet." />
      ) : (
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 8, right: 16, left: 8, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" />
              <XAxis
                type="number"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              />
              <YAxis
                type="category"
                dataKey="short_name"
                tickLine={false}
                axisLine={false}
                width={110}
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              />
              <Tooltip content={<TopProductsTooltip />} />
              <Bar
                dataKey="quantity_sold"
                fill="var(--chart-3)"
                radius={[0, 6, 6, 0]}
                maxBarSize={28}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </DashboardChartCard>
  );
}
