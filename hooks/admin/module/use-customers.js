"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { ADMIN_API_ROUTES } from "@/lib/routes";
import { customAxios } from "@/utils/api";

function cleanParams(params) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== "" && value !== undefined && value !== null)
  );
}

export function useCustomers(page, pageSize, filters) {
  return useQuery({
    queryKey: ["customers", page, pageSize, filters],
    queryFn: async () => {
      const res = await customAxios.get(ADMIN_API_ROUTES.GET_USERS, {
        params: cleanParams({
          page,
          per_page: pageSize,
          search: filters.search?.trim(),
          is_banned: filters.is_banned,
          registered_from: filters.registered_from,
          registered_to: filters.registered_to,
          min_orders: filters.min_orders,
          max_orders: filters.max_orders,
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

export function useBanCustomer(options) {
  return useMutation({
    mutationFn: async ({ userId, banned_until }) => {
      if (!userId) throw new Error("Missing user ID");

      const res = await customAxios.post(ADMIN_API_ROUTES.BAN_USER(userId), {
        banned_until,
      });
      return res.data;
    },
    ...options,
  });
}

export function useUnbanCustomer(options) {
  return useMutation({
    mutationFn: async (userId) => {
      if (!userId) throw new Error("Missing user ID");

      const res = await customAxios.put(ADMIN_API_ROUTES.UNBAN_USER(userId));
      return res.data;
    },
    ...options,
  });
}
