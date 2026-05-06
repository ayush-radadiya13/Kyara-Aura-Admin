import { AUTH_COOKIE_KEY } from "@/lib/constants";

export function getAdminToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("token");
}

export function setAdminToken(token) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem("token", token);
  document.cookie = `${AUTH_COOKIE_KEY}=${token}; path=/; max-age=86400; samesite=lax`;
}

export function clearAdminToken() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem("token");
  document.cookie = `${AUTH_COOKIE_KEY}=; path=/; max-age=0; samesite=lax`;
}
