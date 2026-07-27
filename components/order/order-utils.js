"use client";

import {
  ORDER_STATUS_RETURN_REQUESTED,
  ORDER_STATUSES_RETURN_COMPLETED,
  RETURN_DISPLAY_STATUS,
  SHIPMENT_RETURN_STATUSES_CANCELLED,
  SHIPMENT_RETURN_STATUSES_PROCESSING,
  SHIPMENT_RETURN_STATUSES_REQUESTED,
  SHIPMENT_RETURN_STATUSES_RETURN_COMPLETED,
} from "@/components/return-order/return-status-constants";
import {
  ORDER_STATUS,
  SHIPMENT_STATUS,
} from "@/components/order/order-status-constants";

const DOWNLOADED_LABEL_ORDER_IDS_KEY = "kyara-downloaded-order-label-ids";

export function normalizeOrderId(id) {
  if (id == null || id === "") return null;
  return String(id);
}

export function readDownloadedLabelOrderIds() {
  if (typeof window === "undefined") return [];

  try {
    let stored = localStorage.getItem(DOWNLOADED_LABEL_ORDER_IDS_KEY);

    if (!stored) {
      const legacyStored = sessionStorage.getItem(DOWNLOADED_LABEL_ORDER_IDS_KEY);
      if (legacyStored) {
        localStorage.setItem(DOWNLOADED_LABEL_ORDER_IDS_KEY, legacyStored);
        sessionStorage.removeItem(DOWNLOADED_LABEL_ORDER_IDS_KEY);
        stored = legacyStored;
      }
    }

    if (!stored) return [];

    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];

    return [...new Set(parsed.map(normalizeOrderId).filter(Boolean))];
  } catch {
    return [];
  }
}

export function persistDownloadedLabelOrderIds(orderIds) {
  if (typeof window === "undefined") return;

  localStorage.setItem(
    DOWNLOADED_LABEL_ORDER_IDS_KEY,
    JSON.stringify(orderIds)
  );
}

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

export function formatEstimatedDate(value) {
  if (!value) return null;

  const date = new Date(String(value).replace(" ", "T"));
  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function getOrderStatusClass(status) {
  const normalizedStatus = String(status || "").toLowerCase();

  if ([ORDER_STATUS.DELIVERED, "completed"].includes(normalizedStatus)) {
    return "bg-green-100 text-green-700 hover:bg-green-100";
  }

  if (
    [
      ORDER_STATUS.PENDING,
      ORDER_STATUS.PROCESSING,
      ORDER_STATUS.SHIPPED,
      "confirmed",
      "pending_admin_confirmation",
    ].includes(normalizedStatus)
  ) {
    return "bg-blue-100 text-blue-700 hover:bg-blue-100";
  }

  if ([ORDER_STATUS.RETURN_REQUESTED].includes(normalizedStatus)) {
    return "bg-yellow-100 text-yellow-700 hover:bg-yellow-100";
  }

  if ([ORDER_STATUS.RETURNED, "refunded"].includes(normalizedStatus)) {
    return "bg-purple-100 text-purple-700 hover:bg-purple-100";
  }

  if ([ORDER_STATUS.CANCELLED, "failed"].includes(normalizedStatus)) {
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

export function getReturnDisplayStatus(order) {
  const returnStatus =
    order?.shipment?.return?.status ?? order?.shipment_return_status;
  const orderStatus = order?.status ?? order?.order_status;

  if (
    ORDER_STATUSES_RETURN_COMPLETED.includes(orderStatus) ||
    SHIPMENT_RETURN_STATUSES_RETURN_COMPLETED.includes(returnStatus)
  ) {
    return RETURN_DISPLAY_STATUS.RETURN_COMPLETED;
  }

  if (SHIPMENT_RETURN_STATUSES_PROCESSING.includes(returnStatus)) {
    return RETURN_DISPLAY_STATUS.RETURN_PROCESSING;
  }

  if (
    orderStatus === ORDER_STATUS_RETURN_REQUESTED ||
    SHIPMENT_RETURN_STATUSES_REQUESTED.includes(returnStatus)
  ) {
    return RETURN_DISPLAY_STATUS.RETURN_REQUESTED;
  }

  if (SHIPMENT_RETURN_STATUSES_CANCELLED.includes(returnStatus)) {
    return RETURN_DISPLAY_STATUS.RETURN_CANCELLED;
  }

  return null;
}

export function getReturnStatusClass(status) {
  const normalizedStatus = String(status || "").toLowerCase();

  if (
    normalizedStatus === RETURN_DISPLAY_STATUS.RETURN_COMPLETED ||
    normalizedStatus === "returned"
  ) {
    return "bg-purple-100 text-purple-700 hover:bg-purple-100";
  }

  if (normalizedStatus === RETURN_DISPLAY_STATUS.RETURN_PROCESSING) {
    return "bg-blue-100 text-blue-700 hover:bg-blue-100";
  }

  if (normalizedStatus === RETURN_DISPLAY_STATUS.RETURN_REQUESTED) {
    return "bg-yellow-100 text-yellow-700 hover:bg-yellow-100";
  }

  if (normalizedStatus === RETURN_DISPLAY_STATUS.RETURN_CANCELLED) {
    return "bg-red-100 text-red-700 hover:bg-red-100";
  }

  return "bg-gray-100 text-gray-700 hover:bg-gray-100";
}

export function getDeliveryStatusClass(status) {
  const normalizedStatus = String(status || "").toLowerCase();

  if ([SHIPMENT_STATUS.DELIVERED].includes(normalizedStatus)) {
    return "bg-green-100 text-green-700 hover:bg-green-100";
  }

  if (
    [
      SHIPMENT_STATUS.MANIFESTED,
      SHIPMENT_STATUS.PICKUP_SCHEDULED,
      SHIPMENT_STATUS.PICKUP_PENDING,
      SHIPMENT_STATUS.PICKED_UP,
      SHIPMENT_STATUS.IN_TRANSIT,
      SHIPMENT_STATUS.OUT_FOR_DELIVERY,
      "shipped",
    ].includes(normalizedStatus)
  ) {
    return "bg-blue-100 text-blue-700 hover:bg-blue-100";
  }

  if (
    ["pending", "not_created", SHIPMENT_STATUS.RETRY_PENDING].includes(
      normalizedStatus
    )
  ) {
    return "bg-yellow-100 text-yellow-700 hover:bg-yellow-100";
  }

  if (
    [
      SHIPMENT_STATUS.RTO,
      SHIPMENT_STATUS.CANCELLED,
      SHIPMENT_STATUS.FAILED,
      SHIPMENT_STATUS.CREATION_FAILED,
      "returned",
    ].includes(normalizedStatus)
  ) {
    return "bg-red-100 text-red-700 hover:bg-red-100";
  }

  return "bg-gray-100 text-gray-700 hover:bg-gray-100";
}

export function getOrderDeliveryStatus(order) {
  return (
    order?.shipment?.shipment_status ||
    order?.shipment_status ||
    order?.shipping_status ||
    ""
  );
}

export function canRetryOrderShipment(order) {
  return Boolean(order?.shipment?.can_retry_shipment);
}

export function isOrderShipmentRetryPending(order) {
  return (
    String(getOrderDeliveryStatus(order) || "").toLowerCase() ===
    SHIPMENT_STATUS.RETRY_PENDING
  );
}

export function getOrderShipmentFailedReason(order) {
  return (
    order?.shipment?.failed_reason ||
    order?.failed_reason ||
    ""
  );
}

export function getOrderWaybill(order) {
  return order?.shipment?.waybill || order?.awb_code || order?.tracking_number || "";
}

export function hasOrderWaybill(order) {
  return Boolean(getOrderWaybill(order));
}

export function hasOrderLabelBeenDownloaded(order, downloadedLabelOrderIds = []) {
  if (
    order?.is_downloaded ||
    order?.shipment?.is_downloaded ||
    order?.order?.is_downloaded ||
    order?.order?.shipment?.is_downloaded
  ) {
    return true;
  }

  const orderId = normalizeOrderId(order?.id ?? order?.order_id);
  return orderId != null && downloadedLabelOrderIds.includes(orderId);
}

export function getOrderEstimatedDeliveryAt(order) {
  return order?.shipment?.estimated_delivery_at ?? null;
}

export function getOrderEstimatedDeliveryDate(order) {
  const estimatedDeliveryAt = getOrderEstimatedDeliveryAt(order);
  if (!estimatedDeliveryAt) return null;

  return formatEstimatedDate(estimatedDeliveryAt);
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
    is_downloaded: Boolean(
      item?.is_downloaded ?? item?.shipment?.is_downloaded
    ),
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
    cod_charge: item?.cod_charge ?? 0,
    buy_two_get_one_discount_amount: item?.buy_two_get_one_discount_amount ?? 0,
    first_order_discount_amount: item?.first_order_discount_amount ?? 0,
    online_payment_discount_amount: item?.online_payment_discount_amount ?? 0,
    scratch_coupon_code: item?.scratch_coupon_code ?? "",
    discount_percent: item?.discount_percent ?? 0,
    discount_amount: item?.discount_amount ?? 0,
    total_amount: item?.total_amount ?? 0,
    address_id: item?.address_id ?? null,
    shipping_address: item?.shipping_address ?? {},
    billing_address: item?.billing_address ?? {},
    notes: item?.notes ?? "",
    can_be_cancelled: Boolean(item?.can_be_cancelled),
    invoice_download_url: item?.invoice_download_url ?? "",
    delivered_at: item?.delivered_at ?? null,
    return_request: item?.return_request ?? null,
    return_summary: item?.return_summary ?? null,
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
