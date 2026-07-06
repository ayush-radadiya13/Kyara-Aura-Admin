"use client";

import {
  ORDER_STATUS_RETURN_REQUESTED,
  ORDER_STATUSES_RETURN_COMPLETED,
  RETURN_DISPLAY_STATUS,
  SHIPMENT_RETURN_STATUSES_RETURN_COMPLETED,
} from "./return-status-constants";

import {
  formatEstimatedDate,
  formatLabel,
} from "@/components/order/order-utils";

export {
  formatCurrency,
  formatDateTime,
  formatEstimatedDate,
  formatLabel,
  getReturnDisplayStatus,
} from "@/components/order/order-utils";

export {
  ORDER_STATUS_RETURN_REQUESTED,
  ORDER_STATUSES_RETURN_COMPLETED,
  RETURN_DISPLAY_STATUS,
  RETURN_DISPLAY_STATUS_VALUES,
  SHIPMENT_RETURN_STATUSES_CANCELLED,
  SHIPMENT_RETURN_STATUSES_PROCESSING,
  SHIPMENT_RETURN_STATUSES_REQUESTED,
  SHIPMENT_RETURN_STATUSES_RETURN_COMPLETED,
} from "./return-status-constants";

export function getReturnRequestStatusClass(status) {
  const normalizedStatus = String(status || "").toLowerCase();

  if (["completed", "refunded"].includes(normalizedStatus)) {
    return "bg-green-100 text-green-700 hover:bg-green-100";
  }

  if (["awaiting_refund", "received"].includes(normalizedStatus)) {
    return "bg-blue-100 text-blue-700 hover:bg-blue-100";
  }

  if (["pending", ORDER_STATUS_RETURN_REQUESTED].includes(normalizedStatus)) {
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

export function getReturnShipment(returnOrder) {
  return (
    returnOrder?.shipment ??
    returnOrder?.order?.shipment ??
    null
  );
}

export function buildReturnTrackingContext(returnOrder, orderDetails) {
  if (!returnOrder) return null;

  return {
    ...returnOrder,
    shipment: getReturnShipment(returnOrder) ?? orderDetails?.shipment ?? null,
  };
}

export function getReturnEstimatedReturnAt(returnOrder) {
  const shipmentReturn = getReturnShipment(returnOrder)?.return;

  return (
    shipmentReturn?.estimated_return_at ??
    returnOrder?.estimated_return_at ??
    null
  );
}

export function getReturnEstimatedReturnDate(returnOrder) {
  const estimatedReturnAt = getReturnEstimatedReturnAt(returnOrder);
  if (!estimatedReturnAt) return null;

  return formatEstimatedDate(estimatedReturnAt);
}

export function getReturnRequestStatus(returnOrder) {
  return (
    returnOrder?.return_request_status ??
    returnOrder?.status ??
    returnOrder?.return_request?.latest?.status ??
    ""
  );
}

export function getReturnTrackingInfo(returnOrder) {
  const shipment = getReturnShipment(returnOrder);
  const shipmentReturn = shipment?.return;
  const estimatedReturnAt =
    shipmentReturn?.estimated_return_at ?? returnOrder?.estimated_return_at;

  if (estimatedReturnAt) {
    const date = formatEstimatedDate(estimatedReturnAt);
    if (date) {
      return {
        label: "Estimated Return Date",
        value: date,
      };
    }
  }

  if (isReturnTrackingComplete(returnOrder) || (shipment != null && shipmentReturn == null)) {
    const status = getReturnRequestStatus(returnOrder);
    if (status) {
      return {
        label: "Return Status",
        value: formatLabel(status),
      };
    }
  }

  return null;
}

function getShipmentReturnStatus(returnOrder) {
  return (
    returnOrder?.shipment_return_status ||
    getReturnShipment(returnOrder)?.return?.status ||
    ""
  );
}

function isReturnTrackingComplete(returnOrder) {
  const orderStatus = returnOrder?.order_status;
  const shipmentReturnStatus = getShipmentReturnStatus(returnOrder);
  const displayStatus = returnOrder?.return_display_status;
  const returnRequestStatus = getReturnRequestStatus(returnOrder);

  return (
    ORDER_STATUSES_RETURN_COMPLETED.includes(orderStatus) ||
    SHIPMENT_RETURN_STATUSES_RETURN_COMPLETED.includes(shipmentReturnStatus) ||
    ["completed", "refunded"].includes(String(returnRequestStatus).toLowerCase()) ||
    displayStatus === RETURN_DISPLAY_STATUS.RETURN_COMPLETED ||
    displayStatus === "returned"
  );
}

export function getReturnTrackingStepIndex(returnOrder) {
  if (!returnOrder) return -1;

  if (isReturnTrackingComplete(returnOrder)) return 4;

  const orderStatus = returnOrder?.order_status;
  const shipmentReturnStatus = getShipmentReturnStatus(returnOrder);

  if (shipmentReturnStatus === "out_for_delivery") return 3;
  if (shipmentReturnStatus === "in_transit") return 2;
  if (["picked_up", "pickup_pending"].includes(shipmentReturnStatus)) return 1;
  if (orderStatus === ORDER_STATUS_RETURN_REQUESTED) return 0;

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
    shipment: item?.shipment ?? null,
    order: item?.order ?? null,
    estimated_return_at: item?.estimated_return_at ?? null,
    shipment_return_status: item?.shipment_return_status ?? "",
    return_display_status: item?.return_display_status ?? "",
    return_request_status: item?.return_request_status ?? "",
    return_request: item?.return_request ?? null,
    return_summary: item?.return_summary ?? null,
    payment_status: item?.payment_status ?? "",
    order_total_amount: item?.order_total_amount ?? 0,
    customer: item?.customer ?? {},
    reason: item?.reason ?? "",
    items: Array.isArray(item?.items) ? item.items : [],
    refund_amount: item?.refund_amount ?? 0,
    is_partial: Boolean(item?.is_partial),
    status: item?.return_request_status ?? item?.status ?? "",
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
    can_pay_refund: Boolean(item?.can_pay_refund ?? item?.can_pay_return_refund),
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
