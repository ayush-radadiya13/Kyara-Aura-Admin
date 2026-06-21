import { AUTH_COOKIE_KEY, AUTH_COOKIE_MAX_AGE_SECONDS } from "@/lib/constants";

function readCookie(name) {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}=([^;]*)`)
  );
  return match ? decodeURIComponent(match[1]) : null;
}

export function getAuthCookie() {
  return readCookie(AUTH_COOKIE_KEY);
}

export function setAuthCookie(token) {
  if (typeof document === "undefined" || !token) return;
  document.cookie = `${AUTH_COOKIE_KEY}=${encodeURIComponent(token)}; path=/; max-age=${AUTH_COOKIE_MAX_AGE_SECONDS}; samesite=lax`;
}

export function clearAuthCookie() {
  if (typeof document === "undefined") return;
  document.cookie = `${AUTH_COOKIE_KEY}=; path=/; max-age=0; samesite=lax`;
}

export function migrateLegacyAuthStorage() {
  if (typeof window === "undefined") return;

  if (getAuthCookie()) {
    window.localStorage.removeItem("token");
    return;
  }

  const legacyToken = window.localStorage.getItem("token");
  if (legacyToken) {
    setAuthCookie(legacyToken);
    window.localStorage.removeItem("token");
    return;
  }

  try {
    const persisted = window.localStorage.getItem("ka-auth-storage");
    if (!persisted) return;
    const parsed = JSON.parse(persisted);
    const token = parsed?.state?.token;
    if (token) {
      setAuthCookie(token);
    }
  } catch {
    // Ignore invalid persisted auth payload.
  }
}
