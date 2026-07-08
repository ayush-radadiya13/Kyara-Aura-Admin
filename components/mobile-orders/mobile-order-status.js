import {
  formatLabel,
  getDeliveryStatusClass,
  getOrderDeliveryStatus,
  getOrderStatusClass,
  getPaymentStatusClass,
} from "@/components/order/order-utils";
import {
  getPaymentMethodClass,
  getReturnRequestStatus,
  getReturnRequestStatusClass,
} from "@/components/return-order/return-order-utils";

export function getOrderListStatusBadges(order) {
  const deliveryStatus = getOrderDeliveryStatus(order);
  const badges = [
    {
      className: getPaymentStatusClass(order?.payment_status),
      label: formatLabel(order?.payment_status),
    },
    {
      className: getOrderStatusClass(order?.status),
      label: formatLabel(order?.status),
    },
  ];

  if (deliveryStatus) {
    badges.push({
      className: getDeliveryStatusClass(deliveryStatus),
      label: formatLabel(deliveryStatus),
    });
  }

  return badges;
}

export function getReturnListStatusBadges(returnOrder) {
  const status = getReturnRequestStatus(returnOrder);

  return [
    {
      className: getPaymentMethodClass(returnOrder?.payment_method),
      label: formatLabel(returnOrder?.payment_method),
    },
    {
      className: getReturnRequestStatusClass(status),
      label: formatLabel(status),
    },
  ];
}
