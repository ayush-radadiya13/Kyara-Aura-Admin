import {
  formatLabel,
  getDeliveryStatusClass,
  getOrderDeliveryStatus,
  getOrderStatusClass,
  getPaymentStatusClass,
  isCodOrder,
} from "@/components/order/order-utils";
import {
  getPaymentMethodClass,
  getReturnRequestStatus,
  getReturnRequestStatusClass,
} from "@/components/return-order/return-order-utils";

export function getOrderCardPaymentBadge(order) {
  const badges = [];

  if (isCodOrder(order)) {
    badges.push({
      className: getPaymentMethodClass("cod"),
      label: "COD",
    });
  } else {
    const paymentStatus = String(order?.payment_status || "").toLowerCase();
    if (["paid", "captured", "success"].includes(paymentStatus)) {
      badges.push({
        className: getPaymentStatusClass("paid"),
        label: "Paid",
      });
    } else {
      badges.push({
        className: getPaymentStatusClass(order?.payment_status),
        label: formatLabel(order?.payment_status) || "Online",
      });
    }
  }

  if (order?.status) {
    badges.push({
      className: getOrderStatusClass(order?.status),
      label: formatLabel(order?.status),
    });
  }

  return badges;
}

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

export function getReturnCardPaymentBadge(returnOrder) {
  const paymentMethod = String(returnOrder?.payment_method || "").toLowerCase();

  if (paymentMethod === "cod") {
    return [
      {
        className: getPaymentMethodClass("cod"),
        label: "COD",
      },
    ];
  }

  const paymentStatus = String(returnOrder?.payment_status || "").toLowerCase();
  if (["paid", "captured", "success"].includes(paymentStatus)) {
    return [
      {
        className: getPaymentStatusClass("paid"),
        label: "Paid",
      },
    ];
  }

  return [
    {
      className: getPaymentStatusClass(returnOrder?.payment_status),
      label: formatLabel(returnOrder?.payment_status) || "Online",
    },
  ];
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
