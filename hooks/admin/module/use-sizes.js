"use client";

import { useQuery } from "@tanstack/react-query";
import { normalizeSize } from "@/components/size/size-utils";
import { customAxios } from "@/utils/api";

export const SIZES_ENDPOINT = "/cpanel/sizes";

export function useSizes(page, pageSize, search, isActive) {
  return useQuery({
    queryKey: ["sizes", page, pageSize, search, isActive],
    queryFn: async () => {
      const res = await customAxios.get(SIZES_ENDPOINT, {
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

export function useSizeOptions() {
  return useQuery({
    queryKey: ["sizes", "options"],
    queryFn: async () => {
      const res = await customAxios.get(SIZES_ENDPOINT, {
        params: {
          page: 1,
          per_page: 100,
        },
      });
      const rows = res.data?.data || res.data?.results || [];

      return rows.map(normalizeSize);
    },
    staleTime: 0,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: true,
  });
}
