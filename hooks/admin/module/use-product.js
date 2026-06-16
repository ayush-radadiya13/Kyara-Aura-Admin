"use client";

import { useQuery } from "@tanstack/react-query";
import { normalizeProduct } from "@/components/product/product-utils";
import { ADMIN_API_ROUTES } from "@/lib/routes";
import { customAxios } from "@/utils/api";

function getProductListItems(data) {
  return data?.data || data?.results || [];
}

export function useProduct(productId) {
  return useQuery({
    queryKey: ["product", productId],
    queryFn: async () => {
      try {
        const res = await customAxios.get(`${ADMIN_API_ROUTES.GETBYID_PRODUCTS}/${productId}`);
        return normalizeProduct(res.data?.data || res.data?.result || res.data);
      } catch (error) {
        if (error?.response?.status !== 404) {
          throw error;
        }

        const res = await customAxios.get(ADMIN_API_ROUTES.GET_PRODUCTS, {
          params: { page: 1, per_page: 1000 },
        });
        const product = getProductListItems(res.data)
          .map(normalizeProduct)
          .find((item) => String(item.id) === String(productId));

        if (!product) {
          throw error;
        }

        return product;
      }
    },
    enabled: Boolean(productId),
    retry: false,
    refetchOnWindowFocus: false,
  });
}
