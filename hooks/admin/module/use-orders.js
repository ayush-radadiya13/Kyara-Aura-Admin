"use client";

import { useQuery } from "@tanstack/react-query";
import { normalizeOrder, unwrapOrderResponse } from "@/components/order/order-utils";
import { ADMIN_API_ROUTES } from "@/lib/routes";
import { customAxios } from "@/utils/api";

export function useOrders(page, pageSize, search) {
  return useQuery({
    queryKey: ["orders", page, pageSize, search],
    queryFn: async () => {
      const res = await customAxios.get(ADMIN_API_ROUTES.GET_ORDER, {
        params: {
          page,
          per_page: pageSize,
          ...(search?.trim() ? { search: search.trim() } : {}),
        },
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

export function normalizeOrdersResponse(data) {
  return (data?.data || data?.results || []).map(normalizeOrder);
}
