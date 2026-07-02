"use client";

export {
  formatCurrency,
  formatDateTime,
  formatLabel,
} from "@/components/order/order-utils";

export function getReturnRequestStatusClass(status) {
  const normalizedStatus = String(status || "").toLowerCase();

  if (["completed", "refunded"].includes(normalizedStatus)) {
    return "bg-green-100 text-green-700 hover:bg-green-100";
  }

  if (["awaiting_refund", "received"].includes(normalizedStatus)) {
    return "bg-blue-100 text-blue-700 hover:bg-blue-100";
  }

  if (["pending", "return_requested"].includes(normalizedStatus)) {
    return "bg-yellow-100 text-yellow-700 hover:bg-yellow-100";
  }

  if (["rejected", "cancelled", "failed"].includes(normalizedStatus)) {
    return "bg-red-100 text-red-700 hover:bg-red-100";
  }

  return "bg-gray-100 text-gray-700 hover:bg-gray-100";
}

export function getPaymentMethodClass(method) {
  const normalizedMethod = String(method || "").toLowerCase();

  if (normalizedMethod === "online") {
    return "bg-indigo-100 text-indigo-700 hover:bg-indigo-100";
  }

  if (normalizedMethod === "cod") {
    return "bg-orange-100 text-orange-700 hover:bg-orange-100";
  }

  return "bg-gray-100 text-gray-700 hover:bg-gray-100";
}

export const RETURN_TRACKING_LABELS = [
  "Return Requested",
  "Package Picked Up",
  "Return In Transit",
  "Arriving at Warehouse",
  "Return Completed",
];

export function getReturnTrackingStepIndex(returnOrder) {
  const orderStatus = returnOrder?.order_status;
  const shipmentReturnStatus = returnOrder?.shipment_return_status;

  if (shipmentReturnStatus === "delivered") return 4;
  if (shipmentReturnStatus === "out_for_delivery") return 3;
  if (shipmentReturnStatus === "in_transit") return 2;
  if (shipmentReturnStatus === "picked_up") return 1;
  if (orderStatus === "return_requested") return 0;

  return -1;
}

export function normalizeReturnOrder(item) {
  const returnRequestId = item?.return_request_id ?? "";
  const orderId = item?.order_id ?? null;

  return {
    id: returnRequestId || (orderId ? `order-${orderId}` : ""),
    return_request_id: returnRequestId,
    order_id: item?.order_id ?? null,
    order_number: item?.order_number ?? "",
    payment_method: item?.payment_method ?? "",
    order_status: item?.order_status ?? "",
    shipment_return_status: item?.shipment_return_status ?? "",
    return_display_status: item?.return_display_status ?? "",
    payment_status: item?.payment_status ?? "",
    order_total_amount: item?.order_total_amount ?? 0,
    customer: item?.customer ?? {},
    reason: item?.reason ?? "",
    items: Array.isArray(item?.items) ? item.items : [],
    refund_amount: item?.refund_amount ?? 0,
    is_partial: Boolean(item?.is_partial),
    status: item?.status ?? "",
    product_images: Array.isArray(item?.product_images) ? item.product_images : [],
    refund_details: item?.refund_details ?? null,
    requested_at: item?.requested_at ?? null,
    received_at: item?.received_at ?? null,
    refunded_at: item?.refunded_at ?? null,
    completed_at: item?.completed_at ?? null,
    refund_method: item?.refund_method ?? null,
    razorpay_refund_id: item?.razorpay_refund_id ?? null,
    razorpay_payout_id: item?.razorpay_payout_id ?? null,
    upi_transaction_reference: item?.upi_transaction_reference ?? null,
    can_pay_refund: Boolean(item?.can_pay_refund),
    cod_refund_requires_upi_reference: Boolean(item?.cod_refund_requires_upi_reference),
  };
}

export function getReturnItemSummary(items) {
  if (!Array.isArray(items) || items.length === 0) return "-";

  if (items.length === 1) {
    const item = items[0];
    return `${item.product_name || "Item"}${item.size_text ? ` (${item.size_text})` : ""}`;
  }

  return `${items.length} items`;
}

export function canShowPayRefundButton(returnOrder) {
  return Boolean(returnOrder?.can_pay_refund);
}
