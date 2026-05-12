"use client";

import { useQuery } from "@tanstack/react-query";
import { ADMIN_API_ROUTES } from "@/lib/routes";
import { customAxios } from "@/utils/api";

export function useProducts(page, pageSize, search, isActive) {
  return useQuery({
    queryKey: ["products", page, pageSize, search, isActive],
    queryFn: async () => {
      const res = await customAxios.get(ADMIN_API_ROUTES.GET_PRODUCTS, {
        params: {
          page,
          per_page: pageSize,
          ...(search?.trim() ? { search: search.trim() } : {}),
          ...(isActive !== "all" ? { is_active: isActive } : {}),
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
