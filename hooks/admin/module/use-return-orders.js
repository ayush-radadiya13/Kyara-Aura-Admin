"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { normalizeReturnOrder } from "@/components/return-order/return-order-utils";
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

export function useReturnOrders(page, pageSize, filters, type) {
  return useQuery({
    queryKey: ["return-orders", page, pageSize, filters, type],
    queryFn: async () => {
      const res = await customAxios.get(ADMIN_API_ROUTES.GET_RETURN_ORDERS, {
        params: cleanParams({
          page,
          per_page: pageSize,
          type,
          search: filters.search?.trim(),
          status: filters.status,
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

export function normalizeReturnOrdersResponse(data) {
  return (data?.data || data?.results || []).map(normalizeReturnOrder);
}

export function usePayReturnRefund(options) {
  return useMutation({
    mutationFn: async ({ orderId, returnRequestId }) => {
      if (!orderId) throw new Error("Missing order ID");
      if (!returnRequestId) throw new Error("Missing return request ID");

      const res = await customAxios.post(
        ADMIN_API_ROUTES.PAY_RETURN_REFUND(orderId),
        { return_request_id: returnRequestId }
      );

      return res.data;
    },
    ...options,
  });
}
