"use client";

import { useQuery } from "@tanstack/react-query";
import { extractBannerList, normalizeBanner } from "@/components/banner/banner-utils";
import { ADMIN_API_ROUTES } from "@/lib/routes";
import { customAxios } from "@/utils/api";

export function useBanners() {
  return useQuery({
    queryKey: ["banners"],
    queryFn: async () => {
      const res = await customAxios.get(ADMIN_API_ROUTES.GET_BANNERS);
      return extractBannerList(res.data).map((banner, index) =>
        normalizeBanner(banner, index + 1)
      );
    },
    staleTime: 0,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: true,
  });
}
