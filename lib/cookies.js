import { AUTH_COOKIE_KEY } from "@/lib/constants";

export function setAuthCookie(token) {
  document.cookie = `${AUTH_COOKIE_KEY}=${token}; path=/; max-age=86400; samesite=lax`;
}

export function clearAuthCookie() {
  document.cookie = `${AUTH_COOKIE_KEY}=; path=/; max-age=0; samesite=lax`;
}
