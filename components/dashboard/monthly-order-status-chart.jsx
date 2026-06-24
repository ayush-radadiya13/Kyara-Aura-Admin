"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useMonthlyOrderStatus } from "@/hooks/admin/module/use-dashboard";
import {
  DashboardChartCard,
  DashboardEmptyState,
} from "@/components/dashboard/dashboard-chart-card";
import {
  formatNumber,
  ORDER_STATUS_COLORS,
  ORDER_STATUS_LABELS,
  unwrapDashboardData,
} from "@/lib/dashboard-utils";

const STATUS_KEYS = Object.keys(ORDER_STATUS_COLORS);

function MonthlyStatusTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border border-border/80 bg-card px-3 py-2 text-xs shadow-md">
      <p className="mb-2 font-medium">{label}</p>
      <div className="space-y-1">
        {payload
          .filter((item) => Number(item.value) > 0)
          .map((item) => (
            <p key={item.dataKey} className="text-muted-foreground">
              {ORDER_STATUS_LABELS[item.dataKey] ?? item.dataKey}:{" "}
              {formatNumber(item.value)}
            </p>
          ))}
      </div>
    </div>
  );
}

export function MonthlyOrderStatusChart() {
  const { data, isLoading, isError } = useMonthlyOrderStatus();
  const chartData = (unwrapDashboardData(data) ?? []).map((month) => ({
    ...month.statuses,
    label: month.label ?? month.month ?? "",
    total: Number(month.total ?? 0),
  }));
  const hasData = chartData.some((month) => month.total > 0);

  return (
    <DashboardChartCard
      title="Monthly Order Status"
      description="Order status breakdown for the last 12 months"
      isLoading={isLoading}
      isError={isError}
      contentClassName="pt-0"
    >
      {!hasData ? (
        <DashboardEmptyState message="No orders recorded in the last 12 months." />
      ) : (
        <div className="h-[340px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                interval="preserveStartEnd"
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                allowDecimals={false}
              />
              <Tooltip content={<MonthlyStatusTooltip />} />
              <Legend
                iconType="circle"
                wrapperStyle={{ fontSize: 11, paddingTop: 12 }}
              />
              {STATUS_KEYS.map((status) => (
                <Bar
                  key={status}
                  dataKey={status}
                  name={ORDER_STATUS_LABELS[status]}
                  stackId="orders"
                  fill={ORDER_STATUS_COLORS[status]}
                  maxBarSize={42}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </DashboardChartCard>
  );
}
