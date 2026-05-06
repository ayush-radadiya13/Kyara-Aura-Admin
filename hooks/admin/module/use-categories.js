"use client";

import { useQuery } from "@tanstack/react-query";
import { ADMIN_API_ROUTES } from "@/lib/routes";
import { customAxios } from "@/utils/api";

export function useCategories(page, pageSize, search) {
  return useQuery({
    queryKey: ["categories", page, pageSize, search],
    queryFn: async () => {
      const res = await customAxios.get(ADMIN_API_ROUTES.GET_CATEGORIES, {
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
