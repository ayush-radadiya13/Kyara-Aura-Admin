export function getCustomerId(customer) {
  return customer?.id ?? customer?._id ?? customer?.user_id ?? null;
}

export function formatCurrency(value) {
  if (value === undefined || value === null || value === "") return "-";

  const numberValue = Number(value);
  if (Number.isNaN(numberValue)) return value;

  return numberValue.toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  });
}

export function formatDateTime(value) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function formatGender(value) {
  if (!value) return "-";

  return String(value)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function normalizeCustomer(customer) {
  const totalOrders =
    customer?.total_orders ?? customer?.orders_count ?? customer?.orders ?? customer?.order_count;
  const totalSpent =
    customer?.total_spent ?? customer?.spent ?? customer?.amount_spent ?? customer?.lifetime_spent;

  return {
    ...customer,
    id: getCustomerId(customer),
    name: customer?.name ?? customer?.full_name ?? customer?.username ?? "-",
    email: customer?.email ?? "-",
    phone: customer?.phone ?? customer?.mobile ?? customer?.phone_number ?? "-",
    gender: customer?.gender ?? null,
    is_banned: Boolean(customer?.is_banned),
    banned_until: customer?.banned_until ?? null,
    total_orders: totalOrders ?? 0,
    total_spent: totalSpent ?? 0,
    created_at: customer?.created_at ?? customer?.registered_at ?? customer?.registration_date ?? null,
  };
}

export function normalizeCustomersResponse(data) {
  return (data?.data || data?.results || data?.users || []).map(normalizeCustomer);
}
