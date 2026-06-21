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
import { useWeeklyOrderStatus } from "@/hooks/admin/module/use-dashboard";
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

function formatWeekLabel(weekStart, weekEnd) {
  if (!weekStart) return "";

  const start = new Date(`${weekStart}T00:00:00`);
  const end = weekEnd ? new Date(`${weekEnd}T00:00:00`) : null;

  const startLabel = start.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });

  if (!end || Number.isNaN(end.getTime())) {
    return startLabel;
  }

  const endLabel = end.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });

  return `${startLabel} - ${endLabel}`;
}

function WeeklyStatusTooltip({ active, payload, label }) {
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

export function WeeklyOrderStatusChart() {
  const { data, isLoading, isError } = useWeeklyOrderStatus();
  const chartData = (unwrapDashboardData(data) ?? []).map((week) => ({
    ...week.statuses,
    weekLabel: formatWeekLabel(week.week_start, week.week_end),
    total: Number(week.total ?? 0),
  }));
  const hasData = chartData.some((week) => week.total > 0);

  return (
    <DashboardChartCard
      title="Weekly Order Status"
      description="Order status breakdown for the last 8 weeks"
      isLoading={isLoading}
      isError={isError}
      contentClassName="pt-0"
    >
      {!hasData ? (
        <DashboardEmptyState message="No orders recorded in the last 8 weeks." />
      ) : (
        <div className="h-[340px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis
                dataKey="weekLabel"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                interval={0}
                angle={-18}
                textAnchor="end"
                height={56}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                allowDecimals={false}
              />
              <Tooltip content={<WeeklyStatusTooltip />} />
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
