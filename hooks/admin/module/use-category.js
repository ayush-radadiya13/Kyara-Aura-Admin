"use client";

import { useQuery } from "@tanstack/react-query";
import { normalizeCategory } from "@/components/category/category-utils";
import { ADMIN_API_ROUTES } from "@/lib/routes";
import { customAxios } from "@/utils/api";

export function useCategory(categoryId) {
  return useQuery({
    queryKey: ["category", categoryId],
    queryFn: async () => {
      const res = await customAxios.get(`${ADMIN_API_ROUTES.GETBYID_CATEGORIES}/${categoryId}`);
      return normalizeCategory(res.data?.data || res.data?.result || res.data);
    },
    enabled: Boolean(categoryId),
    retry: false,
    refetchOnWindowFocus: false,
  });
}
