import { authService } from "@/services/authService";

export async function loginService(payload) {
  return authService.login(payload);
}

export async function logoutService() {
  return authService.logout();
}
