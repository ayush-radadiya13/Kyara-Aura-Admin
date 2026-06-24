"use client";

import { useQuery } from "@tanstack/react-query";
import {
  extractScratchCardCouponsList,
  normalizeScratchCardCoupon,
} from "@/components/promo-code/promo-code-utils";
import { ADMIN_API_ROUTES } from "@/lib/routes";
import { customAxios } from "@/utils/api";

export const SCRATCH_CARD_COUPONS_ENDPOINT = ADMIN_API_ROUTES.GET_SCRATCH_CARD_COUPONS;

export function useScratchCardCoupons(page, pageSize, search) {
  return useQuery({
    queryKey: ["scratch-card-coupons", page, pageSize, search],
    queryFn: async () => {
      const res = await customAxios.get(SCRATCH_CARD_COUPONS_ENDPOINT, {
        params: {
          page,
          per_page: pageSize,
          ...(search?.trim() ? { search: search.trim() } : {}),
        },
      });

      const { items, meta } = extractScratchCardCouponsList(res.data);

      return {
        data: items.map(normalizeScratchCardCoupon),
        meta,
      };
    },
    staleTime: 0,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: true,
  });
}
