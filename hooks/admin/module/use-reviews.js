"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { ADMIN_API_ROUTES } from "@/lib/routes";
import { customAxios } from "@/utils/api";

function cleanParams(params) {
  return Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== "" && value !== undefined && value !== null
    )
  );
}

export function useReviews(page, pageSize, filters) {
  return useQuery({
    queryKey: ["customer-reviews", page, pageSize, filters],
    queryFn: async () => {
      const res = await customAxios.get(ADMIN_API_ROUTES.GET_CUSTOMER_REVIEWS, {
        params: cleanParams({
          page,
          per_page: pageSize,
          search: filters?.search?.trim(),
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

export function useUpdateReviewVisibility(options) {
  return useMutation({
    mutationFn: async ({ reviewId, on_web_show }) => {
      if (!reviewId) throw new Error("Missing review ID");

      const res = await customAxios.put(
        ADMIN_API_ROUTES.UPDATE_CUSTOMER_REVIEW(reviewId),
        { on_web_show }
      );
      return res.data;
    },
    ...options,
  });
}
