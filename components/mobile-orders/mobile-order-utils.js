export function parseOrderDate(value) {
  if (!value) return null;

  const date = new Date(String(value).replace(" ", "T"));
  return Number.isNaN(date.getTime()) ? null : date;
}

export function getOrderDateKey(order) {
  const date = parseOrderDate(order?.created_at);
  if (!date) return "unknown";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function getReturnOrderDateKey(returnOrder) {
  const date = parseOrderDate(
    returnOrder?.requested_at || returnOrder?.created_at
  );
  if (!date) return "unknown";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function formatMobileDateLabel(dateKey) {
  if (!dateKey || dateKey === "unknown") return "Unknown Date";

  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function formatMobileTime(value) {
  const date = parseOrderDate(value);
  if (!date) return "-";

  return new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

export function groupItemsByDate(items, getDateKey) {
  const groups = new Map();

  items.forEach((item) => {
    const key = getDateKey(item);
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key).push(item);
  });

  return [...groups.entries()]
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([dateKey, groupItems]) => ({
      dateKey,
      dateLabel: formatMobileDateLabel(dateKey),
      items: groupItems,
    }));
}

export function getCustomerName(item, mode = "order") {
  if (mode === "return") {
    return item?.customer?.name || item?.customer?.full_name || "-";
  }

  return (
    item?.user?.name ||
    item?.shipping_address?.name ||
    "-"
  );
}

export function getCustomerPhone(item, mode = "order") {
  if (mode === "return") {
    return item?.customer?.phone || item?.customer?.mobile || "-";
  }

  return (
    item?.user?.phone ||
    item?.shipping_address?.phone ||
    item?.shipping_address?.mobile ||
    "-"
  );
}

export function getProductCount(item, mode = "order") {
  if (mode === "return") {
    return Array.isArray(item?.items) ? item.items.length : 0;
  }

  return Array.isArray(item?.order_items) ? item.order_items.length : 0;
}

export function formatDateValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function parseDateValue(value) {
  if (!value) return null;

  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}
