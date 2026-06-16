import { AUTH_COOKIE_KEY } from "@/lib/constants";

const AUTH_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export function getAdminToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("token");
}

export function setAdminToken(token) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem("token", token);
  document.cookie = `${AUTH_COOKIE_KEY}=${token}; path=/; max-age=${AUTH_COOKIE_MAX_AGE_SECONDS}; samesite=lax`;
}

export function clearAdminToken() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem("token");
  document.cookie = `${AUTH_COOKIE_KEY}=; path=/; max-age=0; samesite=lax`;
}
