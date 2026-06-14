"use client";

export function formatCurrency(value) {
  const numericValue = Number(value ?? 0);

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number.isNaN(numericValue) ? 0 : numericValue);
}

export function formatDateTime(value) {
  if (!value) return "-";

  const date = new Date(String(value).replace(" ", "T"));
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function formatLabel(value) {
  if (!value) return "-";

  return String(value)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function getOrderStatusClass(status) {
  const normalizedStatus = String(status || "").toLowerCase();

  if (["delivered", "completed"].includes(normalizedStatus)) {
    return "bg-green-100 text-green-700 hover:bg-green-100";
  }

  if (["pending", "processing", "confirmed", "shipped"].includes(normalizedStatus)) {
    return "bg-blue-100 text-blue-700 hover:bg-blue-100";
  }

  if (["returned", "refunded"].includes(normalizedStatus)) {
    return "bg-purple-100 text-purple-700 hover:bg-purple-100";
  }

  if (["cancelled", "failed"].includes(normalizedStatus)) {
    return "bg-red-100 text-red-700 hover:bg-red-100";
  }

  return "bg-gray-100 text-gray-700 hover:bg-gray-100";
}

export function getPaymentStatusClass(status) {
  const normalizedStatus = String(status || "").toLowerCase();

  if (["paid", "captured", "success"].includes(normalizedStatus)) {
    return "bg-green-100 text-green-700 hover:bg-green-100";
  }

  if (["pending", "processing"].includes(normalizedStatus)) {
    return "bg-yellow-100 text-yellow-700 hover:bg-yellow-100";
  }

  if (["refunded"].includes(normalizedStatus)) {
    return "bg-purple-100 text-purple-700 hover:bg-purple-100";
  }

  if (["failed", "cancelled"].includes(normalizedStatus)) {
    return "bg-red-100 text-red-700 hover:bg-red-100";
  }

  return "bg-gray-100 text-gray-700 hover:bg-gray-100";
}

export function isCodOrder(order) {
  const checkoutType = String(order?.checkout_type || "").toLowerCase();
  const paymentMethod = String(order?.payment_method || "").toLowerCase();

  return [checkoutType, paymentMethod].some((value) =>
    ["cod", "cash_on_delivery", "cash on delivery"].includes(value)
  );
}

export function isPendingAdminConfirmation(order) {
  return (
    String(order?.status || "").toLowerCase() ===
    "pending_admin_confirmation"
  );
}

export function normalizeOrder(item) {
  return {
    id: item?.id ?? item?._id ?? null,
    user: item?.user ?? {},
    order_number: item?.order_number ?? "",
    checkout_type: item?.checkout_type ?? "",
    status: item?.status ?? "",
    payment_status: item?.payment_status ?? "",
    payment_method: item?.payment_method ?? "",
    razorpay_order_id: item?.razorpay_order_id ?? "",
    razorpay_payment_id: item?.razorpay_payment_id ?? "",
    paid_at: item?.paid_at ?? null,
    payment_failed_at: item?.payment_failed_at ?? null,
    shipment: item?.shipment ?? null,
    shipment_detail: item?.shipment_detail ?? null,
    shipment_details: item?.shipment_details ?? null,
    shipment_status: item?.shipment_status ?? "",
    shipment_id: item?.shipment_id ?? null,
    courier_shipment_id: item?.courier_shipment_id ?? null,
    awb_code: item?.awb_code ?? "",
    tracking_number: item?.tracking_number ?? "",
    courier_tracking_number: item?.courier_tracking_number ?? "",
    subtotal: item?.subtotal ?? 0,
    tax_amount: item?.tax_amount ?? 0,
    shipping_amount: item?.shipping_amount ?? 0,
    total_amount: item?.total_amount ?? 0,
    address_id: item?.address_id ?? null,
    shipping_address: item?.shipping_address ?? {},
    billing_address: item?.billing_address ?? {},
    notes: item?.notes ?? "",
    order_items: Array.isArray(item?.order_items) ? item.order_items : [],
    created_at: item?.created_at ?? "",
    updated_at: item?.updated_at ?? "",
  };
}

export function buildOrderItemRows(orders) {
  return orders.flatMap((order) => {
    const items = Array.isArray(order?.order_items) ? order.order_items : [];

    if (items.length === 0) {
      return [
        {
          id: `${order?.id || "order"}-empty-item`,
          order,
          order_number: order?.order_number ?? "",
          user: order?.user ?? {},
          status: order?.status ?? "",
          payment_status: order?.payment_status ?? "",
          payment_method: order?.payment_method ?? "",
          order_total_amount: order?.total_amount ?? 0,
          order_created_at: order?.created_at ?? "",
          product_image_url: "",
          product_name: "-",
          product_slug: "",
          size_text: "",
          quantity: "",
          unit_price: 0,
          total: 0,
          product_id: "",
          created_at: order?.created_at ?? "",
        },
      ];
    }

    return items.map((item, index) => ({
      id: `${order?.id || "order"}-${item?.id ?? index}`,
      order,
      order_number: order?.order_number ?? "",
      user: order?.user ?? {},
      status: order?.status ?? "",
      payment_status: order?.payment_status ?? "",
      payment_method: order?.payment_method ?? "",
      order_total_amount: order?.total_amount ?? 0,
      order_created_at: order?.created_at ?? "",
      product_image_url: item?.product?.images?.[0]?.image_url ?? "",
      product_name: item?.product_name ?? "",
      product_slug: item?.product_slug ?? "",
      size_text: item?.size_text ?? "",
      quantity: item?.quantity ?? "",
      unit_price: item?.price ?? item?.size_price ?? 0,
      total: item?.total ?? 0,
      product_id: item?.product_id ?? "",
      created_at: item?.created_at ?? "",
    }));
  });
}

export function unwrapOrderResponse(response) {
  const value = response?.data ?? response?.result ?? response;

  if (Array.isArray(value)) {
    return normalizeOrder(value[0]);
  }

  return normalizeOrder(value);
}
