import { ORDER_STATUSES, SHIPMENT_STATUSES } from "./order-status-constants";

const ORDER_STATUS_LABELS = {
  pending: "Pending",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  return_requested: "Return Requested",
  returned: "Returned",
  cancelled: "Cancelled",
};

const SHIPMENT_STATUS_LABELS = {
  manifested: "Manifested",
  pickup_scheduled: "Pickup Scheduled",
  pickup_pending: "Pickup Pending",
  picked_up: "Picked Up",
  in_transit: "In Transit",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  rto: "RTO",
  cancelled: "Cancelled",
  failed: "Failed",
};

export const ORDER_STATUS_OPTIONS = [
  { value: "all", label: "All" },
  ...ORDER_STATUSES.map((value) => ({
    value,
    label: ORDER_STATUS_LABELS[value] ?? value,
  })),
];

export const PAYMENT_STATUS_OPTIONS = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "paid", label: "Paid" },
  { value: "failed", label: "Failed" },
  { value: "refunded", label: "Refunded" },
];

export const SHIPPING_STATUS_OPTIONS = [
  { value: "all", label: "All" },
  ...SHIPMENT_STATUSES.map((value) => ({
    value,
    label: SHIPMENT_STATUS_LABELS[value] ?? value,
  })),
];
