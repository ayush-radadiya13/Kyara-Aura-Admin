"use client";

import { useQuery } from "@tanstack/react-query";
import { normalizeCategory } from "@/components/category/category-utils";
import { ADMIN_API_ROUTES } from "@/lib/routes";
import { customAxios } from "@/utils/api";

function getCategoryListItems(data) {
  return data?.data || data?.results || [];
}

export function useCategory(categoryId) {
  return useQuery({
    queryKey: ["category", categoryId],
    queryFn: async () => {
      try {
        const res = await customAxios.get(`${ADMIN_API_ROUTES.GETBYID_CATEGORIES}/${categoryId}`);
        return normalizeCategory(res.data?.data || res.data?.result || res.data);
      } catch (error) {
        if (error?.response?.status !== 404) {
          throw error;
        }

        const res = await customAxios.get(ADMIN_API_ROUTES.GET_CATEGORIES, {
          params: { page: 1, per_page: 1000 },
        });
        const category = getCategoryListItems(res.data)
          .map(normalizeCategory)
          .find((item) => String(item.id) === String(categoryId));

        if (!category) {
          throw error;
        }

        return category;
      }
    },
    enabled: Boolean(categoryId),
    retry: false,
    refetchOnWindowFocus: false,
  });
}
