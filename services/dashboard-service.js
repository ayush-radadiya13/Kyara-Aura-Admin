import { ADMIN_API_ROUTES } from "@/lib/routes";
import { customAxios } from "@/utils/api";

export async function getPaymentMethodDistributionService() {
  const { data } = await customAxios.get(
    ADMIN_API_ROUTES.DASHBOARD_PAYMENT_METHOD_DISTRIBUTION
  );
  return data;
}

export async function getTotalCustomersService() {
  const { data } = await customAxios.get(ADMIN_API_ROUTES.DASHBOARD_TOTAL_CUSTOMERS);
  return data;
}

export async function getMonthlySalesService() {
  const { data } = await customAxios.get(ADMIN_API_ROUTES.DASHBOARD_MONTHLY_SALES);
  return data;
}

export async function getTopProductsService() {
  const { data } = await customAxios.get(ADMIN_API_ROUTES.DASHBOARD_TOP_PRODUCTS);
  return data;
}

export async function getGenderDistributionService() {
  const { data } = await customAxios.get(
    ADMIN_API_ROUTES.DASHBOARD_GENDER_DISTRIBUTION
  );
  return data;
}

export async function getMonthlyOrderStatusService() {
  const { data } = await customAxios.get(
    ADMIN_API_ROUTES.DASHBOARD_MONTHLY_ORDER_STATUS
  );
  return data;
}
