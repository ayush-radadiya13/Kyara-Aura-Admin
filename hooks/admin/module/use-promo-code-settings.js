"use client";

import { useQuery } from "@tanstack/react-query";
import {
  extractPromoCodeSettings,
  normalizePromoCodeSettings,
} from "@/components/promo-code/promo-code-utils";
import { ADMIN_API_ROUTES } from "@/lib/routes";
import { customAxios } from "@/utils/api";

export function usePromoCodeSettings() {
  return useQuery({
    queryKey: ["promo-code-settings"],
    queryFn: async () => {
      const res = await customAxios.get(ADMIN_API_ROUTES.GET_SCRATCH_CARD_SETTINGS);
      return normalizePromoCodeSettings(extractPromoCodeSettings(res.data));
    },
    staleTime: 0,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: true,
  });
}
