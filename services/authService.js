import { ADMIN_API_ROUTES } from "@/lib/routes";
import { withoutTokenApi } from "@/utils/api";

export const authService = {
  async login(payload) {
    const { data } = await withoutTokenApi.post(ADMIN_API_ROUTES.LOGIN, payload);
    return data;
  },
};
