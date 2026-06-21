import {
  clearAuthCookie,
  getAuthCookie,
  migrateLegacyAuthStorage,
  setAuthCookie,
} from "@/lib/cookies";

migrateLegacyAuthStorage();

export function getAdminToken() {
  return getAuthCookie();
}

export function setAdminToken(token) {
  setAuthCookie(token);
}

export function clearAdminToken() {
  clearAuthCookie();
}
