import { ADMIN_API_ROUTES } from "@/lib/routes";
import { customAxios } from "@/utils/api";

export async function getCategoriesService(params) {
  const { data } = await customAxios.get(ADMIN_API_ROUTES.GET_CATEGORIES, {
    params,
  });
  return data;
}

export async function createCategoryService(payload) {
  const { data } = await customAxios.post(ADMIN_API_ROUTES.CREATE_CATEGORIES, payload);
  return data;
}

export async function updateCategoryService(id, payload) {
  const { data } = await customAxios.put(
    `${ADMIN_API_ROUTES.UPDATE_CATEGORIES}/${id}`,
    payload
  );
  return data;
}

export async function deleteCategoryService(id) {
  const { data } = await customAxios.delete(
    `${ADMIN_API_ROUTES.DELETE_CATEGORIES}/${id}`
  );
  return data;
}
