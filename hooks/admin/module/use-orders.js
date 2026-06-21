"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { normalizeOrder, unwrapOrderResponse } from "@/components/order/order-utils";
import { ADMIN_API_ROUTES } from "@/lib/routes";
import { customAxios } from "@/utils/api";

function cleanParams(params) {
  return Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) =>
        value !== "" && value !== "all" && value !== undefined && value !== null
    )
  );
}

export function useOrders(page, pageSize, filters, type) {
  return useQuery({
    queryKey: ["orders", page, pageSize, filters, type],
    queryFn: async () => {
      const res = await customAxios.get(ADMIN_API_ROUTES.GET_ORDER, {
        params: cleanParams({
          page,
          per_page: pageSize,
          type,
          search: filters.search?.trim(),
          status: filters.status,
          payment_status: filters.payment_status,
          shipping_status: filters.shipping_status,
          shipping_provider: filters.shipping_provider?.trim(),
          waybill: filters.waybill?.trim(),
          shipment_created_from: filters.shipment_created_from,
          shipment_created_to: filters.shipment_created_to,
        }),
      });

      return res.data;
    },
    staleTime: 0,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: true,
  });
}

export function useOrderDetails(orderId, enabled = true) {
  return useQuery({
    queryKey: ["order", orderId],
    queryFn: async () => {
      const res = await customAxios.get(`${ADMIN_API_ROUTES.GET_ORDER_DETAILS}/${orderId}`);
      return unwrapOrderResponse(res.data);
    },
    enabled: Boolean(orderId) && enabled,
    retry: false,
    refetchOnWindowFocus: false,
  });
}

export function useCreateOrderShipment(options) {
  return useMutation({
    mutationFn: async (orderId) => {
      if (!orderId) throw new Error("Missing order ID");

      const res = await customAxios.post(
        ADMIN_API_ROUTES.CREATE_ORDER_SHIPMENT(orderId)
      );
      return res.data;
    },
    ...options,
  });
}

export function useCancelOrderShipment(options) {
  return useMutation({
    mutationFn: async (orderId) => {
      if (!orderId) throw new Error("Missing order ID");

      const res = await customAxios.post(
        ADMIN_API_ROUTES.CANCEL_ORDER_SHIPMENT(orderId)
      );
      return res.data;
    },
    ...options,
  });
}

function getLabelFilename(headers, orderId) {
  const disposition = headers?.["content-disposition"] || "";
  const filenameMatch = disposition.match(/filename\*?=(?:UTF-8'')?["']?([^"';]+)["']?/i);

  if (filenameMatch?.[1]) {
    return decodeURIComponent(filenameMatch[1]);
  }

  return `order-${orderId}-label.pdf`;
}

export function useDownloadOrderShipmentLabel(options) {
  return useMutation({
    mutationFn: async (orderId) => {
      if (!orderId) throw new Error("Missing order ID");

      const res = await customAxios.get(
        ADMIN_API_ROUTES.DOWNLOAD_ORDER_SHIPMENT_LABEL(orderId),
        { responseType: "blob" }
      );

      return {
        blob: res.data,
        filename: getLabelFilename(res.headers, orderId),
      };
    },
    ...options,
  });
}

function getBulkLabelFilename(headers) {
  const disposition = headers?.["content-disposition"] || "";
  const filenameMatch = disposition.match(/filename\*?=(?:UTF-8'')?["']?([^"';]+)["']?/i);

  if (filenameMatch?.[1]) {
    return decodeURIComponent(filenameMatch[1]);
  }

  return "shipment-labels.pdf";
}

export function useBulkDownloadOrderShipmentLabels(options) {
  return useMutation({
    mutationFn: async (orderIds) => {
      if (!Array.isArray(orderIds) || orderIds.length === 0) {
        throw new Error("Select at least one order");
      }

      const res = await customAxios.post(
        ADMIN_API_ROUTES.BULK_DOWNLOAD_ORDER_SHIPMENT_LABELS,
        { order_ids: orderIds },
        { responseType: "blob" }
      );

      return {
        blob: res.data,
        filename: getBulkLabelFilename(res.headers),
      };
    },
    ...options,
  });
}

export function normalizeOrdersResponse(data) {
  return (data?.data || data?.results || []).map(normalizeOrder);
}
