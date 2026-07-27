export const ORDER_STATUS = {
  PENDING: "pending",
  PROCESSING: "processing",
  SHIPPED: "shipped",
  DELIVERED: "delivered",
  RETURN_REQUESTED: "return_requested",
  RETURNED: "returned",
  CANCELLED: "cancelled",
};

export const ORDER_STATUSES = Object.values(ORDER_STATUS);

export const SHIPMENT_STATUS = {
  MANIFESTED: "manifested",
  PICKUP_SCHEDULED: "pickup_scheduled",
  PICKUP_PENDING: "pickup_pending",
  PICKED_UP: "picked_up",
  IN_TRANSIT: "in_transit",
  OUT_FOR_DELIVERY: "out_for_delivery",
  DELIVERED: "delivered",
  RTO: "rto",
  CANCELLED: "cancelled",
  FAILED: "failed",
  RETRY_PENDING: "retry_pending",
  CREATION_FAILED: "creation_failed",
};

export const SHIPMENT_STATUSES = Object.values(SHIPMENT_STATUS);
