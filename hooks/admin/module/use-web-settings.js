"use client";

import { useQuery } from "@tanstack/react-query";
import {
  extractWebSettings,
  normalizeWebSettings,
} from "@/components/web-settings/web-settings-utils";
import { ADMIN_API_ROUTES } from "@/lib/routes";
import { customAxios } from "@/utils/api";

export function useWebSettings() {
  return useQuery({
    queryKey: ["web-settings"],
    queryFn: async () => {
      const res = await customAxios.get(ADMIN_API_ROUTES.GET_WEB_SETTINGS);
      return normalizeWebSettings(extractWebSettings(res.data));
    },
    staleTime: 0,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: true,
  });
}
