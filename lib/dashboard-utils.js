export const DASHBOARD_CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

export const ORDER_STATUS_COLORS = {
  pending: "#f59e0b",
  processing: "#3b82f6",
  shipped: "#6366f1",
  delivered: "#22c55e",
  return_requested: "#a855f7",
  returned: "#ec4899",
  cancelled: "#ef4444",
  manual_review: "#9a8678",
};

export const ORDER_STATUS_LABELS = {
  pending: "Pending",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  return_requested: "Return Requested",
  returned: "Returned",
  cancelled: "Cancelled",
  manual_review: "Manual Review",
};

export function formatNumber(value) {
  const numericValue = Number(value ?? 0);
  if (Number.isNaN(numericValue)) return "0";

  return new Intl.NumberFormat("en-IN").format(numericValue);
}

export function formatCurrency(value) {
  const numericValue = Number(value ?? 0);
  if (Number.isNaN(numericValue)) return "₹0";

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(numericValue);
}

export function unwrapDashboardData(response) {
  return response?.data ?? response ?? null;
}

export function normalizeDistributionItems(response) {
  const raw = unwrapDashboardData(response);

  if (Array.isArray(raw)) {
    return raw.map((item, index) => ({
      key: item?.method ?? item?.gender ?? item?.label ?? `item-${index}`,
      label: item?.label ?? item?.method ?? item?.gender ?? "Unknown",
      count: Number(item?.count ?? item?.value ?? 0),
      percentage: Number(item?.percentage ?? 0),
      fill: DASHBOARD_CHART_COLORS[index % DASHBOARD_CHART_COLORS.length],
    }));
  }

  if (raw && typeof raw === "object") {
    return Object.entries(raw).map(([key, value], index) => ({
      key,
      label: String(key).replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase()),
      count: Number(value ?? 0),
      percentage: 0,
      fill: DASHBOARD_CHART_COLORS[index % DASHBOARD_CHART_COLORS.length],
    }));
  }

  return [];
}
