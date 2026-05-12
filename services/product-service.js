import { ADMIN_API_ROUTES } from "@/lib/routes";
import { customAxios } from "@/utils/api";

export async function getProductsService(params) {
  const { data } = await customAxios.get(ADMIN_API_ROUTES.GET_PRODUCTS, {
    params,
  });
  return data;
}

export async function createProductService(payload) {
  const { data } = await customAxios.post(ADMIN_API_ROUTES.CREATE_PRODUCTS, payload);
  return data;
}

export async function updateProductService(id, payload) {
  const { data } = await customAxios.put(
    `${ADMIN_API_ROUTES.UPDATE_PRODUCTS}/${id}`,
    payload
  );
  return data;
}

export async function deleteProductService(id) {
  const { data } = await customAxios.delete(
    `${ADMIN_API_ROUTES.DELETE_PRODUCTS}/${id}`
  );
  return data;
}
