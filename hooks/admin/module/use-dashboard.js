"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getGenderDistributionService,
  getMonthlySalesService,
  getPaymentMethodDistributionService,
  getTopProductsService,
  getTotalCustomersService,
  getWeeklyOrderStatusService,
} from "@/services/dashboard-service";

const dashboardQueryOptions = {
  staleTime: 60_000,
  refetchOnWindowFocus: false,
};

export function usePaymentMethodDistribution() {
  return useQuery({
    queryKey: ["dashboard", "payment-method-distribution"],
    queryFn: getPaymentMethodDistributionService,
    ...dashboardQueryOptions,
  });
}

export function useTotalCustomers() {
  return useQuery({
    queryKey: ["dashboard", "total-customers"],
    queryFn: getTotalCustomersService,
    ...dashboardQueryOptions,
  });
}

export function useMonthlySales() {
  return useQuery({
    queryKey: ["dashboard", "monthly-sales"],
    queryFn: getMonthlySalesService,
    ...dashboardQueryOptions,
  });
}

export function useTopProducts() {
  return useQuery({
    queryKey: ["dashboard", "top-products"],
    queryFn: getTopProductsService,
    ...dashboardQueryOptions,
  });
}

export function useGenderDistribution() {
  return useQuery({
    queryKey: ["dashboard", "gender-distribution"],
    queryFn: getGenderDistributionService,
    ...dashboardQueryOptions,
  });
}

export function useWeeklyOrderStatus() {
  return useQuery({
    queryKey: ["dashboard", "weekly-order-status"],
    queryFn: getWeeklyOrderStatusService,
    ...dashboardQueryOptions,
  });
}
