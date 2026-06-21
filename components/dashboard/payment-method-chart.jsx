"use client";

import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { usePaymentMethodDistribution } from "@/hooks/admin/module/use-dashboard";
import {
  DashboardChartCard,
  DashboardEmptyState,
} from "@/components/dashboard/dashboard-chart-card";
import { formatNumber, normalizeDistributionItems } from "@/lib/dashboard-utils";

function PaymentTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;

  const item = payload[0]?.payload;
  if (!item) return null;

  return (
    <div className="rounded-lg border border-border/80 bg-card px-3 py-2 text-xs shadow-md">
      <p className="font-medium">{item.label}</p>
      <p className="text-muted-foreground">
        {formatNumber(item.count)} orders ({item.percentage}%)
      </p>
    </div>
  );
}

export function PaymentMethodChart() {
  const { data, isLoading, isError } = usePaymentMethodDistribution();
  const chartData = normalizeDistributionItems(data);
  const hasData = chartData.some((item) => item.count > 0);

  return (
    <DashboardChartCard
      title="Payment Methods"
      description="COD vs Online distribution"
      isLoading={isLoading}
      isError={isError}
    >
      {!hasData ? (
        <DashboardEmptyState message="No payment data available yet." />
      ) : (
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="count"
                nameKey="label"
                cx="50%"
                cy="50%"
                innerRadius={58}
                outerRadius={92}
                paddingAngle={3}
                strokeWidth={2}
                stroke="var(--card)"
              >
                {chartData.map((entry) => (
                  <Cell key={entry.key} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip content={<PaymentTooltip />} />
              <Legend
                verticalAlign="bottom"
                iconType="circle"
                formatter={(value) => (
                  <span className="text-xs text-muted-foreground">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </DashboardChartCard>
  );
}
