"use client";

import { useQuery } from "@tanstack/react-query";
import { normalizeProduct } from "@/components/product/product-utils";
import { ADMIN_API_ROUTES } from "@/lib/routes";
import { customAxios } from "@/utils/api";

export function useProduct(productId) {
  return useQuery({
    queryKey: ["product", productId],
    queryFn: async () => {
      const res = await customAxios.get(`${ADMIN_API_ROUTES.GETBYID_PRODUCTS}/${productId}`);
      return normalizeProduct(res.data?.data || res.data?.result || res.data);
    },
    enabled: Boolean(productId),
    retry: false,
    refetchOnWindowFocus: false,
  });
}
