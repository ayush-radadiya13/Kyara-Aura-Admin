export const RETURN_DISPLAY_STATUS = {
  RETURN_COMPLETED: "return_completed",
  RETURN_PROCESSING: "return_processing",
  RETURN_REQUESTED: "return_requested",
  RETURN_CANCELLED: "return_cancelled",
};

export const RETURN_DISPLAY_STATUS_VALUES = Object.values(RETURN_DISPLAY_STATUS);

/** Order-level statuses when the return / RTO flow is complete. */
export const ORDER_STATUSES_RETURN_COMPLETED = ["returned", "rto"];

/** Shipment return statuses when the package has reached the warehouse. */
export const SHIPMENT_RETURN_STATUSES_RETURN_COMPLETED = ["delivered", "dto", "rto"];

export const SHIPMENT_RETURN_STATUSES_PROCESSING = [
  "scheduled",
  "dispatched",
  "picked_up",
  "in_transit",
  "pending",
  "out_for_delivery",
];

export const SHIPMENT_RETURN_STATUSES_REQUESTED = ["open", "ready_for_pickup"];

export const SHIPMENT_RETURN_STATUSES_CANCELLED = ["cancelled", "closed"];

export const ORDER_STATUS_RETURN_REQUESTED = "return_requested";
