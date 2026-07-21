"use client";

import { useQuery } from "@tanstack/react-query";
import { ADMIN_API_ROUTES } from "@/lib/routes";
import { customAxios } from "@/utils/api";

function cleanParams(params) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== "" && value !== undefined && value !== null)
  );
}

export function useProducts(page, pageSize, filters) {
  return useQuery({
    queryKey: ["products", page, pageSize, filters],
    queryFn: async () => {
      const res = await customAxios.get(ADMIN_API_ROUTES.GET_PRODUCTS, {
        params: cleanParams({
          page,
          per_page: pageSize,
          search: filters.search?.trim(),
          category_id: filters.category_id,
          category_type: filters.category_type,
          size_id: filters.size_id,
          price: filters.price,
          is_active: filters.is_active,
          is_collection: filters.is_collection,
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
