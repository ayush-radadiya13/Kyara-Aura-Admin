"use client";

import { useQuery } from "@tanstack/react-query";
import { ADMIN_API_ROUTES } from "@/lib/routes";
import { customAxios } from "@/utils/api";

export function useCategories(page, pageSize, search, isActive, type) {
  return useQuery({
    queryKey: ["categories", page, pageSize, search, isActive, type],
    queryFn: async () => {
      const res = await customAxios.get(ADMIN_API_ROUTES.GET_CATEGORIES, {
        params: {
          page,
          per_page: pageSize,
          ...(search?.trim() ? { search: search.trim() } : {}),
          ...(isActive !== "all" ? { is_active: isActive } : {}),
          ...(type ? { type } : {}),
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
