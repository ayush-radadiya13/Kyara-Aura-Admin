import { authService } from "@/services/authService";

export async function loginService(payload) {
  return authService.login(payload);
}
